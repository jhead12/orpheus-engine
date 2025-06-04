/**
 * GraphQL Types for Plugin System Integration
 * Allows external developers to create and manage plugins via GraphQL API
 */

import { gql } from '@apollo/client';

// Core Plugin Types for GraphQL
export const PLUGIN_FRAGMENT = gql`
  fragment PluginInfo on Plugin {
    id
    name
    version
    description
    author
    category
    tags
    supportedFormats
    homepage
    license
    icon
    status {
      installed
      enabled
      configured
      lastUpdated
    }
    capabilities {
      formats
      storage
      blockchain
      features
    }
    configuration
    dependencies
    metadata
  }
`;

// Plugin Queries
export const GET_PLUGINS = gql`
  query GetPlugins($category: String, $format: String) {
    plugins(category: $category, format: $format) {
      ...PluginInfo
    }
  }
  ${PLUGIN_FRAGMENT}
`;

export const GET_PLUGIN = gql`
  query GetPlugin($id: ID!) {
    plugin(id: $id) {
      ...PluginInfo
      documentation
      examples
      changelog
    }
  }
  ${PLUGIN_FRAGMENT}
`;

export const SEARCH_PLUGINS = gql`
  query SearchPlugins($query: String!, $limit: Int, $offset: Int) {
    searchPlugins(query: $query, limit: $limit, offset: $offset) {
      plugins {
        ...PluginInfo
      }
      total
      hasMore
    }
  }
  ${PLUGIN_FRAGMENT}
`;

export const GET_PLUGIN_RECOMMENDATIONS = gql`
  query GetPluginRecommendations($options: ExportOptionsInput!) {
    pluginRecommendations(options: $options) {
      plugin {
        ...PluginInfo
      }
      score
      reason
    }
  }
  ${PLUGIN_FRAGMENT}
`;

// Plugin Mutations
export const INSTALL_PLUGIN = gql`
  mutation InstallPlugin($source: String!, $config: PluginConfigInput) {
    installPlugin(source: $source, config: $config) {
      success
      plugin {
        ...PluginInfo
      }
      error
      warnings
    }
  }
  ${PLUGIN_FRAGMENT}
`;

export const UPDATE_PLUGIN = gql`
  mutation UpdatePlugin($id: ID!, $version: String) {
    updatePlugin(id: $id, version: $version) {
      success
      plugin {
        ...PluginInfo
      }
      error
    }
  }
  ${PLUGIN_FRAGMENT}
`;

export const UNINSTALL_PLUGIN = gql`
  mutation UninstallPlugin($id: ID!) {
    uninstallPlugin(id: $id) {
      success
      message
      error
    }
  }
`;

export const CONFIGURE_PLUGIN = gql`
  mutation ConfigurePlugin($id: ID!, $config: PluginConfigInput!) {
    configurePlugin(id: $id, config: $config) {
      success
      plugin {
        ...PluginInfo
      }
      error
    }
  }
  ${PLUGIN_FRAGMENT}
`;

export const ENABLE_PLUGIN = gql`
  mutation EnablePlugin($id: ID!) {
    enablePlugin(id: $id) {
      success
      plugin {
        ...PluginInfo
      }
      error
    }
  }
  ${PLUGIN_FRAGMENT}
`;

export const DISABLE_PLUGIN = gql`
  mutation DisablePlugin($id: ID!) {
    disablePlugin(id: $id) {
      success
      plugin {
        ...PluginInfo
      }
      error
    }
  }
  ${PLUGIN_FRAGMENT}
`;

// Export Operations
export const EXPORT_WITH_PLUGIN = gql`
  mutation ExportWithPlugin($pluginId: ID!, $clips: [ClipInput!]!, $options: ExportOptionsInput!) {
    exportWithPlugin(pluginId: $pluginId, clips: $clips, options: $options) {
      success
      result {
        filePath
        url
        hash
        ipfsHash
        storyProtocolId
        format
        urls
        metadata
      }
      error
      warnings
    }
  }
`;

