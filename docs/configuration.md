# Gitea Mirror Configuration Guide

This guide provides detailed information on how to configure Gitea Mirror for your environment.

## Configuration Methods

Gitea Mirror can be configured in two ways:

1. **Environment Variables**: Set configuration options through environment variables
2. **Web UI**: Configure the application through the web interface after installation

## Environment Variables

The following environment variables can be used to configure Gitea Mirror:

| Variable | Description | Default Value | Example |
|----------|-------------|---------------|---------|
| `NODE_ENV` | Node environment (development, production, test) | `development` | `production` |
| `DATABASE_URL` | SQLite database URL | `sqlite://data/gitea-mirror.db` or `sqlite://data/gitea-mirror-dev.db` | `sqlite://path/to/your/database.db` |
| `JWT_SECRET` | Secret key for JWT authentication | `your-secret-key-change-this-in-production` | `your-secure-random-string` |
| `HOST` | Server host | `localhost` | `0.0.0.0` |
| `PORT` | Server port | `3000` | `8080` |
| `USE_MOCK_DATA` | Whether to use mock data (development mode) | `true` in development, `false` in production | `false` |

### Important Security Note

In production environments, you should always set a strong, unique `JWT_SECRET` to ensure secure authentication.

## Web UI Configuration

After installing and starting Gitea Mirror, you can configure it through the web interface:

1. Navigate to `http://your-server:port/`
2. Log in with the default credentials (username: `admin`, password: `password`)
3. Go to the Configuration page

### GitHub Configuration

| Option | Description | Default |
|--------|-------------|---------|
| Username | Your GitHub username | - |
| Token | GitHub personal access token | - |
| Skip Forks | Skip forked repositories | `false` |
| Private Repositories | Include private repositories | `false` |
| Mirror Issues | Mirror issues from GitHub to Gitea | `false` |
| Mirror Starred | Mirror starred repositories | `false` |
| Mirror Organizations | Mirror organization repositories | `false` |
| Only Mirror Orgs | Only mirror organization repositories | `false` |
| Preserve Org Structure | Maintain organization structure in Gitea | `false` |
| Skip Starred Issues | Skip mirroring issues for starred repositories | `false` |

#### GitHub Token Permissions

Your GitHub token needs the following permissions:

- `repo` - Full control of private repositories
- `read:org` - Read organization membership
- `read:user` - Read user profile data

### Gitea Configuration

| Option | Description | Default |
|--------|-------------|---------|
| URL | Gitea server URL | - |
| Token | Gitea access token | - |
| Organization | Default organization for mirrored repositories | - |
| Visibility | Default visibility for mirrored repositories | `public` |
| Starred Repos Org | Organization for starred repositories | `github` |

#### Gitea Token Permissions

Your Gitea token needs the following permissions:

- Repository: Create, Write
- Organization: Create, Write
- Issue: Write (if mirroring issues)

### Schedule Configuration

| Option | Description | Default |
|--------|-------------|---------|
| Enabled | Enable scheduled mirroring | `false` |
| Interval | Mirroring interval in seconds | `3600` (1 hour) |

### Repository Filtering

You can include or exclude repositories using patterns:

- **Include Patterns**: Only repositories matching these patterns will be mirrored
- **Exclude Patterns**: Repositories matching these patterns will be excluded

Patterns support wildcards:
- `*` - Matches any number of characters
- Example: `org-name/*` matches all repositories in the organization `org-name`

## Running in Different Modes

### Development Mode

In development mode (`USE_MOCK_DATA=true`), Gitea Mirror uses a pre-populated database with mock data:

- Sample repositories
- Sample organizations
- Sample mirror jobs and activity logs
- Default configuration
- Test user account (username: `admin`, password: `password`)

This allows developers to work on the UI without setting up GitHub and Gitea accounts.

**Available Scripts:**

```bash
# Run in development mode with mock data
pnpm dev

# Preview production build with mock data
pnpm preview:mock

# Start production server with mock data
pnpm start:mock
```

### Production Mode

In production mode (`USE_MOCK_DATA=false`), Gitea Mirror requires proper configuration:

**Available Scripts:**

```bash
# Run in development mode with real data
pnpm dev:real

# Preview production build with real data
pnpm preview:real

# Start production server with real data
pnpm start
```

1. Set up a GitHub account and create a personal access token
2. Set up a Gitea instance and create an access token
3. Configure Gitea Mirror with these tokens
4. Set up repository filtering as needed
5. Configure automatic mirroring schedule if desired

## Docker Environment Variables

When using Docker, you can set environment variables in your docker-compose.yml file:

```yaml
services:
  gitea-mirror:
    # ...
    volumes:
      - gitea-mirror-prod-data:/app/data  # For database persistence
    environment:
      - NODE_ENV=production
      - DATABASE_URL=sqlite://data/gitea-mirror.db
      - HOST=0.0.0.0
      - PORT=3000
      - JWT_SECRET=your-secure-random-string
      - USE_MOCK_DATA=false

# Define named volumes for database persistence
volumes:
  gitea-mirror-prod-data:  # Production database volume
```

### Database Persistence

To ensure your data persists across container restarts and updates, Gitea Mirror uses Docker volumes:

- **Production Mode**: Uses the `gitea-mirror-prod-data` volume
- **Development Mode**: Uses the `gitea-mirror-dev-data` volume
- **Development-Real Mode**: Uses the `gitea-mirror-dev-real-data` volume

These volumes are automatically created when you use docker-compose. If you're using Docker CLI directly, you need to create the volumes manually:

```bash
docker volume create gitea-mirror-prod-data
```

## Troubleshooting

### Common Issues

1. **Authentication Failures**:
   - Ensure your GitHub and Gitea tokens have the correct permissions
   - Check that the tokens haven't expired

2. **Database Issues**:
   - Ensure the database directory is writable
   - Check that the database URL is correctly formatted

3. **Mirroring Failures**:
   - Check GitHub API rate limits
   - Ensure Gitea server is accessible
   - Verify repository permissions

### Logs

Logs can be found:
- In Docker: `docker logs gitea-mirror`
- In the application: Check the Activity page in the web UI
