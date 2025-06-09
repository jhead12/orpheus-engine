"""
GraphQL Plugin System Schema for Orpheus Engine Backend
Integrates with existing backend ports and service manager
"""

import graphene
from graphene import ObjectType, String, ID, Float, Int, List as GrapheneList, Field, Boolean, Mutation, InputObjectType
import json
import os
import sys
import importlib
import subprocess
from datetime import datetime
from typing import Dict, Any, Optional, List
import requests
import threading
import time

# Plugin System Types
class PluginStatus(graphene.Enum):
    PENDING = "pending"
    INSTALLING = "installing"
    INSTALLED = "installed"
    ENABLED = "enabled"
    DISABLED = "disabled"
    ERROR = "error"
    UPDATING = "updating"

class PluginCategory(graphene.Enum):
    AUDIO_INPUT = "audio_input"
    AUDIO_PROCESSING = "audio_processing"
    EXPORT = "export"
    STORAGE = "storage"
    BLOCKCHAIN = "blockchain"
    ANALYSIS = "analysis"
    VISUALIZATION = "visualization"
    UTILITY = "utility"

class PluginCapability(ObjectType):
    name = String(required=True)
    version = String()
    description = String()
    parameters = String()  # JSON string of parameter schema

class PluginMetadata(ObjectType):
    author = String()
    homepage = String()
    license = String()
    repository = String()
    documentation = String()
    keywords = GrapheneList(String)
    created_at = String()
    updated_at = String()

class PluginConfiguration(ObjectType):
    key = String(required=True)
    value = String()
    type = String()  # 'string', 'number', 'boolean', 'object'
    required = Boolean()
    description = String()

class Plugin(ObjectType):
    id = ID(required=True)
    name = String(required=True)
    version = String(required=True)
    description = String()
    category = Field(PluginCategory, required=True)
    status = Field(PluginStatus, required=True)
    capabilities = GrapheneList(PluginCapability)
    configuration = GrapheneList(PluginConfiguration)
    metadata = Field(PluginMetadata)
    supported_formats = GrapheneList(String)
    backend_port = Int()  # Port where plugin backend service runs
    api_endpoint = String()  # Full API endpoint URL
    health_check_url = String()  # Health check endpoint
    last_health_check = String()
    dependencies = GrapheneList(String)
    tags = GrapheneList(String)

class PluginInstallResult(ObjectType):
    success = Boolean(required=True)
    plugin = Field(Plugin)
    error = String()
    warnings = GrapheneList(String)
    install_log = String()

class PluginHealthStatus(ObjectType):
    plugin_id = ID(required=True)
    healthy = Boolean(required=True)
    response_time = Float()
    last_check = String()
    error = String()

