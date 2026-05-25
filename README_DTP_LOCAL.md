# DTP local Twenty CRM

Hudson-installed local Twenty CRM for Digital Technology Partner.

## Purpose

This fork is the DTP-controlled copy of the open-source Twenty CRM codebase. The local Mac mini install is intended to become DTP's internal CRM surface, with Hudson able to read/write CRM records directly via API.

## Cost position

Current setup uses only:

- local Docker Desktop on the Mac mini;
- the open-source Twenty Docker images/configuration;
- local Postgres and Redis containers;
- the DTP GitHub fork.

No paid Twenty Cloud account, paid CRM subscription, or paid third-party service was configured.

## Local URLs

- Web UI: `http://127.0.0.1:3020`
- Internal server port in the container: `3000`

## Local compose command

From `packages/twenty-docker`:

```bash
docker compose -f docker-compose.yml -f docker-compose.dtp-local.yml --env-file .env up -d
```

Health check:

```bash
curl -sS http://127.0.0.1:3020/healthz
```

## Credentials and tokens

Local admin credentials and API tokens are stored outside the repo at:

```text
/Users/hudsonrebel/.hudson/twenty-crm/
```

Do not commit that directory, print token values, or sync it to Google Drive.

## Hudson API helper

Use:

```bash
python3 scripts/dtp-twenty-api.py companies
python3 scripts/dtp-twenty-api.py people
python3 scripts/dtp-twenty-api.py opportunities
python3 scripts/dtp-twenty-api.py tasks
```

The helper reads the local workspace token from `~/.hudson/twenty-crm/workspace-access-token.txt` and talks to `http://127.0.0.1:3020/rest`.

## Smoke-test records created

- Company: Digital Technology Partner
- Person: Steve Shearman / `steve.shearman@digitaltechnologypartner.ai`
- Opportunity: Twenty CRM rollout
- Task: Review Twenty CRM demo setup

These prove create/list behaviour through the local REST API. They are not polished production CRM data yet.

## Known notes

- The first workspace was activated as `Digital Technology Partner CRM`.
- Twenty seeded example CRM records during workspace initialisation; those need removing or replacing before the CRM is treated as clean operational data.
- Email/calendar integrations were not connected because that may require additional OAuth/admin choices and must not create financial cost accidentally.
