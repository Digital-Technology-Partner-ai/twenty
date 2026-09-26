#!/usr/bin/env python3
"""Deploy only the verified matrix frontend, with a fresh backup and rollback."""
import argparse
import datetime
import hashlib
import json
import os
from pathlib import Path
import subprocess
import urllib.request

parser = argparse.ArgumentParser()
parser.add_argument('--backup', required=True)
parser.add_argument('--apply', action='store_true')
args = parser.parse_args()
os.umask(0o077)
if os.geteuid() != 0 or os.uname().nodename != 'omar-macbook-pro':
    raise SystemExit('Run as root only on the verified Omar host')

crm = Path('/opt/dtp/twenty-crm')
compose = crm / 'compose.yaml'
server = 'dtp-twenty-crm-server-1'
old_image = 'sha256:db6e106694e70c52ae37b608b28e95394293a501a1680a4848e8f849686dc537'
new_image = 'sha256:8e5721f51236447bfbf26363836911a9961486260b5028b09dfffd3e8a426ac2'
old_tag = 'dtp-twenty-tooltip:20260924'
new_tag = 'dtp-twenty-matrix:20260926'
protected = ['dtp-twenty-crm-' + name + '-1'
             for name in ['worker', 'db', 'redis', 'mail-relay']]

def capture(*command):
    return subprocess.check_output(command, cwd=crm)

def inspect(name):
    return json.loads(capture('docker', 'inspect', name))[0]

def digest(path):
    result = hashlib.sha256()
    with path.open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
            result.update(chunk)
    return result.hexdigest()

backup = Path(args.backup).resolve()
assert backup.parent == Path('/var/backups/dtp-twenty'), 'Unexpected backup location'
manifest = json.loads((backup / 'manifest.json').read_text())
completed = datetime.datetime.fromisoformat(manifest['completedAt'])
assert 0 <= (datetime.datetime.now(datetime.timezone.utc) - completed).total_seconds() < 3600, 'Take a fresh backup'
assert manifest['images'][server] == old_image, 'Backup must match live baseline'
for name, checksum in manifest['checksums'].items():
    assert digest(backup / name) == checksum, 'Backup checksum mismatch'
assert manifest['attachmentsUnchangedDuringDump'], 'Attachment backup changed during copy'

before = inspect(server)
assert before['Image'] == old_image, 'Live image changed; repeat inventory'
assert before['State']['Health']['Status'] == 'healthy', 'Live server is not healthy'
identities = {name: inspect(name)['Id'] for name in protected}
release = json.loads(capture('docker', 'image', 'inspect', new_tag))[0]
base = json.loads(capture('docker', 'image', 'inspect', old_image))[0]
assert release['Id'] == new_image and release['Architecture'] == 'amd64'
assert release['Os'] == 'linux'
assert release['RootFS']['Layers'][:-1] == base['RootFS']['Layers'], 'Release must add only one layer to the live base'
original = compose.read_bytes()
assert original.count(old_tag.encode()) == 1, 'Unexpected server image configuration'
candidate = original.replace(old_tag.encode(), new_tag.encode())
candidate_path = crm / 'compose.matrix-candidate.yaml'
candidate_path.write_bytes(candidate)
try:
    current_config = json.loads(capture('docker', 'compose', '-f', str(compose), 'config', '--format', 'json'))
    next_config = json.loads(capture('docker', 'compose', '-f', str(candidate_path), 'config', '--format', 'json'))
    assert current_config['services']['server']['image'] == old_tag
    current_config['services']['server']['image'] = new_tag
    assert current_config == next_config, 'Only server.image may change'
finally:
    candidate_path.unlink()

if not args.apply:
    print(json.dumps({'preflight': 'passed', 'backup': str(backup), 'image': new_image,
                      'composeSha256': hashlib.sha256(original).hexdigest()}))
    raise SystemExit(0)

stamp = datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
rollback = crm / ('compose.before-matrix-' + stamp + '.yaml')
rollback.write_bytes(original)
assert compose.read_bytes() == original, 'Compose changed during preflight'
compose.write_bytes(candidate)
command = ['docker', 'compose', '-f', str(compose), 'up', '-d', '--no-deps',
           '--pull', 'never', '--wait', '--wait-timeout', '180', 'server']
try:
    subprocess.run(command, cwd=crm, check=True)
    after = inspect(server)
    assert after['Image'] == new_image
    assert after['State']['Health']['Status'] == 'healthy'
    assert sorted(before['Config']['Env']) == sorted(after['Config']['Env']), 'Live environment changed'
    mounts = lambda container: sorted((m['Source'], m['Destination'], m['RW']) for m in container['Mounts'])
    assert mounts(before) == mounts(after), 'Live storage changed'
    assert before['HostConfig']['PortBindings'] == after['HostConfig']['PortBindings'], 'Live ports changed'
    assert identities == {name: inspect(name)['Id'] for name in protected}, 'Another service was recreated'
    with urllib.request.urlopen('http://127.0.0.1:3020/healthz', timeout=15) as response:
        assert json.load(response)['status'] == 'ok'
    receipt = {'deployedAt': stamp, 'image': new_image, 'backup': str(backup),
               'rollbackCompose': str(rollback), 'otherServicesUnchanged': True,
               'environmentAndStorageUnchanged': True}
    (backup / 'deployment-receipt.json').write_text(json.dumps(receipt, indent=2) + '\n')
except Exception:
    compose.write_bytes(original)
    subprocess.run(command, cwd=crm, check=True)
    assert inspect(server)['Image'] == old_image
    print('Deployment verification failed; original server image restored.')
    raise

print(json.dumps(receipt))
