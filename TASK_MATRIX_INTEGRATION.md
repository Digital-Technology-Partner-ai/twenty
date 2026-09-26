# Task matrix integration

## Status, 25 September 2026

The native matrix is running in a separate test CRM on Hudson's Mac mini:

https://hudsons-mac-mini.taild3bcf1.ts.net:8443/objects/tasks?taskLayout=matrix

Sign in with the usual CRM credentials. This is a restored copy. Production
still runs its original image and database on Omar. Hudson approved the design
and authorized a fresh backup and live deployment on 26 September. Deployment
is pending the restricted-role check and access to the locked credential vault.

The reviewing device must be connected to Tailscale. The original loopback
address works only on the Mac mini. Tailscale Serve now provides private HTTPS
on port 8443 and forwards to the local gateway. Existing Tailscale routing on
port 443 is preserved; public Funnel access is not enabled.

The HTTPS sign-in page was verified in fresh Chromium and WebKit sessions with
no failed responses or JavaScript errors. Health and frontend asset requests
also succeeded from Omar over Tailscale. The gateway uses multiple workers
and 2,048 connections per worker to accommodate the parallel asset requests
from the HTTPS proxy. Authenticated matrix acceptance checks below were
completed before changing the staging origin.

The original checkout and prototype remain unchanged. Work is saved in
`/Users/hudsonrebel/twenty-matrix-v2395`, branch `codex/task-matrix-v2395`.

## Backup and isolation

Administrator access used the authorized Omar credential from unlocked
KeePassXC. It was passed through memory and SSH standard input, never printed
or saved in source files. No SSH, sudo or authentication policy was changed.

- Production host: `omar@100.126.181.121`, Linux/AMD64.
- Production image: `dtp-twenty-tooltip:20260924`, immutable identity
  `sha256:db6e106694e70c52ae37b608b28e95394293a501a1680a4848e8f849686dc537`.
- Database: PostgreSQL 16.14, database `default`, user `twenty`.
- Redis: 7.4.9.
- Server backup: `/var/backups/dtp-twenty/matrix-20260925T194420Z.tar`.
- Mac mini backup: `/Users/hudsonrebel/.local/share/dtp-matrix-staging/matrix-20260925T194420Z.tar`.
- Archive SHA-256:
  `2326a93a06a8a9469a94f052bb19b54e88199ac12165a8190f05b6d08a4088ca`.

The backup includes a custom-format database dump, database globals,
attachments, deployment configuration and a private container inventory.
Files and secrets remain outside Git in restricted directories. All archive
checksums verified after transfer. Before app startup, all 107 restored table
counts matched the backup inventory and all 73 attachment hashes matched.
Attachment hashes were unchanged throughout the live backup. Production
remained available during the backup.

Staging has independent database and attachment volumes and a fresh Redis.
There is no worker. Migrations, cron registration, outbound email, mail/calendar
integrations, telemetry and database configuration overrides are disabled.
The CRM, database and Redis share only a Docker-internal network. Runtime
connection attempts from the final CRM container to Internet and Omar test
endpoints failed as expected. A fixed nginx gateway publishes only
`127.0.0.1:3030`. It forwards exclusively to staging.

The exact production application and PostgreSQL images were imported.
Redis's AMD64 binaries failed under QEMU, so staging uses the same Redis 7.4.9
release for ARM64. This is a recorded test-environment difference. The
application still runs the production AMD64 backend with the new frontend.

Final staging image, `dtp-twenty-matrix:staging-20260925`:
`sha256:dc833b3427921f3f0950dc9e6e4421c9aad68153088d03558f8f7b3142f9a42a`.
The production health endpoint was checked again after staging tests and returned
healthy.

## Implementation

Base commit: `1d73bff4495df5c9592e423cc66256594742480d`, the documented
v2.39.5 deployment source with the planned-day change. The tooltip fix is
included. No database entity, GraphQL schema or migration was changed.

Tasks have a Standard view / Impact & effort switch. Matrix mode uses
`taskLayout=matrix`; existing view filters and sorting continue to apply.
It reads task fields and all GTD options from readable workspace metadata.
Project and GTD filters include select all, clear all, search and unassigned
values. Equal scores are grouped, with a separate Unscored tray. Four quadrant
backgrounds retain low/medium/high score positions.

Clicking a card opens Twenty's existing record side panel, or its native task
page on mobile. Edits use existing permissions, field controls, mutations and
cache. Native field appearance follows workspace metadata. The prototype's
sample editor is not used. This Twenty release offers Delete Task, which moves
records to trash; it has no separate Archive action.

