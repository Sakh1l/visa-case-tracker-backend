#!/bin/bash

# Start backend
node index.js &
BACKEND_PID=$!

# Start frontend
cd frontend && npm run dev &
FRONTEND_PID=$!

# Function to cleanup on exit
cleanup() {
  echo "Stopping servers..."
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
  exit
}

# Trap Ctrl+C and call cleanup
trap cleanup INT TERM

echo "Backend running on http://localhost:4000"
echo "Frontend running on http://localhost:5173"
echo "Press Ctrl+C to stop both servers"

# Wait for processes
wait
