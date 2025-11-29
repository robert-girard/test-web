# CSV File Processor

A full-stack web application for processing CSV files with configurable multiplexing and protocol options. Built with React frontend and Flask backend.

## Features

- CSV file upload with validation
- Configurable multiplexing options: none, byte mask, byte, 2 byte
- Protocol selection: none, isotp, J1939
- Modern glassmorphic UI design
- Flask backend API for processing
- Single server deployment (Flask serves React)

## Project Structure

```
test-web/
├── src/                    # React frontend source
│   ├── App.jsx            # Main application component
│   ├── App.css            # Application styles
│   ├── main.jsx           # React entry point
│   └── index.css          # Global styles
├── backend/               # Flask backend
│   ├── app.py             # Flask application
│   ├── pyproject.toml     # Python dependencies (uv)
│   └── .venv/             # Virtual environment (auto-generated)
├── dist/                  # Production build (auto-generated)
├── index.html             # HTML entry point
├── vite.config.js         # Vite configuration
└── package.json           # Node.js dependencies
```

## Prerequisites

- Node.js (version 16 or higher)
- npm (comes with Node.js)
- Python 3.12+
- uv (Python package manager)

## Setup

### 1. Install uv (if not already installed)

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### 2. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd test-web

# Install Node.js dependencies
npm install

# Install Python dependencies
cd backend
~/.local/bin/uv sync
cd ..
```

## Development

### Option 1: Separate Frontend and Backend (Hot Reload)

Run the frontend and backend separately for development with hot reload:

**Terminal 1 - Frontend:**
```bash
npm run dev
```
This starts the Vite dev server at `http://localhost:5173/`

**Terminal 2 - Backend:**
```bash
cd backend
~/.local/bin/uv run python app.py
```
This starts the Flask server at `http://localhost:5000/`

**Note:** When running separately, the frontend makes API calls to `http://localhost:5000/api/process`

### Option 2: Single Server (Production-like)

Run only the Flask server which serves both frontend and backend:

```bash
# Build the React app first
npm run build

# Start Flask server
cd backend
~/.local/bin/uv run python app.py
```

Open `http://localhost:5000/` in your browser.

**Note:** You need to rebuild the React app (`npm run build`) each time you make frontend changes.

## Deployment

### Build for Production

1. Build the React frontend:
```bash
npm run build
```

This creates optimized static files in the `dist/` directory.

2. The Flask backend is already configured to serve these static files.

### Run Production Server

```bash
cd backend
~/.local/bin/uv run python app.py
```

The application will be available at `http://localhost:5000/`

### Deploy to Production Environment

#### Option 1: Using Gunicorn (Recommended)

1. Add Gunicorn to dependencies:
```bash
cd backend
~/.local/bin/uv add gunicorn
```

2. Run with Gunicorn:
```bash
cd backend
~/.local/bin/uv run gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

#### Option 2: Using Docker

Create a `Dockerfile` in the project root:

```dockerfile
FROM python:3.12-slim

WORKDIR /app

# Install uv
RUN pip install uv

# Copy backend files
COPY backend/ /app/backend/
COPY dist/ /app/dist/

WORKDIR /app/backend

# Install dependencies
RUN uv sync

# Expose port
EXPOSE 5000

# Run the application
CMD ["uv", "run", "python", "app.py"]
```

Build and run:
```bash
docker build -t csv-processor .
docker run -p 5000:5000 csv-processor
```

### Environment Variables for Production

For production deployment, consider these environment variables:

```bash
# Disable Flask debug mode
export FLASK_ENV=production
export FLASK_DEBUG=0

# Set the port
export PORT=5000
```

Update `backend/app.py` to use environment variables:
```python
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'False') == 'True'
    app.run(debug=debug, port=port, host='0.0.0.0')
```

## Technologies Used

### Frontend
- React 19.2.0
- Vite 7.2.4
- JavaScript (ES6+)

### Backend
- Python 3.12
- Flask 3.1.2
- Flask-CORS 6.0.1
- uv (package manager)

## API Endpoints

### POST /api/process

Processes CSV file with selected options.

**Request:**
```json
{
  "filename": "data.csv",
  "multiplexing": "byte mask",
  "protocol": "isotp"
}
```

**Response:**
```json
{
  "message": "CSV File: data.csv\nMultiplexing: byte mask\nProtocol: isotp"
}
```