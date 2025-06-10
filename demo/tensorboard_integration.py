#!/usr/bin/env python3
"""
Orpheus Engine TensorBoard Integration Module
Comprehensive real-time monitoring and visualization for HP AI Studio compatible demos

This module provides TensorBoard integration for all Orpheus Engine demo notebooks,
enabling real-time monitoring of audio analysis, DAW workflows, and competition metrics.
"""

import os
import sys
import time
import threading
import subprocess
import json
import numpy as np
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, Optional, List, Union

# TensorBoard imports with fallback handling
try:
    import tensorboard
    from torch.utils.tensorboard import SummaryWriter
    import tensorflow as tf
    TENSORBOARD_AVAILABLE = True
    print("✅ TensorBoard integration available")
except ImportError as e:
    TENSORBOARD_AVAILABLE = False
    print(f"⚠️ TensorBoard not available: {e}")
    print("Install with: pip install tensorboard torch tensorflow")

# Audio processing imports for waveform logging
try:
    import librosa
    import soundfile as sf
    AUDIO_LIBS_AVAILABLE = True
except ImportError:
    AUDIO_LIBS_AVAILABLE = False
    print("⚠️ Audio libraries not available for advanced TensorBoard logging")


def check_tensorboard_compatibility() -> bool:
    """
    Check TensorBoard compatibility and dependencies
    
    Returns:
        bool: True if TensorBoard is fully compatible, False otherwise
    """
    compatibility_issues = []
    
    # Check TensorBoard availability
    if not TENSORBOARD_AVAILABLE:
        compatibility_issues.append("TensorBoard not installed")
    
    # Check PyTorch SummaryWriter
    try:
        from torch.utils.tensorboard import SummaryWriter
        print("✅ PyTorch TensorBoard SummaryWriter available")
    except ImportError:
        compatibility_issues.append("PyTorch SummaryWriter not available")
    
    # Check TensorFlow backend
    try:
        import tensorflow as tf
        print(f"✅ TensorFlow backend: {tf.__version__}")
    except ImportError:
        compatibility_issues.append("TensorFlow backend not available")
    
    # Check audio processing capabilities
    if not AUDIO_LIBS_AVAILABLE:
        print("⚠️ Audio visualization will be limited (librosa/soundfile missing)")
    else:
        print("✅ Audio visualization capabilities available")
    
    # Check for HP AI Studio Phoenix paths
    phoenix_accessible = os.path.exists("/phoenix") if os.name != 'nt' else False
    if phoenix_accessible:
        print("✅ HP AI Studio Phoenix paths accessible")
    else:
        print("⚠️ HP AI Studio Phoenix paths not accessible (using local paths)")
    
    # Report compatibility status
    if compatibility_issues:
        print(f"❌ TensorBoard compatibility issues:")
        for issue in compatibility_issues:
            print(f"   • {issue}")
        return False
    else:
        print("✅ TensorBoard fully compatible")
        return True


def setup_tensorboard_logging(log_dir: str = "./tensorboard_logs", 
                            experiment_name: str = "orpheus_experiment") -> bool:
    """
    Setup TensorBoard logging directory and initial configuration
    
    Args:
        log_dir: Base directory for TensorBoard logs
        experiment_name: Name of the experiment
        
    Returns:
        bool: True if setup successful, False otherwise
    """
    try:
        log_path = Path(log_dir) / experiment_name
        log_path.mkdir(parents=True, exist_ok=True)
        
        # Create a simple test log
        if TENSORBOARD_AVAILABLE:
            from torch.utils.tensorboard import SummaryWriter
            test_writer = SummaryWriter(log_dir=str(log_path / "setup_test"))
            test_writer.add_scalar("setup/test_metric", 1.0, 0)
            test_writer.close()
            print(f"✅ TensorBoard logging setup complete: {log_path}")
            return True
        else:
            print("❌ TensorBoard not available for logging setup")
            return False
    except Exception as e:
        print(f"❌ TensorBoard logging setup failed: {e}")
        return False


