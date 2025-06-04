/**
 * React Hook for Plugin Management via GraphQL
 * Provides easy-to-use React integration for external plugin developers
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useSubscription, useApolloClient } from '@apollo/client';
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
  VALIDATE_PLUGIN,
  GET_PLUGIN_REGISTRY,
  RATE_PLUGIN,
  PLUGIN_STATUS_SUBSCRIPTION,
  ExportResult,
  PluginValidationResult
} from './types';

// Plugin types and hooks
export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  tags: string[];
  status?: string;
  category?: string;
  rating?: number;
  downloads?: number;
  supportedFormats?: string[];
  homepage?: string;
}

export interface PluginRecommendation {
  plugin: Plugin;
  score: number;
  reason: string;
}

// Main plugin management hook
export function usePlugins(filters?: { category?: string; format?: string }) {
  const { data, loading, error, refetch } = useQuery(GET_PLUGINS, {
    variables: filters,
    fetchPolicy: 'cache-and-network',
  });

  return {
    plugins: data?.plugins || [],
    loading,
    error,
    refetch,
  };
}

// Individual plugin hook
export function usePlugin(id: string) {
  const { data, loading, error, refetch } = useQuery(GET_PLUGIN, {
    variables: { id },
    skip: !id,
  });

  return {
    plugin: data?.plugin,
    loading,
    error,
    refetch,
  };
}

// Plugin search hook
export function usePluginSearch() {
  const [searchPlugins, { loading, error }] = useMutation(SEARCH_PLUGINS);
  const [results, setResults] = useState<{
    plugins: Plugin[];
    total: number;
    hasMore: boolean;
  }>({ plugins: [], total: 0, hasMore: false });

  const search = useCallback(async (query: string, options?: { limit?: number; offset?: number }) => {
    try {
      const { data } = await searchPlugins({
        variables: { query, ...options },
      });
      setResults(data.searchPlugins);
    } catch (err) {
      console.error('Plugin search error:', err);
    }
  }, [searchPlugins]);

  return {
    search,
    results,
    loading,
    error,
  };
}

// Plugin recommendations hook
export function usePluginRecommendations(exportOptions: any) {
  const { data, loading, error } = useQuery(GET_PLUGIN_RECOMMENDATIONS, {
    variables: { options: exportOptions },
    skip: !exportOptions,
  });

  return {
    recommendations: data?.pluginRecommendations || [],
    loading,
    error,
  };
}

// Plugin management operations hook
export function usePluginOperations() {
  const [installPlugin] = useMutation(INSTALL_PLUGIN);
  const [updatePlugin] = useMutation(UPDATE_PLUGIN);
  const [uninstallPlugin] = useMutation(UNINSTALL_PLUGIN);
  const [configurePlugin] = useMutation(CONFIGURE_PLUGIN);
  const [enablePlugin] = useMutation(ENABLE_PLUGIN);
  const [disablePlugin] = useMutation(DISABLE_PLUGIN);

  const install = useCallback(async (source: string, config?: Record<string, any>) => {
    const { data } = await installPlugin({
      variables: { source, config },
    });
    return data.installPlugin;
  }, [installPlugin]);

  const update = useCallback(async (id: string, version?: string) => {
    const { data } = await updatePlugin({
      variables: { id, version },
    });
    return data.updatePlugin;
  }, [updatePlugin]);

  const uninstall = useCallback(async (id: string) => {
    const { data } = await uninstallPlugin({
      variables: { id },
    });
    return data.uninstallPlugin;
  }, [uninstallPlugin]);

  const configure = useCallback(async (id: string, config: Record<string, any>) => {
    const { data } = await configurePlugin({
      variables: { id, config },
    });
    return data.configurePlugin;
  }, [configurePlugin]);

  const enable = useCallback(async (id: string) => {
    const { data } = await enablePlugin({
      variables: { id },
    });
    return data.enablePlugin;
  }, [enablePlugin]);

  const disable = useCallback(async (id: string) => {
    const { data } = await disablePlugin({
      variables: { id },
    });
    return data.disablePlugin;
  }, [disablePlugin]);

  return {
    install,
    update,
    uninstall,
    configure,
    enable,
    disable,
  };
}

// Export operations hook
export function usePluginExport() {
  const [exportWithPlugin] = useMutation(EXPORT_WITH_PLUGIN);

  const exportClips = useCallback(async (
    pluginId: string,
    clips: any[],
    options: any
  ): Promise<ExportResult> => {
    const { data } = await exportWithPlugin({
      variables: { pluginId, clips, options },
    });
    return data.exportWithPlugin;
  }, [exportWithPlugin]);

  return {
    exportClips,
  };
}

// Plugin validation hook
export function usePluginValidation() {
  const [validatePlugin] = useMutation(VALIDATE_PLUGIN);

  const validate = useCallback(async (source: string): Promise<PluginValidationResult> => {
    const { data } = await validatePlugin({
      variables: { source },
    });
    return data.validatePlugin;
  }, [validatePlugin]);

  return {
    validate,
  };
}

// Plugin marketplace hook
export function usePluginMarketplace() {
  const { data, loading, error, refetch } = useQuery(GET_PLUGIN_REGISTRY);
  const [ratePlugin] = useMutation(RATE_PLUGIN);

  const rate = useCallback(async (pluginId: string, rating: number, review?: string) => {
    const { data } = await ratePlugin({
      variables: { pluginId, rating, review },
    });
    return data.ratePlugin;
  }, [ratePlugin]);

  return {
    registry: data?.pluginRegistry,
    loading,
    error,
    refetch,
    rate,
  };
}

// Plugin status subscription hook
export function usePluginStatusSubscription(pluginId?: string) {
  const { data, loading, error } = useSubscription(PLUGIN_STATUS_SUBSCRIPTION, {
    variables: { pluginId },
  });

  return {
    statusUpdate: data?.pluginStatusUpdated,
    loading,
    error,
  };
}

// Comprehensive plugin manager hook
export function usePluginManager() {
  const client = useApolloClient();
  const plugins = usePlugins();
  const operations = usePluginOperations();
  const exportOps = usePluginExport();
  const validation = usePluginValidation();
  const marketplace = usePluginMarketplace();

  // Helper function to install plugin from various sources
  const installFromSource = useCallback(async (source: string, type: 'npm' | 'github' | 'url' = 'url') => {
    let fullSource = source;
    
    switch (type) {
      case 'npm':
        fullSource = `npm:${source}`;
        break;
      case 'github':
        fullSource = `github:${source}`;
        break;
      case 'url':
      default:
        fullSource = source;
        break;
    }

    return operations.install(fullSource);
  }, [operations]);

  // Helper function to create export workflow
  const createExportWorkflow = useCallback(async (
    clips: any[],
    outputFormat: string,
    destination?: string
  ) => {
    // Get plugin recommendations
    const exportOptions = {
      audioFormat: outputFormat,
      storage: destination ? { provider: destination } : undefined,
    };

    const recommendationsData = await client.query({
      query: GET_PLUGIN_RECOMMENDATIONS,
      variables: { options: exportOptions },
    });

    const recommendations = recommendationsData.data.pluginRecommendations;

    // Create workflow steps
    const workflow = [
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
      },
      {
        step: 3,
        action: 'export',
        description: 'Execute export operation',
      },
    ];

    return { recommendations, workflow };
  }, [client]);

  // Quick export function
  const quickExport = useCallback(async (
    clips: any[],
    outputFormat: string,
    customOptions?: any
  ) => {
    // Get best plugin for format
    const { recommendations } = await createExportWorkflow(clips, outputFormat);
    
    if (recommendations.length === 0) {
      throw new Error(`No plugins available for ${outputFormat} format`);
    }

    const bestPlugin = recommendations[0].plugin;
    
    // Execute export
    return exportOps.exportClips(bestPlugin.id, clips, {
      audioFormat: outputFormat,
      ...customOptions,
    });
  }, [createExportWorkflow, exportOps]);

  return {
    // Plugin data
    plugins: plugins.plugins,
    loading: plugins.loading,
    error: plugins.error,
    
    // Operations
    ...operations,
    installFromSource,
    
    // Export
    ...exportOps,
    quickExport,
    createExportWorkflow,
    
    // Validation
    ...validation,
    
    // Marketplace
    marketplace: marketplace.registry,
    ratePlugin: marketplace.rate,
    
    // Utilities
    refetch: plugins.refetch,
  };
}

// External developer helper hooks
export function useExternalPluginDevelopment() {
  const validation = usePluginValidation();
  const operations = usePluginOperations();

  // Helper for testing plugin during development
  const testPlugin = useCallback(async (pluginSource: string) => {
    // First validate the plugin
    const validationResult = await validation.validate(pluginSource);
    
    if (!validationResult.valid) {
      return {
        success: false,
        errors: validationResult.errors,
        warnings: validationResult.warnings,
      };
    }

    // If valid, try installing it
    try {
      const installResult = await operations.install(pluginSource);
      return {
        success: installResult.success,
        plugin: installResult.plugin,
        errors: installResult.error ? [installResult.error] : [],
        warnings: installResult.warnings || [],
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Installation failed'],
        warnings: [],
      };
    }
  }, [validation, operations]);

  return {
    testPlugin,
    validate: validation.validate,
    install: operations.install,
  };
}
