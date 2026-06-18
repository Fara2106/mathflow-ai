#!/bin/bash
cd "$(dirname "$0")"
echo "🚀 Pubblico su GitHub..."
git add -A
git commit -m "Update site" || echo "Niente da committare."
git push
echo ""
echo "✅ Fatto! Sito online tra ~1 minuto:"
echo "   https://fara2106.github.io/mathflow-ai/"
echo ""
echo "Premi Invio per chiudere."
read
