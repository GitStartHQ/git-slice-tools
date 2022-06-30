import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { ActionInputs } from '../types'

dotenv.config()

export const loadValidateActionInputs = (): ActionInputs => {
    const forceInit = !process.env.GIT_SLICE_FORCE_GIT_INIT || process.env.GIT_SLICE_FORCE_GIT_INIT !== 'false'

    if (
        !process.env.GIT_SLICE_UPSTREAM_REPO_DIR ||
        !fs.existsSync(path.resolve(process.cwd(), process.env.GIT_SLICE_UPSTREAM_REPO_DIR))
    ) {
        throw new Error(`Missing 'UPSTREAM_REPO_DIR' or 'UPSTREAM_REPO_DIR' doesn't exist `)
    }

    if (
        !process.env.GIT_SLICE_SLICE_REPO_DIR ||
        !fs.existsSync(path.resolve(process.cwd(), process.env.GIT_SLICE_SLICE_REPO_DIR))
    ) {
        throw new Error(`Missing 'SLICE_REPO_DIR' or 'SLICE_REPO_DIR' doesn't exist `)
    }

    if (!process.env.GIT_SLICE_SLICE_REPO_DEFAULT_BRANCH) {
        throw new Error(`Missing 'GIT_SLICE_SLICE_REPO_DEFAULT_BRANCH'`)
    }

    if (!process.env.GIT_SLICE_UPSTREAM_REPO_DEFAULT_BRANCH) {
        throw new Error(`Missing 'GIT_SLICE_UPSTREAM_REPO_DEFAULT_BRANCH'`)
    }

    if (!process.env.GIT_SLICE_SLICE_REPO_USERNAME) {
        throw new Error(`Missing 'GIT_SLICE_SLICE_REPO_USERNAME'`)
    }

    if (!process.env.GIT_SLICE_UPSTREAM_REPO_USERNAME) {
        throw new Error(`Missing 'GIT_SLICE_UPSTREAM_REPO_USERNAME'`)
    }

    if (!process.env.GIT_SLICE_SLICE_REPO_PASSWORD) {
        throw new Error(`Missing 'GIT_SLICE_SLICE_REPO_PASSWORD'`)
    }

    if (!process.env.GIT_SLICE_UPSTREAM_REPO_PASSWORD) {
        throw new Error(`Missing 'GIT_SLICE_UPSTREAM_REPO_PASSWORD'`)
    }

    if (!process.env.GIT_SLICE_SLICE_REPO_URL) {
        throw new Error(`Missing 'GIT_SLICE_SLICE_REPO_URL'`)
    }

    if (!process.env.GIT_SLICE_UPSTREAM_REPO_URL) {
        throw new Error(`Missing 'GIT_SLICE_UPSTREAM_REPO_URL'`)
    }

    if (!process.env.GIT_SLICE_SLICE_REPO_EMAIL) {
        throw new Error(`Missing 'GIT_SLICE_SLICE_REPO_EMAIL'`)
    }

    if (!process.env.GIT_SLICE_UPSTREAM_REPO_EMAIL) {
        throw new Error(`Missing 'GIT_SLICE_UPSTREAM_REPO_EMAIL'`)
    }

    const sliceIgnores: string[] = ['.github/workflows', 'git-slice.json']
    if (process.env.GIT_SLICE_SLICE_IGNORES) {
        try {
            const parsedSliceIgnores = JSON.parse(process.env.GIT_SLICE_SLICE_IGNORES)

            if (!Array.isArray(parsedSliceIgnores)) {
                throw new Error()
            }

            sliceIgnores.push(...parsedSliceIgnores)
        } catch (error) {
            throw new Error(`Parsing 'GIT_SLICE_SLICE_IGNORES' failed`)
        }
    }

    const pushBranchNameTemplate = process.env.GIT_SLICE_PUSH_BRANCH_NAME_TEMPLATE || '<branch_name>'
    const pushCommitMsgRegex = new RegExp(process.env.GIT_SLICE_PUSH_COMMIT_MSG_REGEX || '.*', 'gi')

    const prLabels: string[] = []
    if (process.env.GIT_SLICE_PR_LABELS) {
        try {
            const parsedPRLabels = JSON.parse(process.env.GIT_SLICE_PR_LABELS)

            if (!Array.isArray(parsedPRLabels)) {
                throw new Error()
            }

            prLabels.push(...parsedPRLabels)
        } catch (error) {
            throw new Error(`Parsing 'GIT_SLICE_PR_LABELS' failed`)
        }
    }

    const prDraft = !process.env.GIT_SLICE_FORCE_GIT_INIT || process.env.GIT_SLICE_FORCE_GIT_INIT !== 'false'

    return {
        sliceIgnores,
        pushBranchNameTemplate,
        pushCommitMsgRegex,
        forceInit,
        prLabels,
        prDraft,
        sliceRepo: {
            name: 'Slice',
            dir: path.resolve(process.cwd(), process.env.GIT_SLICE_SLICE_REPO_DIR),
            defaultBranch: process.env.GIT_SLICE_SLICE_REPO_DEFAULT_BRANCH,
            username: process.env.GIT_SLICE_SLICE_REPO_USERNAME,
            userEmail: process.env.GIT_SLICE_SLICE_REPO_EMAIL,
            userToken: process.env.GIT_SLICE_SLICE_REPO_PASSWORD,
            gitHttpUri: process.env.GIT_SLICE_SLICE_REPO_URL,
        },
        upstreamRepo: {
            name: 'Upstream',
            dir: path.resolve(process.cwd(), process.env.GIT_SLICE_UPSTREAM_REPO_DIR),
            defaultBranch: process.env.GIT_SLICE_UPSTREAM_REPO_DEFAULT_BRANCH,
            username: process.env.GIT_SLICE_UPSTREAM_REPO_USERNAME,
            userEmail: process.env.GIT_SLICE_UPSTREAM_REPO_EMAIL,
            userToken: process.env.GIT_SLICE_UPSTREAM_REPO_PASSWORD,
            gitHttpUri: process.env.GIT_SLICE_UPSTREAM_REPO_URL,
        },
    }
}
