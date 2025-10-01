#!/usr/bin/env python3
"""
Start the Flask backend server for the Car Price Prediction API
"""
import subprocess
import sys
import os

def start_backend():
    """Start the Flask backend server"""
    backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
    
    # Change to backend directory
    os.chdir(backend_dir)
    
    # Install requirements if needed
    print("Installing backend dependencies...")
    subprocess.run([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'], check=True)
    
    # Start Flask server
    print("Starting Flask backend server...")
    subprocess.run([sys.executable, 'app.py'])

if __name__ == '__main__':
    start_backend()
