import graphene
from graphene import ObjectType, String, ID, List, Field, Boolean, Mutation

class PluginMetadata(ObjectType):
    id = ID(required=True)
    name = String(required=True)
    version = String(required=True)
    description = String()
    author = String()
    category = String(required=True)
    tags = List(String)
    supported_formats = List(String)

class PluginStatus(ObjectType):
    id = ID(required=True)
    installed = Boolean(required=True)
    enabled = Boolean(required=True)
    configured = Boolean(required=True)

class ExportPlugin(ObjectType):
    metadata = Field(PluginMetadata, required=True)
    status = Field(PluginStatus, required=True)

class PluginQuery(ObjectType):
    plugins = List(ExportPlugin)
    plugin = Field(ExportPlugin, id=String(required=True))
    plugin_recommendations = List(ExportPlugin, options=String())
    
    def resolve_plugins(self, info):
        # Interface with frontend plugin manager via API
        return []
    
    def resolve_plugin(self, info, id):
        # Get specific plugin info
        return None

class InstallPlugin(Mutation):
    class Arguments:
        source = String(required=True)
    
    plugin = Field(ExportPlugin)
    success = Boolean()
    error = String()
    
    def mutate(self, info, source):
        # Install plugin from source
        return InstallPlugin(success=True)

class PluginMutation(ObjectType):
    install_plugin = InstallPlugin.Field()
