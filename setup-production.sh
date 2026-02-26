#!/bin/bash

# ═══════════════════════════════════════════════════════════
# Production Setup Script - Omekan Events Platform
# ═══════════════════════════════════════════════════════════

set -e

echo "🚀 Omekan Events - Production Setup"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file already exists. Backing up to .env.backup${NC}"
    cp .env .env.backup
fi

# Copy .env.example to .env
echo "📝 Creating .env file from template..."
cp .env.example .env

# Generate secure secrets
echo ""
echo "🔐 Generating secure secrets..."
echo ""

# Generate JWT Secret (64 characters)
JWT_SECRET=$(openssl rand -hex 32)
echo -e "${GREEN}✅ JWT_SECRET generated${NC}"

# Generate DB Password (32 characters)
DB_PASSWORD=$(openssl rand -base64 24 | tr -d "=+/" | cut -c1-32)
echo -e "${GREEN}✅ DB_PASSWORD generated${NC}"

# Update .env file with generated secrets
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/your-jwt-secret-here-min-32-chars/$JWT_SECRET/" .env
    sed -i '' "s/your-secure-password-here-min-16-chars/$DB_PASSWORD/" .env
else
    # Linux
    sed -i "s/your-jwt-secret-here-min-32-chars/$JWT_SECRET/" .env
    sed -i "s/your-secure-password-here-min-16-chars/$DB_PASSWORD/" .env
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ Secrets generated successfully!"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. 📧 Email Service Setup (SendGrid):"
echo "   - Create account: https://signup.sendgrid.com/"
echo "   - Verify sender identity"
echo "   - Generate API key"
echo "   - Update .env with:"
echo "     SENDGRID_API_KEY=your-api-key"
echo "     SENDGRID_FROM_EMAIL=noreply@yourdomain.com"
echo ""
echo "2. 🎵 Spotify Integration (Optional):"
echo "   - Create app: https://developer.spotify.com/dashboard"
echo "   - Update .env with:"
echo "     SPOTIFY_CLIENT_ID=your-client-id"
echo "     SPOTIFY_CLIENT_SECRET=your-client-secret"
echo ""
echo "3. 🌐 Production URLs:"
echo "   - Update FRONTEND_URL in .env"
echo "   - Update CORS_ORIGIN in .env"
echo "   - Update VITE_API_URL in .env"
echo ""
echo "4. 🐳 Docker Deployment:"
echo "   - Run: docker compose up -d"
echo "   - Check logs: docker compose logs -f"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT SECURITY NOTES:${NC}"
echo "   - Never commit .env to Git!"
echo "   - Keep your secrets secure"
echo "   - Use strong passwords for production"
echo "   - Enable HTTPS in production"
echo ""
echo "═══════════════════════════════════════════════════════════"
