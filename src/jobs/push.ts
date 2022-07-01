import { CleanOptions, ResetMode, SimpleGit } from 'simple-git'
import { terminal } from 'terminal-kit'
import {
    copyFiles,
    createCommitAndPushCurrentChanges,
    deleteSliceIgnoresFilesDirs,
    logExtendLastLine,
    logWriteLine,
    pullRemoteBranchIntoCurrentBranch,
} from '../common'
import { ActionInputs, LogScope } from '../types'

const cleanAndDeleteLocalBranch = async (
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

export const push = async (
    sliceGit: SimpleGit,
    upstreamGit: SimpleGit,
    actionInputs: ActionInputs,
    sliceBranch: string,
    commitMsg: string,
    forcePush: boolean
): Promise<void> => {
    terminal('-'.repeat(30) + '\n')
    terminal(`Performing push job with ${JSON.stringify({ sliceBranch, commitMsg, forcePush })}...\n`)

    if (!actionInputs.pushCommitMsgRegex.test(commitMsg)) {
        throw new Error('Commit message failed PUSH_COMMIT_MSG_REGEX')
    }

    const upstreamBranch = actionInputs.pushBranchNameTemplate.replace('<branch_name>', sliceBranch)

    await cleanAndDeleteLocalBranch(sliceGit, 'Slice', actionInputs.sliceRepo.defaultBranch, sliceBranch)

    // Find the oid from last gitslice:*** commit

    logWriteLine('Slice', `Finding the last git-slice:*** commit...`)

    const logs = await sliceGit.log({ maxCount: 20 })
    const lastGitSlicePullLog = logs.all.find(x => /^git-slice:.*$/.test(x.message.trim()))

    if (!lastGitSlicePullLog) {
        logExtendLastLine('Not found!')

        throw new Error('Not found git-slice:*** commit in last 20 commits')
    }

    const currentSyncUpstreamCommitId = lastGitSlicePullLog.message.trim().split(':')[1]

    logExtendLastLine(`${currentSyncUpstreamCommitId}\n`)
    logWriteLine('Slice', `Checkout branch '${sliceBranch}'...`)

    try {
        await sliceGit.checkout(sliceBranch)
        await sliceGit.pull('origin', sliceBranch)

        logExtendLastLine('Done!')
    } catch (error) {
        // noop
        logExtendLastLine('Not found!')

        throw error
    }

    await pullRemoteBranchIntoCurrentBranch('Slice', sliceGit, actionInputs.sliceRepo.defaultBranch, sliceBranch)
    await deleteSliceIgnoresFilesDirs(actionInputs.sliceIgnores, actionInputs.sliceRepo.dir, 'Slice')
    await cleanAndDeleteLocalBranch(upstreamGit, 'Upstream', actionInputs.upstreamRepo.defaultBranch, upstreamBranch)

    let upstreamBranchExists = false

    try {
        logWriteLine('Upstream', `Check remote branch '${upstreamBranch}'...`)

        await upstreamGit.show(`remotes/origin/${upstreamBranch}`)

        upstreamBranchExists = true

        logExtendLastLine('Existed!\n')
    } catch (error) {
        logExtendLastLine('Not found!\n')
    }

    if (!upstreamBranchExists || forcePush) {
        logWriteLine('Upstream', `Checkout new branch '${upstreamBranch}'...`)

        await upstreamGit.checkoutLocalBranch(upstreamBranch)

        logExtendLastLine('Done!\n')

        const diffFiles = await copyFiles(
            upstreamGit,
            actionInputs.sliceRepo.dir,
            actionInputs.upstreamRepo.dir,
            actionInputs.sliceIgnores,
            'Upstream'
        )

        if (!diffFiles.length) {
            return
        }

        await createCommitAndPushCurrentChanges(upstreamGit, commitMsg, upstreamBranch, 'Upstream', true)

        return
    }

    logWriteLine('Upstream', `Upstream: Checkout branch '${upstreamBranch}'...`)

    await upstreamGit.checkout(upstreamBranch)
    await upstreamGit.pull('origin', upstreamBranch)
    await pullRemoteBranchIntoCurrentBranch(
        'Upstream',
        upstreamGit,
        // we merge the revision which current slice's default branch is synced at
        // instead of upstream's default branch which can be missed matching while running in parallel
        currentSyncUpstreamCommitId,
        upstreamBranch,
        // We ignore merging error on upstream to allow pushing updates when there are conflicts on upstream repo.
        // In this case, commit below will contain both updates + merge base commit
        true
    )

    logExtendLastLine('Done!\n')

    const diffFiles = await copyFiles(
        upstreamGit,
        actionInputs.sliceRepo.dir,
        actionInputs.upstreamRepo.dir,
        actionInputs.sliceIgnores,
        'Upstream'
    )

    if (!diffFiles.length) {
        return
    }

    await createCommitAndPushCurrentChanges(upstreamGit, commitMsg, upstreamBranch, 'Upstream', false)
}
