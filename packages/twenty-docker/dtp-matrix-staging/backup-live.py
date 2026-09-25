#!/usr/bin/env python3
"""Create a private, non-disruptive backup of the verified Omar CRM."""
import datetime
import hashlib
import json
import os
from pathlib import Path
import subprocess
import tarfile

os.umask(0o077)
if os.geteuid() != 0 or os.uname().nodename != 'omar-macbook-pro':
    raise SystemExit('Run as root only on the verified Omar host')

crm = Path('/opt/dtp/twenty-crm')
server = 'dtp-twenty-crm-server-1'
database = 'dtp-twenty-crm-db-1'
expected_image = 'sha256:db6e106694e70c52ae37b608b28e95394293a501a1680a4848e8f849686dc537'

def capture(*command):
    return subprocess.check_output(command)

server_config = json.loads(capture('docker', 'inspect', server))[0]
if server_config['Image'] != expected_image:
    raise SystemExit('Live image changed; repeat inventory before backup')
files = next(Path(mount['Source']) for mount in server_config['Mounts']
             if mount['Destination'] == '/app/packages/twenty-server/.local-storage')
stamp = datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
root = Path('/var/backups/dtp-twenty')
root.mkdir(mode=0o700, parents=True, exist_ok=True)
backup = root / ('matrix-' + stamp)
backup.mkdir(mode=0o700)

def digest(path):
    result = hashlib.sha256()
    with path.open('rb') as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b''):
            result.update(chunk)
    return result.hexdigest()

def file_manifest():
    return {str(path.relative_to(files)): digest(path)
            for path in sorted(files.rglob('*')) if path.is_file()}

before = file_manifest()
with (backup / 'database.dump').open('wb') as destination:
    subprocess.run(['docker', 'exec', database, 'sh', '-c',
                    'exec pg_dump -Fc -U "$POSTGRES_USER" -d "$POSTGRES_DB"'],
                   stdout=destination, check=True)
with (backup / 'database-globals.sql').open('wb') as destination:
    subprocess.run(['docker', 'exec', database, 'sh', '-c',
                    'exec pg_dumpall --globals-only -U "$POSTGRES_USER"'],
                   stdout=destination, check=True)
with tarfile.open(backup / 'attachments.tar.gz', 'w:gz') as archive:
    archive.add(files, arcname='local-storage')
after = file_manifest()
if before != after:
    raise SystemExit('Attachment files changed during backup; retain incomplete backup and retry')
(backup / 'attachments-sha256.json').write_text(json.dumps(after, indent=2) + '\n')

with tarfile.open(backup / 'deployment-config.tar.gz', 'w:gz') as archive:
    for path in sorted(crm.iterdir()):
        if path.is_file():
            archive.add(path, arcname=str(path.relative_to(crm)))
    for relative in ['mail-relay/secrets', 'mail-relay/tokens']:
        if (crm / relative).exists():
            archive.add(crm / relative, arcname=relative)

containers = [server, 'dtp-twenty-crm-worker-1', database,
              'dtp-twenty-crm-redis-1', 'dtp-twenty-crm-mail-relay-1']
configs = json.loads(capture('docker', 'inspect', *containers))
# This private file contains deployment secrets. Never print or commit it.
(backup / 'containers-private.json').write_text(json.dumps(configs, indent=2) + '\n')

query = """SELECT format('SELECT %L, %L, count(*) FROM %I.%I;',
 schemaname, tablename, schemaname, tablename) FROM pg_tables
 WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
 ORDER BY schemaname, tablename;"""
def sql(statement):
    return subprocess.check_output(['docker', 'exec', '-i', database, 'sh', '-c',
        'exec psql -X -v ON_ERROR_STOP=1 -At -U "$POSTGRES_USER" -d "$POSTGRES_DB"'], input=statement)
counts = sql(sql(query.encode()))
(backup / 'table-counts-after-dump.txt').write_bytes(counts)
manifest = {
    'startedAt': stamp,
    'completedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'host': os.uname().nodename,
    'databaseVersion': capture('docker', 'exec', database, 'postgres', '--version').decode().strip(),
    'images': {config['Name'].lstrip('/'): config['Image'] for config in configs},
    'attachmentCount': len(after),
    'attachmentsUnchangedDuringDump': True,
    'rowCountNote': 'Counts captured after pg_dump, not inside its snapshot; investigate any difference on restore.',
    'checksums': {path.name: digest(path) for path in sorted(backup.iterdir()) if path.is_file()},
}
(backup / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
with tarfile.open(str(backup) + '.tar', 'w') as archive:
    archive.add(backup, arcname=backup.name)
print(json.dumps({'backup': str(backup), 'archive': str(backup) + '.tar',
                  'archiveSha256': digest(Path(str(backup) + '.tar')),
                  'attachmentCount': len(after), 'tableCount': len(counts.splitlines())}))
