/**
 * GraphQL Plugin Client Service
 * High-level interface for external developers to interact with Orpheus Engine plugins
 */

import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import {
  GET_PLUGINS,
  GET_PLUGIN,
  SEARCH_PLUGINS,
  GET_PLUGIN_RECOMMENDATIONS,
  INSTALL_PLUGIN,
  UPDATE_PLUGIN,
  UNINSTALL_PLUGIN,
  CONFIGURE_PLUGIN,
  ENABLE_PLUGIN,
  DISABLE_PLUGIN,
  EXPORT_WITH_PLUGIN,
  PUBLISH_PLUGIN,
  VALIDATE_PLUGIN,
  GET_PLUGIN_REGISTRY,
  RATE_PLUGIN,
  GET_PLUGIN_ANALYTICS,
  Plugin,
  PluginRecommendation,
  ExportResult,
  PluginValidationResult,
  PluginAnalytics
} from './types';

export class GraphQLPluginClient {
  private client: ApolloClient<NormalizedCacheObject>;

  constructor(client: ApolloClient<NormalizedCacheObject>) {
    this.client = client;
  }

  // Plugin Discovery & Information
  async getPlugins(filters?: { category?: string; format?: string }): Promise<Plugin[]> {
    const { data } = await this.client.query({
      query: GET_PLUGINS,
      variables: filters,
    });
    return data.plugins;
  }

  async getPlugin(id: string): Promise<Plugin | null> {
    const { data } = await this.client.query({
      query: GET_PLUGIN,
      variables: { id },
    });
    return data.plugin;
  }

  async searchPlugins(
    query: string,
    options?: { limit?: number; offset?: number }
  ): Promise<{ plugins: Plugin[]; total: number; hasMore: boolean }> {
    const { data } = await this.client.query({
      query: SEARCH_PLUGINS,
      variables: { query, ...options },
    });
    return data.searchPlugins;
  }

  async getPluginRecommendations(exportOptions: any): Promise<PluginRecommendation[]> {
    const { data } = await this.client.query({
      query: GET_PLUGIN_RECOMMENDATIONS,
      variables: { options: exportOptions },
    });
    return data.pluginRecommendations;
  }

  // Plugin Management
  async installPlugin(
    source: string,
    config?: Record<string, any>
  ): Promise<{ success: boolean; plugin?: Plugin; error?: string; warnings?: string[] }> {
    const { data } = await this.client.mutate({
      mutation: INSTALL_PLUGIN,
      variables: { source, config },
    });
    return data.installPlugin;
  }

  async updatePlugin(id: string, version?: string): Promise<{ success: boolean; plugin?: Plugin; error?: string }> {
    const { data } = await this.client.mutate({
      mutation: UPDATE_PLUGIN,
      variables: { id, version },
    });
    return data.updatePlugin;
  }

  async uninstallPlugin(id: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const { data } = await this.client.mutate({
      mutation: UNINSTALL_PLUGIN,
      variables: { id },
    });
    return data.uninstallPlugin;
  }

  async configurePlugin(
    id: string,
    config: Record<string, any>
  ): Promise<{ success: boolean; plugin?: Plugin; error?: string }> {
    const { data } = await this.client.mutate({
      mutation: CONFIGURE_PLUGIN,
      variables: { id, config },
    });
    return data.configurePlugin;
  }

  async enablePlugin(id: string): Promise<{ success: boolean; plugin?: Plugin; error?: string }> {
    const { data } = await this.client.mutate({
      mutation: ENABLE_PLUGIN,
      variables: { id },
    });
    return data.enablePlugin;
  }

  async disablePlugin(id: string): Promise<{ success: boolean; plugin?: Plugin; error?: string }> {
    const { data } = await this.client.mutate({
      mutation: DISABLE_PLUGIN,
      variables: { id },
    });
    return data.disablePlugin;
  }

  // Export Operations
  async exportWithPlugin(
    pluginId: string,
    clips: any[],
    options: any
  ): Promise<ExportResult> {
    const { data } = await this.client.mutate({
      mutation: EXPORT_WITH_PLUGIN,
      variables: { pluginId, clips, options },
    });
    return data.exportWithPlugin;
  }

