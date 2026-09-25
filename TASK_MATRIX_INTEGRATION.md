# Task matrix integration

## Status, 25 September 2026

The native frontend implementation and isolated staging configuration are
prepared locally. Production has not been changed. No new production backup
has been taken, and no production database has been restored into staging.

SSH to `omar@100.126.181.121` now works from Hudson's Mac mini using the existing
`~/.ssh/id_ed25519_hudson_to_steves_mbp` key. The host identifies itself as
`omar-macbook-pro`, running Linux. The account has sudo rights, but Docker and
`/opt/dtp/twenty-crm` require administrator privileges and noninteractive sudo
requires a password. Direct root SSH with this key is not permitted.

The remaining blocker is administrator authentication for inventory and backup,
not SSH connectivity. `inspect-live.sh` in the staging directory provides a
read-only inventory for an operator to run with sudo. It prints selected image,
mount and version metadata, never environment values or configuration contents.

Hudson identified the saved Omar credential in KeePassXC on the Mac mini.
KeePassXC is open, but its `DTP-Hudson` database is locked; the user has been
asked to unlock it locally. No password has been copied or recorded. The
inventory script is available on Omar at
`/home/omar/.local/share/dtp-matrix/inspect-live.sh`; its SHA-256 matches the
local copy, and it has not been run with administrator privileges.

## Baseline and scope

- Branch: `codex/task-matrix-v2395`.
- Base: `1d73bff4495df5c9592e423cc66256594742480d`, the documented v2.39.5
  deployment source with the planned-day change.
- The existing tooltip fix is ported into this release's UI component.
- The original prototype and unrelated changes remain in the original checkout.
- No database entity, GraphQL schema, or migration is changed.

Tasks now have a Standard view / Impact & effort switch. The matrix mode is
selected with `taskLayout=matrix` in the URL; existing view filters and sorts
continue to apply. The standard view remains available.

The matrix reads task fields and all GTD options from readable workspace
metadata. Project and GTD filters support select all, clear all, search, and
untagged/unassigned-project tasks. Equal-score tasks are grouped and unscored
tasks have a separate tray. The board has four backgrounds while retaining
low/medium/high score positions. Project colors are assigned consistently by
project ID within the matrix.

Clicking a task opens Twenty's existing record side panel, or its native task
page on mobile. Editing uses Twenty's existing fields, permissions, mutations,
and cache. It does not use the prototype's sample-data editor. Native field
appearance comes from the workspace's field configuration.

## Validation

- 55 tests pass across 11 suites, covering matrix interaction, adapter, metadata,
  pagination, retry and existing record-index behavior.
- Pagination fixture exercises 425 records across three pages.
- Scoped type-aware lint and full frontend TypeScript check.
- Production frontend build using the exact release dependencies.
- Browser checks use the real React matrix with synthetic fixtures. They cover
  desktop, short and narrow viewports, all 11 GTD labels plus No tags, and task
  opening from the unscored dialog. These do not establish live API compatibility.

Server-backed acceptance remains outstanding: save every editable task field,
reload to verify persistence, check permissions with a restricted user, change
scores/projects/tags and verify matrix updates, archive/delete sample tasks,
and confirm the standard views still work.

## Remaining deployment sequence

1. Inventory the live image digest, source revision, database version, storage,
   worker configuration, custom fields and existing patches using read-only
   server commands.
2. Take a consistent database dump and back up attachments and deployment
   configuration. Keep secrets outside Git with restricted file permissions.
   Record checksums, time, PostgreSQL version and live image digest.
3. Restore the dump and attachments into the separate staging volumes, with
   outbound integrations disabled and network isolation verified. Verify the
   restore, schema, row counts and representative attachment hashes.
4. Build the frontend overlay against the verified server image and start
   staging. Use the staging-only URL and database. Perform the acceptance tests
   above, including planned-day and tooltip regressions.
5. Let Hudson review the working staging matrix. Production deployment follows
   that review, using a fresh pre-deployment backup and the exact tested image.
6. Deploy code onto the existing live database, never the staging database.
   Verify health and task operations. Keep the previous image available for a
   code-only rollback that preserves current live data.

See `packages/twenty-docker/dtp-matrix-staging/README.md` for the staging
configuration and restore steps. Its required image and backup inputs must be
verified before use.
