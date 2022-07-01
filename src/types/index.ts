export interface ActionInputs {
    sliceIgnores: string[]
    pushBranchNameTemplate: string
    pushCommitMsgRegex: RegExp
    forceInit: boolean
    sliceRepo: Repo
    upstreamRepo: Repo
    prLabels: string[]
    prDraft: boolean
}

export interface Repo {
    name: string
    dir: string
    defaultBranch: string
    username: string
    userEmail: string
    gitHttpUri: string
    userToken: string
}

export interface ErrorLike {
    message: string
    name?: string
}

export type LogScope = 'Upstream' | 'Slice'