  // Plugin Development & Publishing
  async publishPlugin(pluginPackage: any): Promise<{
    success: boolean;
    pluginId?: string;
    publishedVersion?: string;
    registryUrl?: string;
    error?: string;
  }> {
    const { data } = await this.client.mutate({
      mutation: PUBLISH_PLUGIN,
      variables: { plugin: pluginPackage },
    });
    return data.publishPlugin;
  }

  async validatePlugin(source: string): Promise<PluginValidationResult> {
    const { data } = await this.client.mutate({
      mutation: VALIDATE_PLUGIN,
      variables: { source },
    });
    return data.validatePlugin;
  }

  // Plugin Registry & Marketplace
  async getPluginRegistry(filters?: { category?: string; verified?: boolean }): Promise<{
    plugins: Plugin[];
    categories: string[];
    totalCount: number;
  }> {
    const { data } = await this.client.query({
      query: GET_PLUGIN_REGISTRY,
      variables: filters,
    });
    return data.pluginRegistry;
  }

  async ratePlugin(
    pluginId: string,
    rating: number,
    review?: string
  ): Promise<{ success: boolean; averageRating?: number; totalRatings?: number; error?: string }> {
    const { data } = await this.client.mutate({
      mutation: RATE_PLUGIN,
      variables: { pluginId, rating, review },
    });
    return data.ratePlugin;
  }

  // Analytics & Monitoring
  async getPluginAnalytics(pluginId: string, timeframe?: string): Promise<PluginAnalytics> {
    const { data } = await this.client.query({
      query: GET_PLUGIN_ANALYTICS,
      variables: { pluginId, timeframe },
    });
    return data.pluginAnalytics;
  }

  // Utility Methods for External Developers
  async createExportWorkflow(clips: any[], outputFormat: string, destination?: string): Promise<{
    recommendedPlugins: PluginRecommendation[];
    workflow: ExportWorkflowStep[];
  }> {
    // Get recommendations based on export requirements
    const recommendations = await this.getPluginRecommendations({
      audioFormat: outputFormat,
      storage: destination ? { provider: destination } : undefined,
    });

    // Create a suggested workflow
    const workflow: ExportWorkflowStep[] = [
      {
        step: 1,
        action: 'select_plugin',
        plugin: recommendations[0]?.plugin,
        description: `Use ${recommendations[0]?.plugin.name} for ${outputFormat} export`,
      },
      {
        step: 2,
        action: 'configure',
        description: 'Configure export settings',
        suggestedConfig: this.getDefaultExportConfig(outputFormat),
      },
      {
        step: 3,
        action: 'export',
        description: 'Execute export operation',
      },
    ];

    return { recommendedPlugins: recommendations, workflow };
  }

  async installPluginFromNPM(packageName: string, version?: string): Promise<{
    success: boolean;
    plugin?: Plugin;
    error?: string;
  }> {
    const source = version ? `npm:${packageName}@${version}` : `npm:${packageName}`;
    return this.installPlugin(source);
  }

  async installPluginFromGitHub(repo: string, tag?: string): Promise<{
    success: boolean;
    plugin?: Plugin;
    error?: string;
  }> {
    const source = tag ? `github:${repo}#${tag}` : `github:${repo}`;
    return this.installPlugin(source);
  }

  async installPluginFromURL(url: string): Promise<{
    success: boolean;
    plugin?: Plugin;
    error?: string;
  }> {
    return this.installPlugin(url);
  }

  // Helper methods
  private getDefaultExportConfig(format: string): Record<string, any> {
    const configs: Record<string, any> = {
      wav: { sampleRate: 44100, bitDepth: 24 },
      mp3: { bitRate: 320, quality: 'high' },
      ogg: { quality: 'high' },
      flac: { compression: 5 },
    };
    return configs[format] || {};
  }
}

export interface ExportWorkflowStep {
  step: number;
  action: 'select_plugin' | 'configure' | 'export' | 'post_process';
  plugin?: Plugin;
  description: string;
  suggestedConfig?: Record<string, any>;
}

// Factory function to create a GraphQL Plugin Client
export function createGraphQLPluginClient(apolloClient: ApolloClient<NormalizedCacheObject>): GraphQLPluginClient {
  return new GraphQLPluginClient(apolloClient);
}

// Export hook for React components
export function useGraphQLPluginClient(): GraphQLPluginClient {
  // This would use useApolloClient hook in a real React component
  throw new Error('useGraphQLPluginClient must be used within an Apollo Provider');
}
