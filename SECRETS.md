# Secrets Required for CI/CD Pipeline

This documents every secret needed by the CI/CD pipeline.

## Comparison: Old vs New

### Old Pipeline (api-deploy.yml + composite action)

The old pipeline required **80+ secrets** passed through the workflow as action inputs,
generated into a `.env` file, and SCPed to the server. Every new env var meant editing
4 files across 3 directories.

### New Pipeline (api-ci.yml)

The new pipeline requires **5 secrets** (per environment). Application secrets live on
the server and are managed out-of-band.

## Secrets Required Per Environment

| Secret | Description | Where to Set |
|--------|-------------|--------------|
| `GITHUB_TOKEN` | Automatic — provided by GitHub Actions | Automatic |
| `SSH_PRIVATE_KEY` | SSH private key for the deployment server | GitHub Environment Secret |
| `SSH_HOSTNAME` | Hostname/IP of the deployment server | GitHub Environment Secret |
| `SSH_USERNAME` | SSH username on the deployment server | GitHub Environment Secret |
| `HOST_KEY` | SSH known_hosts entry for the server | GitHub Environment Secret |

## Application Secrets (Server-Side)

All application configuration (database, Redis, API keys, etc.) lives in a `.env` file
on each deployment server. These are **not** managed by the CI/CD pipeline.

To update application secrets:
1. SSH to the server
2. Edit `~/.env`
3. Restart the app: `docker compose down && docker compose up -d`

Or use Vault/Consul (already running on the servers).

## Bitwarden Secrets Manager

The old pipeline used Bitwarden SM for 7 secrets per environment. In the new pipeline,
these are part of the server-side `.env` and don't flow through the CI/CD pipeline at all.

| Old BW Secret | Now Lives In |
|--------------|-------------|
| MORALIS_STREAMS_SECRET | Server .env |
| HOOKDECK_WEBHOOK_SECRET | Server .env |
| CHILIZ_WEB3PROVIDER_HTTP_URL | Server .env |
| CHILIZ_API_KEY | Server .env |
| BICONOMY_BUNDLER_URL | Server .env |
| BICONOMY_PAYMASTER_API_KEY | Server .env |
| SLACK_GENERAL_ALERTS_WEBHOOK_URL | Server .env |
