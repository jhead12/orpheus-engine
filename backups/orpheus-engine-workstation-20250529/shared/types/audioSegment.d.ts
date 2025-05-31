interface AudioSegment {
    id: string;
    start: number; // Start time in seconds
    end: number;   // End time in seconds
    text: string;  // Transcribed text for the audio segment
}

export type { AudioSegment };