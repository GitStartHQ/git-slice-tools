import gitUrlParse from 'git-url-parse'
import { Octokit } from 'octokit'
import { SimpleGit } from 'simple-git'
import { terminal } from 'terminal-kit'
import { logExtendLastLine, logWriteLine } from '../common'
import { ActionInputs } from '../types'

export const pullReview = async (
    sliceGit: SimpleGit,
    upstreamGit: SimpleGit,
    actionInputs: ActionInputs,
    slicePrNumber: number,
    upstreamPrReviewLink: string
): Promise<void> => {
    terminal('-'.repeat(30) + '\n')
    terminal(`Performing pull-review job with ${JSON.stringify({ slicePrNumber, upstreamPrReviewLink })}...\n`)

    const { sliceRepo, upstreamRepo } = actionInputs
    const upstreamGitUrlObject = gitUrlParse(upstreamRepo.gitHttpUri)
    const sliceGitUrlObject = gitUrlParse(sliceRepo.gitHttpUri)
    const upstreamOctokit = new Octokit({
        auth: upstreamRepo.userToken,
    })
    const sliceOctokit = new Octokit({
        auth: actionInputs.sliceRepo.userToken,
    })

    if (upstreamGitUrlObject.source !== 'github.com') {
        throw new Error(`Unsuported codehost '${upstreamGitUrlObject.source}'`)
    }

    const prReivewLinkRegResult = /\/pull\/(\d+)#pullrequestreview-(\d+)$/i.exec(upstreamPrReviewLink)

    if (!prReivewLinkRegResult || !prReivewLinkRegResult[1] || !prReivewLinkRegResult[2]) {
        throw new Error(`Invalid pr-preview-link '${upstreamPrReviewLink}'`)
    }

    const upstreamPrNumber = Number(prReivewLinkRegResult[1])
    const upstreamPrReviewNumber = Number(prReivewLinkRegResult[2])

    logWriteLine('Upstream', `Getting PR review...`)

    const { data: upstreamReview } = await upstreamOctokit.rest.pulls.getReview({
        owner: upstreamGitUrlObject.owner,
        repo: upstreamGitUrlObject.name,
        pull_number: upstreamPrNumber,
        review_id: upstreamPrReviewNumber,
    })

    logExtendLastLine(`Done!`)

    logWriteLine('Upstream', `Getting PR review comments...`)

    const { data: upstreamReviewComments } = await upstreamOctokit.rest.pulls.listCommentsForReview({
        owner: upstreamGitUrlObject.owner,
        repo: upstreamGitUrlObject.name,
        pull_number: upstreamPrNumber,
        review_id: upstreamPrReviewNumber,
        // Assume that 100 comments per review is good limit
        per_page: 100,
        page: 1,
    })

    logExtendLastLine(`Done!`)

    logWriteLine('Slice', `Creating PR review...`)

    const { data: sliceReview } = await sliceOctokit.rest.pulls.createReview({
        owner: sliceGitUrlObject.owner,
        repo: sliceGitUrlObject.name,
        pull_number: slicePrNumber,
        event: 'COMMENT',
        body: `Pull request review is synched from ${upstreamPrReviewLink} by git-slice-tools:\nFrom **_${
            upstreamReview.user?.login
        }_**:\n${upstreamReview.body ?? ''}`,
        comments: upstreamReviewComments.map(
            ({
                path,
                body,
                position,
                line,
                side,
                start_line,
                start_side,
                user,
                original_position,
                original_line,
                original_start_line,
            }) => ({
                path,
                body: `From **_${user?.login}_**:\n${body}`,
                position: position ?? original_position,
                line: line ?? original_line ?? undefined,
                side: side ?? undefined,
                start_line: start_line ?? original_start_line ?? undefined,
                start_side: start_side ?? undefined,
            })
        ),
    })

    logExtendLastLine(`Done! -> ${sliceReview.html_url}`)
}
