from pathlib import Path
from pydantic import BaseModel


class Settings(BaseModel):
    """Application runtime configurations."""
    API_TITLE: str = "VeriAnalyst API"
    API_VERSION: str = "0.1.0"
    
    # LLM Settings (Ollama local instance)
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "qwen2.5:3b"
    OLLAMA_TIMEOUT_SECONDS: float = 60.0

    # Data Storage Paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent.parent
    UPLOAD_DIR: Path = BASE_DIR / "data" / "uploads"
    SAMPLE_DIR: Path = BASE_DIR / "data" / "samples"


settings = Settings()
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
