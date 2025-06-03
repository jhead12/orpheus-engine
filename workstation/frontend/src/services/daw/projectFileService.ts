import { electronAPI } from '../electron/utils';

export class ProjectFileService {
  async saveProject(project: any): Promise<string | null> {
    try {
      const result = await electronAPI.showSaveDialog({
        title: 'Save Project',
        defaultPath: 'project.json',
        filters: [
          { name: 'JSON Files', extensions: ['json'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });

      if (result.canceled || !result.filePath) {
        return null;
      }

      const projectData = JSON.stringify(project, null, 2);
      await electronAPI.writeFile(result.filePath, projectData);
      
      return result.filePath;
    } catch (error) {
      console.error('Error saving project:', error);
      return null;
    }
  }

  async loadProject(): Promise<any> {
    try {
      const result = await electronAPI.showOpenDialog({
        title: 'Open Project',
        filters: [
          { name: 'JSON Files', extensions: ['json'] },
          { name: 'All Files', extensions: ['*'] }
        ],
        properties: ['openFile']
      });

      if (result.canceled || !result.filePaths.length) {
        return null;
      }

      const projectData = await electronAPI.readFile(result.filePaths[0]);
      return JSON.parse(projectData);
    } catch (error) {
      console.error('Error loading project:', error);
      return null;
    }
  }

  async exportProjectAsText(project: any): Promise<string | null> {
    return this.saveProject(project);
  }

  async importAudioFileMetadata(): Promise<any> {
    try {
      const result = await electronAPI.showOpenDialog({
        title: 'Import Audio File',
        filters: [
          { name: 'Audio Files', extensions: ['wav', 'mp3', 'flac', 'ogg'] },
          { name: 'All Files', extensions: ['*'] }
        ],
        properties: ['openFile']
      });

      if (result.canceled || !result.filePaths.length) {
        return null;
      }

      // Return basic metadata - in a real implementation this would extract actual audio metadata
      return {
        path: result.filePaths[0],
        name: result.filePaths[0].split('/').pop(),
        type: 'audio'
      };
    } catch (error) {
      console.error('Error importing audio file metadata:', error);
      return null;
    }
  }

  async exportMarkersAsText(markers: any[]): Promise<string | null> {
    try {
      const result = await electronAPI.showSaveDialog({
        title: 'Export Markers',
        defaultPath: 'markers.txt',
        filters: [
          { name: 'Text Files', extensions: ['txt'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });

      if (result.canceled || !result.filePath) {
        return null;
      }

      const markersText = markers.map(marker => 
        `${marker.position.toString()}: ${marker.label}`
      ).join('\n');

      await electronAPI.writeFile(result.filePath, markersText);
      
      return result.filePath;
    } catch (error) {
      console.error('Error exporting markers:', error);
      return null;
    }
  }
}