# Plugin Manager Class
class PluginManager:
    def __init__(self, backend_base_port=5000):
        self.backend_base_port = backend_base_port
        self.plugins: Dict[str, Dict] = {}
        self.next_port = backend_base_port + 100  # Start plugin ports at 5100
        self.plugin_processes: Dict[str, Any] = {}
        self.load_plugins()
    
    def get_data_dir(self):
        """Get the plugins data directory"""
        return os.path.join(os.path.dirname(__file__), '../../data/plugins')
    
    def ensure_data_dir(self):
        """Ensure the plugins data directory exists"""
        data_dir = self.get_data_dir()
        os.makedirs(data_dir, exist_ok=True)
        return data_dir
    
    def load_plugins(self):
        """Load plugins from the data directory"""
        try:
            data_dir = self.ensure_data_dir()
            plugins_file = os.path.join(data_dir, 'installed_plugins.json')
            
            if os.path.exists(plugins_file):
                with open(plugins_file, 'r') as f:
                    data = json.load(f)
                    self.plugins = data.get('plugins', {})
                    self.next_port = data.get('next_port', self.backend_base_port + 100)
        except Exception as e:
            print(f"Error loading plugins: {e}")
            self.plugins = {}
    
    def save_plugins(self):
        """Save plugins to the data directory"""
        try:
            data_dir = self.ensure_data_dir()
            plugins_file = os.path.join(data_dir, 'installed_plugins.json')
            
            data = {
                'plugins': self.plugins,
                'next_port': self.next_port,
                'updated_at': datetime.now().isoformat()
            }
            
            with open(plugins_file, 'w') as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            print(f"Error saving plugins: {e}")
    
    def allocate_port(self) -> int:
        """Allocate a new port for a plugin"""
        port = self.next_port
        self.next_port += 1
        return port
    
    def install_plugin(self, source: str, config: Optional[Dict] = None) -> Dict:
        """Install a plugin from source"""
        try:
            plugin_id = f"plugin_{len(self.plugins)}"
            port = self.allocate_port()
            
            # Create plugin entry
            plugin_data = {
                'id': plugin_id,
                'name': f'Plugin {plugin_id}',
                'version': '1.0.0',
                'description': f'Plugin installed from {source}',
                'category': 'utility',
                'status': 'installed',
                'capabilities': [],
                'configuration': [],
                'metadata': {
                    'author': 'External Developer',
                    'created_at': datetime.now().isoformat()
                },
                'supported_formats': [],
                'backend_port': port,
                'api_endpoint': f'http://localhost:{port}',
                'health_check_url': f'http://localhost:{port}/health',
                'dependencies': [],
                'tags': [],
                'source': source,
                'config': config or {}
            }
            
            self.plugins[plugin_id] = plugin_data
            self.save_plugins()
            
            return {
                'success': True,
                'plugin': plugin_data,
                'warnings': []
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'warnings': []
            }
    
    def get_plugin(self, plugin_id: str) -> Optional[Dict]:
        """Get a plugin by ID"""
        return self.plugins.get(plugin_id)
    
    def list_plugins(self, category: Optional[str] = None) -> List[Dict]:
        """List all plugins, optionally filtered by category"""
        plugins = list(self.plugins.values())
        if category:
            plugins = [p for p in plugins if p.get('category') == category]
        return plugins
    
    def enable_plugin(self, plugin_id: str) -> bool:
        """Enable a plugin"""
        if plugin_id in self.plugins:
            self.plugins[plugin_id]['status'] = 'enabled'
            self.save_plugins()
            return True
        return False
    
    def disable_plugin(self, plugin_id: str) -> bool:
        """Disable a plugin"""
        if plugin_id in self.plugins:
            self.plugins[plugin_id]['status'] = 'disabled'
            self.save_plugins()
            return True
        return False
    
    def check_plugin_health(self, plugin_id: str) -> Dict:
        """Check if a plugin's backend service is healthy"""
        plugin = self.get_plugin(plugin_id)
        if not plugin:
            return {'healthy': False, 'error': 'Plugin not found'}
        
        health_url = plugin.get('health_check_url')
        if not health_url:
            return {'healthy': False, 'error': 'No health check URL configured'}
        
        try:
            start_time = time.time()
            response = requests.get(health_url, timeout=5)
            response_time = (time.time() - start_time) * 1000  # ms
            
            healthy = response.status_code == 200
            return {
                'healthy': healthy,
                'response_time': response_time,
                'last_check': datetime.now().isoformat(),
                'error': None if healthy else f'HTTP {response.status_code}'
            }
        except Exception as e:
            return {
                'healthy': False,
                'response_time': None,
                'last_check': datetime.now().isoformat(),
                'error': str(e)
            }

# Global plugin manager instance
plugin_manager = PluginManager()

# Input Types
class PluginConfigInput(InputObjectType):
    key = String(required=True)
    value = String(required=True)
    type = String()

class InstallPluginInput(InputObjectType):
    source = String(required=True)
    name = String()
    category = String()
    config = GrapheneList(PluginConfigInput)