Production browser testing caught missing translation catalog entries. The
English catalog and compiled catalogs now include the new labels. Untranslated
locales fall back to English. Matrix cards no longer repeat the score labels
already communicated by their row and column.

## Validation

- 55 tests passed across 11 matrix and record-index suites.
- Pagination exercised 425 records across three pages.
- Required frontend lint and full TypeScript checks passed.
- Production frontend build passed.
- The final restored-data browser check rendered all 25 scored tasks. Its two
  congested groups contained seven and nine cards, showed `3 more` and `5 more`,
  paged the first cue to `3 above`, and expanded a focused card from 38px to
  132px without adding effort or impact pills.
- Synthetic browser checks covered desktop, short and narrow viewports.
- Restored metadata matched all expected fields and all 11 GTD choices.
- Native browser creation and editing passed for title, body, assignee,
  project, effort, impact, GTD tags, due date/time, planned day, status, next
  owner, task type and waiting-on/blocker. Values persisted after reload and
  were checked in the staging database.
- Cards updated after native edits. Project select/clear all, GTD select/clear
  all, all 11 tags plus No tags, OR matching, outside-click dismissal and the
  standard table view passed.
- Table Planned Day shortcuts Today, Tomorrow and Clear from plan passed,
  including persistence. Due-date editing retained its normal picker.
- Native deletion removed the disposable test task from the matrix and set its
  trash timestamp. The test record remains only in staging trash.
- The original staging account password hash was restored after a temporary
  staging-only test login. The temporary credential file was removed.

Hudson completed design review and verified attachment upload/download by
creating a test task and attaching a test file. Restricted-role and final
deployment checks remain before production rollout. Background integrations
are intentionally not exercised in staging.

## After review

1. Address review findings and complete remaining acceptance checks.
2. Take a fresh pre-deployment database, attachment and configuration backup.
3. Deploy the exact tested frontend-overlay image onto the existing live
   database and storage. Never replace production data with staging data.
4. Verify production health and task operations. Keep the current production
   image available for a code-only rollback that preserves live data.

See `packages/twenty-docker/dtp-matrix-staging/README.md` for staging commands,
image identities and recovery details. Private runtime inputs and logs are in
`/Users/hudsonrebel/.local/share/dtp-matrix-staging`.

## Production deployment preparation, 26 September

The exact tested image was exported and copied to Omar at
`/home/omar/.local/share/dtp-matrix-release/matrix-release-selected-a-20260926.tar.gz`.
Local and remote SHA-256 values match:
`8d9e080ee800e4e01964fc4b09e9b0291a4ee0379a8e2a26868222254e28ee1c`.
The release image ID is
`sha256:8e5721f51236447bfbf26363836911a9961486260b5028b09dfffd3e8a426ac2`.
Inspection of the final image layer confirmed that all 1,445 changed files
are under `/app/packages/twenty-server/dist/front/`. All preceding layers
match the current live image. No backend or migration files change.

`deploy-live.py` requires the fresh backup directory and checks its manifest,
checksums and age (under one hour). The import step must tag the tested image
as `dtp-twenty-matrix:20260926`; the script checks that tag's exact image ID.
It compares rendered Compose configurations and allows only `server.image`
to change. It recreates only `server`, waits for health, and checks that live
environment, mounts, ports and the other four service identities are unchanged.
On verification failure it restores the original Compose and server image.

These files are preparation, not evidence of a completed production rollout.
The fresh backup and deployment receipt will be recorded after execution.


Restricted-role test setup was attempted using a disposable staging user.
Native sign-in and workspace token exchange succeeded, but the test API session
returned `Invalid auth context`; denied reads/writes and hidden-field cases are
therefore still unverified. The original task object permissions were restored,
all disposable account/membership/role-target rows were deleted, and temporary
credentials/tokens/cookies were removed. No production state changed.

The selected compact-card design was accepted on 26 September. Every scored
task now remains in the matrix as a 38px row that expands to 132px on hover or
keyboard focus. Each score cell scrolls independently and keeps an explicit
above/below task count visible, so congestion is discoverable without relying
on a transient scrollbar. The repeated effort and impact pills were removed
from matrix cards, score-cell outlines remain absent, and quadrant backgrounds
are ten percent stronger.

Production rollout is pending access to the locked KeePassXC vault on the Mac
mini. The fresh pre-deployment backup has not yet been taken. The final tested
image archive is copied to Omar but has not been imported or deployed.
