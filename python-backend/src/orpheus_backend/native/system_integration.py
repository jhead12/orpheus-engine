"""
Native system integration for file dialogs, notifications, and OS-level operations.
"""

import asyncio
import json
import logging
import os
import platform
import subprocess
import webbrowser
from pathlib import Path
from typing import Dict, List, Optional, Any

try:
    import tkinter as tk
    from tkinter import filedialog, messagebox
    HAS_TKINTER = True
except ImportError:
    HAS_TKINTER = False
    logging.warning("tkinter not available, some native features will be limited")

from ..config import settings

logger = logging.getLogger(__name__)


class SystemIntegration:
    """Handles native system integration and OS-level operations."""

    def __init__(self):
        self.platform = platform.system().lower()
        self.preferences_file = Path.home() / ".orpheus" / "preferences.json"
        self.recent_files_file = Path.home() / ".orpheus" / "recent_files.json"
        self.max_recent_files = 10

        # Ensure config directory exists
        self.preferences_file.parent.mkdir(exist_ok=True)

        # Initialize default preferences
        self.default_preferences = {
            "audio": {
                "sample_rate": 44100,
                "buffer_size": 512,
                "input_device": "default",
                "output_device": "default",
                "input_gain": 1.0,
                "output_gain": 1.0
            },
            "ui": {
                "theme": "dark",
                "zoom_level": 1.0,
                "show_waveforms": True,
                "show_grid": True,
                "snap_to_grid": True,
                "auto_save": True,
                "auto_save_interval": 300
            },
            "paths": {
                "projects_directory": str(Path.home() / "Orpheus Projects"),
                "audio_samples_directory": str(Path.home() / "Orpheus Samples"),
                "exports_directory": str(Path.home() / "Orpheus Exports"),
                "plugins_directory": str(Path.home() / "Orpheus Plugins")
            },
            "performance": {
                "enable_gpu_acceleration": True,
                "max_cpu_cores": -1,  # -1 means use all cores
                "audio_priority": "high",
                "lookahead_processing": True
            }
        }

    async def show_open_file_dialog(
        self,
        title: str = "Open File",
        file_types: Optional[List[Dict[str, str]]] = None,
        multiple: bool = False,
        initial_dir: Optional[str] = None
    ) -> List[str]:
        """Show native file open dialog."""
        if not HAS_TKINTER:
            logger.warning("tkinter not available, cannot show file dialog")
            return []

        try:
            # Run in a separate thread to avoid blocking
            loop = asyncio.get_event_loop()
            return await loop.run_in_executor(None, self._show_open_file_dialog_sync, title, file_types, multiple, initial_dir)
        except Exception as e:
            logger.error(f"Error showing open file dialog: {e}")
            return []

    def _show_open_file_dialog_sync(
        self,
        title: str,
        file_types: Optional[List[Dict[str, str]]],
        multiple: bool,
        initial_dir: Optional[str]
    ) -> List[str]:
        """Synchronous implementation of file open dialog."""
        try:
            root = tk.Tk()
            root.withdraw()  # Hide the main window

            # Convert file types to tkinter format
            tk_filetypes = []
            if file_types:
                for ft in file_types:
                    name = ft.get("name", "Files")
                    extensions = ft.get("extensions", ["*.*"])
                    # Convert extensions list to tuple for tkinter
                    tk_filetypes.append((name, " ".join(extensions)))
            else:
                tk_filetypes = [("All files", "*.*")]

            if multiple:
                file_paths = filedialog.askopenfilenames(
                    title=title,
                    filetypes=tk_filetypes,
                    initialdir=initial_dir
                )
                return list(file_paths) if file_paths else []
            else:
                file_path = filedialog.askopenfilename(
                    title=title,
                    filetypes=tk_filetypes,
                    initialdir=initial_dir
                )
                return [file_path] if file_path else []

        except Exception as e:
            logger.error(f"Error in sync file dialog: {e}")
            return []
        finally:
            try:
                root.destroy()
            except:
                pass

    async def show_save_file_dialog(
        self,
        title: str = "Save File",
        default_name: str = "untitled",
        file_types: Optional[List[Dict[str, str]]] = None,
        initial_dir: Optional[str] = None
    ) -> Optional[str]:
        """Show native file save dialog."""
        if not HAS_TKINTER:
            logger.warning("tkinter not available, cannot show save dialog")
            return None

        try:
            loop = asyncio.get_event_loop()
            return await loop.run_in_executor(None, self._show_save_file_dialog_sync, title, default_name, file_types, initial_dir)
        except Exception as e:
            logger.error(f"Error showing save file dialog: {e}")
            return None

    def _show_save_file_dialog_sync(
        self,
        title: str,
        default_name: str,
        file_types: Optional[List[Dict[str, str]]],
        initial_dir: Optional[str]
    ) -> Optional[str]:
        """Synchronous implementation of file save dialog."""
        try:
            root = tk.Tk()
            root.withdraw()

            # Convert file types to tkinter format
            tk_filetypes = []
            if file_types:
                for ft in file_types:
                    name = ft.get("name", "Files")
                    extensions = ft.get("extensions", ["*.*"])
                    tk_filetypes.append((name, " ".join(extensions)))
            else:
                tk_filetypes = [("All files", "*.*")]

            file_path = filedialog.asksaveasfilename(
                title=title,
                initialfile=default_name,
                filetypes=tk_filetypes,
                initialdir=initial_dir
            )

            return file_path if file_path else None

        except Exception as e:
            logger.error(f"Error in sync save dialog: {e}")
            return None
        finally:
            try:
                root.destroy()
            except:
                pass

    async def show_folder_dialog(
        self,
        title: str = "Select Folder",
        initial_dir: Optional[str] = None
    ) -> Optional[str]:
        """Show native folder selection dialog."""
        if not HAS_TKINTER:
            logger.warning("tkinter not available, cannot show folder dialog")
            return None

        try:
            loop = asyncio.get_event_loop()
            return await loop.run_in_executor(None, self._show_folder_dialog_sync, title, initial_dir)
        except Exception as e:
            logger.error(f"Error showing folder dialog: {e}")
            return None

    def _show_folder_dialog_sync(self, title: str, initial_dir: Optional[str]) -> Optional[str]:
        """Synchronous implementation of folder dialog."""
        try:
            root = tk.Tk()
            root.withdraw()

            folder_path = filedialog.askdirectory(
                title=title,
                initialdir=initial_dir
            )

            return folder_path if folder_path else None

        except Exception as e:
            logger.error(f"Error in sync folder dialog: {e}")
            return None
        finally:
            try:
                root.destroy()
            except:
                pass

    async def show_notification(
        self,
        title: str,
        message: str,
        notification_type: str = "info",
        duration: int = 5000
    ) -> None:
        """Show a system notification."""
        try:
            if self.platform == "windows":
                await self._show_windows_notification(title, message, notification_type)
            elif self.platform == "darwin":  # macOS
                await self._show_macos_notification(title, message, notification_type)
            elif self.platform == "linux":
                await self._show_linux_notification(title, message, notification_type)
            else:
                logger.warning(f"Notifications not supported on platform: {self.platform}")

        except Exception as e:
            logger.error(f"Error showing notification: {e}")

    async def _show_windows_notification(self, title: str, message: str, notification_type: str) -> None:
        """Show notification on Windows."""
        try:
            # Use Windows 10+ toast notifications
            import win10toast
            toaster = win10toast.ToastNotifier()
            toaster.show_toast(title, message, duration=5)
        except ImportError:
            # Fallback to tkinter messagebox
            if HAS_TKINTER:
                loop = asyncio.get_event_loop()
                await loop.run_in_executor(None, self._show_tkinter_notification, title, message, notification_type)

    async def _show_macos_notification(self, title: str, message: str, notification_type: str) -> None:
        """Show notification on macOS."""
        try:
            script = f'''
            display notification "{message}" with title "{title}"
            '''
            subprocess.run(["osascript", "-e", script], check=True)
        except Exception as e:
            logger.error(f"Error showing macOS notification: {e}")

    async def _show_linux_notification(self, title: str, message: str, notification_type: str) -> None:
        """Show notification on Linux."""
        try:
            # Use notify-send if available
            subprocess.run(["notify-send", title, message], check=True)
        except (subprocess.CalledProcessError, FileNotFoundError):
            # Fallback to tkinter messagebox
            if HAS_TKINTER:
                loop = asyncio.get_event_loop()
                await loop.run_in_executor(None, self._show_tkinter_notification, title, message, notification_type)

    def _show_tkinter_notification(self, title: str, message: str, notification_type: str) -> None:
        """Show notification using tkinter messagebox."""
        try:
            root = tk.Tk()
            root.withdraw()

            if notification_type == "error":
                messagebox.showerror(title, message)
            elif notification_type == "warning":
                messagebox.showwarning(title, message)
            else:
                messagebox.showinfo(title, message)

        except Exception as e:
            logger.error(f"Error showing tkinter notification: {e}")
        finally:
            try:
                root.destroy()
            except:
                pass

    async def open_folder_in_shell(self, folder_path: str) -> None:
        """Open a folder in the system file manager."""
        try:
            if self.platform == "windows":
                subprocess.run(["explorer", folder_path], check=True)
            elif self.platform == "darwin":
                subprocess.run(["open", folder_path], check=True)
            elif self.platform == "linux":
                subprocess.run(["xdg-open", folder_path], check=True)
            else:
                logger.warning(f"Opening folders not supported on platform: {self.platform}")

        except Exception as e:
            logger.error(f"Error opening folder in shell: {e}")

    async def open_file_in_shell(self, file_path: str) -> None:
        """Open a file with the system default application."""
        try:
            if self.platform == "windows":
                os.startfile(file_path)
            elif self.platform == "darwin":
                subprocess.run(["open", file_path], check=True)
            elif self.platform == "linux":
                subprocess.run(["xdg-open", file_path], check=True)
            else:
                logger.warning(f"Opening files not supported on platform: {self.platform}")

        except Exception as e:
            logger.error(f"Error opening file in shell: {e}")

    async def get_preferences(self) -> Dict[str, Any]:
        """Get application preferences."""
        try:
            if self.preferences_file.exists():
                with open(self.preferences_file, 'r') as f:
                    preferences = json.load(f)

                # Merge with defaults to ensure all keys exist
                merged_preferences = self._merge_preferences(self.default_preferences, preferences)
                return merged_preferences
            else:
                # Return default preferences and save them
                await self.set_preferences(self.default_preferences)
                return self.default_preferences.copy()

        except Exception as e:
            logger.error(f"Error getting preferences: {e}")
            return self.default_preferences.copy()

    async def set_preferences(self, preferences: Dict[str, Any]) -> None:
        """Set application preferences."""
        try:
            # Merge with existing preferences
            existing_preferences = await self.get_preferences()
            merged_preferences = self._merge_preferences(existing_preferences, preferences)

            with open(self.preferences_file, 'w') as f:
                json.dump(merged_preferences, f, indent=2)

            logger.info("Preferences saved successfully")

        except Exception as e:
            logger.error(f"Error setting preferences: {e}")

    def _merge_preferences(self, base: Dict[str, Any], update: Dict[str, Any]) -> Dict[str, Any]:
        """Recursively merge preference dictionaries."""
        result = base.copy()

        for key, value in update.items():
            if key in result and isinstance(result[key], dict) and isinstance(value, dict):
                result[key] = self._merge_preferences(result[key], value)
            else:
                result[key] = value

        return result

    async def get_recent_files(self) -> List[Dict[str, Any]]:
        """Get recently opened files."""
        try:
            if self.recent_files_file.exists():
                with open(self.recent_files_file, 'r') as f:
                    recent_files = json.load(f)
                return recent_files
            else:
                return []

        except Exception as e:
            logger.error(f"Error getting recent files: {e}")
            return []

    async def add_recent_file(self, file_path: str) -> None:
        """Add a file to the recent files list."""
        try:
            recent_files = await self.get_recent_files()

            # Remove if already exists
            recent_files = [f for f in recent_files if f.get("path") != file_path]

            # Add to the beginning
            file_info = {
                "path": file_path,
                "name": Path(file_path).name,
                "accessed_at": asyncio.get_event_loop().time()
            }
            recent_files.insert(0, file_info)

            # Keep only the most recent files
            recent_files = recent_files[:self.max_recent_files]

            with open(self.recent_files_file, 'w') as f:
                json.dump(recent_files, f, indent=2)

        except Exception as e:
            logger.error(f"Error adding recent file: {e}")

    async def clear_recent_files(self) -> None:
        """Clear the recent files list."""
        try:
            if self.recent_files_file.exists():
                self.recent_files_file.unlink()
            logger.info("Recent files cleared")

        except Exception as e:
            logger.error(f"Error clearing recent files: {e}")

    async def get_clipboard_content(self) -> Optional[str]:
        """Get clipboard content (text only)."""
        try:
            if HAS_TKINTER:
                root = tk.Tk()
                root.withdraw()
                try:
                    content = root.clipboard_get()
                    return content
                except tk.TclError:
                    return None
                finally:
                    root.destroy()
            else:
                logger.warning("tkinter not available, cannot access clipboard")
                return None

        except Exception as e:
            logger.error(f"Error getting clipboard content: {e}")
            return None

    async def set_clipboard_content(self, content: str) -> None:
        """Set clipboard content."""
        try:
            if HAS_TKINTER:
                root = tk.Tk()
                root.withdraw()
                try:
                    root.clipboard_clear()
                    root.clipboard_append(content)
                    root.update()  # Required to persist clipboard content
                finally:
                    root.destroy()
            else:
                logger.warning("tkinter not available, cannot set clipboard")

        except Exception as e:
            logger.error(f"Error setting clipboard content: {e}")

    async def open_url(self, url: str) -> None:
        """Open a URL in the default browser."""
        try:
            webbrowser.open(url)
        except Exception as e:
            logger.error(f"Error opening URL {url}: {e}")
