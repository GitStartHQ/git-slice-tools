import { Octokit } from 'octokit'
import { terminal } from 'terminal-kit'
import gitUrlParse from 'git-url-parse'
import { ActionInputs } from '../types'
import { isErrorLike, logWriteLine, logExtendLastLine } from '../common'

export const raisePr = async (
    actionInputs: ActionInputs,
    sliceBranch: string,
    title: string,
    description: string
): Promise<void> => {
    terminal('-'.repeat(30) + '\n')
    terminal(`Performing raise-pr job with ${JSON.stringify({ sliceBranch, title, description })}...\n`)

    const upstreamBranch = actionInputs.pushBranchNameTemplate.replace('<branch_name>', sliceBranch)
    const repo = actionInputs.upstreamRepo
    const gitUrlObject = gitUrlParse(repo.gitHttpUri)

    if (gitUrlObject.source !== 'github.com') {
        throw new Error(`Unsuported codehost '${gitUrlObject.source}'`)
    }

    const octokit = new Octokit({
        auth: repo.userToken,
    })

    logWriteLine('Upstream', `Checking existing PR (${repo.defaultBranch} <- ${upstreamBranch})...`)

    const listResponse = await octokit.rest.pulls.list({
        owner: gitUrlObject.owner,
        repo: gitUrlObject.name,
        base: repo.defaultBranch,
        head: `${gitUrlObject.owner}:${upstreamBranch}`,
        state: 'open',
    })

    if (listResponse.data.length !== 0) {
        logExtendLastLine(`Found PR #${listResponse.data[0].number} (${listResponse.data[0].html_url})`)
        logWriteLine('Upstream', `Done!`)

        return
    }

    logExtendLastLine(`Not found!`)

    logWriteLine('Upstream', `Raising new PR (${repo.defaultBranch} <- ${upstreamBranch})...`)

    const createResponse = await octokit.rest.pulls.create({
        owner: gitUrlObject.owner,
        repo: gitUrlObject.name,
        title,
        body: description,
        base: repo.defaultBranch,
        head: `${gitUrlObject.owner}:${upstreamBranch}`,
        draft: actionInputs.prDraft,
        maintainer_can_modifyboolean: true,
    })
    const prNumber = createResponse.data.number

    logExtendLastLine(`Done PR #${prNumber}`)

    await octokit.rest.issues.addLabels({
        issue_number: prNumber,
        owner: gitUrlObject.owner,
        repo: gitUrlObject.name,
        labels: actionInputs.prLabels,
    })

    logWriteLine('Upstream', `Adding assignees into PR #${prNumber}...`)
    try {
        await octokit.rest.issues.addAssignees({
            issue_number: prNumber,
            owner: gitUrlObject.owner,
            repo: gitUrlObject.name,
            assignees: [repo.username],
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
            await octokit.rest.issues.addLabels({
                issue_number: prNumber,
                owner: gitUrlObject.owner,
                repo: gitUrlObject.name,
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
