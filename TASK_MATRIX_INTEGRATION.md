# Task matrix integration

## Status, 25 September 2026

The native matrix is running in a separate test CRM on Hudson's Mac mini:

http://127.0.0.1:3030/objects/tasks?taskLayout=matrix

Sign in with the usual CRM credentials. This is a restored copy. Production
still runs its original image and database on Omar. Deployment waits for
Hudson's review of staging.

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
locales fall back to English. Narrow cards keep score pills on one line.

## Validation

- 55 tests passed across 11 matrix and record-index suites.
- Pagination exercised 425 records across three pages.
- Required frontend lint and full TypeScript checks passed.
- Production frontend build passed.
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

User review, testing with a restricted-permission account and final deployment
checks remain before production rollout. Background integrations are
intentionally not exercised in staging. Attachment contents were verified by
hash; a browser upload/download check remains part of final acceptance.

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
