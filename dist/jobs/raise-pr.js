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
exports.raisePr = void 0;
var git_url_parse_1 = __importDefault(require("git-url-parse"));
var octokit_1 = require("octokit");
var terminal_kit_1 = require("terminal-kit");
var common_1 = require("../common");
var raisePr = function (actionInputs, sliceBranch) { return __awaiter(void 0, void 0, void 0, function () {
    var upstreamRepo, sliceRepo, upstreamGitUrlObject, sliceGitUrlObject, sliceOctokit, listResponse, _a, title, body, slicePrNumber, upstreamOctokit, upstreamBranch, createResponse, prNumber, error_1, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                (0, terminal_kit_1.terminal)('-'.repeat(30) + '\n');
                (0, terminal_kit_1.terminal)("Performing raise-pr job with " + JSON.stringify({ sliceBranch: sliceBranch }) + "...\n");
                upstreamRepo = actionInputs.upstreamRepo, sliceRepo = actionInputs.sliceRepo;
                upstreamGitUrlObject = (0, git_url_parse_1.default)(upstreamRepo.gitHttpUri);
                sliceGitUrlObject = (0, git_url_parse_1.default)(sliceRepo.gitHttpUri);
                if (upstreamGitUrlObject.source !== 'github.com') {
                    throw new Error("Unsuported codehost '" + upstreamGitUrlObject.source + "'");
                }
                (0, common_1.logWriteLine)('Slice', "Finding PR (" + sliceRepo.defaultBranch + " <- " + sliceBranch + ") ...");
                sliceOctokit = new octokit_1.Octokit({
                    auth: sliceRepo.userToken,
                });
                return [4 /*yield*/, sliceOctokit.rest.pulls.list({
                        owner: sliceGitUrlObject.owner,
                        repo: sliceGitUrlObject.name,
                        base: sliceRepo.defaultBranch,
                        head: sliceGitUrlObject.owner + ":" + sliceBranch,
                        state: 'open',
                    })];
            case 1:
                listResponse = _b.sent();
                if (listResponse.data.length === 0) {
                    (0, common_1.logExtendLastLine)("Not found!");
                    throw new Error("Couldn't find PR (" + sliceRepo.defaultBranch + " <- " + sliceBranch + ") for getting title/description");
                    return [2 /*return*/];
                }
                _a = listResponse.data[0], title = _a.title, body = _a.body, slicePrNumber = _a.number;
                (0, common_1.logExtendLastLine)("PR #" + slicePrNumber);
                if (!body) {
                    throw new Error('PR #${slicePrNumber} has an empty description');
                }
                upstreamOctokit = new octokit_1.Octokit({
                    auth: upstreamRepo.userToken,
                });
                upstreamBranch = actionInputs.pushBranchNameTemplate.replace('<branch_name>', sliceBranch);
                (0, common_1.logWriteLine)('Upstream', "Checking existing PR (" + upstreamRepo.defaultBranch + " <- " + upstreamBranch + ")...");
                return [4 /*yield*/, upstreamOctokit.rest.pulls.list({
                        owner: upstreamGitUrlObject.owner,
                        repo: upstreamGitUrlObject.name,
                        base: upstreamRepo.defaultBranch,
                        head: upstreamGitUrlObject.owner + ":" + upstreamBranch,
                        state: 'open',
                    })];
            case 2:
                listResponse = _b.sent();
                if (listResponse.data.length !== 0) {
                    (0, common_1.logExtendLastLine)("Found PR #" + listResponse.data[0].number + " (" + listResponse.data[0].html_url + ")");
                    (0, common_1.logWriteLine)('Upstream', "Done!");
                    return [2 /*return*/];
                }
                (0, common_1.logExtendLastLine)("Not found!");
                (0, common_1.logWriteLine)('Upstream', "Raising new PR (" + upstreamRepo.defaultBranch + " <- " + upstreamBranch + ")...");
                return [4 /*yield*/, upstreamOctokit.rest.pulls.create({
                        owner: upstreamGitUrlObject.owner,
                        repo: upstreamGitUrlObject.name,
                        title: title,
                        body: body,
                        base: upstreamRepo.defaultBranch,
                        head: upstreamGitUrlObject.owner + ":" + upstreamBranch,
                        draft: actionInputs.prDraft,
                        maintainer_can_modifyboolean: true,
                    })];
            case 3:
                createResponse = _b.sent();
                prNumber = createResponse.data.number;
                (0, common_1.logExtendLastLine)("Done PR #" + prNumber);
                return [4 /*yield*/, upstreamOctokit.rest.issues.addLabels({
                        issue_number: prNumber,
                        owner: upstreamGitUrlObject.owner,
                        repo: upstreamGitUrlObject.name,
                        labels: actionInputs.prLabels,
                    })];
            case 4:
                _b.sent();
                (0, common_1.logWriteLine)('Upstream', "Adding assignees into PR #" + prNumber + "...");
                _b.label = 5;
            case 5:
                _b.trys.push([5, 7, , 8]);
                return [4 /*yield*/, upstreamOctokit.rest.issues.addAssignees({
                        issue_number: prNumber,
                        owner: upstreamGitUrlObject.owner,
                        repo: upstreamGitUrlObject.name,
                        assignees: [upstreamRepo.username],
                    })];
            case 6:
                _b.sent();
                (0, common_1.logExtendLastLine)("Done!");
                return [3 /*break*/, 8];
            case 7:
                error_1 = _b.sent();
                if ((0, common_1.isErrorLike)(error_1)) {
                    (0, terminal_kit_1.terminal)("Failed with following error: '" + error_1.message + "'\n");
                    return [2 /*return*/];
                }
                return [3 /*break*/, 8];
            case 8:
                if (!actionInputs.prLabels.length) return [3 /*break*/, 12];
                (0, common_1.logWriteLine)('Upstream', "Adding labels into PR #" + prNumber + "...");
                _b.label = 9;
            case 9:
                _b.trys.push([9, 11, , 12]);
                return [4 /*yield*/, upstreamOctokit.rest.issues.addLabels({
                        issue_number: prNumber,
                        owner: upstreamGitUrlObject.owner,
                        repo: upstreamGitUrlObject.name,
                        labels: actionInputs.prLabels,
                    })];
            case 10:
                _b.sent();
                (0, common_1.logExtendLastLine)("Done!");
                return [3 /*break*/, 12];
            case 11:
                error_2 = _b.sent();
                if ((0, common_1.isErrorLike)(error_2)) {
                    (0, terminal_kit_1.terminal)("Failed with following error: '" + error_2.message + "'\n");
                    return [2 /*return*/];
                }
                return [3 /*break*/, 12];
            case 12:
                (0, common_1.logWriteLine)('Upstream', "Created PR #" + prNumber + " (" + createResponse.data.html_url + ") successfully");
                return [2 /*return*/];
        }
    });
}); };
exports.raisePr = raisePr;
//# sourceMappingURL=raise-pr.js.map