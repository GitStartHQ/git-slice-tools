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
Object.defineProperty(exports, "__esModule", { value: true });
exports.push = void 0;
var terminal_kit_1 = require("terminal-kit");
var common_1 = require("../common");
var push = function (sliceGit, upstreamGit, actionInputs, sliceBranch, commitMsg, forcePush) { return __awaiter(void 0, void 0, void 0, function () {
    var upstreamBranch, logs, lastGitSlicePullLog, currentSyncUpstreamCommitId, error_1, upstreamBranchExists, error_2, diffFiles_1, diffFiles;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                (0, terminal_kit_1.terminal)('-'.repeat(30) + '\n');
                (0, terminal_kit_1.terminal)("Performing push job with " + JSON.stringify({ sliceBranch: sliceBranch, commitMsg: commitMsg, forcePush: forcePush }) + "...\n");
                if (!actionInputs.pushCommitMsgRegex.test(commitMsg)) {
                    throw new Error('Commit message failed PUSH_COMMIT_MSG_REGEX');
                }
                upstreamBranch = actionInputs.pushBranchNameTemplate.replace('<branch_name>', sliceBranch);
                return [4 /*yield*/, (0, common_1.cleanAndDeleteLocalBranch)(sliceGit, 'Slice', actionInputs.sliceRepo.defaultBranch, sliceBranch)
                    // Find the oid from last gitslice:*** commit
                ];
            case 1:
                _a.sent();
                // Find the oid from last gitslice:*** commit
                (0, common_1.logWriteLine)('Slice', "Finding the last git-slice:*** commit...");
                return [4 /*yield*/, sliceGit.log({ maxCount: 20 })];
            case 2:
                logs = _a.sent();
                lastGitSlicePullLog = logs.all.find(function (x) { return /^git-slice:.*$/.test(x.message.trim()); });
                if (!lastGitSlicePullLog) {
                    (0, common_1.logExtendLastLine)('Not found!');
                    throw new Error('Not found git-slice:*** commit in last 20 commits');
                }
                currentSyncUpstreamCommitId = lastGitSlicePullLog.message.trim().split(':')[1];
                (0, common_1.logExtendLastLine)(currentSyncUpstreamCommitId + "\n");
                (0, common_1.logWriteLine)('Slice', "Checkout branch '" + sliceBranch + "'...");
                _a.label = 3;
            case 3:
                _a.trys.push([3, 6, , 7]);
                return [4 /*yield*/, sliceGit.checkout(sliceBranch)];
            case 4:
                _a.sent();
                return [4 /*yield*/, sliceGit.pull('origin', sliceBranch)];
            case 5:
                _a.sent();
                (0, common_1.logExtendLastLine)('Done!');
                return [3 /*break*/, 7];
            case 6:
                error_1 = _a.sent();
                // noop
                (0, common_1.logExtendLastLine)('Not found!');
                throw error_1;
            case 7: return [4 /*yield*/, (0, common_1.pullRemoteBranchIntoCurrentBranch)('Slice', sliceGit, actionInputs.sliceRepo.defaultBranch, sliceBranch)];
            case 8:
                _a.sent();
                return [4 /*yield*/, (0, common_1.deleteSliceIgnoresFilesDirs)(actionInputs.sliceIgnores, actionInputs.sliceRepo.dir, 'Slice')];
            case 9:
                _a.sent();
                return [4 /*yield*/, (0, common_1.cleanAndDeleteLocalBranch)(upstreamGit, 'Upstream', actionInputs.upstreamRepo.defaultBranch, upstreamBranch)];
            case 10:
                _a.sent();
                upstreamBranchExists = false;
                _a.label = 11;
            case 11:
                _a.trys.push([11, 13, , 14]);
                (0, common_1.logWriteLine)('Upstream', "Check remote branch '" + upstreamBranch + "'...");
                return [4 /*yield*/, upstreamGit.show("remotes/origin/" + upstreamBranch)];
            case 12:
                _a.sent();
                upstreamBranchExists = true;
                (0, common_1.logExtendLastLine)('Existed!\n');
                return [3 /*break*/, 14];
            case 13:
                error_2 = _a.sent();
                (0, common_1.logExtendLastLine)('Not found!\n');
                return [3 /*break*/, 14];
            case 14:
                if (!(!upstreamBranchExists || forcePush)) return [3 /*break*/, 18];
                (0, common_1.logWriteLine)('Upstream', "Checkout new branch '" + upstreamBranch + "'...");
                return [4 /*yield*/, upstreamGit.checkoutLocalBranch(upstreamBranch)];
            case 15:
                _a.sent();
                (0, common_1.logExtendLastLine)('Done!\n');
                return [4 /*yield*/, (0, common_1.copyFiles)(upstreamGit, actionInputs.sliceRepo.dir, actionInputs.upstreamRepo.dir, actionInputs.sliceIgnores, 'Upstream')];
            case 16:
                diffFiles_1 = _a.sent();
                if (!diffFiles_1.length) {
                    return [2 /*return*/];
                }
                return [4 /*yield*/, (0, common_1.createCommitAndPushCurrentChanges)(upstreamGit, commitMsg, upstreamBranch, 'Upstream', true)];
            case 17:
                _a.sent();
                return [2 /*return*/];
            case 18:
                (0, common_1.logWriteLine)('Upstream', "Upstream: Checkout branch '" + upstreamBranch + "'...");
                return [4 /*yield*/, upstreamGit.checkout(upstreamBranch)];
            case 19:
                _a.sent();
                return [4 /*yield*/, upstreamGit.pull('origin', upstreamBranch)];
            case 20:
                _a.sent();
                return [4 /*yield*/, (0, common_1.pullRemoteBranchIntoCurrentBranch)('Upstream', upstreamGit, 
                    // we merge the revision which current slice's default branch is synced at
                    // instead of upstream's default branch which can be missed matching while running in parallel
                    currentSyncUpstreamCommitId, upstreamBranch, 
                    // We ignore merging error on upstream to allow pushing updates when there are conflicts on upstream repo.
                    // In this case, commit below will contain both updates + merge base commit
                    true)];
            case 21:
                _a.sent();
                (0, common_1.logExtendLastLine)('Done!\n');
                return [4 /*yield*/, (0, common_1.copyFiles)(upstreamGit, actionInputs.sliceRepo.dir, actionInputs.upstreamRepo.dir, actionInputs.sliceIgnores, 'Upstream')];
            case 22:
                diffFiles = _a.sent();
                if (!diffFiles.length) {
                    return [2 /*return*/];
                }
                return [4 /*yield*/, (0, common_1.createCommitAndPushCurrentChanges)(upstreamGit, commitMsg, upstreamBranch, 'Upstream', false)];
            case 23:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.push = push;
//# sourceMappingURL=push.js.map