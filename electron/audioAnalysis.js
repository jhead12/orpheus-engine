"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.setupAudioAnalysisHandlers = setupAudioAnalysisHandlers;
exports.analyzeAudioFile = analyzeAudioFile;
exports.listAudioFiles = listAudioFiles;
const electron_1 = require("electron");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
// Configuration
const config = {
    supportedFormats: ['.mp3', '.wav', '.ogg', '.flac'],
    defaultOptions: {
        fftSize: 2048,
        sampleRate: 44100,
        normalize: true
    }
};
exports.config = config;
/**
 * Analyze an audio file and extract relevant data
 * @param filePath Path to the audio file
 * @returns Analysis result object
 */
async function analyzeAudioFile(filePath) {
    // This is a placeholder implementation
    // In a real implementation, you would use audio processing libraries
    // like Web Audio API, node-audio, etc.
    console.log(`Analyzing audio file: ${filePath}`);
    // Placeholder analysis result
    return {
        duration: 180, // 3 minutes
        channels: 2, // Stereo
        sampleRate: 44100,
        peaks: Array(100).fill(0).map(() => Math.random()),
        waveform: [
            Array(100).fill(0).map(() => Math.random() * 2 - 1),
            Array(100).fill(0).map(() => Math.random() * 2 - 1)
        ],
        bpm: 120,
        key: 'C'
    };
}
/**
 * List audio files in a directory
 * @param directoryPath Path to directory
 * @returns Array of audio file paths
 */
function listAudioFiles(directoryPath) {
    try {
        const files = fs.readdirSync(directoryPath);
        return files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return config.supportedFormats.includes(ext);
        }).map(file => path.join(directoryPath, file));
    }
    catch (error) {
        console.error("Error listing audio files:", error);
        return [];
    }
}
// Set up IPC handlers
function setupAudioAnalysisHandlers() {
    electron_1.ipcMain.handle('audio:analyze', async (_event, filePath) => {
        try {
            return await analyzeAudioFile(filePath);
        }
        catch (error) {
            console.error("Error analyzing audio:", error);
            throw error;
        }
    });
    electron_1.ipcMain.handle('audio:list-files', (_event, directoryPath) => {
        try {
            return listAudioFiles(directoryPath);
        }
        catch (error) {
            console.error("Error listing audio files:", error);
            throw error;
        }
    });
}
