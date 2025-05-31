#!/bin/bash
# Script to set up production secrets securely

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== Pomodoro Play Production Secrets Setup ===${NC}"
echo

# Function to generate secure random strings
generate_secret() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
}

# Check if .env already exists
if [ -f .env ]; then
    echo -e "${YELLOW}Warning: .env file already exists${NC}"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Exiting without changes"
        exit 0
    fi
fi

# Copy template
cp .env.production .env

echo -e "${GREEN}Generating secure secrets...${NC}"

# Database
echo -e "${YELLOW}Setting up database credentials...${NC}"
read -p "Enter database name (default: pomodoro_play_prod): " DB_NAME
DB_NAME=${DB_NAME:-pomodoro_play_prod}

read -p "Enter database user (default: pomodoro_user): " DB_USER
DB_USER=${DB_USER:-pomodoro_user}

DB_PASSWORD=$(generate_secret)
echo -e "${GREEN}Generated database password${NC}"

# Redis
REDIS_PASSWORD=$(generate_secret)
echo -e "${GREEN}Generated Redis password${NC}"

# JWT Secrets
JWT_SECRET=$(generate_secret)
JWT_REFRESH_SECRET=$(generate_secret)
echo -e "${GREEN}Generated JWT secrets${NC}"

# Session Secret
SESSION_SECRET=$(generate_secret)
echo -e "${GREEN}Generated session secret${NC}"

# Backup Encryption
BACKUP_ENCRYPTION_KEY=$(generate_secret)
echo -e "${GREEN}Generated backup encryption key${NC}"

# Frontend URL
read -p "Enter your domain (default: pomodoroplay.app): " DOMAIN
DOMAIN=${DOMAIN:-pomodoroplay.app}
FRONTEND_URL="https://$DOMAIN"

# Update .env file
echo -e "${YELLOW}Updating .env file...${NC}"

# Use sed to replace values
sed -i.bak \
    -e "s|DB_NAME=.*|DB_NAME=$DB_NAME|" \
    -e "s|DB_USER=.*|DB_USER=$DB_USER|" \
    -e "s|DB_PASSWORD=.*|DB_PASSWORD=$DB_PASSWORD|" \
    -e "s|REDIS_PASSWORD=.*|REDIS_PASSWORD=$REDIS_PASSWORD|" \
    -e "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" \
    -e "s|JWT_REFRESH_SECRET=.*|JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET|" \
    -e "s|SESSION_SECRET=.*|SESSION_SECRET=$SESSION_SECRET|" \
    -e "s|BACKUP_ENCRYPTION_KEY=.*|BACKUP_ENCRYPTION_KEY=$BACKUP_ENCRYPTION_KEY|" \
    -e "s|FRONTEND_URL=.*|FRONTEND_URL=$FRONTEND_URL|" \
    .env

# Remove backup file
rm -f .env.bak

# Optional services
echo
echo -e "${BLUE}=== Optional Services ===${NC}"
echo "Leave blank to skip any optional service"
echo

# Email service
read -p "Enter SendGrid API key (optional): " EMAIL_API_KEY
if [ ! -z "$EMAIL_API_KEY" ]; then
    sed -i "s|EMAIL_API_KEY=.*|EMAIL_API_KEY=$EMAIL_API_KEY|" .env
fi

# Monitoring
read -p "Enter Sentry DSN (optional): " SENTRY_DSN
if [ ! -z "$SENTRY_DSN" ]; then
    sed -i "s|SENTRY_DSN=.*|SENTRY_DSN=$SENTRY_DSN|" .env
fi

read -p "Enter Google Analytics ID (optional): " GA_ID
if [ ! -z "$GA_ID" ]; then
    sed -i "s|GOOGLE_ANALYTICS_ID=.*|GOOGLE_ANALYTICS_ID=$GA_ID|" .env
fi

# OpenAI
read -p "Enter OpenAI API key (optional): " OPENAI_KEY
if [ ! -z "$OPENAI_KEY" ]; then
    sed -i "s|OPENAI_API_KEY=.*|OPENAI_API_KEY=$OPENAI_KEY|" .env
fi

# Set secure permissions
chmod 600 .env

echo
echo -e "${GREEN}=== Setup Complete ===${NC}"
echo
echo -e "${YELLOW}Important: Save these credentials securely!${NC}"
echo -e "Database Password: ${BLUE}$DB_PASSWORD${NC}"
echo -e "Redis Password: ${BLUE}$REDIS_PASSWORD${NC}"
echo -e "JWT Secret: ${BLUE}$JWT_SECRET${NC}"
echo
echo -e "${GREEN}The .env file has been created with secure permissions (600)${NC}"
echo -e "${YELLOW}Make sure to backup these credentials in a secure password manager${NC}"
echo
echo -e "${BLUE}Next steps:${NC}"
echo "1. Review the .env file and adjust any other settings as needed"
echo "2. Set up SSL certificates in deployment/nginx/ssl/"
echo "3. Run the deployment script: ./deploy.sh"