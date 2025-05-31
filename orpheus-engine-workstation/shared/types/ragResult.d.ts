interface RagResult {
    segments: AudioSegment[];
    transcription: string;
    metadata: {
        [key: string]: any; // Additional metadata fields can be added as needed
    };
}

interface AudioSegment {
    id: string;
    start: number; // Start time in seconds
    end: number;   // End time in seconds
    text: string;  // Transcribed text for the segment
}