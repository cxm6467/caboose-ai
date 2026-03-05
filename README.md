# caboose-ai

> Claude/Cursor rules manager with automated documentation update service

A Fastify-based service that automatically monitors documentation sources and updates your AI assistant rule files (like `.cursorrules` and `CLAUDE.md`) to keep them current with the latest best practices and API changes.

## Features

- **Automated Documentation Monitoring**: Periodically scrapes specified documentation URLs
- **GitHub Integration**: Automatically creates pull requests with updated rule files
- **Webhook Support**: Responds to GitHub webhooks for event-driven updates
- **Scheduled Updates**: Configurable cron-based scheduling for regular checks
- **Manual Triggers**: REST API endpoint for on-demand updates
- **Health Monitoring**: Built-in health check and status endpoints

## Prerequisites

- Node.js >= 22.0.0
- GitHub Personal Access Token with repo permissions
- GitHub repository containing your rule files

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd caboose-ai

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env
```

## Configuration

Create a `.env` file based on `.env.example`:

```env
# Server Configuration
PORT=3000
HOST=0.0.0.0
NODE_ENV=development
LOG_LEVEL=info

# GitHub Configuration
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_WEBHOOK_SECRET=your_webhook_secret
GITHUB_OWNER=your_github_username
GITHUB_REPO=your_repository_name

# Cron Configuration
UPDATE_SCHEDULE=0 2 * * *

# Documentation Sources (comma-separated)
DOC_SOURCES=https://docs.anthropic.com/claude/docs,https://docs.cursor.com

# Rule Files (comma-separated)
RULES_FILE_PATHS=.cursorrules,CLAUDE.md,.claude/CLAUDE.md
DEFAULT_BRANCH=main
```

## Usage

### Development

```bash
# Run in development mode with hot reload
npm run dev
```

### Production

```bash
# Build the project
npm run build

# Start the production server
npm start
```

### Testing

```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Run end-to-end tests
npm run test:e2e
```

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check

# Type check
npm run typecheck

# Run all CI checks
npm run ci
```

## API Endpoints

### Health Check

```bash
GET /health
```

Returns server health status and scheduler information.

### Service Info

```bash
GET /api/info
```

Returns service configuration and details.

### Manual Update

```bash
POST /api/update
```

Manually triggers a documentation update check.

### Scheduler Status

```bash
GET /api/scheduler/status
```

Returns current scheduler status and schedule.

### GitHub Webhook

```bash
POST /webhook/github
```

Receives GitHub webhook events (requires valid signature).

## GitHub Webhook Setup

1. Go to your repository settings on GitHub
2. Navigate to Webhooks > Add webhook
3. Set Payload URL to: `https://your-domain.com/webhook/github`
4. Set Content type to: `application/json`
5. Set Secret to match your `GITHUB_WEBHOOK_SECRET`
6. Select events: `push`
7. Save webhook

## How It Works

1. **Scheduled Checks**: The service runs on a cron schedule (default: daily at 2 AM)
2. **Documentation Scraping**: Fetches content from configured documentation URLs
3. **Change Detection**: Compares new documentation with previous versions
4. **Rule Updates**: Generates updated rule file content based on latest docs
5. **Pull Request Creation**: Creates a PR with changes for review
6. **Webhook Response**: Can also be triggered by GitHub push events

## Project Structure

```
caboose-ai/
├── src/
│   ├── config/          # Configuration files
│   ├── routes/          # API and webhook routes
│   ├── services/        # Core business logic
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   └── index.ts         # Application entry point
├── tests/
│   ├── unit/            # Unit tests
│   ├── e2e/             # End-to-end tests
│   └── fixtures/        # Test fixtures
├── dist/                # Compiled output
└── package.json
```

## Architecture

The service is built with:

- **Fastify**: High-performance web framework
- **TypeScript**: Type-safe code
- **Octokit**: GitHub API client
- **Cheerio**: HTML parsing for documentation scraping
- **Node-cron**: Scheduled task execution
- **Zod**: Runtime type validation
- **Vitest**: Fast unit testing

## Services

### GitHubService

Handles all GitHub API interactions:
- Fetching repository files
- Creating/updating files
- Managing branches
- Creating pull requests

### ScraperService

Manages documentation fetching:
- HTTP requests to documentation URLs
- HTML parsing and content extraction
- Change comparison between versions

### RulesManagerService

Core orchestration logic:
- Coordinates GitHub and scraper services
- Generates updated rule content
- Manages update workflow

### SchedulerService

Handles scheduled tasks:
- Cron-based scheduling
- Background task execution
- Lifecycle management

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

MIT

## Author

Chris <cxm6467@gmail.com>
