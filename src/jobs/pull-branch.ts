import gitUrlParse from 'git-url-parse'
import { Octokit } from 'octokit'
import { CleanOptions, ResetMode, SimpleGit } from 'simple-git'
import { terminal } from 'terminal-kit'
import {
    cleanAndDeleteLocalBranch,
    copyFiles,
    createCommitAndPushCurrentChanges,
    logExtendLastLine,
    logWriteLine,
} from '../common'
import { ActionInputs } from '../types'

export const pullBranch = async (
    sliceGit: SimpleGit,
    upstreamGit: SimpleGit,
    actionInputs: ActionInputs,
    upstreamBranch: string,
    targetSliceBranch?: string
): Promise<void> => {
    terminal('-'.repeat(30) + '\n')
    terminal(`Performing pull-branch job with ${JSON.stringify({ upstreamBranch, targetSliceBranch })}...\n`)

    const sliceBranch = `upstream-${upstreamBranch}`

    logWriteLine('Upstream', `Checkout and pull last versions '${upstreamBranch}' branch...`)

    await upstreamGit.reset(ResetMode.HARD)
    await upstreamGit.checkout(upstreamBranch)
    await upstreamGit.reset(['--hard', `origin/${upstreamBranch}`])
    await upstreamGit.pull('origin', upstreamBranch)

    logExtendLastLine('Done!')

    logWriteLine('Upstream', `Clean...`)

    await upstreamGit.clean(CleanOptions.FORCE + CleanOptions.RECURSIVE + CleanOptions.IGNORED_INCLUDED)

    logExtendLastLine('Done!')

    logWriteLine('Slice', `Checkout and pull last versions '${actionInputs.sliceRepo.defaultBranch}' branch...`)

    await sliceGit.checkout(actionInputs.sliceRepo.defaultBranch)
    await sliceGit.reset(['--hard', `origin/${actionInputs.sliceRepo.defaultBranch}`])
    await sliceGit.pull('origin', actionInputs.sliceRepo.defaultBranch)

    logExtendLastLine('Done!')

    logWriteLine('Slice', `Clean...`)

    await sliceGit.clean(CleanOptions.FORCE + CleanOptions.RECURSIVE + CleanOptions.IGNORED_INCLUDED)

    logExtendLastLine('Done!')

    logWriteLine('Slice', `Checkout new branch '${sliceBranch}'...`)

    await cleanAndDeleteLocalBranch(sliceGit, 'Slice', actionInputs.sliceRepo.defaultBranch, sliceBranch)
    await sliceGit.checkoutLocalBranch(sliceBranch)

    logExtendLastLine('Done!')

    logWriteLine('Slice', `Copying diffs from upstream branch to slice branch...`)

    await copyFiles(
        sliceGit,
        actionInputs.upstreamRepo.dir,
        actionInputs.sliceRepo.dir,
        actionInputs.sliceIgnores,
        'Slice'
    )

    logExtendLastLine('Done!')

    logWriteLine('Slice', `Staging diffs...`)

    await sliceGit.raw('add', '.', '--force')

    logExtendLastLine('Done!')

    await createCommitAndPushCurrentChanges(
        sliceGit,
        `feat: pull changes from upstream branch ${upstreamBranch}`,
        sliceBranch,
        'Slice',
        true
    )

    if (!targetSliceBranch) {
        logWriteLine('Slice', `Pulled upstream branch '${upstreamBranch}' to slice branch ${sliceBranch}`)
        return
    }

    const sliceGitUrlObject = gitUrlParse(actionInputs.sliceRepo.gitHttpUri)
    const sliceOctokit = new Octokit({
        auth: actionInputs.sliceRepo.userToken,
    })

    logWriteLine('Slice', `Finding PR (${targetSliceBranch} <- ${sliceBranch}) ...`)

    const listResponse = await sliceOctokit.rest.pulls.list({
        owner: sliceGitUrlObject.owner,
        repo: sliceGitUrlObject.name,
        base: targetSliceBranch,
        head: `${sliceGitUrlObject.owner}:${sliceBranch}`,
        state: 'open',
    })

    if (listResponse.data.length !== 0) {
        const { number: slicePrNumber, html_url } = listResponse.data[0]

        logExtendLastLine(`PR #${slicePrNumber}`)

        logWriteLine(
            'Slice',
            `Pulled upstream branch '${upstreamBranch}' to slice branch ${sliceBranch} and PR ${slicePrNumber} (${html_url}) is available`
        )
    }

    logExtendLastLine(`Not found!`)

    logWriteLine('Slice', `Raising new PR (${targetSliceBranch} <- ${sliceBranch})...`)

    const createResponse = await sliceOctokit.rest.pulls.create({
        owner: sliceGitUrlObject.owner,
        repo: sliceGitUrlObject.name,
        title: `${targetSliceBranch} <- upstream ${upstreamBranch}`,
        body: `This PR is for synching changes from branch ${upstreamBranch} on upstream repo to branch ${targetSliceBranch} on slice repo`,
        base: targetSliceBranch,
        head: `${sliceGitUrlObject.owner}:${sliceBranch}`,
        draft: actionInputs.prDraft,
        maintainer_can_modifyboolean: true,
    })

    logExtendLastLine(`Done PR #${createResponse.data.number}`)

    logWriteLine(
        'Slice',
        `Pulled upstream branch '${upstreamBranch}' to slice branch ${sliceBranch} and PR ${createResponse.data.number} (${createResponse.data.html_url}) is available`
    )
}
