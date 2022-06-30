import { terminal } from 'terminal-kit'
import yargs from 'yargs/yargs'
import { loadValidateActionInputs } from './config'
import { init, pull, push, checkout, raisePr } from './jobs'

const argv = yargs(process.argv.slice(2))
    .options({
        action: { type: 'string', choices: ['pull', 'push', 'checkout', 'raise-pr'], alias: 'a' },
        branch: { type: 'string', alias: 'b' },
        title: { type: 'string', alias: 't' },
        description: { type: 'string', alias: 'd' },
        message: { type: 'string', alias: 'm' },
        forcePush: { type: 'boolean', alias: 'force-push', default: false },
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

            if (!argv.title || typeof argv.title !== 'string') {
                throw new Error(`raise-pr job: 'title' in string is required`)
            }

            if (!argv.description || typeof argv.description !== 'string') {
                throw new Error(`raise-pr job: 'description' in string is required`)
            }

            return raisePr(actionInputs, argv.branch, argv.title, argv.description)
        }
        default: {
            return
        }
    }
})
