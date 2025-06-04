import { gql } from '@apollo/client';

// Get all plugins
export const GET_PLUGINS = gql`
  query GetPlugins {
    plugins {
      id
      name
      version
      description
      author
      enabled
      installed
      category
      tags
    }
  }
`;

// Get plugin registry
export const GET_PLUGIN_REGISTRY = gql`
  query GetPluginRegistry {
    pluginRegistry {
      id
      name
      version
      description
      author
      category
      tags
      downloadUrl
      verified
      rating
      downloads
    }
  }
`;

// Install plugin mutation
export const INSTALL_PLUGIN = gql`
  mutation InstallPlugin($pluginId: String!) {
    installPlugin(pluginId: $pluginId) {
      success
      message
      plugin {
        id
        name
        version
        enabled
        installed
      }
    }
  }
`;

// Enable plugin mutation
export const ENABLE_PLUGIN = gql`
  mutation EnablePlugin($pluginId: String!) {
    enablePlugin(pluginId: $pluginId) {
      success
      message
    }
  }
`;

// Disable plugin mutation
export const DISABLE_PLUGIN = gql`
  mutation DisablePlugin($pluginId: String!) {
    disablePlugin(pluginId: $pluginId) {
      success
      message
    }
  }
`;

// Get plugin analytics
export const GET_PLUGIN_ANALYTICS = gql`
  query GetPluginAnalytics($pluginId: String!) {
    pluginAnalytics(pluginId: $pluginId) {
      usage
      performance
      errors
      lastUsed
    }
  }
`;

// Plugin types
export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  enabled: boolean;
  installed: boolean;
  category: string;
  tags: string[];
}

export interface PluginRegistryEntry {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: string;
  tags: string[];
  downloadUrl: string;
  verified: boolean;
  rating: number;
  downloads: number;
}

export interface PluginAnalytics {
  usage: number;
  performance: number;
  errors: number;
  lastUsed: string;
}