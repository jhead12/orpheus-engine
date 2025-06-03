import { AudioExportPluginManager } from './PluginManager';
import { 
  AudioExportPlugin, 
  ExportPluginOptions, 
  PluginRecommendation,
  PluginMetadata 
} from './types';

/**
 * AI-Enhanced Plugin Manager
 * Extends the base plugin manager with AI-powered recommendations and analysis
 */
export class AIEnhancedPluginManager extends AudioExportPluginManager {
  private aiEndpoint: string;
  private learningData: Map<string, any> = new Map();

  constructor(aiEndpoint: string = 'http://localhost:5001') {
    super();
    this.aiEndpoint = aiEndpoint;
  }

  /**
   * Get AI-powered plugin recommendations
   */
  async getAIRecommendations(options: ExportPluginOptions): Promise<PluginRecommendation[]> {
    try {
      // Get base recommendations
      const baseRecommendations = this.getExportRecommendations(options);
      
      // Enhance with AI analysis
      const aiAnalysis = await this.analyzeExportIntent(options);
      
      // Score and rank plugins using AI insights
      const scoredRecommendations = baseRecommendations.map(plugin => {
        const aiScore = this.calculateAIScore(plugin, options, aiAnalysis);
        const combinedScore = super.scorePlugin(plugin, options) + aiScore;
        
        return {
          plugin,
          score: combinedScore,
          reasons: this.generateRecommendationReasons(plugin, options, aiAnalysis)
        };
      });

      // Sort by combined score and return top recommendations
      return scoredRecommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
    } catch (error) {
      console.error('AI recommendation failed, falling back to basic recommendations:', error);
      return this.getExportRecommendations(options).map(plugin => ({
        plugin,
        score: super.scorePlugin(plugin, options),
        reasons: ['Basic compatibility match']
      }));
    }
  }

  /**
   * Learn from user export choices to improve future recommendations
   */
  async learnFromExport(
    options: ExportPluginOptions, 
    chosenPlugin: AudioExportPlugin, 
    result: any
  ): Promise<void> {
    const learningEntry = {
      timestamp: Date.now(),
      options,
      pluginId: chosenPlugin.metadata.id,
      success: result.success,
      userSatisfaction: result.userRating || null
    };

    // Store learning data
    const key = this.generateLearningKey(options);
    const existing = this.learningData.get(key) || [];
    existing.push(learningEntry);
    this.learningData.set(key, existing);

    // Send to AI backend for model training
    try {
      await this.sendLearningData(learningEntry);
    } catch (error) {
      console.warn('Failed to send learning data to AI backend:', error);
    }
  }

