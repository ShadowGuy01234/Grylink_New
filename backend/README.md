# Grylink Backend

Node.js/Express backend server for Grylink application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
- Copy `.env` and update values as needed
- PORT: Server port (default: 5000)
- NODE_ENV: Environment (development/production)

## Running the Server

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

## API Endpoints

- `GET /` - Welcome message
- `GET /api/health` - Health check endpoint

## Project Structure

```
backend/
├── index.js        # Main server file
├── .env           # Environment variables
├── .gitignore     # Git ignore rules
└── package.json   # Dependencies and scripts
```
