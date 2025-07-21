#!/usr/bin/env python3
"""
Photo Editor Pro Launcher
Automatically installs dependencies and starts the photo editor
"""

import subprocess
import sys
import os
import webbrowser
import time
from pathlib import Path

def check_python_version():
    """Check if Python version is 3.7 or higher"""
    if sys.version_info < (3, 7):
        print("❌ Python 3.7 or higher is required!")
        print(f"Current version: {sys.version}")
        return False
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")
    return True

def install_dependencies():
    """Install required dependencies"""
    print("📦 Installing dependencies...")
    
    requirements_file = "photo_editor_requirements.txt"
    if not os.path.exists(requirements_file):
        print(f"❌ Requirements file {requirements_file} not found!")
        return False
    
    try:
        subprocess.check_call([
            sys.executable, "-m", "pip", "install", "-r", requirements_file
        ])
        print("✅ Dependencies installed successfully!")
        return True
    except subprocess.CalledProcessError:
        print("❌ Failed to install dependencies!")
        print("Try running manually: pip install -r photo_editor_requirements.txt")
        return False

def create_directories():
    """Create necessary directories"""
    directories = ['uploads', 'processed', 'templates']
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
    print("✅ Directories created")

def copy_template():
    """Copy HTML template to templates directory"""
    if os.path.exists('photo_editor.html'):
        templates_dir = Path('templates')
        templates_dir.mkdir(exist_ok=True)
        
        # Copy the HTML file to templates directory
        import shutil
        shutil.copy2('photo_editor.html', 'templates/photo_editor.html')
        print("✅ Template copied to templates directory")

def start_server():
    """Start the photo editor server"""
    print("🚀 Starting Photo Editor Pro server...")
    
    if not os.path.exists('photo_editor_backend.py'):
        print("❌ photo_editor_backend.py not found!")
        return False
    
    try:
        # Start the server in a new process
        print("🌐 Server starting at http://localhost:5000")
        print("📸 Opening browser in 3 seconds...")
        
        # Wait a moment then open browser
        def open_browser():
            time.sleep(3)
            webbrowser.open('http://localhost:5000')
        
        import threading
        browser_thread = threading.Thread(target=open_browser)
        browser_thread.daemon = True
        browser_thread.start()
        
        # Start the Flask server
        subprocess.run([sys.executable, "photo_editor_backend.py"])
        
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except FileNotFoundError:
        print("❌ Failed to start server - Python not found in PATH")
    except Exception as e:
        print(f"❌ Error starting server: {e}")

def main():
    """Main launcher function"""
    print("🎨 Photo Editor Pro Launcher")
    print("=" * 40)
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Install dependencies
    if not install_dependencies():
        print("\n⚠️  Dependencies installation failed!")
        print("You can try to run the photo editor anyway, but some features might not work.")
        response = input("Continue anyway? (y/n): ").strip().lower()
        if response != 'y':
            sys.exit(1)
    
    # Create directories
    create_directories()
    
    # Copy template
    copy_template()
    
    print("\n🎉 Setup complete!")
    print("=" * 40)
    
    # Start server
    start_server()

if __name__ == "__main__":
    main()