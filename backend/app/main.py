from fastapi import FastAPI

from .api.chat import router as chat_router
from .api.health import router as health_router
from .core.config import settings
from .core.cors import setup_cors


def create_app() -> FastAPI:
	app = FastAPI(title=settings.app_name)
	setup_cors(app)
	app.include_router(health_router)
	app.include_router(chat_router)
	return app


app = create_app()
