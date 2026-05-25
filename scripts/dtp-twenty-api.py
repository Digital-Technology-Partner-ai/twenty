#!/usr/bin/env python3
"""Small DTP helper for Hudson to interact with local Twenty CRM.

Reads a local workspace token from ~/.hudson/twenty-crm/workspace-access-token.txt.
Never prints token values.
"""

from __future__ import annotations

import json
import sys
import urllib.error
import urllib.request
from pathlib import Path

BASE_URL = "http://127.0.0.1:3020/rest"
TOKEN_PATH = Path.home() / ".hudson" / "twenty-crm" / "workspace-access-token.txt"


def token() -> str:
    if not TOKEN_PATH.exists():
        raise SystemExit(f"Missing token file: {TOKEN_PATH}")
    return TOKEN_PATH.read_text().strip()


def call(method: str, path: str, payload: dict | None = None) -> dict:
    data = json.dumps(payload).encode() if payload is not None else None
    request = urllib.request.Request(
        f"{BASE_URL}/{path.lstrip('/')}",
        data=data,
        method=method,
        headers={
            "Authorization": f"Bearer {token()}",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return json.loads(response.read().decode())
    except urllib.error.HTTPError as exc:
        body = exc.read().decode()
        raise SystemExit(f"Twenty API error {exc.code}: {body}") from exc


def list_object(name: str, limit: int = 10) -> None:
    print(json.dumps(call("GET", f"/{name}?limit={limit}"), indent=2))


def create_company(name: str, domain: str = "") -> None:
    payload: dict = {"name": name}
    if domain:
        payload["domainName"] = {"primaryLinkUrl": domain}
    print(json.dumps(call("POST", "/companies", payload), indent=2))


def create_person(first: str, last: str, email: str) -> None:
    payload = {
        "name": {"firstName": first, "lastName": last},
        "emails": {"primaryEmail": email},
    }
    print(json.dumps(call("POST", "/people", payload), indent=2))


def usage() -> None:
    print(
        "Usage:\n"
        "  dtp-twenty-api.py companies|people|opportunities|tasks [limit]\n"
        "  dtp-twenty-api.py create-company <name> [domain]\n"
        "  dtp-twenty-api.py create-person <first> <last> <email>"
    )


def main(argv: list[str]) -> int:
    if len(argv) < 2:
        usage()
        return 2
    cmd = argv[1]
    if cmd in {"companies", "people", "opportunities", "tasks"}:
        list_object(cmd, int(argv[2]) if len(argv) > 2 else 10)
        return 0
    if cmd == "create-company" and len(argv) >= 3:
        create_company(argv[2], argv[3] if len(argv) > 3 else "")
        return 0
    if cmd == "create-person" and len(argv) == 5:
        create_person(argv[2], argv[3], argv[4])
        return 0
    usage()
    return 2


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
