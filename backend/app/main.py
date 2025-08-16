from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

app = FastAPI(title="AI Dev Template Backend")

# Enable CORS for local dev so the Next.js app (3000) can call this API
app.add_middleware(
	CORSMiddleware,
	allow_origins=["*"],  # For dev convenience; consider restricting in production
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)


@app.get("/ping")
def ping() -> dict[str, str]:
	"""Health check endpoint.

	Returns {"status": "ok"} with 200 to confirm the backend is alive.
	"""
	return {"status": "ok"}
