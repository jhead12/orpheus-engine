#!/bin/bash

# Orpheus Audio Analysis Demo Launcher
# HP AI Studio Competition Entry

echo "🎵 Orpheus Audio Analysis Demo - HP AI Studio Competition"
echo "=========================================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "start_demo.py" ]; then
    echo -e "${RED}❌ Error: start_demo.py not found. Please run this script from the demo directory.${NC}"
    exit 1
fi

# Check for Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is required but not installed.${NC}"
    exit 1
fi

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is required but not installed.${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Checking dependencies...${NC}"

# Check if MLflow is installed
if ! python3 -c "import mlflow" 2>/dev/null; then
    echo -e "${YELLOW}⚠️  MLflow not found. Installing Python dependencies...${NC}"
    pip3 install -r requirements.txt
else
    echo -e "${GREEN}✅ MLflow is available${NC}"
fi

# Check if demo frontend is built
if [ ! -d "audio-analysis-demo/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Demo frontend dependencies not found. Installing...${NC}"
    cd audio-analysis-demo
    npm install
    cd ..
else
    echo -e "${GREEN}✅ Demo frontend dependencies are available${NC}"
fi

# Check for available ports
echo -e "${BLUE}🔍 Checking available ports...${NC}"

# Check if port 5000 is available for MLflow
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}⚠️  Port 5000 is in use. MLflow may not start properly.${NC}"
else
    echo -e "${GREEN}✅ Port 5000 is available for MLflow${NC}"
fi

# Check if port 3001 is available for demo frontend
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}⚠️  Port 3001 is in use. Demo frontend may not start properly.${NC}"
else
    echo -e "${GREEN}✅ Port 3001 is available for demo frontend${NC}"
fi

echo ""
echo -e "${GREEN}🚀 Starting Orpheus Audio Analysis Demo...${NC}"
echo ""

# Ask user for launch method
echo "Choose launch method:"
echo "1) Integrated Python launcher (Recommended)"
echo "2) Manual launch (separate terminals)"
echo "3) Frontend only"
echo "4) MLflow only"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo -e "${BLUE}🚀 Starting integrated demo...${NC}"
        python3 start_demo.py
        ;;
    2)
        echo -e "${BLUE}📋 Manual launch instructions:${NC}"
        echo ""
        echo "Terminal 1 - MLflow Server:"
        echo "  cd $(pwd)"
        echo "  mlflow ui --host 0.0.0.0 --port 5000"
        echo ""
        echo "Terminal 2 - Demo Frontend:"
        echo "  cd $(pwd)/audio-analysis-demo"
        echo "  npm run dev"
        echo ""
        echo "Then visit:"
        echo "  🎵 Demo: http://localhost:3001"
        echo "  📊 MLflow: http://localhost:5000"
        ;;
    3)
        echo -e "${BLUE}🎵 Starting frontend only...${NC}"
        cd audio-analysis-demo
        npm run dev
        ;;
    4)
        echo -e "${BLUE}📊 Starting MLflow only...${NC}"
        mlflow ui --host 0.0.0.0 --port 5000
        ;;
    *)
        echo -e "${RED}❌ Invalid choice. Please run the script again.${NC}"
        exit 1
        ;;
esac
