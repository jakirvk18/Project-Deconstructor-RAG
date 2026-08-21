# Project Deconstructor RAG Model

A local RAG-powered codebase analysis tool. Point it at any public GitHub repository and chat with the code — ask architectural questions, run security audits, open individual files, and get answers grounded in the actual source.

Everything runs on your machine. No data leaves your network.

---

## What it does

- **Clones and indexes** any public GitHub repo into a local ChromaDB vector store
- **Chat with the codebase** — ask natural-language questions and get answers that cite real file paths
- **Security audit mode** — detects vulnerabilities, hardcoded secrets, auth issues, and code smells using a dedicated reasoning model
- **Architecture mode** — maps system design, data flow, and folder structure
- **File viewer** — browse and open source files, images, and audio directly in the UI
- **Persistent chat history** — conversations are saved to MongoDB and restored across sessions
- **Resizable sidebar** — drag the file explorer to any width you like

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Backend | FastAPI (Python) |
| Vector store | ChromaDB (local) |
| Embeddings | `nomic-embed-text` via Ollama |
| Chat LLM | `qwen3:8b` via Ollama |
| Audit LLM | `deepseek-r1:8b` via Ollama |
| Database | MongoDB |
| Parsing | LangChain text splitters |

---

## Prerequisites

- Python 3.10+
- Node.js 18+
- [Ollama](https://ollama.com) installed and running
- MongoDB running locally on port `27017`
- Git

---

## Setup

### 1. Pull the required Ollama models

```bash
ollama pull nomic-embed-text
ollama pull qwen3:8b
ollama pull deepseek-r1:8b
```

### 2. Clone this repo

```bash
git clone https://github.com/your-username/project-deconstructor.git
cd project-deconstructor
```

### 3. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install fastapi uvicorn pymongo langchain langchain-chroma \
            langchain-ollama langchain-text-splitters
```

Start the server:

```bash
uvicorn app.main:app --reload --port 8000
```

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Environment variables

The backend reads one optional environment variable:

| Variable | Default | Description |
|---|---|---|
| `RAG_MAX_FILE_SIZE_MB` | `2` | Files larger than this are skipped during indexing |

Set it before starting the server:

```bash
export RAG_MAX_FILE_SIZE_MB=4
```

---

## Project structure

```
project-deconstructor/
├── backend/
│   ├── app/
│   │   └── main.py              # FastAPI routes
│   ├── build_folder.py          # Repository tree builder
│   ├── rag_services/
│   │   ├── parser.py            # File chunking and parsing
│   │   └── rag_engine.py        # ChromaDB + Ollama RAG engine
│   ├── cloned_repos/            # Git clones land here (gitignored)
│   └── storage/
│       └── chromadb/            # Vector indexes (gitignored)
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── LandingPage.jsx
    │   │   └── MainPage.jsx
    │   └── components/
    │       ├── FileExplorer.jsx  # Resizable sidebar
    │       ├── FileTree.jsx
    │       ├── FileContent.jsx
    │       └── ChatScreen.jsx    # Chat UI with markdown + syntax highlighting
    └── vite.config.js
```

---

## API reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/fetch-repo` | Clone and index a GitHub repository |
| `POST` | `/ask-ai` | Send a query to the RAG engine |
| `GET` | `/chat-history/{repository}` | Load saved chat history |
| `DELETE` | `/chat-history` | Clear chat history for a repository |
| `POST` | `/get-file-content` | Fetch a file's content from a cloned repo |

---

## How queries are routed

The backend classifies each query before sending it to a model:

- **Audit** — triggered by keywords like `security`, `vulnerability`, `bug`, `exploit`. Uses `deepseek-r1:8b` with a security-focused prompt and retrieves 12 context chunks.
- **Architecture** — triggered by keywords like `architecture`, `data flow`, `system design`. Uses `qwen3:8b` with the current open file as additional context.
- **Chat** — everything else. Uses `qwen3:8b` with 8 context chunks.

Keyword matching uses whole-word regex (`\b`) so `"debug"` doesn't accidentally trigger an audit.

---

## Notes

- Only public GitHub repositories are supported. Private repos require a personal access token passed to `git clone`.
- The `cloned_repos/` and `storage/chromadb/` directories are excluded from git — add them to `.gitignore` if they aren't already.
- Re-fetching a repo that's already indexed will clear the old vector store and re-index from scratch, so the index stays clean.
- The first query after cloning a large repo may be slow while ChromaDB warms up.



---
## Developer
Shaik Jakir Hussain
