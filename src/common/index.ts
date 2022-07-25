import { compareSync, DifferenceState, Reason } from 'dir-compare'
import fs from 'fs-extra'
import { Glob } from 'glob'
import path from 'path'
import { CleanOptions, GitError, ResetMode, SimpleGit } from 'simple-git'
import { terminal } from 'terminal-kit'
import { ErrorLike, LogScope } from '../types'
import { logExtendLastLine, logWriteLine } from './logger'

export * from './gitInit'
export * from './logger'

export const isErrorLike = (value: unknown): value is ErrorLike =>
    typeof value === 'object' && value !== null && ('stack' in value || 'message' in value)

export const delay = (time: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, time))
}

export const pullRemoteBranchIntoCurrentBranch = async (
    logPrefix: string,
    git: SimpleGit,
    remoteBranch: string,
    currentBranch: string,
    ignoreMergeConflictsError = false,
    noPush = false
) => {
    try {
        terminal(`${logPrefix}: Try to pull remote branch '${remoteBranch}' into current branch '${currentBranch}'...`)

        await git.pull('origin', remoteBranch, ['--no-rebase'])
        const status = await git.status()

        if (status.ahead) {
            if (!noPush) {
                await git.push('origin', currentBranch)
                terminal('Merged!\n')

                return
            }

            terminal('Done!\n')

            return
        }

        terminal('None!\n')
    } catch (error) {
        if (ignoreMergeConflictsError && isErrorLike(error) && error instanceof GitError) {
            terminal(`Skipped with following error: '${error.message}'\n`)

            return
        }

        // noop
        terminal('Failed!\n')

        throw error
    }
}

export const deleteSliceIgnoresFilesDirs = async (
    sliceIgnores: string[],
    rootDir: string,
    scope: LogScope
): Promise<void> => {
    for (let i = 0; i < sliceIgnores.length; i++) {
        const pattern = sliceIgnores[i]

        logWriteLine(scope, `Getting ingoring files/directores with pattern '${pattern}'...`)

        const mg = new Glob(pattern, {
            cwd: rootDir,
            sync: true,
        })

        logExtendLastLine(`Found ${mg.found.length} files/directories!`)

        if (mg.found.length === 0) {
            continue
        }

        for (let j = 0; j < mg.found.length; j++) {
            const pathMatch = mg.found[j]
            const resolvedPath = path.join(rootDir, pathMatch)

            logWriteLine(scope, `Deleting: ${pathMatch}...`)

            fs.rmSync(resolvedPath, { force: true, recursive: true })

            logExtendLastLine('Done!')
        }
    }
}

export const createCommitAndPushCurrentChanges = async (
    git: SimpleGit,
    commitMsg: string,
    branch: string,
    scope: LogScope,
    forcePush = false
): Promise<boolean> => {
    const status = await git.status()

    if (status.files.length === 0) {
        logWriteLine(scope, `No changes found`)

        return false
    }

    logWriteLine(scope, `Stage changes`)

    await git.add('.')

    logWriteLine(
        scope,
        [
            ...status.modified.map(x => ({ filePath: x, changeType: '~' })),
            ...status.deleted.map(x => ({ filePath: x, changeType: '-' })),
            ...status.created.map(x => ({ filePath: x, changeType: '+' })),
        ]
            .map(x => `${scope}: Commit (${x.changeType}) ${x.filePath}`)
            .join('\n') + '\n'
    )

    logWriteLine(scope, `Creating '${commitMsg}' commit...`)

    await git.commit(commitMsg)

    logExtendLastLine('Done!')

    logWriteLine(scope, `Pushing...`)

    await git.push('origin', branch, forcePush ? ['--force'] : [])

    logExtendLastLine('Done!')

    return true
}