class OrpheusTensorBoardManager:
    """
    Comprehensive TensorBoard integration for Orpheus Engine demos
    Compatible with HP AI Studio and MLflow workflows
    
    Features:
    - Real-time audio analysis monitoring
    - DAW workflow performance tracking
    - Competition metrics visualization
    - HP AI Studio integration
    - Automatic server management
    """
    
    def __init__(self, log_dir: str = "./tensorboard_logs", experiment_name: str = "orpheus_demo", 
                 hp_ai_studio_compatible: bool = True, port: int = 6006):
        """
        Initialize TensorBoard manager
        
        Args:
            log_dir: Base directory for TensorBoard logs
            experiment_name: Name of the experiment for logging organization
            hp_ai_studio_compatible: Enable HP AI Studio specific features
            port: Port for TensorBoard server
        """
        self.experiment_name = experiment_name
        self.port = port
        self.server_port = port  # Add server_port attribute for notebook compatibility
        self.hp_ai_studio_compatible = hp_ai_studio_compatible
        
        # Set up log directory
        if log_dir.startswith("/phoenix"):
            # HP AI Studio Phoenix path
            self.log_dir = Path(log_dir)
            try:
                self.log_dir.mkdir(parents=True, exist_ok=True)
                print(f"📁 HP AI Studio log directory: {self.log_dir}")
            except Exception:
                # Fallback to local if Phoenix not available
                self.log_dir = Path(f"./tensorboard_logs/{experiment_name}")
                self.log_dir.mkdir(parents=True, exist_ok=True)
                print(f"📁 Using local TensorBoard logs: {self.log_dir}")
        else:
            # Local path
            self.log_dir = Path(log_dir) / experiment_name
            self.log_dir.mkdir(parents=True, exist_ok=True)
        
        self.writers: Dict[str, Any] = {}
        self.tb_process = None
        self.step_counters: Dict[str, int] = {}
        
        # Initialize default writer
        if TENSORBOARD_AVAILABLE:
            self.create_writer("default")
            self.start_tensorboard_server()
            
    def start_tensorboard_server(self):
        """Start TensorBoard server in background"""
        if not TENSORBOARD_AVAILABLE:
            print("⚠️ Cannot start TensorBoard server - TensorBoard not available")
            return False
            
        try:
            # Check if TensorBoard is already running on this port
            import socket
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            result = sock.connect_ex(('localhost', self.port))
            sock.close()
            
            if result == 0:
                print(f"📊 TensorBoard already running on port {self.port}")
                return True
            
            # Start TensorBoard server
            cmd = [
                sys.executable, "-m", "tensorboard.main",
                "--logdir", str(self.log_dir.parent if self.log_dir.name == self.experiment_name else self.log_dir),
                "--port", str(self.port),
                "--host", "localhost"
            ]
            
            self.tb_process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                start_new_session=True
            )
            
            # Give it a moment to start
            time.sleep(2)
            
            print(f"🚀 TensorBoard server started on http://localhost:{self.port}")
            return True
            
        except Exception as e:
            print(f"⚠️ Failed to start TensorBoard server: {e}")
            return False
    
    def create_writer(self, writer_name: str = "default") -> Optional[Any]:
        """Create a TensorBoard writer for logging metrics"""
        if not TENSORBOARD_AVAILABLE:
            print("⚠️ TensorBoard not available")
            return None
            
        timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
        writer_dir = self.log_dir / writer_name / timestamp
        writer = SummaryWriter(log_dir=str(writer_dir))
        self.writers[writer_name] = writer
        self.step_counters[writer_name] = 0
        
        print(f"📊 TensorBoard writer created: {writer_name}")
        print(f"   Log directory: {writer_dir}")
        
        return writer
    
    def log_scalar(self, tag: str, value: float, step: int, writer_name: str = "default") -> None:
        """Log a scalar value to TensorBoard"""
        if not TENSORBOARD_AVAILABLE:
            return
            
        if writer_name not in self.writers:
            self.create_writer(writer_name)
            
        if self.writers[writer_name] is None:
            return
            
        try:
            self.writers[writer_name].add_scalar(tag, float(value), step)
        except (ValueError, TypeError) as e:
            print(f"Warning: Failed to log scalar {tag}: {e}")
    
    def log_audio_waveform(self, audio_data: np.ndarray, sample_rate: int, 
                          tag: str, step: int, writer_name: str = "default") -> None:
        """Log audio waveform visualization to TensorBoard"""
        if not TENSORBOARD_AVAILABLE or not AUDIO_LIBS_AVAILABLE:
            return
            
        if writer_name not in self.writers:
            self.create_writer(writer_name)
            
        if self.writers[writer_name] is None:
            return
            
        try:
            # Ensure audio is in the right format
            if len(audio_data.shape) > 1:
                audio_data = audio_data.flatten()
            
            # Normalize audio for visualization
            if np.max(np.abs(audio_data)) > 0:
                audio_normalized = audio_data / np.max(np.abs(audio_data))
            else:
                audio_normalized = audio_data
                
            # Log as audio sample (TensorBoard will show waveform)
            self.writers[writer_name].add_audio(tag, audio_normalized, step, sample_rate)
            
        except Exception as e:
            print(f"Warning: Failed to log audio waveform {tag}: {e}")
    
    def log_audio_spectrogram(self, audio_data: np.ndarray, sample_rate: int,
                            tag: str, step: int, writer_name: str = "default") -> None:
        """Log audio spectrogram visualization to TensorBoard"""
        if not TENSORBOARD_AVAILABLE or not AUDIO_LIBS_AVAILABLE:
            return
            
        if writer_name not in self.writers:
            self.create_writer(writer_name)
            
        if self.writers[writer_name] is None:
            return
            
        try:
            import matplotlib.pyplot as plt
            
            # Generate spectrogram
            D = librosa.amplitude_to_db(np.abs(librosa.stft(audio_data)), ref=np.max)
            
            # Create figure
            fig, ax = plt.subplots(figsize=(10, 4))
            img = librosa.display.specshow(D, y_axis='hz', x_axis='time', 
                                         sr=sample_rate, ax=ax)
            ax.set_title(f'Spectrogram - {tag}')
            fig.colorbar(img, ax=ax, format='%+2.0f dB')
            
            # Convert to image for TensorBoard
            fig.canvas.draw()
            img_array = np.frombuffer(fig.canvas.tostring_rgb(), dtype=np.uint8)
            img_array = img_array.reshape(fig.canvas.get_width_height()[::-1] + (3,))
            
            # Log to TensorBoard
            self.writers[writer_name].add_image(tag, img_array, step, dataformats='HWC')
            
            plt.close(fig)
            
        except Exception as e:
            print(f"Warning: Failed to log spectrogram {tag}: {e}")
    
    def get_next_step(self, writer_name: str) -> int:
        """Get the next step counter for a writer"""
        if writer_name not in self.step_counters:
            self.step_counters[writer_name] = 0
        step = self.step_counters[writer_name]
        self.step_counters[writer_name] += 1
        return step
    
    def log_audio_analysis(self, writer_name: str, analysis_results: Dict[str, Any], 
                          step: Optional[int] = None) -> None:
        """Log audio analysis results to TensorBoard"""
        if writer_name not in self.writers:
            self.create_writer(writer_name)
            
        if self.writers[writer_name] is None:
            return
            
        writer = self.writers[writer_name]
        if step is None:
            step = self.get_next_step(writer_name)
        
        # Log scalar metrics
        scalar_metrics = [
            'quality_score', 'lufs', 'peak_db', 'rms_db', 'tempo_bpm',
            'spectral_centroid', 'spectral_bandwidth', 'spectral_rolloff',
            'zero_crossing_rate', 'harmonic_ratio', 'percussive_ratio',
            'crest_factor', 'duration'
        ]
        
        for metric in scalar_metrics:
            if metric in analysis_results and analysis_results[metric] is not None:
                try:
                    value = float(analysis_results[metric])
                    writer.add_scalar(f'Audio/{metric.replace("_", " ").title()}', value, step)
                except (ValueError, TypeError):
                    continue
        
        # Log compliance as histogram
        if 'compliance' in analysis_results:
            compliance_data = analysis_results['compliance']
            if isinstance(compliance_data, dict):
                compliance_score = sum(compliance_data.values()) / len(compliance_data)
                writer.add_scalar('Audio/Compliance_Score', compliance_score, step)
                
                # Log individual compliance metrics
                for key, value in compliance_data.items():
                    writer.add_scalar(f'Compliance/{key.replace("_", " ").title()}', 
                                    int(value), step)
        
        # Log MFCC features as histogram
        if 'mfcc_mean' in analysis_results:
            mfcc_data = analysis_results['mfcc_mean']
            if isinstance(mfcc_data, list) and len(mfcc_data) > 0:
                writer.add_histogram('Audio/MFCC_Coefficients', 
                                   np.array(mfcc_data), step)
        
        # Log genre as text
        if 'predicted_genre' in analysis_results:
            writer.add_text('Audio/Predicted_Genre', 
                          str(analysis_results['predicted_genre']), step)
        
        writer.flush()
    
    def log_audio_waveform(self, writer_name: str, audio_signal: np.ndarray, 
                          sample_rate: int, tag: str = "Audio", 
                          step: Optional[int] = None) -> None:
        """Log audio waveform to TensorBoard"""
        if writer_name not in self.writers or not TENSORBOARD_AVAILABLE:
            return
            
        writer = self.writers[writer_name]
        if writer is None:
            return
            
        if step is None:
            step = self.get_next_step(writer_name)
        
        try:
            # Ensure audio is in correct format for TensorBoard
            if len(audio_signal.shape) == 1:
                audio_signal = audio_signal.reshape(1, -1)
            elif len(audio_signal.shape) == 2 and audio_signal.shape[0] > audio_signal.shape[1]:
                audio_signal = audio_signal.T
            
            # Normalize audio to [-1, 1] range
            if np.max(np.abs(audio_signal)) > 0:
                audio_signal = audio_signal / np.max(np.abs(audio_signal))
            
            writer.add_audio(tag, audio_signal, step, sample_rate=sample_rate)
            writer.flush()
        except Exception as e:
            print(f"⚠️ Failed to log audio waveform: {e}")
    
    def log_spectrogram(self, writer_name: str, audio_signal: np.ndarray, 
                       sample_rate: int, tag: str = "Spectrogram", 
                       step: Optional[int] = None) -> None:
        """Log spectrogram to TensorBoard"""
        if (writer_name not in self.writers or not TENSORBOARD_AVAILABLE or 
            not AUDIO_LIBS_AVAILABLE):
            return
            
        writer = self.writers[writer_name]
        if writer is None:
            return
            
        if step is None:
            step = self.get_next_step(writer_name)
        
        try:
            # Generate spectrogram using librosa
            stft = librosa.stft(audio_signal)
            spectrogram = np.abs(stft)
            
            # Convert to log scale for better visualization
            log_spectrogram = librosa.amplitude_to_db(spectrogram, ref=np.max)
            
            # Normalize for TensorBoard image display
            normalized = (log_spectrogram - log_spectrogram.min()) / (
                log_spectrogram.max() - log_spectrogram.min())
            
            # Add channel dimension for TensorBoard
            spectrogram_image = normalized[np.newaxis, :, :]
            
            writer.add_image(tag, spectrogram_image, step)
            writer.flush()
        except Exception as e:
            print(f"⚠️ Failed to log spectrogram: {e}")
    
    def log_daw_workflow(self, writer_name: str, workflow_metrics: Dict[str, Any], 
                        step: Optional[int] = None) -> None:
        """Log DAW workflow metrics"""
        if writer_name not in self.writers:
            self.create_writer(writer_name)
            
        if self.writers[writer_name] is None:
            return
            
        writer = self.writers[writer_name]
        if step is None:
            step = self.get_next_step(writer_name)
        
        # Log processing metrics
        daw_metrics = [
            'processing_time', 'real_time_factor', 'clips_processed',
            'average_improvement', 'total_duration', 'lufs_improvement',
            'noise_reduction', 'quality_improvement'
        ]
        
        for metric in daw_metrics:
            if metric in workflow_metrics and workflow_metrics[metric] is not None:
                try:
                    value = float(workflow_metrics[metric])
                    writer.add_scalar(f'DAW/{metric.replace("_", " ").title()}', value, step)
                except (ValueError, TypeError):
                    continue
        
        writer.flush()
    
    def log_competition_metrics(self, writer_name: str, competition_data: Dict[str, Any], 
                               step: Optional[int] = None) -> None:
        """Log competition judging metrics"""
        if writer_name not in self.writers:
            self.create_writer(writer_name)
            
        if self.writers[writer_name] is None:
            return
            
        writer = self.writers[writer_name]
        if step is None:
            step = self.get_next_step(writer_name)
        
        competition_metrics = [
            'total_submissions', 'average_quality_score', 'professional_submissions',
            'technical_issues', 'average_tempo', 'genre_diversity'
        ]
        
        for metric in competition_metrics:
            if metric in competition_data and competition_data[metric] is not None:
                try:
                    value = float(competition_data[metric])
                    writer.add_scalar(f'Competition/{metric.replace("_", " ").title()}', 
                                    value, step)
                except (ValueError, TypeError):
                    continue
        
        # Log genre distribution as histogram
        if 'genre_distribution' in competition_data:
            genre_data = competition_data['genre_distribution']
            if isinstance(genre_data, dict):
                genres = list(genre_data.keys())
                counts = list(genre_data.values())
                
                # Add text summary
                genre_summary = ", ".join([f"{genre}: {count}" 
                                         for genre, count in genre_data.items()])
                writer.add_text('Competition/Genre_Distribution', genre_summary, step)
        
        writer.flush()
    
    def log_mlflow_integration(self, writer_name: str, mlflow_data: Dict[str, Any], 
                              step: Optional[int] = None) -> None:
        """Log MLflow integration metrics"""
        if writer_name not in self.writers:
            self.create_writer(writer_name)
            
        if self.writers[writer_name] is None:
            return
            
        writer = self.writers[writer_name]
        if step is None:
            step = self.get_next_step(writer_name)
        
        # Log MLflow metrics
        mlflow_metrics = [
            'runs_logged', 'artifacts_stored', 'experiments_created',
            'models_registered', 'deployment_readiness'
        ]
        
        for metric in mlflow_metrics:
            if metric in mlflow_data and mlflow_data[metric] is not None:
                try:
                    value = float(mlflow_data[metric])
                    writer.add_scalar(f'MLflow/{metric.replace("_", " ").title()}', 
                                    value, step)
                except (ValueError, TypeError):
                    continue
        
        writer.flush()
    
    def start_tensorboard_server(self) -> bool:
        """Start TensorBoard server in background"""
        if not TENSORBOARD_AVAILABLE:
            print("⚠️ Cannot start TensorBoard - not available")
            return False
            
        if self.tb_process and self.tb_process.poll() is None:
            print(f"✅ TensorBoard already running on port {self.port}")
            return True
            
        try:
            cmd = [
                sys.executable, "-m", "tensorboard.main",
                "--logdir", str(self.log_dir),
                "--port", str(self.port),
                "--host", "0.0.0.0",
                "--reload_interval", "5",
                "--bind_all"
            ]
            
            self.tb_process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            # Give TensorBoard time to start
            time.sleep(3)
            
            if self.tb_process.poll() is None:
                print(f"🚀 TensorBoard started successfully!")
                print(f"📊 TensorBoard URL: http://localhost:{self.port}")
                print(f"📁 Log directory: {self.log_dir}")
                return True
            else:
                print(f"❌ Failed to start TensorBoard")
                return False
                
        except Exception as e:
            print(f"❌ Error starting TensorBoard: {e}")
            return False
    
    def stop_tensorboard_server(self) -> None:
        """Stop TensorBoard server"""
        if self.tb_process and self.tb_process.poll() is None:
            self.tb_process.terminate()
            time.sleep(2)
            if self.tb_process.poll() is None:
                self.tb_process.kill()
            print("🛑 TensorBoard server stopped")
    
    def close_writers(self) -> None:
        """Close all TensorBoard writers"""
        for name, writer in self.writers.items():
            if writer is not None:
                writer.close()
                print(f"📊 Closed TensorBoard writer: {name}")
        self.writers.clear()
        self.step_counters.clear()
    
    def create_hp_ai_studio_summary(self) -> Dict[str, Any]:
        """Create summary for HP AI Studio integration"""
        summary = {
            "tensorboard_integration": {
                "enabled": TENSORBOARD_AVAILABLE,
                "demo_name": self.demo_name,
                "port": self.port,
                "log_directory": str(self.log_dir),
                "writers_active": list(self.writers.keys()),
                "hp_ai_studio_compatible": self.hp_ai_studio_compatible,
                "server_running": self.tb_process is not None and self.tb_process.poll() is None,
                "url": f"http://localhost:{self.port}",
                "timestamp": datetime.now().isoformat()
            }
        }
        return summary
    
    def __del__(self):
        """Cleanup when object is destroyed"""
        self.close_writers()
        self.stop_tensorboard_server()


