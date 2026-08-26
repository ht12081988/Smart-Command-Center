# Smart Command Center - Python Backend

This is the Python backend service for the Sharjah Broadcasting Authority (SBA) Humanitarian Case Management System.

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   └── main.py          # FastAPI application entrypoint
└── requirements.txt     # Python package dependencies
```

## Quick Start (Local Setup)

1. **Create virtual environment**:
   ```bash
   python -m venv .venv
   ```

2. **Activate virtual environment**:
   * Windows:
     ```powershell
     .venv\Scripts\Activate.ps1
     ```
   * macOS/Linux:
     ```bash
     source .venv/bin/activate
     ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the development server**:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   The API will be available at [http://localhost:8000](http://localhost:8000) and API documentation at [http://localhost:8000/docs](http://localhost:8000/docs).
