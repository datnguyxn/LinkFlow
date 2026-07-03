#!/bin/bash

set -e

echo "===================================="
echo " Starting LinkFlow Environment"
echo "===================================="

# Check Docker
if ! command -v docker &> /dev/null
then
    echo "❌ Docker is not installed."
    exit 1
fi

# Check Docker daemon
if ! docker info > /dev/null 2>&1
then
    echo "❌ Docker Desktop is not running."
    exit 1
fi

echo "🐳 Pulling latest images..."
docker compose pull

echo "🏗️ Building containers..."
docker compose build

echo "🚀 Starting containers..."
docker compose up -d

echo ""
echo "📋 Container Status"
docker compose ps

echo ""
echo "🎉 LinkFlow environment is ready!"