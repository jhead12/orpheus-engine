import { 
  AudioExportPlugin, 
  PluginMetadata, 
  PluginConfiguration, 
  PluginContext, 
  ExportPluginOptions, 
  PluginExportResult 
} from '../types';
import { Clip } from '../../types/types';

export class StoryProtocolPlugin implements AudioExportPlugin {
  metadata: PluginMetadata = {
    id: 'story-protocol-export',
    name: 'Story Protocol Export',
    version: '1.0.0',
    description: 'Export and register IP assets on Story Protocol',
    author: 'Orpheus Engine',
    category: 'blockchain',
    tags: ['story', 'blockchain', 'ip', 'licensing', 'web3'],
    supportedFormats: ['wav', 'mp3', 'ogg', 'flac']
  };

  private context?: PluginContext;

  async initialize(config: PluginConfiguration, context: PluginContext): Promise<void> {
    this.context = context;
    
    if (!context.capabilities.blockchain) {
      console.warn('Blockchain not available - Story Protocol features limited');
    }
    
    console.log('Story Protocol Plugin initialized');
  }

  canHandle(options: ExportPluginOptions): boolean {
    return !!options.blockchain?.storyProtocol?.enabled;
  }

  async exportClip(clip: Clip, options: ExportPluginOptions): Promise<PluginExportResult> {
    try {
      // Mock Story Protocol registration
      const ipAssetId = `0x${Math.random().toString(16).substring(2, 42)}`;
      const format = options.audioFormat || options.exportFormat || 'wav';
      
      return {
        success: true,
        format,
        metadata: {
          storyProtocol: {
            ipAssetId,
            licenseTerms: options.blockchain?.storyProtocol?.licenseTerms,
            registeredAt: new Date().toISOString()
          },
          clipId: clip.id
        },
        urls: {
          preview: `https://story.foundation/assets/${ipAssetId}`
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Story Protocol registration failed'
      };
    }
  }

  async exportMultipleClips(clips: Clip[], options: ExportPluginOptions): Promise<PluginExportResult> {
    try {
      const ipAssetId = `0x${Math.random().toString(16).substring(2, 42)}`;
      const format = options.audioFormat || options.exportFormat || 'wav';
      
      return {
        success: true,
        format,
        metadata: {
          storyProtocol: {
            ipAssetId,
            clipCount: clips.length,
            clipIds: clips.map(c => c.id),
            licenseTerms: options.blockchain?.storyProtocol?.licenseTerms,
            registeredAt: new Date().toISOString()
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Story Protocol registration failed'
      };
    }
  }

  async exportTimelineSection(
    clips: Clip[], 
    startTime: number, 
    endTime: number, 
    options: ExportPluginOptions
  ): Promise<PluginExportResult> {
    return this.exportMultipleClips(clips, options);
  }

  async validateConfiguration(config: PluginConfiguration): Promise<boolean> {
    return this.context?.capabilities.blockchain || false;
  }

  async dispose(): Promise<void> {
    console.log('Story Protocol Plugin disposed');
  }
}
