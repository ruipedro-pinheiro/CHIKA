#!/bin/bash
set -e
echo "🎯 Chika Deployment"
docker-compose build
docker-compose up -d
echo "✅ Running at http://localhost:3000"
