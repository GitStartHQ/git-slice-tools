"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanAndDeleteLocalBranch = exports.copyFiles = exports.createCommitAndPushCurrentChanges = exports.deleteSliceIgnoresFilesDirs = exports.pullRemoteBranchIntoCurrentBranch = exports.isErrorLike = void 0;
var dir_compare_1 = require("dir-compare");
var fs_extra_1 = __importDefault(require("fs-extra"));
var glob_1 = require("glob");
var path_1 = __importDefault(require("path"));
var simple_git_1 = require("simple-git");
var terminal_kit_1 = require("terminal-kit");
var logger_1 = require("./logger");
__exportStar(require("./gitInit"), exports);
__exportStar(require("./logger"), exports);
var isErrorLike = function (value) {
    return typeof value === 'object' && value !== null && ('stack' in value || 'message' in value);
};
exports.isErrorLike = isErrorLike;
var pullRemoteBranchIntoCurrentBranch = function (logPrefix, git, remoteBranch, currentBranch, ignoreMergeConflictsError, noPush) {
    if (ignoreMergeConflictsError === void 0) { ignoreMergeConflictsError = false; }
    if (noPush === void 0) { noPush = false; }
    return __awaiter(void 0, void 0, void 0, function () {
        var status, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    (0, terminal_kit_1.terminal)(logPrefix + ": Try to pull remote branch '" + remoteBranch + "' into current branch '" + currentBranch + "'...");
                    return [4 /*yield*/, git.pull('origin', remoteBranch, ['--no-rebase'])];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, git.status()];
                case 2:
                    status = _a.sent();
                    if (!status.ahead) return [3 /*break*/, 5];
                    if (!!noPush) return [3 /*break*/, 4];
                    return [4 /*yield*/, git.push('origin', currentBranch)];
                case 3:
                    _a.sent();
                    (0, terminal_kit_1.terminal)('Merged!\n');
                    return [2 /*return*/];
                case 4:
                    (0, terminal_kit_1.terminal)('Done!\n');
                    return [2 /*return*/];
                case 5:
                    (0, terminal_kit_1.terminal)('None!\n');
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    if (ignoreMergeConflictsError && (0, exports.isErrorLike)(error_1) && error_1 instanceof simple_git_1.GitError) {
                        (0, terminal_kit_1.terminal)("Skipped with following error: '" + error_1.message + "'\n");
                        return [2 /*return*/];
                    }
                    // noop
                    (0, terminal_kit_1.terminal)('Failed!\n');
                    throw error_1;
                case 7: return [2 /*return*/];
            }
        });
    });
};
exports.pullRemoteBranchIntoCurrentBranch = pullRemoteBranchIntoCurrentBranch;
var deleteSliceIgnoresFilesDirs = function (sliceIgnores, rootDir, scope) { return __awaiter(void 0, void 0, void 0, function () {
    var i, pattern, mg, j, pathMatch, resolvedPath;
    return __generator(this, function (_a) {
        for (i = 0; i < sliceIgnores.length; i++) {
            pattern = sliceIgnores[i];
            (0, logger_1.logWriteLine)(scope, "Getting ingoring files/directores with pattern '" + pattern + "'...");
            mg = new glob_1.Glob(pattern, {
                cwd: rootDir,
                sync: true,
            });
            (0, logger_1.logExtendLastLine)("Found " + mg.found.length + " files/directories!");
            if (mg.found.length === 0) {
                continue;
            }
            for (j = 0; j < mg.found.length; j++) {
                pathMatch = mg.found[j];
                resolvedPath = path_1.default.join(rootDir, pathMatch);
                (0, logger_1.logWriteLine)(scope, "Deleting: " + pathMatch + "...");
                fs_extra_1.default.rmSync(resolvedPath, { force: true, recursive: true });
                (0, logger_1.logExtendLastLine)('Done!');
            }
        }
        return [2 /*return*/];
    });
}); };
exports.deleteSliceIgnoresFilesDirs = deleteSliceIgnoresFilesDirs;
var createCommitAndPushCurrentChanges = function (git, commitMsg, branch, scope, forcePush) {
    if (forcePush === void 0) { forcePush = false; }
    return __awaiter(void 0, void 0, void 0, function () {
        var status;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, git.status()];
                case 1:
                    status = _a.sent();
                    if (status.files.length === 0) {
                        (0, logger_1.logWriteLine)(scope, "No changes found");
                        return [2 /*return*/, false];
                    }
                    (0, logger_1.logWriteLine)(scope, "Stage changes");
                    return [4 /*yield*/, git.add('.')];
                case 2:
                    _a.sent();
                    (0, logger_1.logWriteLine)(scope, __spreadArray(__spreadArray(__spreadArray([], status.modified.map(function (x) { return ({ filePath: x, changeType: '~' }); }), true), status.deleted.map(function (x) { return ({ filePath: x, changeType: '-' }); }), true), status.created.map(function (x) { return ({ filePath: x, changeType: '+' }); }), true).map(function (x) { return scope + ": Commit (" + x.changeType + ") " + x.filePath; })
                        .join('\n') + '\n');
                    (0, logger_1.logWriteLine)(scope, "Creating '" + commitMsg + "' commit...");
                    return [4 /*yield*/, git.commit(commitMsg)];
                case 3:
                    _a.sent();
                    (0, logger_1.logExtendLastLine)('Done!');
                    (0, logger_1.logWriteLine)(scope, "Pushing...");
                    return [4 /*yield*/, git.push('origin', branch, forcePush ? ['--force'] : [])];
                case 4:
                    _a.sent();
                    (0, logger_1.logExtendLastLine)('Done!');
                    return [2 /*return*/, true];
            }
        });
    });
};
exports.createCommitAndPushCurrentChanges = createCommitAndPushCurrentChanges;
var copyFiles = function (git, fromDir, toDir, sliceIgnores, scope) { return __awaiter(void 0, void 0, void 0, function () {
    var compareResponse, fileChanges, onlyOnToDirFiles, i, diff, filePath, absPath, symlinkFiles, onlyOnFromDirFiles, i, diff, filePath, lstat, targetLink, distinctFiles, i, diff, filePath, lstat, targetLink, i, _a, filePath, targetLink, reason, state, symlinkPath, symlinkPath, status;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                (0, logger_1.logWriteLine)(scope, "Copy files from '" + fromDir + "' to '" + toDir + "'...");
                compareResponse = (0, dir_compare_1.compareSync)(toDir, fromDir, {
                    compareContent: true,
                    compareDate: false,
                    compareSize: false,
                    compareSymlink: true,
                    excludeFilter: __spreadArray([
                        '**/.DS_Store',
                        '**/.git/**'
                    ], sliceIgnores.map(function (x) { return (x.startsWith('**/') ? x : "**/" + x.replace(/^\/+/, '')); }), true).join(','),
                });
                (0, logger_1.logExtendLastLine)('Done!');
                if (!compareResponse.diffSet || compareResponse.diffSet.length === 0) {
                    (0, logger_1.logWriteLine)(scope, "Found 0 diff file(s)!");
                    return [2 /*return*/, []];
                }
                fileChanges = [];
                onlyOnToDirFiles = compareResponse.diffSet.filter(function (dif) { return dif.state === 'left'; });
                (0, logger_1.logWriteLine)(scope, "Found " + onlyOnToDirFiles.length + " onlyOnToDir file(s)!");
                for (i = 0; i < onlyOnToDirFiles.length; i++) {
                    diff = onlyOnToDirFiles[i];
                    filePath = diff.relativePath.substring(1) + "/" + diff.name1;
                    absPath = path_1.default.join(toDir, filePath);
                    (0, logger_1.logWriteLine)(scope, "Deleting: " + filePath + "...");
                    fs_extra_1.default.rmSync(absPath, { force: true, recursive: true });
                    fileChanges.push(absPath);
                    (0, logger_1.logExtendLastLine)('Done!');
                }
                symlinkFiles = [];
                onlyOnFromDirFiles = compareResponse.diffSet.filter(function (dif) { return dif.state === 'right'; });
                (0, logger_1.logWriteLine)(scope, "Found " + onlyOnFromDirFiles.length + " onlyOnFromDir file(s)!");
                i = 0;
                _b.label = 1;
            case 1:
                if (!(i < onlyOnFromDirFiles.length)) return [3 /*break*/, 6];
                diff = onlyOnFromDirFiles[i];
                filePath = diff.relativePath.substring(1) + "/" + diff.name2;
                return [4 /*yield*/, fs_extra_1.default.lstat(path_1.default.join(fromDir, filePath))];
            case 2:
                lstat = _b.sent();
                if (!lstat.isSymbolicLink()) return [3 /*break*/, 4];
                return [4 /*yield*/, fs_extra_1.default.readlink(path_1.default.join(fromDir, filePath))];
            case 3:
                targetLink = _b.sent();
                symlinkFiles.push({
                    filePath: filePath,
                    targetLink: targetLink,
                    reason: diff.reason,
                    state: diff.state,
                });
                return [3 /*break*/, 5];
            case 4:
                if (lstat.isFile()) {
                    (0, logger_1.logWriteLine)(scope, "Copying: " + filePath + "...");
                    fs_extra_1.default.copySync(path_1.default.join(fromDir, filePath), path_1.default.join(toDir, filePath), {
                        overwrite: true,
                        dereference: false,
                        recursive: false,
                    });
                    fileChanges.push(path_1.default.join(toDir, filePath));
                    (0, logger_1.logExtendLastLine)('Done!');
                }
                _b.label = 5;
            case 5:
                i++;
                return [3 /*break*/, 1];
            case 6:
                distinctFiles = compareResponse.diffSet.filter(function (dif) { return dif.state === 'distinct'; });
                (0, logger_1.logWriteLine)(scope, "Found " + distinctFiles.length + " distinct file(s)!");
                i = 0;
                _b.label = 7;
            case 7:
                if (!(i < distinctFiles.length)) return [3 /*break*/, 12];
                diff = distinctFiles[i];
                filePath = diff.relativePath.substring(1) + "/" + diff.name1;
                return [4 /*yield*/, fs_extra_1.default.lstat(path_1.default.join(fromDir, filePath))];
            case 8:
                lstat = _b.sent();
                if (!lstat.isSymbolicLink()) return [3 /*break*/, 10];
                return [4 /*yield*/, fs_extra_1.default.readlink(path_1.default.join(fromDir, filePath))];
            case 9:
                targetLink = _b.sent();
                symlinkFiles.push({
                    filePath: filePath,
                    targetLink: targetLink,
                    reason: diff.reason,
                    state: diff.state,
                });
                return [3 /*break*/, 11];
            case 10:
                if (lstat.isFile()) {
                    (0, logger_1.logWriteLine)(scope, "Overriding: " + filePath + "...");
                    fs_extra_1.default.copySync(path_1.default.join(fromDir, filePath), path_1.default.join(toDir, filePath), {
                        overwrite: true,
                        dereference: false,
                        recursive: false,
                    });
                    fileChanges.push(path_1.default.join(toDir, filePath));
                    (0, logger_1.logExtendLastLine)('Done!');
                }
                _b.label = 11;
            case 11:
                i++;
                return [3 /*break*/, 7];
            case 12:
                (0, logger_1.logWriteLine)(scope, "Found " + symlinkFiles.length + " symlinks!");
                for (i = 0; i < symlinkFiles.length; i++) {
                    _a = symlinkFiles[i], filePath = _a.filePath, targetLink = _a.targetLink, reason = _a.reason, state = _a.state;
                    (0, logger_1.logWriteLine)(scope, "Checking symlink target: " + filePath + " (" + state + "/" + (reason !== null && reason !== void 0 ? reason : 'No reason') + ")...");
                    if (state === 'distinct' && reason === 'different-symlink') {
                        symlinkPath = path_1.default.join(toDir, filePath);
                        fs_extra_1.default.rmSync(symlinkPath, { force: true });
                        fs_extra_1.default.symlinkSync(targetLink, symlinkPath);
                        fileChanges.push(symlinkPath);
                        (0, logger_1.logExtendLastLine)('Done!');
                        continue;
                    }
                    if (state === 'right') {
                        symlinkPath = path_1.default.join(toDir, filePath);
                        fs_extra_1.default.symlinkSync(targetLink, symlinkPath);
                        fileChanges.push(symlinkPath);
                        (0, logger_1.logExtendLastLine)('Done!');
                        continue;
                    }
                    (0, logger_1.logExtendLastLine)('Ignored!');
                }
                return [4 /*yield*/, git.status()];
            case 13:
                status = _b.sent();
                (0, logger_1.logWriteLine)(scope, "Found " + fileChanges.length + " diff files during compare - Git status: " + status.files.length + " files");
                return [2 /*return*/, fileChanges];
        }
    });
}); };
exports.copyFiles = copyFiles;
var cleanAndDeleteLocalBranch = function (git, scope, defaultBranch, branch) { return __awaiter(void 0, void 0, void 0, function () {
    var error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                (0, logger_1.logWriteLine)(scope, 'Clean...');
                return [4 /*yield*/, git.reset(simple_git_1.ResetMode.HARD)];
            case 1:
                _a.sent();
                return [4 /*yield*/, git.clean(simple_git_1.CleanOptions.FORCE + simple_git_1.CleanOptions.RECURSIVE + simple_git_1.CleanOptions.IGNORED_INCLUDED)];
            case 2:
                _a.sent();
                (0, logger_1.logExtendLastLine)('Done!');
                (0, logger_1.logWriteLine)(scope, 'Fetch...');
                return [4 /*yield*/, git.fetch('origin')];
            case 3:
                _a.sent();
                (0, logger_1.logExtendLastLine)('Done!');
                (0, logger_1.logWriteLine)(scope, "Delete local branch '" + branch + "'...");
                _a.label = 4;
            case 4:
                _a.trys.push([4, 9, , 10]);
                return [4 /*yield*/, git.checkout(defaultBranch)];
            case 5:
                _a.sent();
                return [4 /*yield*/, git.pull('origin', defaultBranch)];
            case 6:
                _a.sent();
                return [4 /*yield*/, git.branch(['-D', branch])];
            case 7:
                _a.sent();
                return [4 /*yield*/, git.branch(['-Dr', branch])];
            case 8:
                _a.sent();
                return [3 /*break*/, 10];
            case 9:
                error_2 = _a.sent();
                return [3 /*break*/, 10];
            case 10:
                (0, logger_1.logExtendLastLine)('Done!');
                return [2 /*return*/];
        }
    });
}); };
exports.cleanAndDeleteLocalBranch = cleanAndDeleteLocalBranch;
//# sourceMappingURL=index.js.map