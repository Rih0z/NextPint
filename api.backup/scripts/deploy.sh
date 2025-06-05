#!/bin/bash

echo "🚀 NextPint API Deployment Script"
echo "================================="

# Check if wrangler is logged in
echo "📝 Checking Cloudflare login status..."
if ! npx wrangler whoami &> /dev/null; then
    echo "⚠️  Not logged in to Cloudflare. Please login:"
    npx wrangler login
fi

# Check if database ID is set
echo ""
echo "🔍 Checking database configuration..."
if grep -q "YOUR_DATABASE_ID" wrangler.toml; then
    echo "❌ Database ID not configured. Please run './scripts/setup.sh' first."
    exit 1
fi

# Run type check
echo ""
echo "🔍 Running type check..."
npm run type-check
if [ $? -ne 0 ]; then
    echo "❌ Type check failed. Please fix TypeScript errors before deploying."
    exit 1
fi

# Deploy based on environment
if [ "$1" == "dev" ] || [ "$1" == "development" ]; then
    echo ""
    echo "🚀 Deploying to DEVELOPMENT environment..."
    npx wrangler deploy --env development
elif [ "$1" == "prod" ] || [ "$1" == "production" ]; then
    echo ""
    echo "🚀 Deploying to PRODUCTION environment..."
    echo "⚠️  Warning: This will deploy to production. Continue? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        npx wrangler deploy --env production
    else
        echo "❌ Deployment cancelled."
        exit 0
    fi
else
    echo ""
    echo "🚀 Deploying to default environment..."
    npx wrangler deploy
fi

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "📌 Next steps:"
    echo "1. Test your API endpoints"
    echo "2. Set up custom domain in Cloudflare dashboard (if not done)"
    echo "3. Update CORS settings if needed"
else
    echo ""
    echo "❌ Deployment failed. Check the error messages above."
    exit 1
fi