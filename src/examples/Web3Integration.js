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
exports.Web3Integration = void 0;
var React = require("react");
var react_1 = require("react");
var WorkstationContext_1 = require("../contexts/WorkstationContext");
var Web3StoragePlugin_1 = require("../plugins/Web3StoragePlugin");
/**
 * Example implementation of Ceramic connector
 * This is a simple mock implementation for demonstration purposes
 * @returns A connector for interacting with Ceramic Network
 */
var createCeramicConnector = function () {
    return {
        connect: function (ceramic) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log('Connected to Ceramic');
                return [2 /*return*/];
            });
        }); },
        createDocument: function (data) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log('Creating document in Ceramic', data);
                return [2 /*return*/, "ceramic://doc-".concat(Date.now())]; // Placeholder
            });
        }); },
        loadDocument: function (id) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log("Loading document ".concat(id, " from Ceramic"));
                return [2 /*return*/, { name: 'Example Workstation', tracks: [] }]; // Placeholder
            });
        }); },
        queryDocuments: function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, ['ceramic://doc-1', 'ceramic://doc-2']]; // Placeholder
            });
        }); }
    };
};
// Example implementation of IPFS connector
var createIPFSConnector = function () {
    return {
        storeFile: function (data) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log('Storing file in IPFS');
                return [2 /*return*/, "ipfs://QmExample".concat(Date.now())]; // Placeholder
            });
        }); },
        retrieveFile: function (cid) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log("Retrieving file ".concat(cid, " from IPFS"));
                return [2 /*return*/, new ArrayBuffer(0)]; // Placeholder
            });
        }); }
    };
};
var Web3Integration = function () {
    var workstation = (0, WorkstationContext_1.useWorkstation)();
    var _a = (0, react_1.useState)([]), availableWorkstations = _a[0], setAvailableWorkstations = _a[1];
    var _b = (0, react_1.useState)(''), selectedWorkstationId = _b[0], setSelectedWorkstationId = _b[1];
    (0, react_1.useEffect)(function () {
        // Create and register Web3 storage plugin
        var ceramicConnector = createCeramicConnector();
        var ipfsConnector = createIPFSConnector();
        var web3Plugin = new Web3StoragePlugin_1.Web3StoragePlugin(ceramicConnector, ipfsConnector);
        workstation.registerPlugin(web3Plugin);
        return function () {
            // Clean up plugin when component unmounts
            workstation.unregisterPlugin(web3Plugin.id);
        };
    }, [workstation]);
    var handleSaveToWeb3 = function () { return __awaiter(void 0, void 0, void 0, function () {
        var id;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!workstation.saveWorkstation) {
                        alert('Save functionality not available');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, workstation.saveWorkstation('My Web3 Workstation')];
                case 1:
                    id = _a.sent();
                    if (id) {
                        console.log("Saved workstation with ID: ".concat(id));
                        // Refresh the list after saving
                        loadAvailableWorkstations();
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    var handleLoadFromWeb3 = function () { return __awaiter(void 0, void 0, void 0, function () {
        var success;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedWorkstationId) {
                        alert('Please select a workstation to load');
                        return [2 /*return*/];
                    }
                    if (!workstation.loadWorkstation) {
                        alert('Load functionality not available');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, workstation.loadWorkstation(selectedWorkstationId)];
                case 1:
                    success = _a.sent();
                    if (success) {
                        console.log("Loaded workstation with ID: ".concat(selectedWorkstationId));
                    }
                    else {
                        alert('Failed to load workstation');
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    var loadAvailableWorkstations = function () { return __awaiter(void 0, void 0, void 0, function () {
        var workstationList, formattedWorkstations_1, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    if (!workstation.listWorkstations) {
                        console.warn('List workstations functionality not available');
                        setAvailableWorkstations([]);
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, workstation.listWorkstations()];
                case 1:
                    workstationList = _a.sent();
                    formattedWorkstations_1 = [];
                    if (Array.isArray(workstationList)) {
                        workstationList.forEach(function (item) {
                            // Handle string IDs
                            if (typeof item === 'string') {
                                formattedWorkstations_1.push({
                                    id: item,
                                    name: "Workstation ".concat(item)
                                });
                            }
                            // Handle objects with safer property access
                            else if (item && typeof item === 'object') {
                                var id = String(item.id || item._id || '');
                                var name_1 = String(item.name || item.title || "Workstation ".concat(id));
                                if (id) {
                                    formattedWorkstations_1.push({ id: id, name: name_1 });
                                }
                            }
                        });
                    }
                    setAvailableWorkstations(formattedWorkstations_1);
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error listing workstations:', error_1);
                    setAvailableWorkstations([]);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    return (<div>
      <h2>Web3 Storage Integration</h2>
      <button onClick={handleSaveToWeb3}>Save to Web3</button>
      
      <h3>Load Workstation</h3>
      <button onClick={loadAvailableWorkstations}>
        Refresh Workstation List
      </button>
      
      <div>
        <select value={selectedWorkstationId} onChange={function (e) { return setSelectedWorkstationId(e.target.value); }} style={{ margin: '10px 0', display: 'block' }}>
          <option value="">Select a workstation</option>
          {availableWorkstations.map(function (ws) { return (<option key={ws.id} value={ws.id}>
              {ws.name}
            </option>); })}
        </select>

        <button onClick={handleLoadFromWeb3} disabled={!selectedWorkstationId}>
          Load Selected Workstation
        </button>
      </div>
    </div>);
};
exports.Web3Integration = Web3Integration;
