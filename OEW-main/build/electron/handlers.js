"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = buildHandlers;
const electron_1 = require("electron");
const fs_1 = require("fs");
const types_1 = require("../src/services/types/types");
const channels_1 = require("../src/services/electron/channels");
function buildHandlers(window) {
    electron_1.ipcMain.handle(channels_1.TRACK_FILE_UPLOAD, (_, type) => handleTrackInsertFiles(window, type));
}
function handleTrackInsertFiles(window, trackType) {
    let name = "";
    let mimetypes = {};
    switch (trackType) {
        case types_1.TrackType.Audio:
            name = "Audio Files";
            mimetypes = {
                aac: "audio/aac",
                flac: "audio/flac",
                ogg: "audio/ogg",
                mp3: "audio/mpeg",
                m4a: "audio/x-m4a",
                wav: "audio/wav",
                mp4: "video/mp4"
            };
            break;
        case types_1.TrackType.Midi:
            name = "MIDI Files";
            mimetypes = { mid: "audio/midi", midi: "audio/midi" };
            break;
    }
    const filePaths = electron_1.dialog.showOpenDialogSync(window, {
        properties: ["openFile", "multiSelections"],
        filters: [{ name, extensions: Object.keys(mimetypes) }]
    });
    if (filePaths) {
        const files = filePaths.map(p => {
            const filename = p.replace(/^.*[\\\/]/, '');
            const idx = filename.lastIndexOf(".");
            const name = filename.substring(0, idx);
            const extension = filename.substring(idx + 1, p.length);
            const buffer = (0, fs_1.readFileSync)(p);
            return { buffer, name, type: mimetypes[extension.toLowerCase()] };
        });
        return files;
    }
    return [];
}
//# sourceMappingURL=handlers.js.map