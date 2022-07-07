"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.gitInit = void 0;
var terminal_kit_1 = require("terminal-kit");
var simple_git_1 = __importStar(require("simple-git"));
var gitInit = function (repo) { return __awaiter(void 0, void 0, void 0, function () {
    var git, remotes;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                (0, terminal_kit_1.terminal)(repo.name + ": Forcing git init...");
                git = (0, simple_git_1.default)(repo.dir, { binary: 'git' });
                // git config init.defaultBranch main
                return [4 /*yield*/, git.addConfig('init.defaultBranch', repo.defaultBranch, false, simple_git_1.GitConfigScope.global)];
            case 1:
                // git config init.defaultBranch main
                _a.sent();
                return [4 /*yield*/, git.init()
                    // git config user.email $EMAIL
                ];
            case 2:
                _a.sent();
                // git config user.email $EMAIL
                return [4 /*yield*/, git.addConfig('user.email', repo.userEmail, false, simple_git_1.GitConfigScope.local)
                    // git config user.name $USERNAME
                ];
            case 3:
                // git config user.email $EMAIL
                _a.sent();
                // git config user.name $USERNAME
                return [4 /*yield*/, git.addConfig('user.name', repo.username, false, simple_git_1.GitConfigScope.local)];
            case 4:
                // git config user.name $USERNAME
                _a.sent();
                if (!repo.gitHttpUri.toLowerCase().includes('github.com')) return [3 /*break*/, 6];
                // git config url."https://$USERNAME:$PAT@github.com/".insteadOf "https://github.com/"
                return [4 /*yield*/, git.addConfig("url.https://" + repo.username + ":" + repo.userToken + "@github.com/.insteadOf", 'https://github.com/', false, simple_git_1.GitConfigScope.local)];
            case 5:
                // git config url."https://$USERNAME:$PAT@github.com/".insteadOf "https://github.com/"
                _a.sent();
                return [3 /*break*/, 9];
            case 6:
                if (!repo.gitHttpUri.toLowerCase().includes('gitlab.com')) return [3 /*break*/, 8];
                // git config url."https://$USERNAME:$PAT@gitlab.com/".insteadOf "https://gitlab.com/"
                return [4 /*yield*/, git.addConfig("url.\"https://" + repo.username + ":" + repo.userToken + "@gitlab.com/\".insteadOf", 'https://gitlab.com/', false, simple_git_1.GitConfigScope.local)];
            case 7:
                // git config url."https://$USERNAME:$PAT@gitlab.com/".insteadOf "https://gitlab.com/"
                _a.sent();
                return [3 /*break*/, 9];
            case 8: throw Error('Support only github.com and gitlab.com');
            case 9: return [4 /*yield*/, git.getRemotes()];
            case 10:
                remotes = _a.sent();
                if (!remotes.find(function (x) { return x.name === 'origin'; })) return [3 /*break*/, 12];
                // git remote set-url origin https://github.com/GitStartHQ/client-sourcegraph.git
                return [4 /*yield*/, git.raw('remote', 'set-url', 'origin', repo.gitHttpUri)];
            case 11:
                // git remote set-url origin https://github.com/GitStartHQ/client-sourcegraph.git
                _a.sent();
                return [3 /*break*/, 14];
            case 12: 
            // git remote add -t \* -f origin https://github.com/GitStartHQ/client-sourcegraph.git
            return [4 /*yield*/, git.raw('remote', 'add', '-t', '*', '-f', 'origin', repo.gitHttpUri)];
            case 13:
                // git remote add -t \* -f origin https://github.com/GitStartHQ/client-sourcegraph.git
                _a.sent();
                _a.label = 14;
            case 14:
                (0, terminal_kit_1.terminal)("Done!\n");
                return [2 /*return*/, git];
        }
    });
}); };
exports.gitInit = gitInit;
//# sourceMappingURL=gitInit.js.map