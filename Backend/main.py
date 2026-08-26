import sys
import os
import uvicorn

# Add Backend root directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend_app.main import app

if __name__ == "__main__":
    uvicorn.run("backend_app.main:app", host="127.0.0.1", port=8003, reload=True)
