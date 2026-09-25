#!/usr/bin/env bash
# Read-only inventory. Does not print environment variables or configuration contents.
set -euo pipefail

crm_directory=/opt/dtp/twenty-crm
if [[ $(id -u) != 0 ]]; then
  echo 'Run this inventory with sudo on Omar.' >&2
  exit 1
fi

hostname
date -u +%Y-%m-%dT%H:%M:%SZ
docker version --format 'Docker server: {{.Server.Version}}'
docker ps --filter "label=com.docker.compose.project.working_dir=$crm_directory" --format '{{.ID}} | {{.Names}} | {{.Image}} | {{.Status}}'
ls -ld "$crm_directory"
find "$crm_directory" -maxdepth 1 -type f -printf '%f\n'
df -h "$crm_directory"

# Container metadata identifies the deployed images and persistent storage.
# Only inspect services whose Compose working directory matches this CRM.
mapfile -t container_ids < <(docker ps -q \
  --filter "label=com.docker.compose.project.working_dir=$crm_directory")
if (( ${#container_ids[@]} == 0 )); then
  echo 'No running containers match the documented CRM working directory; verify the deployment location.' >&2
  exit 1
fi
for container_id in "${container_ids[@]}"; do
  docker inspect --format '{{.Name}} | image={{.Image}} | service={{index .Config.Labels "com.docker.compose.service"}} | mounts={{range .Mounts}}{{.Type}}:{{.Source}}=>{{.Destination}};{{end}}' "$container_id"
  image_id=$(docker inspect --format '{{.Image}}' "$container_id")
  docker image inspect --format '{{.Id}} | digests={{json .RepoDigests}} | platform={{.Os}}/{{.Architecture}}' "$image_id"
done

docker exec dtp-twenty-crm-db-1 sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Atc "SELECT current_database(), current_user, version(), pg_size_pretty(pg_database_size(current_database()));"'
du -sh /var/lib/docker/volumes/dtp-twenty-crm_server-local-data/_data
