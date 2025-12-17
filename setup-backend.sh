#!/bin/bash

# SafeWander Setup Script for Unix/Linux/Mac
# Run this script to set up the backend database and seed it with demo data

echo "🚀 SafeWander Backend Setup"
echo "================================"
echo ""

# Check if Python is installed
echo "Checking Python installation..."
if command -v python3 &> /dev/null; then
    PYTHON_CMD=python3
    echo "✓ Python found: $(python3 --version)"
elif command -v python &> /dev/null; then
    PYTHON_CMD=python
    echo "✓ Python found: $(python --version)"
else
    echo "✗ Python not found. Please install Python 3.8 or higher"
    exit 1
fi

# Navigate to backend directory
echo ""
echo "Setting up backend environment..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    $PYTHON_CMD -m venv venv
    echo "✓ Virtual environment created"
else
    echo "✓ Virtual environment already exists"
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo ""
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Initialize database
echo ""
echo "Initializing database..."
$PYTHON_CMD -c "import asyncio; from database import init_db; asyncio.run(init_db())"
echo "✓ Database initialized"

# Seed database with demo data
echo ""
echo "Seeding database with demo data..."
cd ..
$PYTHON_CMD scripts/seed_database.py
echo "✓ Database seeded successfully"

echo ""
echo "================================"
echo "✓ Backend setup complete!"
echo ""
echo "To start the backend server, run:"
echo "  cd backend"
echo "  source venv/bin/activate"
echo "  uvicorn main:app --reload"
echo ""
