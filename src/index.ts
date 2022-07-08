import { SimpleGit } from 'simple-git'
import { terminal } from 'terminal-kit'
import yargs from 'yargs/yargs'
import { loadValidateActionInputs } from './config'
import { checkout, init, pull, pullBranch, pullReview, push, raisePr } from './jobs'
import { ActionInputs } from './types'

const loadActionInputsAndInit = async (
    envFilePath: string,
    cb: (parameters: { actionInputs: ActionInputs; sliceGit: SimpleGit; upstreamGit: SimpleGit }) => Promise<unknown>
): Promise<void> => {
    const actionInputs = loadValidateActionInputs(envFilePath)
    const { sliceGit, upstreamGit } = await init(actionInputs)

    terminal('Initialized git instances\n')

    await cb({ actionInputs, sliceGit, upstreamGit })

    return
}

const GLOBAL_OPTIONS_CONFIG = {
    env: {
        type: 'string',
        desc: 'File path of a text file which contains all required git-slice env variables',
    },
} as const

yargs(process.argv.slice(2))
    .option(GLOBAL_OPTIONS_CONFIG)
    .command(
        'checkout',
        'Fetch `origin` and checkout default branch of both upstream and slice repos',
        GLOBAL_OPTIONS_CONFIG,
        async ({ env }) => {
            return loadActionInputsAndInit(env, ({ sliceGit, upstreamGit, actionInputs }) =>
                checkout(sliceGit, upstreamGit, actionInputs)
            )
        }
    )
    .command('pull', 'Pull last changes from upstream repo into slice repo', GLOBAL_OPTIONS_CONFIG, async ({ env }) => {
        return loadActionInputsAndInit(env, ({ sliceGit, upstreamGit, actionInputs }) =>
            pull(sliceGit, upstreamGit, actionInputs)
        )
    })
    .command(
        'push',
        'Push a branch in slice repo to upstream repo',
        {
            ...GLOBAL_OPTIONS_CONFIG,
            branch: { type: 'string', alias: 'b', desc: 'Name of pushing branch in slice repo' },
            message: { type: 'string', alias: 'm', desc: 'Commit message' },
            forcePush: {
                type: 'boolean',
                alias: 'force-push',
                default: false,
                desc: 'Determine wether to use force push or not',
            },
        },
        async ({ env, branch, message, forcePush }) => {
            if (!branch || typeof branch !== 'string') {
                throw new Error(`push job: 'branch' in string is required`)
            }

            if (!message || typeof message !== 'string') {
                throw new Error(`push job: 'message' in string is required`)
            }

            return loadActionInputsAndInit(env, ({ sliceGit, upstreamGit, actionInputs }) =>
                push(sliceGit, upstreamGit, actionInputs, branch, message, forcePush)
            )
        }
    )
    .command(
        'raise-pr',
        'Raise new PR for branch on upstream repo (GitHub only) with details (title/body) from the PR for a branch on slice repo',
        {
            ...GLOBAL_OPTIONS_CONFIG,
            branch: { type: 'string', alias: 'b', desc: 'Name of pushing branch in slice repo' },
        },
        async ({ branch, env }) => {
            if (!branch || typeof branch !== 'string') {
                throw new Error(`raise-pr job: 'branch' in string is required`)
            }

            return loadActionInputsAndInit(env, ({ actionInputs }) => raisePr(actionInputs, branch))
        }
    )
    .command(
        'pull-branch',
        'Pull last changes of a branch from upstream repo into slice repo. The destination branch in slice repo has the pulling branch but with `upstream-*` prefix. Please note that this job uses `force-push` and the upstream should be updated to date with the default branch of upstream repo otherwise there would be some extra changes',
        {
            ...GLOBAL_OPTIONS_CONFIG,
            branch: { type: 'string', alias: 'b', desc: 'Name of pulling branch in upstream repo' },
            target: {
                type: 'string',
                alias: 'g',
                desc: "Name of target branch in slice repo. If it's passed, git-slice will create a PR (target branch <- pulling branch)",
            },
        },
        async ({ env, branch, target }) => {
            if (!branch || typeof branch !== 'string') {
                throw new Error(`pull-branch job: 'branch' in string is required`)
            }

            return loadActionInputsAndInit(env, ({ actionInputs, sliceGit, upstreamGit }) =>
                pullBranch(sliceGit, upstreamGit, actionInputs, branch, target)
            )
        }
    )
    .command(
        'pull-review',
        "Pull a PR review from a PR on upstream repo into a PR on slice repo (GitHub only). Please note that if upstream review has comments on code, this job will throw errors if upstream and slice branches don't have the same changes",
        {
            ...GLOBAL_OPTIONS_CONFIG,
            prNumber: {
                type: 'number',
                alias: 'pr-number',
                desc: 'PR number on slice repo which you want to pull a review into',
            },
            prReivewLink: {
                type: 'string',
                alias: 'pr-review-link',
                desc: 'The link of pull request review you want to pull from, ex: https://github.com/sourcegraph/sourcegraph/pull/37919#pullrequestreview-1025518547 . Actually git-slice-tools only care about `/pull/<pull_id>#pullrequestreview-<review_id>` part for getting pull request number and review id',
            },
        },
        async ({ env, prNumber, prReivewLink }) => {
            if (!prNumber || typeof prNumber !== 'number') {
                throw new Error(`pull-review job: 'pr-number' in string is required`)
            }

            if (!prReivewLink || typeof prReivewLink !== 'string') {
                throw new Error(`pull-review job: 'pr-review-link' in string is required`)
            }

            return loadActionInputsAndInit(env, ({ actionInputs, sliceGit, upstreamGit }) =>
                pullReview(sliceGit, upstreamGit, actionInputs, prNumber, prReivewLink)
            )
        }
    )
    .parseAsync()
