# DTP matrix staging

The restored test CRM runs on Hudson's Mac mini and is available privately at
https://hudsons-mac-mini.taild3bcf1.ts.net:8443/objects/tasks?taskLayout=matrix.
The reviewing device must be connected to Tailscale. `127.0.0.1:3030` is the
Mac mini's local gateway address; it cannot be used from another device.
Use the usual CRM credentials. Production has not been deployed or migrated.
The implementation and validation record is in `TASK_MATRIX_INTEGRATION.md`.

## Runtime

Use the local `desktop-linux` Docker context. From the worktree root:

```sh
docker --context desktop-linux compose \
  --env-file /Users/hudsonrebel/.local/share/dtp-matrix-staging/staging.env \
  -f packages/twenty-docker/dtp-matrix-staging/compose.yaml ps
```

Use the same command prefix with `up -d --wait` to start staging or `stop` to
stop it. Do not use `down --volumes` while the restored data is needed. The env
file contains secrets; do not print it or commit it.

Private HTTPS is provided by a separate Tailscale Serve listener:

```sh
/Applications/Tailscale.app/Contents/MacOS/Tailscale serve --bg --https=8443 http://127.0.0.1:3030
```

This uses tailnet access, not public Funnel access. The previous port-443
configuration is preserved. `DTP_MATRIX_SERVER_URL` uses the HTTPS origin above,
and nginx preserves its forwarded HTTPS scheme. Multiple nginx workers and
2,048 connections per worker accommodate the parallel asset requests from
HTTPS clients. Fresh Chromium and WebKit sign-in page checks passed.
To remove only the staging
listener, use `tailscale serve --https=8443 off` with the same executable;
do not use `serve reset`, which would remove unrelated routing.

The application and database use the imported Linux/AMD64 images. Redis 7.4.9
uses ARM64 because its AMD64 binaries crash under local QEMU. The application,
DB and Redis connect only to `dtp-matrix-staging-internal`. Runtime egress
checks to Internet and Omar endpoints failed as expected. A fixed nginx
proxy connects that network to `dtp-matrix-staging-ingress` and publishes only
`127.0.0.1:3030`. The proxy forwards only to `server:3000`.

There is no worker. Migrations, cron registration, email delivery, mail/calendar
integrations and telemetry are disabled. Database configuration overrides are
disabled so restored settings cannot reactivate integrations. Staging retains
the approved encryption keys needed by restored records and uses a fresh
APP_SECRET and database password. Its volumes are `dtp-matrix-staging-db` and
`dtp-matrix-staging-files`.

## Verified inputs

- Base application image:
  `sha256:db6e106694e70c52ae37b608b28e95394293a501a1680a4848e8f849686dc537`.
- PostgreSQL 16.14 image:
  `sha256:4b7183ac05f8ef417db21fd72d71047a4238340c261d3cc3ddb6d579ab5071ae`.
- ARM64 Redis 7.4.9 uses index digest
  `redis@sha256:a8f08480e1f88f2647fed492d1178c06abb0d0c1fbf02c682a61e2f483fb3954`.
- nginx uses index digest
  `nginx@sha256:a8b39bd9cf0f83869a2162827a0caf6137ddf759d50a171451b335cecc87d236`.
- Server backup: `/var/backups/dtp-twenty/matrix-20260925T194420Z.tar`.
- Local private archive:
  `/Users/hudsonrebel/.local/share/dtp-matrix-staging/matrix-20260925T194420Z.tar`.
- Archive SHA-256:
  `2326a93a06a8a9469a94f052bb19b54e88199ac12165a8190f05b6d08a4088ca`.

The archive was extracted beside the local archive. Its manifest verifies the
custom-format `database.dump`, globals, attachment archive, file hashes,
deployment config and private container inventory. All 107 table counts and
73 attachment hashes matched after restore. The image export is also retained
in the private local directory. Never print or commit backup/config contents.

`inspect-live.sh` is read-only. `backup-live.py` takes a non-disruptive custom
PostgreSQL dump and checks attachment hashes before and after copying. It is
guarded by the verified host and base image identity. Run it through the
approved Omar SSH/sudo route only after reviewing it. A successful dump still
needs a restore test. Its table counts are captured after the dump snapshot;
any difference on restore needs investigation.

## Fresh restore procedure

These steps are only for newly created, empty staging volumes, not the running
review copy. Verify the Docker context, image identities and backup checksums
first. Configure a private env file using the variables required by
`compose.yaml`. Preserve the original backup unchanged.

```sh
set -a
. /path/to/private-staging.env
set +a
docker --context desktop-linux compose \
  --env-file /path/to/private-staging.env \
  -f packages/twenty-docker/dtp-matrix-staging/compose.yaml config --quiet
```

Start only `db redis`, then restore the database into staging:

```sh
docker --context desktop-linux compose \
  --env-file /path/to/private-staging.env \
  -f packages/twenty-docker/dtp-matrix-staging/compose.yaml exec -T db \
  pg_restore --exit-on-error --single-transaction --no-owner \
    -U "$DTP_MATRIX_DB_USER" -d "$DTP_MATRIX_DB_NAME" /backup/database.dump
```

Restore files with the verified application image, avoiding any production
volume or network:

```sh
docker --context desktop-linux run --rm --network none --platform linux/amd64 \
  --user 0 --entrypoint sh \
  -v dtp-matrix-staging-files:/staging \
  -v "$DTP_MATRIX_BACKUP_DIR":/backup:ro \
  "$DTP_MATRIX_IMAGE" \
  -c 'tar -xzf /backup/attachments.tar.gz -C /staging --strip-components=1 && chown -R 1000:1000 /staging'
```

Compare every restored file with `attachments-sha256.json`, and all table
counts with `table-counts-after-dump.txt`. Verify independent volume mounts and
network isolation before starting `server gateway`. Check health, login, native
task edits, filters and reload persistence. Do not run a worker or enable
integrations against the copied data.

## Frontend build and rollback

`Dockerfile.frontend-overlay` copies the built frontend onto the verified live
application image, preserving the backend. The frontend build deliberately has
new asset hashes. Verify the release baseline and API compatibility; do not
require the new hashes to equal the old ones.

The base is tagged locally as `dtp-twenty-matrix-base:20260925`. Build with
`--platform linux/amd64 --build-arg BASE_IMAGE=dtp-twenty-matrix-base:20260925`
and `-f packages/twenty-docker/dtp-matrix-staging/Dockerfile.frontend-overlay`.
The staging tag is `dtp-twenty-matrix:staging-20260925`; record its immutable
identity after each rebuilt review image.

Production deployment follows user review and a fresh backup. Deploy code onto
the existing live database and attachment volume. A code-only rollback selects
the original verified image while retaining current live data. Never restore
staging data into production. Production Compose/worker configuration needs its
own final review; this file contains only the local staging definition.
