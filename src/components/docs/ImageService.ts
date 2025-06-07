export interface ImageFile {
  name: string;
  path: string;
  type: 'gif' | 'png';
  component?: string;
  testName?: string;
  category: 'screenshot' | 'diff' | 'gif' | 'snapshot';
}

export class ImageService {
  private static instance: ImageService;
  
  public static getInstance(): ImageService {
    if (!ImageService.instance) {
      ImageService.instance = new ImageService();
    }
    return ImageService.instance;
  }

  /**
   * Load all available test images from the workspace
   */
  async loadImages(): Promise<ImageFile[]> {
    const images: ImageFile[] = [];
    
    try {
      // Load screenshots from __snapshots__/screenshots/
      const screenshotImages = await this.loadScreenshots();
      images.push(...screenshotImages);
      
      // Load GIFs from __snapshots__/gifs/
      const gifImages = await this.loadGifs();
      images.push(...gifImages);
      
      // Load diff images from __snapshots__/diffs/
      const diffImages = await this.loadDiffs();
      images.push(...diffImages);
      
      // Scan for component test snapshots
      const componentImages = await this.loadComponentSnapshots();
      images.push(...componentImages);
      
    } catch (error) {
      console.error('Error loading images:', error);
    }
    
    return images;
  }

  private async loadScreenshots(): Promise<ImageFile[]> {
    // In a real implementation, you would scan the file system
    // For now, return the known files
    return [
      {
        name: 'sidepanel-collapsed.png',
        path: '/__snapshots__/screenshots/sidepanel-collapsed.png',
        type: 'png',
        component: 'SidePanel',
        testName: 'Collapsed State',
        category: 'screenshot'
      },
      {
        name: 'sidepanel-expanded.png',
        path: '/__snapshots__/screenshots/sidepanel-expanded.png',
        type: 'png',
        component: 'SidePanel',
        testName: 'Expanded State',
        category: 'screenshot'
      }
    ];
  }

  private async loadGifs(): Promise<ImageFile[]> {
    // Placeholder for GIF loading
    return [];
  }

  private async loadDiffs(): Promise<ImageFile[]> {
    // Placeholder for diff image loading
    return [];
  }

  private async loadComponentSnapshots(): Promise<ImageFile[]> {
    // Generate sample visual test images for the Meter component
    // In a real implementation, these would be generated from actual visual tests
    return [
      {
        name: 'Meter.test.tsx.snap-meter-renders-horizontally-1.png',
        path: '/src/components/widgets/__tests__/__snapshots__/Meter.test.tsx.snap-meter-renders-horizontally-1.png',
        type: 'png',
        component: 'Meter',
        testName: 'Renders Horizontally',
        category: 'snapshot'
      },
      {
        name: 'Meter.test.tsx.snap-meter-renders-vertically-1.png',
        path: '/src/components/widgets/__tests__/__snapshots__/Meter.test.tsx.snap-meter-renders-vertically-1.png',
        type: 'png',
        component: 'Meter',
        testName: 'Renders Vertically',
        category: 'snapshot'
      },
      {
        name: 'Meter.test.tsx.snap-meter-shows-percentage-1.png',
        path: '/src/components/widgets/__tests__/__snapshots__/Meter.test.tsx.snap-meter-shows-percentage-1.png',
        type: 'png',
        component: 'Meter',
        testName: 'Shows Percentage',
        category: 'snapshot'
      },
      {
        name: 'Meter.test.tsx.snap-meter-with-custom-colors-1.png',
        path: '/src/components/widgets/__tests__/__snapshots__/Meter.test.tsx.snap-meter-with-custom-colors-1.png',
        type: 'png',
        component: 'Meter',
        testName: 'With Custom Colors',
        category: 'snapshot'
      },
      {
        name: 'Meter.test.tsx.snap-meter-with-marks-1.png',
        path: '/src/components/widgets/__tests__/__snapshots__/Meter.test.tsx.snap-meter-with-marks-1.png',
        type: 'png',
        component: 'Meter',
        testName: 'With Marks',
        category: 'snapshot'
      }
    ];
  }

  /**
   * Parse component name from filename
   */
  private parseComponentName(filename: string): string {
    const match = filename.match(/^(.+?)\.test\.tsx\.snap/);
    return match ? match[1] : 'Unknown';
  }

  /**
   * Parse test name from filename
   */
  private parseTestName(filename: string): string {
    const match = filename.match(/snap-(.+)-\d+\.(png|gif)$/);
    if (match) {
      return match[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    return filename.replace(/\.(png|gif)$/, '');
  }

  /**
   * Get file type from extension
   */
  private getFileType(filename: string): 'gif' | 'png' {
    return filename.endsWith('.gif') ? 'gif' : 'png';
  }
}

export const imageService = ImageService.getInstance();
