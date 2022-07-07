"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadValidateActionInputs = void 0;
var dotenv_1 = __importDefault(require("dotenv"));
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
dotenv_1.default.config();
var loadValidateActionInputs = function () {
    var forceInit = !process.env.GIT_SLICE_FORCE_GIT_INIT || process.env.GIT_SLICE_FORCE_GIT_INIT !== 'false';
    if (!process.env.GIT_SLICE_UPSTREAM_REPO_DIR ||
        !fs_1.default.existsSync(path_1.default.resolve(process.cwd(), process.env.GIT_SLICE_UPSTREAM_REPO_DIR))) {
        throw new Error("Missing 'UPSTREAM_REPO_DIR' or 'UPSTREAM_REPO_DIR' doesn't exist ");
    }
    if (!process.env.GIT_SLICE_SLICE_REPO_DIR ||
        !fs_1.default.existsSync(path_1.default.resolve(process.cwd(), process.env.GIT_SLICE_SLICE_REPO_DIR))) {
        throw new Error("Missing 'SLICE_REPO_DIR' or 'SLICE_REPO_DIR' doesn't exist ");
    }
    if (!process.env.GIT_SLICE_SLICE_REPO_DEFAULT_BRANCH) {
        throw new Error("Missing 'GIT_SLICE_SLICE_REPO_DEFAULT_BRANCH'");
    }
    if (!process.env.GIT_SLICE_UPSTREAM_REPO_DEFAULT_BRANCH) {
        throw new Error("Missing 'GIT_SLICE_UPSTREAM_REPO_DEFAULT_BRANCH'");
    }
    if (!process.env.GIT_SLICE_SLICE_REPO_USERNAME) {
        throw new Error("Missing 'GIT_SLICE_SLICE_REPO_USERNAME'");
    }
    if (!process.env.GIT_SLICE_UPSTREAM_REPO_USERNAME) {
        throw new Error("Missing 'GIT_SLICE_UPSTREAM_REPO_USERNAME'");
    }
    if (!process.env.GIT_SLICE_SLICE_REPO_PASSWORD) {
        throw new Error("Missing 'GIT_SLICE_SLICE_REPO_PASSWORD'");
    }
    if (!process.env.GIT_SLICE_UPSTREAM_REPO_PASSWORD) {
        throw new Error("Missing 'GIT_SLICE_UPSTREAM_REPO_PASSWORD'");
    }
    if (!process.env.GIT_SLICE_SLICE_REPO_URL) {
        throw new Error("Missing 'GIT_SLICE_SLICE_REPO_URL'");
    }
    if (!process.env.GIT_SLICE_UPSTREAM_REPO_URL) {
        throw new Error("Missing 'GIT_SLICE_UPSTREAM_REPO_URL'");
    }
    if (!process.env.GIT_SLICE_SLICE_REPO_EMAIL) {
        throw new Error("Missing 'GIT_SLICE_SLICE_REPO_EMAIL'");
    }
    if (!process.env.GIT_SLICE_UPSTREAM_REPO_EMAIL) {
        throw new Error("Missing 'GIT_SLICE_UPSTREAM_REPO_EMAIL'");
    }
    var sliceIgnores = ['.github/workflows', 'git-slice.json'];
    if (process.env.GIT_SLICE_SLICE_IGNORES) {
        try {
            var parsedSliceIgnores = JSON.parse(process.env.GIT_SLICE_SLICE_IGNORES);
            if (!Array.isArray(parsedSliceIgnores)) {
                throw new Error();
            }
            sliceIgnores.push.apply(sliceIgnores, parsedSliceIgnores);
        }
        catch (error) {
            throw new Error("Parsing 'GIT_SLICE_SLICE_IGNORES' failed");
        }
    }
    var pushBranchNameTemplate = process.env.GIT_SLICE_PUSH_BRANCH_NAME_TEMPLATE || '<branch_name>';
    var pushCommitMsgRegex = new RegExp(process.env.GIT_SLICE_PUSH_COMMIT_MSG_REGEX || '.*', 'gi');
    var prLabels = [];
    if (process.env.GIT_SLICE_PR_LABELS) {
        try {
            var parsedPRLabels = JSON.parse(process.env.GIT_SLICE_PR_LABELS);
            if (!Array.isArray(parsedPRLabels)) {
                throw new Error();
            }
            prLabels.push.apply(prLabels, parsedPRLabels);
        }
        catch (error) {
            throw new Error("Parsing 'GIT_SLICE_PR_LABELS' failed");
        }
    }
    var prDraft = !process.env.GIT_SLICE_FORCE_GIT_INIT || process.env.GIT_SLICE_FORCE_GIT_INIT !== 'false';
    return {
        sliceIgnores: sliceIgnores,
        pushBranchNameTemplate: pushBranchNameTemplate,
        pushCommitMsgRegex: pushCommitMsgRegex,
        forceInit: forceInit,
        prLabels: prLabels,
        prDraft: prDraft,
        sliceRepo: {
            name: 'Slice',
            dir: path_1.default.resolve(process.cwd(), process.env.GIT_SLICE_SLICE_REPO_DIR),
            defaultBranch: process.env.GIT_SLICE_SLICE_REPO_DEFAULT_BRANCH,
            username: process.env.GIT_SLICE_SLICE_REPO_USERNAME,
            userEmail: process.env.GIT_SLICE_SLICE_REPO_EMAIL,
            userToken: process.env.GIT_SLICE_SLICE_REPO_PASSWORD,
            gitHttpUri: process.env.GIT_SLICE_SLICE_REPO_URL,
        },
        upstreamRepo: {
            name: 'Upstream',
            dir: path_1.default.resolve(process.cwd(), process.env.GIT_SLICE_UPSTREAM_REPO_DIR),
            defaultBranch: process.env.GIT_SLICE_UPSTREAM_REPO_DEFAULT_BRANCH,
            username: process.env.GIT_SLICE_UPSTREAM_REPO_USERNAME,
            userEmail: process.env.GIT_SLICE_UPSTREAM_REPO_EMAIL,
            userToken: process.env.GIT_SLICE_UPSTREAM_REPO_PASSWORD,
            gitHttpUri: process.env.GIT_SLICE_UPSTREAM_REPO_URL,
        },
    };
};
exports.loadValidateActionInputs = loadValidateActionInputs;
//# sourceMappingURL=loadValidateActionInputs.js.map