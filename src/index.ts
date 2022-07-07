import { terminal } from 'terminal-kit'
import yargs from 'yargs/yargs'
import { loadValidateActionInputs } from './config'
import { checkout, init, pull, pullBranch, pullReview, push, raisePr } from './jobs'

const argv = yargs(process.argv.slice(2))
    .options({
        action: {
            type: 'string',
            choices: ['pull', 'push', 'checkout', 'raise-pr', 'pull-branch', 'pull-review'],
            alias: 'a',
        },
        branch: { type: 'string', alias: 'b' },
        title: { type: 'string', alias: 't' },
        description: { type: 'string', alias: 'd' },
        message: { type: 'string', alias: 'm' },
        target: { type: 'string', alias: '-g' },
        forcePush: { type: 'boolean', alias: 'force-push', default: false },
        prNumber: { type: 'number', alias: 'pr-number' },
        prReivewLink: { type: 'string', alias: 'pr-review-link' },
    })
    .parseSync()

const actionInputs = loadValidateActionInputs()

init(actionInputs).then(({ sliceGit, upstreamGit }) => {
    terminal('Initialized git instances\n')

    switch (argv.action) {
        case 'pull': {
            return pull(sliceGit, upstreamGit, actionInputs)
        }
        case 'checkout': {
            return checkout(sliceGit, upstreamGit, actionInputs)
        }
        case 'push': {
            if (!argv.branch || typeof argv.branch !== 'string') {
                throw new Error(`push job: 'branch' in string is required`)
            }

            if (!argv.message || typeof argv.message !== 'string') {
                throw new Error(`push job: 'message' in string is required`)
            }

            return push(sliceGit, upstreamGit, actionInputs, argv.branch, argv.message, argv.forcePush)
        }
        case 'raise-pr': {
            if (!argv.branch || typeof argv.branch !== 'string') {
                throw new Error(`raise-pr job: 'branch' in string is required`)
            }

            return raisePr(actionInputs, argv.branch)
        }
        case 'pull-branch': {
            if (!argv.branch || typeof argv.branch !== 'string') {
                throw new Error(`pull-branch job: 'branch' in string is required`)
            }

            return pullBranch(sliceGit, upstreamGit, actionInputs, argv.branch, argv.target)
        }
        case 'pull-review': {
            if (!argv.prNumber || typeof argv.prNumber !== 'number') {
                throw new Error(`pull-review job: 'pr-number' in string is required`)
            }

            if (!argv.prReivewLink || typeof argv.prReivewLink !== 'string') {
                throw new Error(`pull-review job: 'pr-review-link' in string is required`)
            }

            return pullReview(sliceGit, upstreamGit, actionInputs, argv.prNumber, argv.prReivewLink)
        }
        default: {
            return
        }
    }
})
