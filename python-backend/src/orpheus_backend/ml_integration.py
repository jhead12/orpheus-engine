"""
Conditional MLflow integration for Mini DAW
"""

import os
import logging
from typing import Optional, Dict, Any

# Conditional MLflow import
try:
    import mlflow
    import mlflow.sklearn
    MLFLOW_AVAILABLE = True
    logging.info("✅ MLflow available - ML features enabled")
except ImportError:
    MLFLOW_AVAILABLE = False
    mlflow = None
    logging.info("ℹ️ MLflow not available - ML features disabled")

class MLflowManager:
    """Manages MLflow integration for audio analysis"""

    def __init__(self, experiment_name: str = "orpheus-mini-daw"):
        self.enabled = MLFLOW_AVAILABLE and os.getenv("ORPHEUS_ML_ENABLED", "false").lower() == "true"
        self.experiment_name = experiment_name

        if self.enabled:
            self._setup_mlflow()

    def _setup_mlflow(self):
        """Initialize MLflow tracking"""
        try:
            # Set tracking URI (can be local file, remote server, etc.)
            tracking_uri = os.getenv("MLFLOW_TRACKING_URI", "sqlite:///mlflow.db")
            mlflow.set_tracking_uri(tracking_uri)

            # Set or create experiment
            try:
                experiment = mlflow.get_experiment_by_name(self.experiment_name)
                if experiment is None:
                    mlflow.create_experiment(self.experiment_name)
                mlflow.set_experiment(self.experiment_name)
                logging.info(f"📊 MLflow experiment set: {self.experiment_name}")
            except Exception as e:
                logging.warning(f"MLflow experiment setup failed: {e}")
                self.enabled = False
        except Exception as e:
            logging.error(f"MLflow setup failed: {e}")
            self.enabled = False

    def log_audio_analysis(self,
                          audio_features: Dict[str, Any],
                          clip_info: Optional[Dict[str, Any]] = None) -> Optional[str]:
        """Log audio analysis results to MLflow"""
        if not self.enabled:
            return None

        try:
            with mlflow.start_run() as run:
                # Log parameters (audio characteristics)
                if clip_info:
                    mlflow.log_params({
                        "sample_rate": clip_info.get("sample_rate", 44100),
                        "duration": clip_info.get("duration", 0),
                        "channels": clip_info.get("channels", 1),
                        "file_format": clip_info.get("format", "unknown")
                    })

                # Log metrics (analysis results)
                if audio_features:
                    metrics = {}
                    for key, value in audio_features.items():
                        if isinstance(value, (int, float)):
                            metrics[f"audio_{key}"] = value
                        elif hasattr(value, '__len__') and len(value) > 0:
                            # Log statistical measures for arrays
                            if hasattr(value[0], '__float__'):
                                metrics[f"audio_{key}_mean"] = float(sum(value) / len(value))
                                metrics[f"audio_{key}_max"] = float(max(value))
                                metrics[f"audio_{key}_min"] = float(min(value))

                    mlflow.log_metrics(metrics)

                # Log tags
                mlflow.set_tags({
                    "daw_version": "mini-1.0",
                    "analysis_type": "audio_features",
                    "component": "mini_daw"
                })

                return run.info.run_id

        except Exception as e:
            logging.error(f"MLflow logging failed: {e}")
            return None

# Global instance
ml_manager = MLflowManager()
