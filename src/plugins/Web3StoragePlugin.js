"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
exports.Web3StoragePlugin = void 0;
var Web3StoragePlugin = /** @class */ (function () {
    function Web3StoragePlugin(ceramicConnector, ipfsConnector) {
        var _this = this;
        this.id = 'web3-storage-plugin';
        this.name = 'Web3 Storage Plugin';
        this.version = '1.0.0';
        this.type = 'utility';
        this.enabled = true;
        this.metadata = {
            author: 'Orpheus Engine Team',
            description: 'Provides storage capabilities using Ceramic and IPFS',
            tags: ['storage', 'web3', 'ceramic', 'ipfs']
        };
        this.storageConnector = {
            type: 'web3',
            save: function (data) { return __awaiter(_this, void 0, void 0, function () {
                var audioRefs, _i, _a, track, cid, dataToStore, documentId, error_1;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 6, , 7]);
                            audioRefs = {};
                            if (!data.tracks) return [3 /*break*/, 4];
                            _i = 0, _a = data.tracks;
                            _b.label = 1;
                        case 1:
                            if (!(_i < _a.length)) return [3 /*break*/, 4];
                            track = _a[_i];
                            if (!track.audioBuffer) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.ipfsConnector.storeFile(track.audioBuffer)];
                        case 2:
                            cid = _b.sent();
                            audioRefs[track.id] = cid;
                            // Remove the buffer before saving to Ceramic
                            delete track.audioBuffer;
                            _b.label = 3;
                        case 3:
                            _i++;
                            return [3 /*break*/, 1];
                        case 4:
                            dataToStore = __assign(__assign({}, data), { audioRefs: audioRefs, lastModified: new Date().toISOString() });
                            return [4 /*yield*/, this.ceramicConnector.createDocument(dataToStore)];
                        case 5:
                            documentId = _b.sent();
                            return [2 /*return*/, documentId];
                        case 6:
                            error_1 = _b.sent();
                            console.error('Failed to save data to Web3 storage:', error_1);
                            throw error_1;
                        case 7: return [2 /*return*/];
                    }
                });
            }); },
            load: function (id) { return __awaiter(_this, void 0, void 0, function () {
                var data, _i, _a, track, _b, error_2;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _c.trys.push([0, 6, , 7]);
                            return [4 /*yield*/, this.ceramicConnector.loadDocument(id)];
                        case 1:
                            data = _c.sent();
                            if (!(data.tracks && data.audioRefs)) return [3 /*break*/, 5];
                            _i = 0, _a = data.tracks;
                            _c.label = 2;
                        case 2:
                            if (!(_i < _a.length)) return [3 /*break*/, 5];
                            track = _a[_i];
                            if (!data.audioRefs[track.id]) return [3 /*break*/, 4];
                            // Retrieve audio buffer from IPFS
                            _b = track;
                            return [4 /*yield*/, this.ipfsConnector.retrieveFile(data.audioRefs[track.id])];
                        case 3:
                            // Retrieve audio buffer from IPFS
                            _b.audioBuffer = _c.sent();
                            _c.label = 4;
                        case 4:
                            _i++;
                            return [3 /*break*/, 2];
                        case 5: return [2 /*return*/, data];
                        case 6:
                            error_2 = _c.sent();
                            console.error('Failed to load data from Web3 storage:', error_2);
                            throw error_2;
                        case 7: return [2 /*return*/];
                    }
                });
            }); },
            list: function () { return __awaiter(_this, void 0, void 0, function () {
                var documentIds, error_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this.ceramicConnector.queryDocuments()];
                        case 1:
                            documentIds = _a.sent();
                            return [2 /*return*/, documentIds];
                        case 2:
                            error_3 = _a.sent();
                            console.error('Failed to list documents from Web3 storage:', error_3);
                            throw error_3;
                        case 3: return [2 /*return*/];
                    }
                });
            }); }
        };
        this.ceramicConnector = ceramicConnector;
        this.ipfsConnector = ipfsConnector;
    }
    Web3StoragePlugin.prototype.initialize = function (workstation) {
        console.log('Web3 Storage Plugin initialized');
    };
    Web3StoragePlugin.prototype.cleanup = function () {
        console.log('Web3 Storage Plugin cleanup');
    };
    return Web3StoragePlugin;
}());
exports.Web3StoragePlugin = Web3StoragePlugin;
