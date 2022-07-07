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
exports.pullBranch = void 0;
var git_url_parse_1 = __importDefault(require("git-url-parse"));
var octokit_1 = require("octokit");
var simple_git_1 = require("simple-git");
var terminal_kit_1 = require("terminal-kit");
var common_1 = require("../common");
var pullBranch = function (sliceGit, upstreamGit, actionInputs, upstreamBranch, targetSliceBranch) { return __awaiter(void 0, void 0, void 0, function () {
    var sliceBranch, sliceGitUrlObject, sliceOctokit, listResponse, _a, slicePrNumber, html_url, createResponse;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                (0, terminal_kit_1.terminal)('-'.repeat(30) + '\n');
                (0, terminal_kit_1.terminal)("Performing pull-branch job with " + JSON.stringify({ upstreamBranch: upstreamBranch, targetSliceBranch: targetSliceBranch }) + "...\n");
                sliceBranch = "upstream-" + upstreamBranch;
                (0, common_1.logWriteLine)('Upstream', "Checkout and pull last versions '" + upstreamBranch + "' branch...");
                return [4 /*yield*/, upstreamGit.reset(simple_git_1.ResetMode.HARD)];
            case 1:
                _b.sent();
                return [4 /*yield*/, upstreamGit.checkout(upstreamBranch)];
            case 2:
                _b.sent();
                return [4 /*yield*/, upstreamGit.reset(['--hard', "origin/" + upstreamBranch])];
            case 3:
                _b.sent();
                return [4 /*yield*/, upstreamGit.pull('origin', upstreamBranch)];
            case 4:
                _b.sent();
                (0, common_1.logExtendLastLine)('Done!');
                (0, common_1.logWriteLine)('Upstream', "Clean...");
                return [4 /*yield*/, upstreamGit.clean(simple_git_1.CleanOptions.FORCE + simple_git_1.CleanOptions.RECURSIVE + simple_git_1.CleanOptions.IGNORED_INCLUDED)];
            case 5:
                _b.sent();
                (0, common_1.logExtendLastLine)('Done!');
                (0, common_1.logWriteLine)('Slice', "Checkout and pull last versions '" + actionInputs.sliceRepo.defaultBranch + "' branch...");
                return [4 /*yield*/, sliceGit.checkout(actionInputs.sliceRepo.defaultBranch)];
            case 6:
                _b.sent();
                return [4 /*yield*/, sliceGit.reset(['--hard', "origin/" + actionInputs.sliceRepo.defaultBranch])];
            case 7:
                _b.sent();
                return [4 /*yield*/, sliceGit.pull('origin', actionInputs.sliceRepo.defaultBranch)];
            case 8:
                _b.sent();
                (0, common_1.logExtendLastLine)('Done!');
                (0, common_1.logWriteLine)('Slice', "Clean...");
                return [4 /*yield*/, sliceGit.clean(simple_git_1.CleanOptions.FORCE + simple_git_1.CleanOptions.RECURSIVE + simple_git_1.CleanOptions.IGNORED_INCLUDED)];
            case 9:
                _b.sent();
                (0, common_1.logExtendLastLine)('Done!');
                (0, common_1.logWriteLine)('Slice', "Checkout new branch '" + sliceBranch + "'...");
                return [4 /*yield*/, (0, common_1.cleanAndDeleteLocalBranch)(sliceGit, 'Slice', actionInputs.sliceRepo.defaultBranch, sliceBranch)];
            case 10:
                _b.sent();
                return [4 /*yield*/, sliceGit.checkoutLocalBranch(sliceBranch)];
            case 11:
                _b.sent();
                (0, common_1.logExtendLastLine)('Done!');
                (0, common_1.logWriteLine)('Slice', "Copying diffs from upstream branch to slice branch...");
                return [4 /*yield*/, (0, common_1.copyFiles)(sliceGit, actionInputs.upstreamRepo.dir, actionInputs.sliceRepo.dir, actionInputs.sliceIgnores, 'Slice')];
            case 12:
                _b.sent();
                (0, common_1.logExtendLastLine)('Done!');
                (0, common_1.logWriteLine)('Slice', "Staging diffs...");
                return [4 /*yield*/, sliceGit.raw('add', '.', '--force')];
            case 13:
                _b.sent();
                (0, common_1.logExtendLastLine)('Done!');
                return [4 /*yield*/, (0, common_1.createCommitAndPushCurrentChanges)(sliceGit, "feat: pull changes from upstream branch " + upstreamBranch, sliceBranch, 'Slice', true)];
            case 14:
                _b.sent();
                if (!targetSliceBranch) {
                    (0, common_1.logWriteLine)('Slice', "Pulled upstream branch '" + upstreamBranch + "' to slice branch " + sliceBranch);
                    return [2 /*return*/];
                }
                sliceGitUrlObject = (0, git_url_parse_1.default)(actionInputs.sliceRepo.gitHttpUri);
                sliceOctokit = new octokit_1.Octokit({
                    auth: actionInputs.sliceRepo.userToken,
                });
                (0, common_1.logWriteLine)('Slice', "Finding PR (" + targetSliceBranch + " <- " + sliceBranch + ") ...");
                return [4 /*yield*/, sliceOctokit.rest.pulls.list({
                        owner: sliceGitUrlObject.owner,
                        repo: sliceGitUrlObject.name,
                        base: targetSliceBranch,
                        head: sliceGitUrlObject.owner + ":" + sliceBranch,
                        state: 'open',
                    })];
            case 15:
                listResponse = _b.sent();
                if (listResponse.data.length !== 0) {
                    _a = listResponse.data[0], slicePrNumber = _a.number, html_url = _a.html_url;
                    (0, common_1.logExtendLastLine)("PR #" + slicePrNumber);
                    (0, common_1.logWriteLine)('Slice', "Pulled upstream branch '" + upstreamBranch + "' to slice branch " + sliceBranch + " and PR " + slicePrNumber + " (" + html_url + ") is available");
                }
                (0, common_1.logExtendLastLine)("Not found!");
                (0, common_1.logWriteLine)('Slice', "Raising new PR (" + targetSliceBranch + " <- " + sliceBranch + ")...");
                return [4 /*yield*/, sliceOctokit.rest.pulls.create({
                        owner: sliceGitUrlObject.owner,
                        repo: sliceGitUrlObject.name,
                        title: targetSliceBranch + " <- upstream " + upstreamBranch,
                        body: "This PR is for synching changes from branch " + upstreamBranch + " on upstream repo to branch " + targetSliceBranch + " on slice repo",
                        base: targetSliceBranch,
                        head: sliceGitUrlObject.owner + ":" + sliceBranch,
                        draft: actionInputs.prDraft,
                        maintainer_can_modifyboolean: true,
                    })];
            case 16:
                createResponse = _b.sent();
                (0, common_1.logExtendLastLine)("Done PR #" + createResponse.data.number);
                (0, common_1.logWriteLine)('Slice', "Pulled upstream branch '" + upstreamBranch + "' to slice branch " + sliceBranch + " and PR " + createResponse.data.number + " (" + createResponse.data.html_url + ") is available");
                return [2 /*return*/];
        }
    });
}); };
exports.pullBranch = pullBranch;
//# sourceMappingURL=pull-branch.js.map