// Plugin Development & Publishing
export const PUBLISH_PLUGIN = gql`
  mutation PublishPlugin($plugin: PluginPackageInput!) {
    publishPlugin(plugin: $plugin) {
      success
      pluginId
      publishedVersion
      registryUrl
      error
    }
  }
`;

export const VALIDATE_PLUGIN = gql`
  mutation ValidatePlugin($source: String!) {
    validatePlugin(source: $source) {
      valid
      errors
      warnings
      metadata {
        id
        name
        version
        description
        author
        category
      }
    }
  }
`;

// Plugin Registry & Marketplace
export const GET_PLUGIN_REGISTRY = gql`
  query GetPluginRegistry($category: String, $verified: Boolean) {
    pluginRegistry(category: $category, verified: $verified) {
      plugins {
        ...PluginInfo
        downloads
        rating
        verified
        publishedAt
        lastUpdated
      }
      categories
      totalCount
    }
  }
  ${PLUGIN_FRAGMENT}
`;

export const RATE_PLUGIN = gql`
  mutation RatePlugin($pluginId: ID!, $rating: Int!, $review: String) {
    ratePlugin(pluginId: $pluginId, rating: $rating, review: $review) {
      success
      averageRating
      totalRatings
      error
    }
  }
`;

// Plugin Subscriptions for Real-time Updates
export const PLUGIN_STATUS_SUBSCRIPTION = gql`
  subscription PluginStatusUpdated($pluginId: ID) {
    pluginStatusUpdated(pluginId: $pluginId) {
      pluginId
      status
      message
      timestamp
    }
  }
`;

export const EXPORT_PROGRESS_SUBSCRIPTION = gql`
  subscription ExportProgress($exportId: ID!) {
    exportProgress(exportId: $exportId) {
      exportId
      progress
      stage
      message
      completed
      error
    }
  }
`;

// Plugin Analytics & Monitoring
export const GET_PLUGIN_ANALYTICS = gql`
  query GetPluginAnalytics($pluginId: ID!, $timeframe: String) {
    pluginAnalytics(pluginId: $pluginId, timeframe: $timeframe) {
      usage {
        totalExports
        successRate
        averageProcessingTime
        popularFormats
      }
      performance {
        averageLatency
        errorRate
        uptime
      }
      trends {
        dailyUsage
        formatDistribution
        userGrowth
      }
    }
  }
`;

// TypeScript interfaces for the GraphQL types
export interface Plugin {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  category: 'storage' | 'blockchain' | 'dapp' | 'utility' | 'export' | 'cloud' | 'local';
  tags: string[];
  supportedFormats: string[];
  homepage?: string;
  license?: string;
  icon?: string;
  status: PluginStatus;
  capabilities: PluginCapabilities;
  configuration?: Record<string, any>;
  dependencies?: string[];
  metadata?: Record<string, any>;
}

export interface PluginStatus {
  installed: boolean;
  enabled: boolean;
  configured: boolean;
  lastUpdated?: string;
}

export interface PluginCapabilities {
  formats: string[];
  storage: string[];
  blockchain: string[];
  features: string[];
}

export interface PluginRecommendation {
  plugin: Plugin;
  score: number;
  reason: string;
}

export interface ExportResult {
  success: boolean;
  result?: {
    filePath?: string;
    url?: string;
    hash?: string;
    ipfsHash?: string;
    storyProtocolId?: string;
    format?: string;
    urls?: Record<string, string>;
    metadata?: Record<string, any>;
  };
  error?: string;
  warnings?: string[];
}

export interface PluginValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  metadata?: Partial<Plugin>;
}

export interface PluginAnalytics {
  usage: {
    totalExports: number;
    successRate: number;
    averageProcessingTime: number;
    popularFormats: string[];
  };
  performance: {
    averageLatency: number;
    errorRate: number;
    uptime: number;
  };
  trends: {
    dailyUsage: number[];
    formatDistribution: Record<string, number>;
    userGrowth: number[];
  };
}
