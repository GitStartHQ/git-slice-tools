"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var terminal_kit_1 = require("terminal-kit");
var yargs_1 = __importDefault(require("yargs/yargs"));
var config_1 = require("./config");
var jobs_1 = require("./jobs");
var loadActionInputsAndInit = function (cb) { return __awaiter(void 0, void 0, void 0, function () {
    var actionInputs, _a, sliceGit, upstreamGit;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                actionInputs = (0, config_1.loadValidateActionInputs)();
                return [4 /*yield*/, (0, jobs_1.init)(actionInputs)];
            case 1:
                _a = _b.sent(), sliceGit = _a.sliceGit, upstreamGit = _a.upstreamGit;
                (0, terminal_kit_1.terminal)('Initialized git instances\n');
                return [4 /*yield*/, cb({ actionInputs: actionInputs, sliceGit: sliceGit, upstreamGit: upstreamGit })];
            case 2:
                _b.sent();
                return [2 /*return*/];
        }
    });
}); };
(0, yargs_1.default)(process.argv.slice(2))
    .command('checkout', 'Fetch `origin` and checkout default branch of both upstream and slice repos', {}, function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, loadActionInputsAndInit(function (_a) {
                var sliceGit = _a.sliceGit, upstreamGit = _a.upstreamGit, actionInputs = _a.actionInputs;
                return (0, jobs_1.checkout)(sliceGit, upstreamGit, actionInputs);
            })];
    });
}); })
    .command('pull', 'Pull last changes from upstream repo into slice repo', {}, function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, loadActionInputsAndInit(function (_a) {
                var sliceGit = _a.sliceGit, upstreamGit = _a.upstreamGit, actionInputs = _a.actionInputs;
                return (0, jobs_1.pull)(sliceGit, upstreamGit, actionInputs);
            })];
    });
}); })
    .command('push', 'Push a branch in slice repo to upstream repo', {
    branch: { type: 'string', alias: 'b', desc: 'Name of pushing branch in slice repo' },
    message: { type: 'string', alias: 'm', desc: 'Commit message' },
    forcePush: {
        type: 'boolean',
        alias: 'force-push',
        default: false,
        desc: 'Determine wether to use force push or not',
    },
}, function (_a) {
    var branch = _a.branch, message = _a.message, forcePush = _a.forcePush;
    return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_b) {
            if (!branch || typeof branch !== 'string') {
                throw new Error("push job: 'branch' in string is required");
            }
            if (!message || typeof message !== 'string') {
                throw new Error("push job: 'message' in string is required");
            }
            return [2 /*return*/, loadActionInputsAndInit(function (_a) {
                    var sliceGit = _a.sliceGit, upstreamGit = _a.upstreamGit, actionInputs = _a.actionInputs;
                    return (0, jobs_1.push)(sliceGit, upstreamGit, actionInputs, branch, message, forcePush);
                })];
        });
    });
})
    .command('raise-pr', 'Raise new PR for branch on upstream repo (GitHub only) with details (title/body) from the PR for a branch on slice repo', {
    branch: { type: 'string', alias: 'b', desc: 'Name of pushing branch in slice repo' },
}, function (_a) {
    var branch = _a.branch;
    return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_b) {
            if (!branch || typeof branch !== 'string') {
                throw new Error("raise-pr job: 'branch' in string is required");
            }
            return [2 /*return*/, loadActionInputsAndInit(function (_a) {
                    var actionInputs = _a.actionInputs;
                    return (0, jobs_1.raisePr)(actionInputs, branch);
                })];
        });
    });
})
    .command('pull-branch', 'Pull last changes of a branch from upstream repo into slice repo. The destination branch in slice repo has the pulling branch but with `upstream-*` prefix. Please note that this job uses `force-push` and the upstream should be updated to date with the default branch of upstream repo otherwise there would be some extra changes', {
    branch: { type: 'string', alias: 'b', desc: 'Name of pulling branch in upstream repo' },
    target: {
        type: 'string',
        alias: 'g',
        desc: "Name of target branch in slice repo. If it's passed, git-slice will create a PR (target branch <- pulling branch)",
    },
}, function (_a) {
    var branch = _a.branch, target = _a.target;
    return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_b) {
            if (!branch || typeof branch !== 'string') {
                throw new Error("pull-branch job: 'branch' in string is required");
            }
            return [2 /*return*/, loadActionInputsAndInit(function (_a) {
                    var actionInputs = _a.actionInputs, sliceGit = _a.sliceGit, upstreamGit = _a.upstreamGit;
                    return (0, jobs_1.pullBranch)(sliceGit, upstreamGit, actionInputs, branch, target);
                })];
        });
    });
})
    .command('pull-review', "Pull a PR review from a PR on upstream repo into a PR on slice repo (GitHub only). Please note that if upstream review has comments on code, this job will throw errors if upstream and slice branches don't have the same changes", {
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
}, function (_a) {
    var prNumber = _a.prNumber, prReivewLink = _a.prReivewLink;
    return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_b) {
            if (!prNumber || typeof prNumber !== 'number') {
                throw new Error("pull-review job: 'pr-number' in string is required");
            }
            if (!prReivewLink || typeof prReivewLink !== 'string') {
                throw new Error("pull-review job: 'pr-review-link' in string is required");
            }
            return [2 /*return*/, loadActionInputsAndInit(function (_a) {
                    var actionInputs = _a.actionInputs, sliceGit = _a.sliceGit, upstreamGit = _a.upstreamGit;
                    return (0, jobs_1.pullReview)(sliceGit, upstreamGit, actionInputs, prNumber, prReivewLink);
                })];
        });
    });
})
    .parseAsync();
//# sourceMappingURL=index.js.map