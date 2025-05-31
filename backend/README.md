# PomoMate Backend

Backend API for the PomoMate mobile application.

## Tech Stack

- **Node.js** (v18+) with ES modules
- **Express.js** - Web framework
- **Prisma** - ORM for PostgreSQL
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **Redis** - Caching (optional)
- **PostgreSQL** - Database

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Configure your `.env` file with your database credentials and other settings.

4. Run database migrations:
```bash
npx prisma generate
npx prisma migrate dev
```

5. Seed the database (optional):
```bash
npm run seed
```

## Development

Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:3000` by default.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Sessions
- `POST /api/sessions` - Record completed session
- `GET /api/sessions` - Get user's sessions
- `GET /api/sessions/stats` - Get session statistics

### Team Sessions
- `POST /api/sessions/team` - Create team session
- `GET /api/sessions/team/:id` - Get team session
- `PUT /api/sessions/team/:id/join` - Join team session
- `PUT /api/sessions/team/:id/leave` - Leave team session
- `PUT /api/sessions/team/:id/status` - Update status (host only)
- `POST /api/sessions/team/:id/messages` - Send message

### Users
- `GET /api/users/:id/stats` - Get user statistics
- `GET /api/users/:id/achievements` - Get achievements
- `PUT /api/users/:id/character` - Update character
- `GET /api/users/leaderboard` - Get leaderboard

### Social
- `GET /api/social/friends` - Get friends list
- `POST /api/social/friends/request` - Send friend request
- `PUT /api/social/friends/request/:id/accept` - Accept request
- `DELETE /api/social/friends/:id` - Remove friend
- `GET /api/social/notifications` - Get notifications

### Games
- `GET /api/games` - Get available games
- `GET /api/games/:id/scores` - Get leaderboard
- `POST /api/games/:id/scores` - Submit score

### Settings
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update settings

## WebSocket Events

### Team Session Events
- `team:join` - Join team session room
- `team:leave` - Leave team session room
- `team:ready` - Update ready status
- `team:timer-sync` - Sync timer state (host only)
- `team:message` - Send chat message
- `team:voice-*` - WebRTC signaling for voice chat

## Database Schema

The database schema is defined in `prisma/schema.prisma`. Key models include:
- User - User accounts and stats
- Session - Individual pomodoro sessions
- TeamSession - Collaborative sessions
- Achievement - Available achievements
- Friend - Friend relationships
- Notification - User notifications

## Testing

Run tests:
```bash
npm test
```

## Production

1. Build for production:
```bash
npm run build
```

2. Start production server:
```bash
npm start
```

## Deployment

### Using Docker:
```bash
docker build -t pomomate-backend .
docker run -p 3000:3000 --env-file .env pomomate-backend
```

### Using PM2:
```bash
pm2 start src/server.js --name pomodoro-backend
```

## Security

- JWT tokens for authentication
- Rate limiting on auth endpoints
- Input validation with Joi
- SQL injection prevention via Prisma
- CORS configured for mobile app
- Helmet.js for security headers