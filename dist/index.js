"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var terminal_kit_1 = require("terminal-kit");
var yargs_1 = __importDefault(require("yargs/yargs"));
var config_1 = require("./config");
var jobs_1 = require("./jobs");
var argv = (0, yargs_1.default)(process.argv.slice(2))
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
    .parseSync();
var actionInputs = (0, config_1.loadValidateActionInputs)();
(0, jobs_1.init)(actionInputs).then(function (_a) {
    var sliceGit = _a.sliceGit, upstreamGit = _a.upstreamGit;
    (0, terminal_kit_1.terminal)('Initialized git instances\n');
    switch (argv.action) {
        case 'pull': {
            return (0, jobs_1.pull)(sliceGit, upstreamGit, actionInputs);
        }
        case 'checkout': {
            return (0, jobs_1.checkout)(sliceGit, upstreamGit, actionInputs);
        }
        case 'push': {
            if (!argv.branch || typeof argv.branch !== 'string') {
                throw new Error("push job: 'branch' in string is required");
            }
            if (!argv.message || typeof argv.message !== 'string') {
                throw new Error("push job: 'message' in string is required");
            }
            return (0, jobs_1.push)(sliceGit, upstreamGit, actionInputs, argv.branch, argv.message, argv.forcePush);
        }
        case 'raise-pr': {
            if (!argv.branch || typeof argv.branch !== 'string') {
                throw new Error("raise-pr job: 'branch' in string is required");
            }
            return (0, jobs_1.raisePr)(actionInputs, argv.branch);
        }
        case 'pull-branch': {
            if (!argv.branch || typeof argv.branch !== 'string') {
                throw new Error("pull-branch job: 'branch' in string is required");
            }
            return (0, jobs_1.pullBranch)(sliceGit, upstreamGit, actionInputs, argv.branch, argv.target);
        }
        case 'pull-review': {
            if (!argv.prNumber || typeof argv.prNumber !== 'number') {
                throw new Error("pull-review job: 'pr-number' in string is required");
            }
            if (!argv.prReivewLink || typeof argv.prReivewLink !== 'string') {
                throw new Error("pull-review job: 'pr-review-link' in string is required");
            }
            return (0, jobs_1.pullReview)(sliceGit, upstreamGit, actionInputs, argv.prNumber, argv.prReivewLink);
        }
        default: {
            return;
        }
    }
});
//# sourceMappingURL=index.js.map