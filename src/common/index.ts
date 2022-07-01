import { Glob } from 'glob'
import path from 'path'
import fs from 'fs-extra'
import { terminal } from 'terminal-kit'
import { GitError, SimpleGit } from 'simple-git'
import { compareSync, DifferenceState, Reason } from 'dir-compare'
import { ErrorLike, LogScope } from '../types'

export * from './gitInit'

export const logWrite = (scope: LogScope, content: string) => {
    let now = new Date()

    terminal(`\n[${now.toISOString()}] ${scope}: ${content}`)

    return (contentExtending?: string) => {
        if (!contentExtending) {
            terminal(`\n`)
            return
        }

        const current = new Date()
        const duration = (current.getTime() - now.getTime()) / 1000

        terminal(`${contentExtending.trim()} (${duration.toFixed(3)}s)`)

        now = current
    }
}
export const isErrorLike = (value: unknown): value is ErrorLike =>
    typeof value === 'object' && value !== null && ('stack' in value || 'message' in value)

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

        let logExtend = logWrite(scope, `Getting ingoring files/directores with pattern '${pattern}'...`)

        const mg = new Glob(pattern, {
            cwd: rootDir,
            sync: true,
        })

        logExtend(`Found ${mg.found.length} files/directories!`)

        if (mg.found.length === 0) {
            continue
        }

        for (let j = 0; j < mg.found.length; j++) {
            const pathMatch = mg.found[j]
            const resolvedPath = path.join(rootDir, pathMatch)

            logExtend = logWrite(scope, `Deleting: ${pathMatch}...`)

            fs.rmSync(resolvedPath, { force: true, recursive: true })

            logExtend('Done!')
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
        logWrite(scope, `No changes found`)()

        return false
    }

    logWrite(scope, `Stage changes`)

    await git.add('.')

    logWrite(
        scope,
        [
            ...status.modified.map(x => ({ filePath: x, changeType: '~' })),
            ...status.deleted.map(x => ({ filePath: x, changeType: '-' })),
            ...status.created.map(x => ({ filePath: x, changeType: '+' })),
        ]
            .map(x => `${scope}: Commit (${x.changeType}) ${x.filePath}`)
            .join('\n') + '\n'
    )

    let logExtend = logWrite(scope, `Creating '${commitMsg}' commit...`)

    await git.commit(commitMsg)

    logExtend('Done!')

    logExtend = logWrite(scope, `Pushing...`)

    await git.push('origin', branch, forcePush ? ['--force'] : [])

    logExtend('Done!')

    return true
}

export const copyFiles = async (
    git: SimpleGit,
    fromDir: string,
    toDir: string,
    sliceIgnores: string[],
    scope: LogScope
): Promise<string[]> => {
    logWrite(scope, `Copy files from '${fromDir}' to '${toDir}'...`)

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

    if (!compareResponse.diffSet || compareResponse.diffSet.length === 0) {
        logWrite(scope, `Found 0 diff file(s)!`)

        return []
    }

    const fileChanges: string[] = []

    // Filter files only on left = to Dir
    const onlyOnToDirFiles = compareResponse.diffSet.filter(dif => dif.state === 'left')

    logWrite(scope, `Found ${onlyOnToDirFiles.length} onlyOnToDir file(s)!`)

    for (let i = 0; i < onlyOnToDirFiles.length; i++) {
        const diff = onlyOnToDirFiles[i]

        const filePath = `${diff.relativePath.substring(1)}/${diff.name1}`
        const absPath = path.join(toDir, filePath)

        const logExtend = logWrite(scope, `Deleting: ${filePath}...`)

        fs.rmSync(absPath, { force: true, recursive: true })
        fileChanges.push(absPath)

        logExtend('Done!')
    }

    const symlinkFiles: { filePath: string; targetLink: string; reason: Reason; state: DifferenceState }[] = []

    // TODO: Getting problem with `.gitignore` related case
    // + Client push update some files, then add them to .gitignore
    // + When we copy those files into slice ropo (included .gitignore) => source won't have those files

    // Filter files only on right = from Dir
    const onlyOnFromDirFiles = compareResponse.diffSet.filter(dif => dif.state === 'right')

    logWrite(scope, `Found ${onlyOnFromDirFiles.length} onlyOnFromDir file(s)!`)

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
            const logExtend = logWrite(scope, `Copying: ${filePath}...`)

            fs.copySync(path.join(fromDir, filePath), path.join(toDir, filePath), {
                overwrite: true,
                dereference: false,
                recursive: false,
            })

            fileChanges.push(path.join(toDir, filePath))

            logExtend('Done!')
        }
    }

    const distinctFiles = compareResponse.diffSet.filter(dif => dif.state === 'distinct')

    logWrite(scope, `Found ${distinctFiles.length} distinct file(s)!`)

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
            const logExtend = logWrite(scope, `Overriding: ${filePath}...`)

            fs.copySync(path.join(fromDir, filePath), path.join(toDir, filePath), {
                overwrite: true,
                dereference: false,
                recursive: false,
            })

            fileChanges.push(path.join(toDir, filePath))

            logExtend('Done!')
        }
    }

    logWrite(scope, `Found ${symlinkFiles.length} symlinks!`)

    for (let i = 0; i < symlinkFiles.length; i++) {
        const { filePath, targetLink, reason, state } = symlinkFiles[i]

        const logExtend = logWrite(scope, `Checking symlink target: ${filePath} (${state}/${reason ?? 'No reason'})...`)

        if (state === 'distinct' && reason === 'different-symlink') {
            const symlinkPath = path.join(toDir, filePath)

            fs.rmSync(symlinkPath, { force: true })
            fs.symlinkSync(targetLink, symlinkPath)

            fileChanges.push(symlinkPath)

            logExtend('Done!')

            continue
        }

        if (state === 'right') {
            const symlinkPath = path.join(toDir, filePath)

            fs.symlinkSync(targetLink, symlinkPath)

            fileChanges.push(symlinkPath)

            logExtend('Done!')

            continue
        }

        logExtend('Ignored!')
    }

    const status = await git.status()

    logWrite(scope, `Found ${fileChanges.length} diff files during compare - Git status: ${status.files.length} files`)

    return fileChanges
}
