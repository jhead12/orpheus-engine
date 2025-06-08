"""
GraphQL Schema for Orpheus Engine Plugin System
Enables external developers to create, manage, and use plugins via GraphQL
"""

import graphene
from graphene import ObjectType, String, ID, List, Field, Boolean, Mutation, Int, Float, Enum
from graphene.types.generic import GenericScalar
from datetime import datetime
import json
import os
import importlib.util
import requests
import subprocess
import tempfile
import shutil
from typing import Dict, Any, Optional, List as ListType
import sys

# Plugin Category Enum
class PluginCategory(graphene.Enum):
    STORAGE = "storage"
    BLOCKCHAIN = "blockchain"
    DAPP = "dapp"
    UTILITY = "utility"
    EXPORT = "export"
    CLOUD = "cloud"
    LOCAL = "local"

# Plugin Status Enum
class PluginStatusEnum(graphene.Enum):
    INSTALLED = "installed"
    ENABLED = "enabled"
    DISABLED = "disabled"
    ERROR = "error"
    UPDATING = "updating"

# Plugin Capabilities
class PluginCapabilities(ObjectType):
    formats = List(String)
    storage = List(String)
    blockchain = List(String)
    features = List(String)

# Plugin Status
class PluginStatus(ObjectType):
    installed = Boolean(required=True)
    enabled = Boolean(required=True)
    configured = Boolean(required=True)
    last_updated = String()
    error_message = String()

# Plugin Metadata
class PluginMetadata(ObjectType):
    id = ID(required=True)
    name = String(required=True)
    version = String(required=True)
    description = String()
    author = String()
    category = Field(PluginCategory, required=True)
    tags = List(String)
    supported_formats = List(String)
    homepage = String()
    license = String()
    icon = String()
    dependencies = List(String)
    
class Plugin(ObjectType):
    id = ID(required=True)
    name = String(required=True)
    version = String(required=True)
    description = String()
    author = String()
    category = Field(PluginCategory, required=True)
    tags = List(String)
    supported_formats = List(String)
    homepage = String()
    license = String()
    icon = String()
    status = Field(PluginStatus, required=True)
    capabilities = Field(PluginCapabilities)
    configuration = GenericScalar()
    dependencies = List(String)
    metadata = GenericScalar()
    documentation = String()
    examples = String()
    changelog = String()
    # Marketplace fields
    downloads = Int()
    rating = Float()
    verified = Boolean()
    published_at = String()
    last_updated = String()

# Plugin Recommendation
class PluginRecommendation(ObjectType):
    plugin = Field(Plugin, required=True)
    score = Float(required=True)
    reason = String(required=True)

# Export Result
class ExportResult(ObjectType):
    success = Boolean(required=True)
    file_path = String()
    url = String()
    hash = String()
    ipfs_hash = String()
    story_protocol_id = String()
    format = String()
    urls = GenericScalar()
    metadata = GenericScalar()
    error = String()
    warnings = List(String)

# Plugin Validation Result
class PluginValidationResult(ObjectType):
    valid = Boolean(required=True)
    errors = List(String)
    warnings = List(String)
    metadata = Field(PluginMetadata)

# Plugin Registry
class PluginRegistry(ObjectType):
    plugins = List(Plugin)
    categories = List(String)
    total_count = Int()

# Plugin Analytics
class PluginUsage(ObjectType):
    total_exports = Int()
    success_rate = Float()
    average_processing_time = Float()
    popular_formats = List(String)

class PluginPerformance(ObjectType):
    average_latency = Float()
    error_rate = Float()
    uptime = Float()

class PluginTrends(ObjectType):
    daily_usage = List(Int)
    format_distribution = GenericScalar()
    user_growth = List(Int)

class PluginAnalytics(ObjectType):
    usage = Field(PluginUsage)
    performance = Field(PluginPerformance)
    trends = Field(PluginTrends)

# Input Types
class PluginConfigInput(graphene.InputObjectType):
    settings = GenericScalar()

class ExportOptionsInput(graphene.InputObjectType):
    audio_format = String()
    export_format = String()
    sample_rate = Int()
    bit_depth = Int()
    bit_rate = Int()
    quality = String()
    normalize = Boolean()
    storage = GenericScalar()
    blockchain = GenericScalar()
    metadata = GenericScalar()

class ClipInput(graphene.InputObjectType):
    id = ID(required=True)
    track_id = ID()
    start_time = Float()
    end_time = Float()
    data = GenericScalar()

class PluginPackageInput(graphene.InputObjectType):
    name = String(required=True)
    version = String(required=True)
    description = String()
    author = String()
    category = String(required=True)
    tags = List(String)
    supported_formats = List(String)
    homepage = String()
    license = String()
    source_code = String()
    documentation = String()
    examples = String()

