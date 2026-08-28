import sys
import os
import uvicorn

# Add Backend root directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app

if __name__ == "__main__":
    app_dir = os.path.dirname(os.path.abspath(__file__))
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8003,
        reload=True,
        reload_dirs=[app_dir, os.path.join(app_dir, "app")]
    )
