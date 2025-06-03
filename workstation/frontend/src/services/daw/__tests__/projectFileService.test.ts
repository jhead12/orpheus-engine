import { describe, test, expect, vi, beforeEach } from 'vitest';
import { TimelinePosition } from '../../types/types';
import { ProjectFileService } from '../projectFileService';

// Mock file system / electron APIs
vi.mock('../../electron/utils', () => ({
  electronAPI: {
    showOpenDialog: vi.fn().mockResolvedValue({ 
      canceled: false, 
      filePaths: ['/path/to/project.json']
    }),
    showSaveDialog: vi.fn().mockResolvedValue({ 
      canceled: false, 
      filePath: '/path/to/save/project.json'
    }),
    readFile: vi.fn().mockImplementation((path) => {
      if (path === '/path/to/project.json') {
        return Promise.resolve(JSON.stringify({
          name: 'Test Project',
          tracks: [
            {
              id: 'track-1',
              name: 'Audio Track 1',
              type: 'audio',
              clips: [
                {
                  id: 'clip-1',
                  trackId: 'track-1',
                  start: { bar: 0, beat: 0, tick: 0 },
                  length: { bar: 0, beat: 2, tick: 0 }
                }
              ]
            }
          ],
          tempo: 120,
          timeSignature: { numerator: 4, denominator: 4 }
        }));
      }
      return Promise.resolve('');
    }),
    writeFile: vi.fn().mockResolvedValue(undefined)
  },
  isElectron: vi.fn().mockReturnValue(true)
}));

describe('ProjectFileService', () => {
  let projectFileService: ProjectFileService;
  let mockProject: {
    name: string;
    tracks: {
      id: string;
      name: string;
      type: string;
      clips: {
        id: string;
        trackId: string;
        start: TimelinePosition;
        length: TimelinePosition;
        data: {
          type: string;
          buffer: AudioBuffer;
          waveform: any[];
        };
      }[];
    }[];
    tempo: number;
    timeSignature: { numerator: number; denominator: number };
  };
  
  beforeEach(() => {
    // Initialize project file service
    projectFileService = new ProjectFileService();
    
    // Create a mock project
    mockProject = {
      name: 'New Project',
      tracks: [
        {
          id: 'track-1',
          name: 'Audio Track 1',
          type: 'audio',
          clips: [
            {
              id: 'clip-1',
              trackId: 'track-1',
              start: new TimelinePosition(0, 0, 0),
              length: new TimelinePosition(0, 2, 0),
              data: {
                type: 'audio',
                buffer: {} as AudioBuffer,
                waveform: []
              }
            }
          ]
        }
      ],
      tempo: 120,
      timeSignature: { numerator: 4, denominator: 4 }
    };
  });
  
  test('should save a project to a JSON file', async () => {
    const result = await projectFileService.saveProject(mockProject);
    
    expect(result).toBe('/path/to/save/project.json');
    expect(vi.mocked(require('../../electron/utils').electronAPI.writeFile)).toHaveBeenCalled();
  });
  
  test('should load a project from a JSON file', async () => {
    const project = await projectFileService.loadProject();
    
    expect(project).toBeDefined();
    expect(project.name).toBe('Test Project');
    expect(project.tracks).toHaveLength(1);
    expect(project.tracks[0].clips).toHaveLength(1);
    expect(vi.mocked(require('../../electron/utils').electronAPI.readFile)).toHaveBeenCalled();
  });
  
  test('should export a project as text format', async () => {
    const result = await projectFileService.exportProjectAsText(mockProject);
    
    expect(result).toBe('/path/to/save/project.json');
    expect(vi.mocked(require('../../electron/utils').electronAPI.writeFile)).toHaveBeenCalled();
  });
  
  test('should import audio file metadata', async () => {
    // Mock dialog to select an audio file
    vi.mocked(require('../../electron/utils').electronAPI.showOpenDialog)
      .mockResolvedValueOnce({ 
        canceled: false, 
        filePaths: ['/path/to/audio.wav']
      });
    
    const metadata = await projectFileService.importAudioFileMetadata();
    
    expect(metadata).toBeDefined();
    expect(vi.mocked(require('../../electron/utils').electronAPI.showOpenDialog)).toHaveBeenCalled();
  });
  
  test('should export track markers as text', async () => {
    const markers = [
      { position: new TimelinePosition(0, 0, 0), label: 'Start' },
      { position: new TimelinePosition(1, 0, 0), label: 'Verse' },
      { position: new TimelinePosition(2, 0, 0), label: 'Chorus' }
    ];
    
    const result = await projectFileService.exportMarkersAsText(markers);
    
    expect(result).toBe('/path/to/save/project.json');
    expect(vi.mocked(require('../../electron/utils').electronAPI.writeFile)).toHaveBeenCalled();
  });
  
  test('should handle export cancellation by user', async () => {
    // Override the mock for this test only
    vi.mocked(require('../../electron/utils').electronAPI.showSaveDialog)
      .mockResolvedValueOnce({ canceled: true, filePath: '' });
    
    const result = await projectFileService.saveProject(mockProject);
    
    expect(result).toBeNull();
  });
});