# Plugin Manager Service
class PluginManager:
    def __init__(self):
        self.plugins: Dict[str, Dict] = {}
        self.plugin_registry: Dict[str, Dict] = {}
        self.load_installed_plugins()
    
    def load_installed_plugins(self):
        """Load plugins from the frontend plugin manager"""
        # This would interface with the frontend plugin system
        # For now, return mock data
        self.plugins = {
            "local-file-export": {
                "id": "local-file-export",
                "name": "Local File Export",
                "version": "1.0.0",
                "description": "Export audio files to local file system",
                "author": "Orpheus Engine",
                "category": "local",
                "tags": ["local", "file", "export"],
                "supported_formats": ["wav", "mp3", "ogg", "flac"],
                "status": {
                    "installed": True,
                    "enabled": True,
                    "configured": True,
                },
                "capabilities": {
                    "formats": ["wav", "mp3", "ogg", "flac"],
                    "storage": ["local"],
                    "blockchain": [],
                    "features": ["export", "local-storage"]
                }
            },
            "ipfs-export": {
                "id": "ipfs-export",
                "name": "IPFS Export",
                "version": "1.0.0",
                "description": "Export and store audio files on IPFS",
                "author": "Orpheus Engine",
                "category": "storage",
                "tags": ["ipfs", "decentralized", "storage"],
                "supported_formats": ["wav", "mp3", "ogg", "flac"],
                "status": {
                    "installed": True,
                    "enabled": True,
                    "configured": True,
                },
                "capabilities": {
                    "formats": ["wav", "mp3", "ogg", "flac"],
                    "storage": ["ipfs"],
                    "blockchain": ["ipfs"],
                    "features": ["export", "decentralized-storage"]
                }
            }
        }
    
    def get_plugins(self, category: Optional[str] = None, format: Optional[str] = None) -> List[Dict]:
        """Get all plugins with optional filtering"""
        plugins = list(self.plugins.values())
        
        if category:
            plugins = [p for p in plugins if p.get("category") == category]
        
        if format:
            plugins = [p for p in plugins if format in p.get("supported_formats", [])]
        
        return plugins
    
    def get_plugin(self, plugin_id: str) -> Optional[Dict]:
        """Get a specific plugin by ID"""
        return self.plugins.get(plugin_id)
    
    def install_plugin(self, source: str, config: Optional[Dict] = None) -> Dict:
        """Install a plugin from source"""
        try:
            # Parse source (npm:package, github:repo, url, etc.)
            plugin_data = self._download_and_validate_plugin(source)
            
            if plugin_data:
                plugin_id = plugin_data["id"]
                self.plugins[plugin_id] = plugin_data
                return {
                    "success": True,
                    "plugin": plugin_data,
                    "error": None,
                    "warnings": []
                }
            else:
                return {
                    "success": False,
                    "plugin": None,
                    "error": "Failed to download or validate plugin",
                    "warnings": []
                }
        except Exception as e:
            return {
                "success": False,
                "plugin": None,
                "error": str(e),
                "warnings": []
            }
    
    def _download_and_validate_plugin(self, source: str) -> Optional[Dict]:
        """Download and validate a plugin from source"""
        # Mock implementation for now
        # Real implementation would:
        # 1. Parse source URL/identifier
        # 2. Download plugin code
        # 3. Validate plugin structure
        # 4. Install dependencies
        # 5. Register plugin
        
        return {
            "id": f"external-plugin-{len(self.plugins)}",
            "name": "External Plugin",
            "version": "1.0.0",
            "description": "Plugin installed from external source",
            "author": "External Developer",
            "category": "utility",
            "tags": ["external"],
            "supported_formats": ["wav"],
            "status": {
                "installed": True,
                "enabled": True,
                "configured": False,
            },
            "capabilities": {
                "formats": ["wav"],
                "storage": [],
                "blockchain": [],
                "features": ["export"]
            }
        }
    
    def validate_plugin(self, source: str) -> Dict:
        """Validate a plugin without installing it"""
        try:
            # Download and validate plugin
            plugin_data = self._download_and_validate_plugin(source)
            
            if plugin_data:
                return {
                    "valid": True,
                    "errors": [],
                    "warnings": [],
                    "metadata": plugin_data
                }
            else:
                return {
                    "valid": False,
                    "errors": ["Invalid plugin package"],
                    "warnings": [],
                    "metadata": None
                }
        except Exception as e:
            return {
                "valid": False,
                "errors": [str(e)],
                "warnings": [],
                "metadata": None
            }

# Global plugin manager instance
plugin_manager = PluginManager()

