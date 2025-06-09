"""
Project management API endpoints for saving, loading, and managing DAW projects.
"""

import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile
from fastapi.responses import FileResponse

from ..models import Project, ProjectMetadata, Track
from ..config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/projects", tags=["projects"])


def get_audio_engine(request: Request):
    """Dependency to get audio engine from app state."""
    return request.app.state.audio_engine


def get_websocket_manager(request: Request):
    """Dependency to get WebSocket manager from app state."""
    return request.app.state.websocket_manager


def get_system_integration(request: Request):
    """Dependency to get system integration from app state."""
    return request.app.state.system_integration


@router.get("/", response_model=List[ProjectMetadata])
async def list_projects():
    """List all available projects."""
    try:
        projects_dir = Path(settings.projects_directory)
        projects_dir.mkdir(exist_ok=True)

        projects = []
        for project_file in projects_dir.glob("*.oew"):
            try:
                with open(project_file, 'r') as f:
                    project_data = json.load(f)

                metadata = ProjectMetadata(
                    id=project_data.get("id", project_file.stem),
                    name=project_data.get("name", project_file.stem),
                    created_at=datetime.fromisoformat(project_data.get("created_at", datetime.now().isoformat())),
                    modified_at=datetime.fromisoformat(project_data.get("modified_at", datetime.now().isoformat())),
                    description=project_data.get("description", ""),
                    file_path=str(project_file),
                    file_size=project_file.stat().st_size,
                    track_count=len(project_data.get("tracks", [])),
                    duration=project_data.get("duration", 0.0),
                    sample_rate=project_data.get("sample_rate", 44100),
                    tempo=project_data.get("tempo", 120.0)
                )
                projects.append(metadata)
            except Exception as e:
                logger.warning(f"Error reading project file {project_file}: {e}")
                continue

        # Sort by modified date, newest first
        projects.sort(key=lambda p: p.modified_at, reverse=True)

        return projects
    except Exception as e:
        logger.error(f"Error listing projects: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{project_id}", response_model=Project)
