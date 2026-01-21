# Tadow API

Express.js API server for the Tadow deal intelligence platform.

## Deployment

This API is configured for deployment on Railway.

### Environment Variables

Set these in your Railway dashboard:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` |
| `PORT` | Server port (auto-set by Railway) | `3000` |
| `NODE_ENV` | Environment | `production` |

### Deploy to Railway

1. Connect your GitHub repo to Railway
2. Select the `apps/api` directory as the root
3. Add a PostgreSQL database plugin
4. Set environment variables
5. Deploy!

### Local Development

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/deals` - List all deals
- `GET /api/deals/hot` - Hot deals
- `GET /api/deals/search?q=` - Search deals
- `GET /api/marketplaces` - List marketplaces
- `GET /api/categories` - List categories
