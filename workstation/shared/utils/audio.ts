import { execFile } from 'child_process';
import path from 'path';

const ffmpegPath = path.resolve(__dirname, '../ffmpeg/ffmpeg');

export function runFfmpeg(args: string[], callback: (error: Error | null, stdout: string, stderr: string) => void) {
  execFile(ffmpegPath, args, (error, stdout, stderr) => {
    callback(error, stdout, stderr);
  });
}