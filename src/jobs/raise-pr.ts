import { terminal } from 'terminal-kit'
import { ActionInputs } from '../types'

export const raisePr = async (
    actionInputs: ActionInputs,
    sliceBranch: string,
    title: string,
    description: string
): Promise<void> => {
    terminal('-'.repeat(30) + '\n')
    terminal(`Performing raise-pr job with ${JSON.stringify({ sliceBranch, title, description })}...\n`)

    const upstreamBranch = actionInputs.pushBranchNameTemplate.replace('<branch_name>', sliceBranch)

    terminal(`Upstream: Create PR ${actionInputs.upstreamRepo.defaultBranch} <- ${upstreamBranch} sucessfully\n`)
}