# Queries
class PluginQuery(ObjectType):
    plugins = GrapheneList(Plugin, category=String(), status=String())
    plugin = Field(Plugin, id=ID(required=True))
    plugin_health = Field(PluginHealthStatus, plugin_id=ID(required=True))
    available_ports = GrapheneList(Int)
    
    def resolve_plugins(self, info, category=None, status=None):
        """Get all plugins, optionally filtered"""
        plugins = plugin_manager.list_plugins(category)
        
        if status:
            plugins = [p for p in plugins if p.get('status') == status]
        
        return [self._convert_plugin_data(p) for p in plugins]
    
    def resolve_plugin(self, info, id):
        """Get a specific plugin by ID"""
        plugin_data = plugin_manager.get_plugin(id)
        if plugin_data:
            return self._convert_plugin_data(plugin_data)
        return None
    
    def resolve_plugin_health(self, info, plugin_id):
        """Check plugin health"""
        health_data = plugin_manager.check_plugin_health(plugin_id)
        return PluginHealthStatus(
            plugin_id=plugin_id,
            healthy=health_data.get('healthy', False),
            response_time=health_data.get('response_time'),
            last_check=health_data.get('last_check'),
            error=health_data.get('error')
        )
    
    def resolve_available_ports(self, info):
        """Get list of available ports for new plugins"""
        base_port = plugin_manager.next_port
        return list(range(base_port, base_port + 10))
    
    def _convert_plugin_data(self, plugin_data: Dict) -> Plugin:
        """Convert plugin data dict to GraphQL Plugin object"""
        return Plugin(
            id=plugin_data.get('id'),
            name=plugin_data.get('name'),
            version=plugin_data.get('version'),
            description=plugin_data.get('description'),
            category=plugin_data.get('category'),
            status=plugin_data.get('status'),
            capabilities=[
                PluginCapability(
                    name=cap.get('name', ''),
                    version=cap.get('version', ''),
                    description=cap.get('description', ''),
                    parameters=json.dumps(cap.get('parameters', {}))
                ) for cap in plugin_data.get('capabilities', [])
            ],
            configuration=[
                PluginConfiguration(
                    key=cfg.get('key', ''),
                    value=cfg.get('value', ''),
                    type=cfg.get('type', 'string'),
                    required=cfg.get('required', False),
                    description=cfg.get('description', '')
                ) for cfg in plugin_data.get('configuration', [])
            ],
            metadata=PluginMetadata(
                author=plugin_data.get('metadata', {}).get('author'),
                homepage=plugin_data.get('metadata', {}).get('homepage'),
                license=plugin_data.get('metadata', {}).get('license'),
                repository=plugin_data.get('metadata', {}).get('repository'),
                documentation=plugin_data.get('metadata', {}).get('documentation'),
                keywords=plugin_data.get('metadata', {}).get('keywords', []),
                created_at=plugin_data.get('metadata', {}).get('created_at'),
                updated_at=plugin_data.get('metadata', {}).get('updated_at')
            ),
            supported_formats=plugin_data.get('supported_formats', []),
            backend_port=plugin_data.get('backend_port'),
            api_endpoint=plugin_data.get('api_endpoint'),
            health_check_url=plugin_data.get('health_check_url'),
            last_health_check=plugin_data.get('last_health_check'),
            dependencies=plugin_data.get('dependencies', []),
            tags=plugin_data.get('tags', [])
        )

# Mutations
class InstallPlugin(Mutation):
    class Arguments:
        input = InstallPluginInput(required=True)
    
    Output = PluginInstallResult
    
    def mutate(self, info, input):
        result = plugin_manager.install_plugin(
            source=input.source,
            config={cfg.key: cfg.value for cfg in (input.config or [])}
        )
        
        plugin_data = result.get('plugin')
        plugin_obj = None
        
        if plugin_data:
            query = PluginQuery()
            plugin_obj = query._convert_plugin_data(plugin_data)
        
        return PluginInstallResult(
            success=result.get('success', False),
            plugin=plugin_obj,
            error=result.get('error'),
            warnings=result.get('warnings', []),
            install_log=result.get('install_log', '')
        )

class EnablePlugin(Mutation):
    class Arguments:
        plugin_id = ID(required=True)
    
    success = Boolean()
    plugin = Field(Plugin)
    error = String()
    
    def mutate(self, info, plugin_id):
        success = plugin_manager.enable_plugin(plugin_id)
        
        if success:
            plugin_data = plugin_manager.get_plugin(plugin_id)
            query = PluginQuery()
            plugin_obj = query._convert_plugin_data(plugin_data) if plugin_data else None
            
            return EnablePlugin(success=True, plugin=plugin_obj)
        else:
            return EnablePlugin(success=False, error="Plugin not found")

class DisablePlugin(Mutation):
    class Arguments:
        plugin_id = ID(required=True)
    
    success = Boolean()
    plugin = Field(Plugin)
    error = String()
    
    def mutate(self, info, plugin_id):
        success = plugin_manager.disable_plugin(plugin_id)
        
        if success:
            plugin_data = plugin_manager.get_plugin(plugin_id)
            query = PluginQuery()
            plugin_obj = query._convert_plugin_data(plugin_data) if plugin_data else None
            
            return DisablePlugin(success=True, plugin=plugin_obj)
        else:
            return DisablePlugin(success=False, error="Plugin not found")

class PluginMutation(ObjectType):
    install_plugin = InstallPlugin.Field()
    enable_plugin = EnablePlugin.Field()
    disable_plugin = DisablePlugin.Field()

# Create the plugin schema
plugin_schema = graphene.Schema(query=PluginQuery, mutation=PluginMutation)
