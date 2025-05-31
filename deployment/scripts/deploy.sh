#!/bin/bash
# Production deployment script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DEPLOYMENT_DIR="/var/www/pomodoroplay"
BACKUP_BEFORE_DEPLOY=${BACKUP_BEFORE_DEPLOY:-true}
RUN_MIGRATIONS=${RUN_MIGRATIONS:-true}
HEALTH_CHECK_URL="https://pomodoroplay.app/api/health"
HEALTH_CHECK_RETRIES=30
HEALTH_CHECK_DELAY=5

echo -e "${GREEN}Starting production deployment...${NC}"

# 1. Pre-deployment checks
echo -e "${YELLOW}Running pre-deployment checks...${NC}"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found!${NC}"
    echo "Please copy .env.production to .env and fill in your values"
    exit 1
fi

# Check Docker and Docker Compose
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed!${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed!${NC}"
    exit 1
fi

# 2. Backup current deployment
if [ "$BACKUP_BEFORE_DEPLOY" = true ]; then
    echo -e "${YELLOW}Creating backup of current deployment...${NC}"
    docker-compose -f docker-compose.prod.yml run --rm backup /backup.sh
fi

# 3. Pull latest code
echo -e "${YELLOW}Pulling latest code from repository...${NC}"
git pull origin main

# 4. Build new images
echo -e "${YELLOW}Building Docker images...${NC}"
docker-compose -f docker-compose.prod.yml build --no-cache

# 5. Run database migrations
if [ "$RUN_MIGRATIONS" = true ]; then
    echo -e "${YELLOW}Running database migrations...${NC}"
    docker-compose -f docker-compose.prod.yml run --rm backend npx prisma migrate deploy
fi

# 6. Stop current containers
echo -e "${YELLOW}Stopping current containers...${NC}"
docker-compose -f docker-compose.prod.yml down

# 7. Start new containers
echo -e "${YELLOW}Starting new containers...${NC}"
docker-compose -f docker-compose.prod.yml up -d

# 8. Wait for services to be healthy
echo -e "${YELLOW}Waiting for services to be healthy...${NC}"
sleep 10

# 9. Health check
echo -e "${YELLOW}Running health checks...${NC}"
for i in $(seq 1 $HEALTH_CHECK_RETRIES); do
    if curl -f -s "$HEALTH_CHECK_URL" > /dev/null; then
        echo -e "${GREEN}Health check passed!${NC}"
        break
    else
        echo "Health check attempt $i/$HEALTH_CHECK_RETRIES failed, retrying in $HEALTH_CHECK_DELAY seconds..."
        if [ $i -eq $HEALTH_CHECK_RETRIES ]; then
            echo -e "${RED}Health check failed after $HEALTH_CHECK_RETRIES attempts!${NC}"
            echo "Rolling back deployment..."
            docker-compose -f docker-compose.prod.yml down
            docker-compose -f docker-compose.prod.yml up -d
            exit 1
        fi
        sleep $HEALTH_CHECK_DELAY
    fi
done

# 10. Clean up old images
echo -e "${YELLOW}Cleaning up old Docker images...${NC}"
docker image prune -f

# 11. Show deployment status
echo -e "${YELLOW}Deployment status:${NC}"
docker-compose -f docker-compose.prod.yml ps

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "Application is available at: ${GREEN}https://pomodoroplay.app${NC}"

# 12. Show logs (last 50 lines)
echo -e "${YELLOW}Recent logs:${NC}"
docker-compose -f docker-compose.prod.yml logs --tail=50