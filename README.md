# Smart Command Center for Humanitarian Case Management

An integrated digital system powered by artificial intelligence for the Sharjah Broadcasting Authority (SBA) "Direct Line" (*Alam wa Amal*) program.

## Monorepo Layout

This repository is organized as a monorepo consisting of:

```
Smart Command Center/
├── Docs/                  # Core specification documents, requirements, and themes
├── frontend/              # Next.js web application (TypeScript, App Router, Tailwind CSS)
└── backend/               # Python backend services (FastAPI)
```

## Running the Project

### 1. Frontend Setup
See details in [frontend README](frontend/README.md) (once generated).
```bash
cd frontend
npm run dev
```

### 2. Backend Setup
See details in [backend README](backend/README.md).
```bash
cd backend
python -m venv .venv
# activate .venv
pip install -r requirements.txt
uvicorn app.main:app --reload
```
