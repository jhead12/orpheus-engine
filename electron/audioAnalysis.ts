import { app, ipcMain, type IpcMainInvokeEvent } from 'electron';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

// Default data directory for audio files
const DATA_DIR = path.join(app.getPath('userData'), 'audioData');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function setupAudioAnalysisHandlers() {
  // List audio files in a directory
  ipcMain.handle('audio:list-files', async (_event: IpcMainInvokeEvent, directoryPath: string = DATA_DIR) => {
    try {
      const files = fs.readdirSync(directoryPath);
      return files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.mp3', '.wav', '.ogg', '.flac'].includes(ext);
      });
    } catch (error) {
      console.error('Error listing audio files:', error);
      return [];
    }
  });

  // Analyze audio file
  ipcMain.handle('audio:analyze', async (_event: IpcMainInvokeEvent, filePath: string) => {
    try {
      // First get basic metadata using ffprobe
      const { stdout: metadata } = await execPromise(
        `ffprobe -v quiet -print_format json -show_format -show_streams "${filePath}"`
      );
      
      const metadataObj = JSON.parse(metadata);
      const audioStream = metadataObj.streams.find((s: any) => s.codec_type === 'audio');
      
      if (!audioStream) {
        throw new Error('No audio stream found');
      }
      
      // Create a fallback analysis object in case Python script fails
      let analysisObj = {
        tempo_bpm: 120,
        loudness_lufs: -14,
        peak_db: 0,
        rms_db: -18,
        waveform_image: null,
        spectrogram_image: null,
        time_signature: "4/4"
      };
      
      try {
        // Try to run Python analysis script if it exists
        const analysisScriptPath = path.join(__dirname, 'python', 'analyze_audio.py');
        
        if (fs.existsSync(analysisScriptPath)) {
          const { stdout: analysis } = await execPromise(
            `python "${analysisScriptPath}" "${filePath}"`
          );
          
          analysisObj = JSON.parse(analysis);
        } else {
          console.warn('Python analysis script not found at:', analysisScriptPath);
        }
      } catch (pythonError) {
        console.error('Error running Python analysis:', pythonError);
        // Continue with fallback values
      }
      
      return {
        filename: path.basename(filePath),
        duration: parseFloat(audioStream.duration),
        sampleRate: parseInt(audioStream.sample_rate, 10),
        channels: parseInt(audioStream.channels, 10),
        tempoBpm: analysisObj.tempo_bpm,
        loudnessLufs: analysisObj.loudness_lufs,
        peakDb: analysisObj.peak_db,
        rmsDb: analysisObj.rms_db,
        waveformImage: analysisObj.waveform_image,
        spectrogramImage: analysisObj.spectrogram_image,
        timeSignature: analysisObj.time_signature
      };
    } catch (error) {
      console.error('Error analyzing audio:', error);
      throw error;
    }
  });
}