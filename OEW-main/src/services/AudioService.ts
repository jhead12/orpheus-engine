/**
 * AudioService - Handles API calls to the backend audio services
 */

interface SearchResult {
  id: string;
  text: string;
  confidence: number;
  start_time: number;
  end_time: number;
  file_path?: string;
  audio_file?: string;
}

interface SearchResponse {
  results: SearchResult[];
  total_results: number;
  query: string;
  processing_time?: number;
}

export class AudioService {
  private apiBase: string = '/api/audio';

  /**
   * Search for audio segments matching a query
   * @param query The search query
   * @param limit Maximum number of results to return (default: 10)
   * @returns Promise with search results
   */
  async searchAudio(query: string, limit: number = 10): Promise<SearchResponse> {
    try {
      const response = await fetch(`${this.apiBase}/search?query=${encodeURIComponent(query)}&limit=${limit}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Search failed (${response.status}): ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Audio search error:', error);
      throw error;
    }
  }

  /**
   * Get a specific audio segment by ID
   * @param segmentId ID of the audio segment
   * @returns Promise with segment details
   */
  async getSegmentDetails(segmentId: string): Promise<any> {
    try {
      const response = await fetch(`${this.apiBase}/segments/${segmentId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get segment details (${response.status})`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching segment details:', error);
      throw error;
    }
  }

  /**
   * Check if the audio service is healthy
   * @returns Promise with health status
   */
  async checkHealth(): Promise<any> {
    try {
      const response = await fetch(`${this.apiBase}/health`);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'unhealthy', error: String(error) };
    }
  }
}

// Export a singleton instance
export const audioService = new AudioService();

export default audioService;
