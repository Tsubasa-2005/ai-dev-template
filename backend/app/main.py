from fastapi import FastAPI


app = FastAPI(title="AI Dev Template Backend")


@app.get("/ping")
def ping() -> dict[str, str]:
	"""Health check endpoint.

	Returns {"status": "ok"} with 200 to confirm the backend is alive.
	"""
	return {"status": "ok"}