async def get_project(
    project_id: str,
    audio_engine=Depends(get_audio_engine)
):
    """Get a specific project by ID."""
    try:
        projects_dir = Path(settings.projects_directory)
        project_file = projects_dir / f"{project_id}.oew"

        if not project_file.exists():
            raise HTTPException(status_code=404, detail="Project not found")

        with open(project_file, 'r') as f:
            project_data = json.load(f)

        project = Project(**project_data)
        return project
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Project not found")
    except Exception as e:
        logger.error(f"Error getting project {project_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=Project)
async def create_project(
    project: Project,
    audio_engine=Depends(get_audio_engine),
    websocket_manager=Depends(get_websocket_manager)
):
    """Create a new project."""
    try:
        projects_dir = Path(settings.projects_directory)
        projects_dir.mkdir(exist_ok=True)

        # Set creation and modification timestamps
        now = datetime.now()
        project.created_at = now
        project.modified_at = now

        # Save project file
        project_file = projects_dir / f"{project.id}.oew"
        with open(project_file, 'w') as f:
            json.dump(project.dict(), f, indent=2, default=str)

        # Load project in audio engine
        await audio_engine.load_project(project)

        # Broadcast project creation
        await websocket_manager.broadcast_project_update("created", project)

        logger.info(f"Created new project: {project.name} ({project.id})")
        return project
    except Exception as e:
        logger.error(f"Error creating project: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{project_id}", response_model=Project)
async def update_project(
    project_id: str,
    project_update: Project,
    audio_engine=Depends(get_audio_engine),
    websocket_manager=Depends(get_websocket_manager)
):
    """Update an existing project."""
    try:
        projects_dir = Path(settings.projects_directory)
        project_file = projects_dir / f"{project_id}.oew"

        if not project_file.exists():
            raise HTTPException(status_code=404, detail="Project not found")

        # Update modification timestamp
        project_update.modified_at = datetime.now()
        project_update.id = project_id  # Ensure ID consistency

        # Save updated project
        with open(project_file, 'w') as f:
            json.dump(project_update.dict(), f, indent=2, default=str)

        # Update audio engine
        await audio_engine.load_project(project_update)

        # Broadcast project update
        await websocket_manager.broadcast_project_update("updated", project_update)

        logger.info(f"Updated project: {project_update.name} ({project_id})")
        return project_update
    except Exception as e:
        logger.error(f"Error updating project {project_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{project_id}")
async def delete_project(
    project_id: str,
    websocket_manager=Depends(get_websocket_manager)
):
    """Delete a project."""
    try:
        projects_dir = Path(settings.projects_directory)
        project_file = projects_dir / f"{project_id}.oew"

        if not project_file.exists():
            raise HTTPException(status_code=404, detail="Project not found")

        # Remove project file
        project_file.unlink()

        # Broadcast project deletion
        await websocket_manager.broadcast_project_update("deleted", {"id": project_id})

        logger.info(f"Deleted project: {project_id}")
        return {"status": "success", "message": f"Project {project_id} deleted"}
    except Exception as e:
        logger.error(f"Error deleting project {project_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{project_id}/load")
async def load_project(
    project_id: str,
    audio_engine=Depends(get_audio_engine),
    websocket_manager=Depends(get_websocket_manager)
):
    """Load a project into the audio engine."""
    try:
        projects_dir = Path(settings.projects_directory)
        project_file = projects_dir / f"{project_id}.oew"

        if not project_file.exists():
            raise HTTPException(status_code=404, detail="Project not found")

        with open(project_file, 'r') as f:
            project_data = json.load(f)

        project = Project(**project_data)

        # Load into audio engine
        await audio_engine.load_project(project)

        # Broadcast project load
        await websocket_manager.broadcast_project_update("loaded", project)

        logger.info(f"Loaded project: {project.name} ({project_id})")
        return {"status": "success", "message": f"Project {project.name} loaded", "project": project}
    except Exception as e:
        logger.error(f"Error loading project {project_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{project_id}/save")
async def save_project(
    project_id: str,
    audio_engine=Depends(get_audio_engine),
    websocket_manager=Depends(get_websocket_manager)
):
    """Save the current project state."""
    try:
        # Get current project state from audio engine
        current_project = await audio_engine.get_current_project()

        if not current_project or current_project.id != project_id:
            raise HTTPException(status_code=400, detail="Project not currently loaded")

        # Update modification timestamp
        current_project.modified_at = datetime.now()

        # Save to file
        projects_dir = Path(settings.projects_directory)
        projects_dir.mkdir(exist_ok=True)
        project_file = projects_dir / f"{project_id}.oew"

        with open(project_file, 'w') as f:
            json.dump(current_project.dict(), f, indent=2, default=str)

        # Broadcast project save
        await websocket_manager.broadcast_project_update("saved", current_project)

        logger.info(f"Saved project: {current_project.name} ({project_id})")
        return {"status": "success", "message": f"Project {current_project.name} saved"}
    except Exception as e:
        logger.error(f"Error saving project {project_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{project_id}/export")
async def export_project(
    project_id: str,
    format: str = "wav",
    quality: str = "high",
    audio_engine=Depends(get_audio_engine)
):
    """Export project as audio file."""
    try:
        projects_dir = Path(settings.projects_directory)
        project_file = projects_dir / f"{project_id}.oew"

        if not project_file.exists():
            raise HTTPException(status_code=404, detail="Project not found")

        # Export audio
        export_path = await audio_engine.export_project(project_id, format, quality)

        if not export_path or not Path(export_path).exists():
            raise HTTPException(status_code=500, detail="Export failed")

        # Return file for download
        return FileResponse(
            path=export_path,
            filename=f"{project_id}.{format}",
            media_type=f"audio/{format}"
        )
    except Exception as e:
        logger.error(f"Error exporting project {project_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/import")
async def import_project(
    file: UploadFile = File(...),
    audio_engine=Depends(get_audio_engine),
    websocket_manager=Depends(get_websocket_manager)
):
    """Import a project file."""
    try:
        if not file.filename.lower().endswith('.oew'):
            raise HTTPException(
                status_code=400,
                detail="Invalid file format. Expected .oew project file"
            )

        # Read and parse project file
        content = await file.read()
        project_data = json.loads(content.decode('utf-8'))
        project = Project(**project_data)

        # Ensure unique ID
        projects_dir = Path(settings.projects_directory)
        projects_dir.mkdir(exist_ok=True)

        original_id = project.id
        counter = 1
        while (projects_dir / f"{project.id}.oew").exists():
            project.id = f"{original_id}_imported_{counter}"
            counter += 1

        # Update timestamps
        now = datetime.now()
        project.modified_at = now

        # Save imported project
        project_file = projects_dir / f"{project.id}.oew"
        with open(project_file, 'w') as f:
            json.dump(project.dict(), f, indent=2, default=str)

        # Broadcast project import
        await websocket_manager.broadcast_project_update("imported", project)

        logger.info(f"Imported project: {project.name} ({project.id})")
        return {"status": "success", "message": f"Project imported as {project.id}", "project": project}
    except Exception as e:
        logger.error(f"Error importing project: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{project_id}/templates")
async def get_project_templates():
    """Get available project templates."""
    try:
        templates_dir = Path(settings.projects_directory) / "templates"
        templates_dir.mkdir(exist_ok=True)

        templates = []
        for template_file in templates_dir.glob("*.oew"):
            try:
                with open(template_file, 'r') as f:
                    template_data = json.load(f)

                template = ProjectMetadata(
                    id=template_data.get("id", template_file.stem),
                    name=template_data.get("name", template_file.stem),
                    created_at=datetime.fromisoformat(template_data.get("created_at", datetime.now().isoformat())),
                    modified_at=datetime.fromisoformat(template_data.get("modified_at", datetime.now().isoformat())),
                    description=template_data.get("description", ""),
                    file_path=str(template_file),
                    file_size=template_file.stat().st_size,
                    track_count=len(template_data.get("tracks", [])),
                    duration=template_data.get("duration", 0.0),
                    sample_rate=template_data.get("sample_rate", 44100),
                    tempo=template_data.get("tempo", 120.0)
                )
                templates.append(template)
            except Exception as e:
                logger.warning(f"Error reading template file {template_file}: {e}")
                continue

        return templates
    except Exception as e:
        logger.error(f"Error getting project templates: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/from-template/{template_id}")
async def create_project_from_template(
    template_id: str,
    project_name: str,
    audio_engine=Depends(get_audio_engine),
    websocket_manager=Depends(get_websocket_manager)
):
    """Create a new project from a template."""
    try:
        templates_dir = Path(settings.projects_directory) / "templates"
        template_file = templates_dir / f"{template_id}.oew"

        if not template_file.exists():
            raise HTTPException(status_code=404, detail="Template not found")

        # Load template
        with open(template_file, 'r') as f:
            template_data = json.load(f)

        # Create new project from template
        project = Project(**template_data)
        project.id = f"project_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        project.name = project_name
        project.created_at = datetime.now()
        project.modified_at = datetime.now()

        # Save new project
        projects_dir = Path(settings.projects_directory)
        project_file = projects_dir / f"{project.id}.oew"

        with open(project_file, 'w') as f:
            json.dump(project.dict(), f, indent=2, default=str)

        # Load project in audio engine
        await audio_engine.load_project(project)

        # Broadcast project creation
        await websocket_manager.broadcast_project_update("created", project)

        logger.info(f"Created project from template: {project.name} ({project.id})")
        return {"status": "success", "message": f"Project created from template", "project": project}
    except Exception as e:
        logger.error(f"Error creating project from template {template_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
