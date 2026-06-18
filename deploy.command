#!/bin/bash
cd "$(dirname "$0")"
echo "🚀 Pubblico su GitHub..."
git add -A
git commit -m "Update site" || echo "Niente da committare."
git push
echo ""
echo "✅ Fatto! Premi Invio per chiudere."
read
