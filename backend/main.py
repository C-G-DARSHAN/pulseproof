import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from schemas import AnalyzeResponse, HealthResponse
from analyzer import analyze_video_pipeline

app = FastAPI(
    title="PulseProof API",
    description="Adaptive Video Forensics & Deepfake Detection Engine",
    version="1.0.0"
)

# Enable CORS for local frontend development (e.g. port 5173, port 3000, and cross-laptop local IP)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["General"])
def root():
    return {
        "app": "PulseProof Adaptive Video Forensics",
        "version": "1.0.0",
        "tagline": "Not just a verdict — the evidence.",
        "health_check": "/health",
        "api_docs": "/docs"
    }

@app.get("/health", response_model=HealthResponse, tags=["Health"])
def health_check():
    return {
        "status": "ok",
        "app": "PulseProof Backend",
        "version": "1.0.0"
    }

@app.post("/api/analyze", response_model=AnalyzeResponse, tags=["Forensics"])
@app.post("/analyze", response_model=AnalyzeResponse, tags=["Forensics"])
async def analyze_video_endpoint(file: UploadFile = File(...)):
    # 1. Validate file format
    valid_extensions = [".mp4", ".mov", ".avi", ".webm", ".mkv"]
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in valid_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported video format '{ext}'. Supported formats: {', '.join(valid_extensions)}"
        )

    # 2. Read bytes with safety limit (100MB)
    MAX_SIZE = 100 * 1024 * 1024
    contents = await file.read()
    if len(contents) > MAX_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File size exceeds the 100MB limit for hackathon analysis."
        )

    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        # 3. Execute forensics pipeline
        result = analyze_video_pipeline(file_bytes=contents, filename=file.filename)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Forensic processing failed: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
