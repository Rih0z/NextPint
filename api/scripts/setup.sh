#!/bin/bash

echo "🚀 NextPint API Setup Script"
echo "============================"

# Check if wrangler is logged in
echo "📝 Checking Cloudflare login status..."
if ! npx wrangler whoami &> /dev/null; then
    echo "⚠️  Not logged in to Cloudflare. Please login:"
    npx wrangler login
fi

# Create D1 database
echo ""
echo "📊 Creating D1 database..."
DB_CREATE_OUTPUT=$(npx wrangler d1 create nextpint-db 2>&1)

if [[ $DB_CREATE_OUTPUT == *"already exists"* ]]; then
    echo "✅ Database already exists"
    # Get existing database ID
    DB_ID=$(npx wrangler d1 list | grep nextpint-db | awk '{print $2}')
else
    echo "✅ Database created successfully"
    # Extract database ID from creation output
    DB_ID=$(echo "$DB_CREATE_OUTPUT" | grep -o '[a-f0-9-]\{36\}')
fi

if [ -z "$DB_ID" ]; then
    echo "❌ Failed to get database ID. Please check the output above and update wrangler.toml manually."
    exit 1
fi

echo "📝 Database ID: $DB_ID"

# Update wrangler.toml with the database ID
echo ""
echo "🔧 Updating wrangler.toml with database ID..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/YOUR_DATABASE_ID/$DB_ID/g" wrangler.toml
else
    # Linux
    sed -i "s/YOUR_DATABASE_ID/$DB_ID/g" wrangler.toml
fi

echo "✅ wrangler.toml updated"

# Initialize database schema
echo ""
echo "🏗️  Initializing database schema..."
npx wrangler d1 execute nextpint-db --file=./schema.sql

# Seed initial data
echo ""
echo "🌱 Seeding initial data..."
npx wrangler d1 execute nextpint-db --file=./seed.sql

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Run 'npm run dev' to start local development"
echo "2. Run 'npm run deploy' to deploy to production"
echo "3. Set up custom domain in Cloudflare dashboard"