import { terminal } from 'terminal-kit'
import { ActionInputs } from '../types'

export const raisePr = async (
    actionInputs: ActionInputs,
    sliceBranch: string,
    title: string,
    description: string
): Promise<void> => {
    terminal('-'.repeat(30) + '\n')
    terminal(`Performing push job with ${JSON.stringify({ sliceBranch, title, description })}...\n`)

    const upstreamBranch = actionInputs.pushBranchNameTemplate.replace('<branch_name>', sliceBranch)

    terminal(`Upstream: Create the PR: ${actionInputs.upstreamRepo.defaultBranch} <- ${upstreamBranch} sucessfully\n`)
}