  /**
   * Analyze export intent using AI
   */
  private async analyzeExportIntent(options: ExportPluginOptions): Promise<any> {
    try {
      const response = await fetch(`${this.aiEndpoint}/analyze-export-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ options })
      });

      if (!response.ok) {
        throw new Error(`AI analysis failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('AI intent analysis failed:', error);
      return {
        intent: 'unknown',
        confidence: 0,
        suggestions: []
      };
    }
  }

  /**
   * Calculate AI-enhanced score for a plugin
   */
  private calculateAIScore(
    plugin: AudioExportPlugin, 
    options: ExportPluginOptions, 
    aiAnalysis: any
  ): number {
    let aiScore = 0;

    // Intent matching
    if (aiAnalysis.intent) {
      const intentMatch = this.matchPluginToIntent(plugin, aiAnalysis.intent);
      aiScore += intentMatch * aiAnalysis.confidence * 10;
    }

    // Historical performance
    const historicalScore = this.getHistoricalScore(plugin.metadata.id, options);
    aiScore += historicalScore * 5;

    // AI suggestions
    if (aiAnalysis.suggestions) {
      const suggestionMatch = aiAnalysis.suggestions.find(
        (s: any) => s.pluginId === plugin.metadata.id
      );
      if (suggestionMatch) {
        aiScore += suggestionMatch.score * 15;
      }
    }

    return aiScore;
  }

  /**
   * Match plugin capabilities to detected user intent
   */
  private matchPluginToIntent(plugin: AudioExportPlugin, intent: string): number {
    const intentMatches: Record<string, (plugin: AudioExportPlugin) => number> = {
      'quick-share': (p) => p.metadata.tags.includes('quick') ? 1 : 0.3,
      'professional-export': (p) => p.metadata.tags.includes('professional') ? 1 : 0.5,
      'blockchain-publish': (p) => p.metadata.category === 'blockchain' ? 1 : 0,
      'archive': (p) => p.metadata.category === 'storage' ? 0.8 : 0.3,
      'distribute': (p) => p.metadata.tags.includes('distribution') ? 1 : 0.4
    };

    return intentMatches[intent]?.(plugin) || 0.5;
  }

  /**
   * Get historical performance score for a plugin
   */
  private getHistoricalScore(pluginId: string, options: ExportPluginOptions): number {
    const key = this.generateLearningKey(options);
    const history = this.learningData.get(key) || [];
    
    const pluginHistory = history.filter((entry: any) => entry.pluginId === pluginId);
    
    if (pluginHistory.length === 0) {
      return 0.5; // Neutral score for new plugins
    }

    const successRate = pluginHistory.filter((entry: any) => entry.success).length / pluginHistory.length;
    const avgSatisfaction = pluginHistory
      .filter((entry: any) => entry.userSatisfaction !== null)
      .reduce((sum: number, entry: any) => sum + entry.userSatisfaction, 0) / pluginHistory.length || 0.5;

    return (successRate + avgSatisfaction) / 2;
  }

  /**
   * Generate reasons for plugin recommendation
   */
  private generateRecommendationReasons(
    plugin: AudioExportPlugin, 
    options: ExportPluginOptions, 
    aiAnalysis: any
  ): string[] {
    const reasons: string[] = [];

    // Format compatibility
    if (options.audioFormat && plugin.metadata.supportedFormats.includes(options.audioFormat)) {
      reasons.push(`Supports ${options.audioFormat.toUpperCase()} format`);
    }

    // Storage provider
    if (options.storage?.provider) {
      if (plugin.metadata.category === 'storage' || plugin.metadata.tags.includes(options.storage.provider)) {
        reasons.push(`Optimized for ${options.storage.provider} storage`);
      }
    }

    // Blockchain features
    if (options.blockchain?.storyProtocol?.enabled && plugin.metadata.category === 'blockchain') {
      reasons.push('Supports blockchain/IP protection features');
    }

    // AI insights
    if (aiAnalysis.intent === 'professional-export' && plugin.metadata.tags.includes('professional')) {
      reasons.push('AI detected professional use case - this plugin excels at high-quality exports');
    }

    // Historical performance
    const historicalScore = this.getHistoricalScore(plugin.metadata.id, options);
    if (historicalScore > 0.8) {
      reasons.push('High success rate in similar exports');
    }

    // Fallback reason
    if (reasons.length === 0) {
      reasons.push('Compatible with your export requirements');
    }

    return reasons;
  }

  /**
   * Generate a key for learning data based on export options
   */
  private generateLearningKey(options: ExportPluginOptions): string {
    const keyParts = [
      options.audioFormat || 'any',
      options.storage?.provider || 'any',
      options.blockchain?.storyProtocol?.enabled ? 'blockchain' : 'standard',
      options.quality || 'medium'
    ];
    
    return keyParts.join('-');
  }

  /**
   * Send learning data to AI backend
   */
  private async sendLearningData(learningEntry: any): Promise<void> {
    await fetch(`${this.aiEndpoint}/learn-export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(learningEntry)
    });
  }

  /**
   * Get smart plugin suggestions based on current project context
   */
  async getSmartSuggestions(context: {
    projectType?: string;
    previousExports?: any[];
    collaborators?: string[];
    deadline?: Date;
  }): Promise<PluginRecommendation[]> {
    try {
      const response = await fetch(`${this.aiEndpoint}/smart-suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(context)
      });

      if (!response.ok) {
        return [];
      }

      const suggestions = await response.json();
      
      // Map AI suggestions to actual plugins
      return suggestions.map((suggestion: {
        pluginId: string;
        score: number;
        reasons: string[];
      }) => {
        const plugin = this.registry.getPlugin(suggestion.pluginId);
        return {
          plugin,
          score: suggestion.score,
          reasons: suggestion.reasons
        };
      }).filter((rec: PluginRecommendation) => rec.plugin) || [];
    } catch (error) {
      console.error('Failed to get smart suggestions:', error);
      return [];
    }
  }

  /**
   * Auto-configure plugins based on AI analysis
   */
  async autoConfigurePlugin(
    pluginId: string, 
    options: ExportPluginOptions
  ): Promise<any> {
    try {
      const response = await fetch(`${this.aiEndpoint}/auto-configure`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pluginId,
          exportOptions: options,
          userPreferences: this.getUserPreferences()
        })
      });

      if (!response.ok) {
        return null;
      }

      const config = await response.json();
      
      // Apply the configuration
      await this.configurePlugin(pluginId, config);
      
      return config;
    } catch (error) {
      console.error('Auto-configuration failed:', error);
      return null;
    }
  }

  /**
   * Get user preferences from learning data
   */
  private getUserPreferences(): any {
    // Analyze learning data to extract user preferences
    const preferences: any = {
      preferredFormats: [],
      preferredProviders: [],
      qualityPreference: 'medium',
      speedPreference: 'balanced'
    };

    // Extract preferences from historical data
    for (const [key, entries] of this.learningData.entries()) {
      const typedEntries = entries as any[];
      for (const entry of typedEntries) {
        if (entry.success && entry.userSatisfaction > 0.7) {
          if (entry.options.audioFormat) {
            preferences.preferredFormats.push(entry.options.audioFormat);
          }
          if (entry.options.storage?.provider) {
            preferences.preferredProviders.push(entry.options.storage.provider);
          }
        }
      }
    }

    // Remove duplicates and get most common preferences
    preferences.preferredFormats = [...new Set(preferences.preferredFormats)];
    preferences.preferredProviders = [...new Set(preferences.preferredProviders)];

    return preferences;
  }
}

// Export singleton instance
export const aiPluginManager = new AIEnhancedPluginManager();