# Global TensorBoard manager instance
_tb_manager = None

def get_tensorboard_manager(demo_name: str = "orpheus_demo", port: int = 6006) -> OrpheusTensorBoardManager:
    """Get or create global TensorBoard manager"""
    global _tb_manager
    if _tb_manager is None:
        _tb_manager = OrpheusTensorBoardManager(demo_name, port)
    return _tb_manager

def log_to_tensorboard(writer_name: str, metrics_dict: Dict[str, Any], 
                      step: Optional[int] = None, metric_type: str = "general") -> None:
    """Convenience function to log metrics to TensorBoard"""
    tb_manager = get_tensorboard_manager()
    
    if metric_type == "audio":
        tb_manager.log_audio_analysis(writer_name, metrics_dict, step)
    elif metric_type == "daw":
        tb_manager.log_daw_workflow(writer_name, metrics_dict, step)
    elif metric_type == "competition":
        tb_manager.log_competition_metrics(writer_name, metrics_dict, step)
    elif metric_type == "mlflow":
        tb_manager.log_mlflow_integration(writer_name, metrics_dict, step)
    else:
        # Generic scalar logging
        if writer_name not in tb_manager.writers:
            tb_manager.create_writer(writer_name)
        
        writer = tb_manager.writers[writer_name]
        if writer is not None:
            if step is None:
                step = tb_manager.get_next_step(writer_name)
            
            for key, value in metrics_dict.items():
                if isinstance(value, (int, float)):
                    writer.add_scalar(f"General/{key}", value, step)
            writer.flush()

