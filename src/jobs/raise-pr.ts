import { Octokit } from 'octokit'
import { terminal } from 'terminal-kit'
import gitUrlParse from 'git-url-parse'
import { ActionInputs } from '../types'
import { isErrorLike, logWriteLine, logExtendLastLine } from '../common'

export const raisePr = async (actionInputs: ActionInputs, sliceBranch: string): Promise<void> => {
    terminal('-'.repeat(30) + '\n')
    terminal(`Performing raise-pr job with ${JSON.stringify({ sliceBranch })}...\n`)

    const { upstreamRepo, sliceRepo } = actionInputs
    const upstreamGitUrlObject = gitUrlParse(upstreamRepo.gitHttpUri)
    const sliceGitUrlObject = gitUrlParse(sliceRepo.gitHttpUri)

    if (upstreamGitUrlObject.source !== 'github.com') {
        throw new Error(`Unsuported codehost '${upstreamGitUrlObject.source}'`)
    }

    logWriteLine('Slice', `Finding PR (${sliceRepo.defaultBranch} <- ${sliceBranch}) ...`)

    const sliceOctokit = new Octokit({
        auth: sliceRepo.userToken,
    })

    let listResponse = await sliceOctokit.rest.pulls.list({
        owner: sliceGitUrlObject.owner,
        repo: sliceGitUrlObject.name,
        base: upstreamRepo.defaultBranch,
        head: `${sliceGitUrlObject.owner}:${sliceBranch}`,
        state: 'open',
    })

    if (listResponse.data.length === 0) {
        logExtendLastLine(`Not found!`)

        throw new Error("Couldn't find PR (${sliceRepo.defaultBranch} <- ${sliceBranch}) for getting title/description")

        return
    }

    const { title, body, number: slicePrNumber } = listResponse.data[0]

    logExtendLastLine(`PR #${slicePrNumber}`)

    if (!body) {
        throw new Error('PR #${slicePrNumber} has an empty description')
    }

    const upstreamOctokit = new Octokit({
        auth: upstreamRepo.userToken,
    })

    const upstreamBranch = actionInputs.pushBranchNameTemplate.replace('<branch_name>', sliceBranch)

    logWriteLine('Upstream', `Checking existing PR (${upstreamRepo.defaultBranch} <- ${upstreamBranch})...`)

    listResponse = await upstreamOctokit.rest.pulls.list({
        owner: upstreamGitUrlObject.owner,
        repo: upstreamGitUrlObject.name,
        base: upstreamRepo.defaultBranch,
        head: `${upstreamGitUrlObject.owner}:${upstreamBranch}`,
        state: 'open',
    })

    if (listResponse.data.length !== 0) {
        logExtendLastLine(`Found PR #${listResponse.data[0].number} (${listResponse.data[0].html_url})`)
        logWriteLine('Upstream', `Done!`)

        return
    }

    logExtendLastLine(`Not found!`)

    logWriteLine('Upstream', `Raising new PR (${upstreamRepo.defaultBranch} <- ${upstreamBranch})...`)

    const createResponse = await upstreamOctokit.rest.pulls.create({
        owner: upstreamGitUrlObject.owner,
        repo: upstreamGitUrlObject.name,
        title,
        body,
        base: upstreamRepo.defaultBranch,
        head: `${upstreamGitUrlObject.owner}:${upstreamBranch}`,
        draft: actionInputs.prDraft,
        maintainer_can_modifyboolean: true,
    })
    const prNumber = createResponse.data.number

    logExtendLastLine(`Done PR #${prNumber}`)

    await upstreamOctokit.rest.issues.addLabels({
        issue_number: prNumber,
        owner: upstreamGitUrlObject.owner,
        repo: upstreamGitUrlObject.name,
        labels: actionInputs.prLabels,
    })

    logWriteLine('Upstream', `Adding assignees into PR #${prNumber}...`)
    try {
        await upstreamOctokit.rest.issues.addAssignees({
            issue_number: prNumber,
            owner: upstreamGitUrlObject.owner,
            repo: upstreamGitUrlObject.name,
            assignees: [upstreamRepo.username],
        })

        logExtendLastLine(`Done!`)
    } catch (error) {
        if (isErrorLike(error)) {
            terminal(`Failed with following error: '${error.message}'\n`)

            return
        }
    }

    if (actionInputs.prLabels.length) {
        logWriteLine('Upstream', `Adding labels into PR #${prNumber}...`)
        try {
            await upstreamOctokit.rest.issues.addLabels({
                issue_number: prNumber,
                owner: upstreamGitUrlObject.owner,
                repo: upstreamGitUrlObject.name,
                labels: actionInputs.prLabels,
            })

            logExtendLastLine(`Done!`)
        } catch (error) {
            if (isErrorLike(error)) {
                terminal(`Failed with following error: '${error.message}'\n`)

                return
            }
        }
    }

    logWriteLine('Upstream', `Created PR #${prNumber} (${createResponse.data.html_url}) successfully`)
}
