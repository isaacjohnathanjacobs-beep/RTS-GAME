#!/bin/bash

# Simple script to run the RTS game with a local web server

echo "========================================="
echo "  RTS Game - Local Server Launcher"
echo "========================================="
echo ""

# Check if Python is available
if command -v python3 &> /dev/null; then
    echo "Starting server with Python 3..."
    echo "Game will be available at: http://localhost:8000"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "Starting server with Python..."
    echo "Game will be available at: http://localhost:8000"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    python -m http.server 8000
else
    echo "Python not found. Please install Python or use another method."
    echo ""
    echo "Alternative methods:"
    echo "1. Install Node.js and run: npx http-server -p 8000"
    echo "2. Use VS Code Live Server extension"
    echo "3. Install Python from https://www.python.org/"
    exit 1
fi
