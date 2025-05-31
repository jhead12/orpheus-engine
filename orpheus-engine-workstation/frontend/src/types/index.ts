export interface AudioSegment {
    id: string;
    start: number;
    end: number;
    text: string;
}

export interface RagResult {
    segments: AudioSegment[];
    query: string;
    relevant: boolean;
}