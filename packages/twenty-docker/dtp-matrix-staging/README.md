# DTP matrix staging

This directory defines an isolated, local-only staging harness for the exact
v2.39.5 matrix worktree. It is intentionally separate from the production
compose project and publishes only `127.0.0.1:3030`.

Status: pending SSH access, verified production inventory, and a verified
database backup. Do not start this stack until those inputs have been checked.
No production host, production volume, or production network is referenced by
this compose file.

## Required inputs

Provide these through a local env file that is kept outside Git or through the
shell environment. Values are intentionally required by Compose and are not
embedded here:

- `DTP_MATRIX_IMAGE`: exact v2.39.5 image, or the locally built image containing the planned-day and tooltip changes.
- `DTP_MATRIX_DB_IMAGE`: confirmed production-compatible Postgres image. The deployment notes document Postgres 16; set the verified immutable image or `postgres:16` after inventory confirms it.
- `DTP_MATRIX_REDIS_IMAGE`: confirmed compatible Redis image.
- `DTP_MATRIX_BACKUP_DIR`: directory containing the verified database backup; it is mounted read-only at `/backup`.
- `DTP_MATRIX_FILES_BACKUP_DIR`: directory containing the separately verified
  local-storage/attachments backup.
- `DTP_MATRIX_SERVER_URL`: staging URL, normally `http://127.0.0.1:3030`.
- `DTP_MATRIX_DB_NAME`, `DTP_MATRIX_DB_USER`, `DTP_MATRIX_DB_PASSWORD`.
- `DTP_MATRIX_ENCRYPTION_KEY` is required and must be the approved existing key
  that can decrypt the restored database. `DTP_MATRIX_APP_SECRET` is required
  and must be a fresh staging-only secret. `DTP_MATRIX_FALLBACK_ENCRYPTION_KEY`
  is optional; set it only when the verified image and restored configuration
  require it.

The secret values must come from the approved staging secret store or a
temporary local env file. Never commit that file or print its contents.

## Safety properties

- There is no worker service by default.
- Database migrations and cron registration are disabled.
- Email uses the logger driver.
- Gmail, Google Calendar, Microsoft mail, and Microsoft Calendar are disabled.
- Google and Microsoft authentication and IMAP/SMTP/CALDAV integrations are
  disabled.
- The database volume and Docker network have staging-specific names.
- The network is declared Docker-internal. Verify the effective runtime
  network behavior before relying on it as an outbound-connectivity control.
- The only published port is `127.0.0.1:3030`.
- Server local storage uses the independent `dtp-matrix-staging-files` volume.

## Pre-start verification checklist

1. Confirm SSH access and obtain a read-only inventory of the production image,
   Postgres image, Redis image, compose project, and database backup metadata.
2. Confirm the backup is complete, corresponds to the intended deployment, and
   can be inspected without contacting production.
3. Verify the backup checksum and inspect its PostgreSQL version metadata.
   Verify the live image digest and frontend asset manifest before using
   `Dockerfile.frontend-overlay`; reject a mismatched asset manifest.
4. Create a temporary local env file with the required variables above; validate
   that it contains no production hostnames, production volume names, or
   production URLs.
5. Validate the rendered configuration without starting services:

   ```sh
   docker compose --project-name dtp-matrix-staging \
     --env-file /path/to/local-staging.env \
     -f packages/twenty-docker/dtp-matrix-staging/compose.yaml config --quiet
   ```

   Inspect the rendered images, ports, volumes, networks, and environment
   values before proceeding.
6. Restore attachments/local storage only into the independent staging files
   volume, after checking its backup checksum:

   ```sh
   docker run --rm \
     -v dtp-matrix-staging-files:/staging \
     -v "$DTP_MATRIX_FILES_BACKUP_DIR":/backup:ro \
     alpine:3.22 sh -c 'cp -a /backup/. /staging/'
   ```

   This copies files locally and does not alter the database. Verify ownership,
   file counts, and representative attachment hashes before starting `server`.
7. Restore the database backup only into the fresh staging database volume:

   ```sh
   set -a
   . /path/to/local-staging.env
   set +a
   docker compose --project-name dtp-matrix-staging \
     --env-file /path/to/local-staging.env \
     -f packages/twenty-docker/dtp-matrix-staging/compose.yaml up -d db
   docker compose --project-name dtp-matrix-staging \
     --env-file /path/to/local-staging.env \
     -f packages/twenty-docker/dtp-matrix-staging/compose.yaml exec -T db \
     pg_restore --exit-on-error --clean --if-exists --no-owner \
       -U "$DTP_MATRIX_DB_USER" -d "$DTP_MATRIX_DB_NAME" \
       /backup/verified.dump
   ```

   These commands use fixed staging project and service names. Replace only
   `/path/to/local-staging.env` and `/backup/verified.dump` with local paths;
   never point them at a production Docker context or host. Verify row counts,
   schema health, and the independent files volume before starting `server`.

The restore must be a local operation. The database restore container may be
removed after verification, but retain the staging database volume until the
validation record is complete. Do not point any command in this directory at a
production hostname or production Docker context.

## Rollback and cleanup checklist

- Stop the local staging project and preserve the original backup unchanged.
- Record the staging image digest, database image digest, backup checksum, and
  validation results.
- For a production code-only rollback, restore the previously verified image
  selection while retaining the current production database and storage
  volumes. Never restore this staging database or attachments backup into the
  live project.
- If the restore is invalid, stop the staging project, discard only the staging
  database/files volumes, and repeat from fresh copies of the verified backup
  after resolving the finding.
- Production rollback remains the separate procedure documented in
  `packages/twenty-docker/dtp-tooltip-fix/README.md`; this staging definition
  has no production rollback command.

## Frontend overlay

`Dockerfile.frontend-overlay` is a frontend-only overlay for an inventory-
verified base image. It copies the exact `packages/twenty-front/build/`
artifact path established by the repository Dockerfile into the server image,
leaving the backend layer and database untouched. Before use, compare the base
image's release/source revision and frontend assets with the documented
v2.39.5 baseline. Investigate any additional deployed patches before replacing
the frontend. The matrix build will deliberately have different asset hashes;
matching those hashes to the live frontend is not an acceptance test. Verify
API compatibility against the restored database and the exact server image.
Record the base and
resulting image digests after live inventory is available. No image build is
performed by this workflow.

The primary encryption key remains a restore dependency: if restored data was
encrypted with a key unavailable to staging, attachments may copy cleanly while
secrets and tokens remain unreadable. Treat that as a blocker and do not rotate
or replace the key in the restored database.
