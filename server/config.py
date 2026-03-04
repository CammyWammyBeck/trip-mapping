from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://localhost:5432/trip_planner"
    supabase_url: str = ""
    supabase_service_key: str = ""
    google_maps_api_key: str = ""

    model_config = {"env_file": ".env"}


settings = Settings()