def log_audio_to_tensorboard(writer_name: str, audio_signal: np.ndarray, 
                           sample_rate: int, tag: str = "Audio", 
                           step: Optional[int] = None) -> None:
    """Convenience function to log audio to TensorBoard"""
    tb_manager = get_tensorboard_manager()
    tb_manager.log_audio_waveform(writer_name, audio_signal, sample_rate, tag, step)

def log_spectrogram_to_tensorboard(writer_name: str, audio_signal: np.ndarray, 
                                 sample_rate: int, tag: str = "Spectrogram", 
                                 step: Optional[int] = None) -> None:
    """Convenience function to log spectrogram to TensorBoard"""
    tb_manager = get_tensorboard_manager()
    tb_manager.log_spectrogram(writer_name, audio_signal, sample_rate, tag, step)

def start_tensorboard_for_demo(demo_name: str, port: int = 6006) -> bool:
    """Start TensorBoard for a specific demo"""
    tb_manager = get_tensorboard_manager(demo_name, port)
    return tb_manager.start_tensorboard_server()

def get_tensorboard_summary() -> Dict[str, Any]:
    """Get comprehensive TensorBoard integration summary"""
    if _tb_manager is not None:
        return _tb_manager.create_hp_ai_studio_summary()
    else:
        return {
            "tensorboard_integration": {
                "enabled": False,
                "error": "TensorBoard manager not initialized"
            }
        }

print("📊 Orpheus Engine TensorBoard Integration Module Loaded")
print(f"   • TensorBoard Available: {'✅' if TENSORBOARD_AVAILABLE else '❌'}")
print(f"   • Audio Libraries Available: {'✅' if AUDIO_LIBS_AVAILABLE else '❌'}")
if TENSORBOARD_AVAILABLE:
    print("   • Real-time monitoring ready")
    print("   • HP AI Studio integration enabled")