export const copyFiles = async (
    git: SimpleGit,
    fromDir: string,
    toDir: string,
    sliceIgnores: string[],
    scope: LogScope
): Promise<string[]> => {
    logWriteLine(scope, `Copy files from '${fromDir}' to '${toDir}'...`)

    const compareResponse = compareSync(toDir, fromDir, {
        compareContent: true,
        compareDate: false,
        compareSize: false,
        compareSymlink: true,
        excludeFilter: [
            '**/.DS_Store',
            '**/.git/**',
            // It requires to have `**/` as prefix to work with dir-compare filter
            ...sliceIgnores.map(x => (x.startsWith('**/') ? x : `**/${x.replace(/^\/+/, '')}`)),
        ].join(','),
    })

    logExtendLastLine('Done!')

    if (!compareResponse.diffSet || compareResponse.diffSet.length === 0) {
        logWriteLine(scope, `Found 0 diff file(s)!`)

        return []
    }

    const fileChanges: string[] = []

    // Filter files only on left = to Dir
    const onlyOnToDirFiles = compareResponse.diffSet.filter(dif => dif.state === 'left')

    logWriteLine(scope, `Found ${onlyOnToDirFiles.length} onlyOnToDir file(s)!`)

    for (let i = 0; i < onlyOnToDirFiles.length; i++) {
        const diff = onlyOnToDirFiles[i]

        const filePath = `${diff.relativePath.substring(1)}/${diff.name1}`
        const absPath = path.join(toDir, filePath)

        logWriteLine(scope, `Deleting: ${filePath}...`)

        fs.rmSync(absPath, { force: true, recursive: true })
        fileChanges.push(absPath)

        logExtendLastLine('Done!')
    }

    const symlinkFiles: { filePath: string; targetLink: string; reason: Reason; state: DifferenceState }[] = []

    // TODO: Getting problem with `.gitignore` related case
    // + Client push update some files, then add them to .gitignore
    // + When we copy those files into slice ropo (included .gitignore) => source won't have those files

    // Filter files only on right = from Dir
    const onlyOnFromDirFiles = compareResponse.diffSet.filter(dif => dif.state === 'right')

    logWriteLine(scope, `Found ${onlyOnFromDirFiles.length} onlyOnFromDir file(s)!`)

    for (let i = 0; i < onlyOnFromDirFiles.length; i++) {
        const diff = onlyOnFromDirFiles[i]
        const filePath = `${diff.relativePath.substring(1)}/${diff.name2}`
        const lstat = await fs.lstat(path.join(fromDir, filePath))

        if (lstat.isSymbolicLink()) {
            const targetLink = await fs.readlink(path.join(fromDir, filePath))

            symlinkFiles.push({
                filePath,
                targetLink,
                reason: diff.reason,
                state: diff.state,
            })
        } else if (lstat.isFile()) {
            logWriteLine(scope, `Copying: ${filePath}...`)

            fs.copySync(path.join(fromDir, filePath), path.join(toDir, filePath), {
                overwrite: true,
                dereference: false,
                recursive: false,
            })

            fileChanges.push(path.join(toDir, filePath))

            logExtendLastLine('Done!')
        }
    }

    const distinctFiles = compareResponse.diffSet.filter(dif => dif.state === 'distinct')

    logWriteLine(scope, `Found ${distinctFiles.length} distinct file(s)!`)

    for (let i = 0; i < distinctFiles.length; i++) {
        const diff = distinctFiles[i]
        const filePath = `${diff.relativePath.substring(1)}/${diff.name1}`
        const lstat = await fs.lstat(path.join(fromDir, filePath))

        if (lstat.isSymbolicLink()) {
            const targetLink = await fs.readlink(path.join(fromDir, filePath))

            symlinkFiles.push({
                filePath,
                targetLink,
                reason: diff.reason,
                state: diff.state,
            })
        } else if (lstat.isFile()) {
            logWriteLine(scope, `Overriding: ${filePath}...`)

            fs.copySync(path.join(fromDir, filePath), path.join(toDir, filePath), {
                overwrite: true,
                dereference: false,
                recursive: false,
            })

            fileChanges.push(path.join(toDir, filePath))

            logExtendLastLine('Done!')
        }
    }

    logWriteLine(scope, `Found ${symlinkFiles.length} symlinks!`)

    for (let i = 0; i < symlinkFiles.length; i++) {
        const { filePath, targetLink, reason, state } = symlinkFiles[i]

        logWriteLine(scope, `Checking symlink target: ${filePath} (${state}/${reason ?? 'No reason'})...`)

        if (state === 'distinct' && reason === 'different-symlink') {
            const symlinkPath = path.join(toDir, filePath)

            fs.rmSync(symlinkPath, { force: true })
            fs.symlinkSync(targetLink, symlinkPath)

            fileChanges.push(symlinkPath)

            logExtendLastLine('Done!')

            continue
        }

        if (state === 'right') {
            const symlinkPath = path.join(toDir, filePath)

            fs.symlinkSync(targetLink, symlinkPath)

            fileChanges.push(symlinkPath)

            logExtendLastLine('Done!')

            continue
        }

        logExtendLastLine('Ignored!')
    }

    const status = await git.status()

    logWriteLine(
        scope,
        `Found ${fileChanges.length} diff files during compare - Git status: ${status.files.length} files`
    )

    return fileChanges
}

export const cleanAndDeleteLocalBranch = async (
    git: SimpleGit,
    scope: LogScope,
    defaultBranch: string,
    branch: string
): Promise<void> => {
    logWriteLine(scope, 'Clean...')

    await git.reset(ResetMode.HARD)
    await git.clean(CleanOptions.FORCE + CleanOptions.RECURSIVE + CleanOptions.IGNORED_INCLUDED)

    logExtendLastLine('Done!')

    logWriteLine(scope, 'Fetch...')

    await git.fetch('origin')

    logExtendLastLine('Done!')

    logWriteLine(scope, `Delete local branch '${branch}'...`)

    try {
        await git.checkout(defaultBranch)
        await git.pull('origin', defaultBranch)
        await git.branch(['-D', branch])
        await git.branch(['-Dr', branch])
    } catch (error) {
        // noop
    }

    logExtendLastLine('Done!')
}