# GraphQL Queries
class PluginQuery(ObjectType):
    plugins = List(Plugin, category=String(), format=String())
    plugin = Field(Plugin, id=ID(required=True))
    search_plugins = Field('PluginSearchResult', query=String(required=True), limit=Int(), offset=Int())
    plugin_recommendations = List(PluginRecommendation, options=ExportOptionsInput(required=True))
    plugin_registry = Field(PluginRegistry, category=String(), verified=Boolean())
    plugin_analytics = Field(PluginAnalytics, plugin_id=ID(required=True), timeframe=String())
    
    def resolve_plugins(self, info, category=None, format=None):
        plugins_data = plugin_manager.get_plugins(category, format)
        return [Plugin(**plugin) for plugin in plugins_data]
    
    def resolve_plugin(self, info, id):
        plugin_data = plugin_manager.get_plugin(id)
        if plugin_data:
            return Plugin(**plugin_data)
        return None
    
    def resolve_search_plugins(self, info, query, limit=10, offset=0):
        # Mock search implementation
        all_plugins = plugin_manager.get_plugins()
        filtered_plugins = [p for p in all_plugins if query.lower() in p.get("name", "").lower()]
        
        total = len(filtered_plugins)
        plugins = filtered_plugins[offset:offset+limit]
        has_more = offset + limit < total
        
        return {
            "plugins": [Plugin(**p) for p in plugins],
            "total": total,
            "hasMore": has_more
        }
    
    def resolve_plugin_recommendations(self, info, options):
        # Mock recommendation logic
        all_plugins = plugin_manager.get_plugins()
        recommendations = []
        
        for plugin in all_plugins:
            score = 50  # Base score
            reason = "General compatibility"
            
            # Score based on format support
            if options.get("audio_format") in plugin.get("supported_formats", []):
                score += 25
                reason = f"Supports {options.get('audio_format')} format"
            
            # Score based on category
            if options.get("blockchain") and plugin.get("category") == "blockchain":
                score += 30
                reason = "Blockchain export support"
            
            recommendations.append({
                "plugin": Plugin(**plugin),
                "score": score,
                "reason": reason
            })
        
        # Sort by score and return top recommendations
        recommendations.sort(key=lambda x: x["score"], reverse=True)
        return recommendations[:5]

# Search Result Type
class PluginSearchResult(ObjectType):
    plugins = List(Plugin)
    total = Int()
    has_more = Boolean()

# GraphQL Mutations
class InstallPlugin(Mutation):
    class Arguments:
        source = String(required=True)
        config = PluginConfigInput()
    
    success = Boolean()
    plugin = Field(Plugin)
    error = String()
    warnings = List(String)
    
    def mutate(self, info, source, config=None):
        result = plugin_manager.install_plugin(source, config)
        
        return InstallPlugin(
            success=result["success"],
            plugin=Plugin(**result["plugin"]) if result["plugin"] else None,
            error=result.get("error"),
            warnings=result.get("warnings", [])
        )

class ValidatePlugin(Mutation):
    class Arguments:
        source = String(required=True)
    
    valid = Boolean()
    errors = List(String)
    warnings = List(String)
    metadata = Field(PluginMetadata)
    
    def mutate(self, info, source):
        result = plugin_manager.validate_plugin(source)
        
        return ValidatePlugin(
            valid=result["valid"],
            errors=result.get("errors", []),
            warnings=result.get("warnings", []),
            metadata=PluginMetadata(**result["metadata"]) if result.get("metadata") else None
        )

class ExportWithPlugin(Mutation):
    class Arguments:
        plugin_id = ID(required=True)
        clips = List(ClipInput, required=True)
        options = ExportOptionsInput(required=True)
    
    success = Boolean()
    result = Field('ExportResultType')
    error = String()
    warnings = List(String)
    
    def mutate(self, info, plugin_id, clips, options):
        # Mock export implementation
        plugin = plugin_manager.get_plugin(plugin_id)
        
        if not plugin:
            return ExportWithPlugin(
                success=False,
                error=f"Plugin {plugin_id} not found",
                warnings=[]
            )
        
        # Simulate successful export
        return ExportWithPlugin(
            success=True,
            result={
                "file_path": f"/exports/clip_{clips[0]['id']}.{options.get('audio_format', 'wav')}",
                "format": options.get('audio_format', 'wav'),
                "metadata": {
                    "plugin_used": plugin_id,
                    "exported_at": datetime.now().isoformat()
                }
            },
            error=None,
            warnings=[]
        )

class ExportResultType(ObjectType):
    file_path = String()
    url = String()
    hash = String()
    ipfs_hash = String()
    story_protocol_id = String()
    format = String()
    urls = GenericScalar()
    metadata = GenericScalar()

class PluginMutation(ObjectType):
    install_plugin = InstallPlugin.Field()
    validate_plugin = ValidatePlugin.Field()
    export_with_plugin = ExportWithPlugin.Field()

# Legacy exports for backward compatibility
class ExportPlugin(ObjectType):
    metadata = Field(PluginMetadata, required=True)
    status = Field(PluginStatus, required=True)

# Combined Query and Mutation classes for the schema
class Query(PluginQuery):
    pass

class Mutation(PluginMutation):
    pass

# Create the GraphQL schema
plugin_schema = graphene.Schema(query=Query, mutation=Mutation)
