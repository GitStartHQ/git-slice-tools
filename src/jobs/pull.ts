import { CleanOptions, ResetMode, SimpleGit } from 'simple-git'
import { terminal } from 'terminal-kit'
import {
    copyFiles,
    createCommitAndPushCurrentChanges,
    deleteSliceIgnoresFilesDirs,
    logWriteLine,
    logExtendLastLine,
} from '../common'
import { ActionInputs } from '../types'

export const pull = async (sliceGit: SimpleGit, upstreamGit: SimpleGit, actionInputs: ActionInputs): Promise<void> => {
    terminal('-'.repeat(30) + '\n')
    terminal('Performing pull job...\n')

    logWriteLine('Upstream', `Checkout and pull last versions '${actionInputs.upstreamRepo.defaultBranch}' branch...`)

    await upstreamGit.reset(ResetMode.HARD)
    await upstreamGit.checkout(actionInputs.upstreamRepo.defaultBranch)
    await upstreamGit.reset(['--hard', `origin/${actionInputs.upstreamRepo.defaultBranch}`])
    await upstreamGit.pull('origin', actionInputs.upstreamRepo.defaultBranch)

    logExtendLastLine('Done!')

    logWriteLine('Upstream', `Clean...`)

    await upstreamGit.clean(CleanOptions.FORCE + CleanOptions.RECURSIVE + CleanOptions.IGNORED_INCLUDED)

    logExtendLastLine('Done!')

    logWriteLine('Upstream', `Get last commit oid...`)

    const upstreamLastCommitId = await upstreamGit.revparse('HEAD')

    logExtendLastLine(`Done! -> ${upstreamLastCommitId}`)

    logWriteLine('Slice', `Checkout and pull last versions '${actionInputs.sliceRepo.defaultBranch}' branch...`)

    await sliceGit.checkout(actionInputs.sliceRepo.defaultBranch)
    await sliceGit.reset(['--hard', `origin/${actionInputs.sliceRepo.defaultBranch}`])
    await sliceGit.pull('origin', actionInputs.sliceRepo.defaultBranch)

    logExtendLastLine('Done!')

    logWriteLine('Slice', `Clean...`)

    await sliceGit.clean(CleanOptions.FORCE + CleanOptions.RECURSIVE + CleanOptions.IGNORED_INCLUDED)

    logExtendLastLine('Done!')

    await deleteSliceIgnoresFilesDirs(actionInputs.sliceIgnores, actionInputs.upstreamRepo.dir, 'Upstream')

    const diffFiles = await copyFiles(
        sliceGit,
        actionInputs.upstreamRepo.dir,
        actionInputs.sliceRepo.dir,
        actionInputs.sliceIgnores,
        'Slice'
    )

    if (diffFiles.length !== 0) {
        await sliceGit.raw('add', '.', '--force')

        await createCommitAndPushCurrentChanges(
            sliceGit,
            `git-slice:${upstreamLastCommitId}`,
            actionInputs.sliceRepo.defaultBranch,
            'Slice'
        )
    }

    logWriteLine('Slice', `Up to date`)
}
