from fastapi import FastAPI

app = FastAPI(
    title="Smart Command Center API",
    description="Backend API services for Sharjah Broadcasting Authority (SBA) Humanitarian Case Management System",
    version="1.0.0"
)

@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "Smart Command Center Backend API",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
