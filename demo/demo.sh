#!/bin/bash
# Demo Preparation Script for HP AI Studio Competition
# This script helps prepare and run the demo for judges

echo "🏆 HP AI Studio Competition - Orpheus Engine Demo Setup"
echo "======================================================="

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js v18+"
    exit 1
fi

NODE_VERSION=$(node --version | sed 's/v//')
if [[ "$(printf '%s\n' "16.0.0" "$NODE_VERSION" | sort -V | head -n1)" != "16.0.0" ]]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please install v16+"
    exit 1
fi
echo "✅ Node.js $NODE_VERSION"

# Check Python (optional)
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version | awk '{print $2}')
    echo "✅ Python $PYTHON_VERSION"
else
    echo "⚠️  Python not found (optional for AI features)"
fi

# Check npm packages
echo "📦 Installing dependencies..."
npm install

# Check if MLFlow is available
if command -v mlflow &> /dev/null; then
    echo "✅ MLFlow available"
    MLFLOW_AVAILABLE=true
else
    echo "⚠️  MLFlow not available (install with: pip install mlflow)"
    MLFLOW_AVAILABLE=false
fi

echo ""
echo "🚀 Demo Options:"
echo "1. Basic Demo (Frontend only)"
echo "2. Full Demo (Frontend + MLFlow)"
echo "3. Test Screenshots (Visual regression)"
echo "4. Run All Tests"
echo ""

read -p "Choose option (1-4): " CHOICE

case $CHOICE in
    1)
        echo "🎵 Starting Basic Demo..."
        echo "Opening Orpheus Engine Workstation..."
        echo "Demo will be available at: http://localhost:5173"
        npm run dev
        ;;
    2)
        if [ "$MLFLOW_AVAILABLE" = true ]; then
            echo "🤖 Starting Full Demo with MLFlow..."
            
            # Start MLFlow in background
            echo "Starting MLFlow tracking server..."
            mlflow server --host 0.0.0.0 --port 5002 --backend-store-uri sqlite:///mlflow.db &
            MLFLOW_PID=$!
            
            # Wait a moment for MLFlow to start
            sleep 3
            
            echo "✅ MLFlow UI: http://localhost:5002"
            echo "✅ Orpheus Engine: http://localhost:5173"
            
            # Start main application
            npm run dev
            
            # Cleanup when done
            kill $MLFLOW_PID 2>/dev/null
        else
            echo "❌ MLFlow not available. Installing..."
            pip3 install mlflow jupyter librosa soundfile numpy pandas scikit-learn
            echo "✅ Please run option 2 again"
        fi
        ;;
    3)
        echo "📸 Running Visual Regression Tests..."
        npm run test:screenshots
        echo "✅ Screenshots available in __snapshots__/screenshots/"
        ;;
    4)
        echo "🧪 Running All Tests..."
        npm test
        npm run lint
        echo "✅ All tests completed"
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "🎬 Demo Tips for Judges:"
echo "========================"
echo "1. Professional DAW Interface: Shows timeline, tracks, clips"
echo "2. Real-time Interactions: Drag clips, edit tracks, adjust settings"
echo "3. TypeScript Integration: Hover over elements to see type safety"
echo "4. Visual Testing: Run 'npm run test:screenshots' to see test coverage"
if [ "$MLFLOW_AVAILABLE" = true ]; then
    echo "5. MLFlow Integration: Check http://localhost:5002 for experiment tracking"
fi
echo ""
echo "📊 Key Features to Highlight:"
echo "- Modern React/TypeScript architecture"
echo "- Electron desktop integration"
echo "- Comprehensive testing suite"
echo "- AI/ML integration readiness"
echo "- Professional audio workstation UI"
echo ""
echo "⏱️  Recommended demo duration: 3 minutes"
echo "🎯 Focus on HP AI Studio integration capabilities"
