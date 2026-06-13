#!/usr/bin/env python3
"""Deploy latest source to VPS via SSH + docker exec rebuild."""

import os
import sys
import tarfile
import io
import paramiko

HOST = "173.230.129.159"
USER = "root"
PASSWORD = "kujua@300@2026"
REMOTE_DIR = "/opt/kujuatube"
LOCAL_DIR = os.path.dirname(os.path.abspath(__file__))

EXCLUDE = {
    "node_modules", ".git", "dist", "build", ".env",
    "__pycache__", ".DS_Store", "storage"
}


def make_tarball():
    buf = io.BytesIO()
    with tarfile.open(fileobj=buf, mode="w:gz") as tar:
        for root, dirs, files in os.walk(LOCAL_DIR):
            dirs[:] = [d for d in dirs if d not in EXCLUDE]
            for fname in files:
                if fname in EXCLUDE:
                    continue
                full = os.path.join(root, fname)
                rel = os.path.relpath(full, LOCAL_DIR)
                tar.add(full, arcname=rel)
    buf.seek(0)
    return buf


def run(client, cmd, check=True):
    print(f"  $ {cmd}")
    _, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode()
    err = stderr.read().decode()
    if out:
        print(out, end="")
    if err:
        print(err, end="", file=sys.stderr)
    code = stdout.channel.recv_exit_status()
    if check and code != 0:
        raise RuntimeError(f"Command failed (exit {code}): {cmd}")
    return code


def main():
    print(f"Connecting to {HOST}...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, username=USER, password=PASSWORD, timeout=15)

    print("Building tarball...")
    tarball = make_tarball()

    print(f"Uploading source to {REMOTE_DIR}...")
    sftp = client.open_sftp()
    run(client, f"mkdir -p {REMOTE_DIR}")
    remote_tar = f"{REMOTE_DIR}/_deploy.tar.gz"
    sftp.putfo(tarball, remote_tar)
    sftp.close()

    print("Extracting on server...")
    # Preserve server/.env if it exists before extraction
    run(client, f"[ -f {REMOTE_DIR}/server/.env ] && cp {REMOTE_DIR}/server/.env /tmp/_kujua_env_backup || true", check=False)
    run(client, f"tar -xzf {remote_tar} -C {REMOTE_DIR} --overwrite")
    run(client, f"rm -f {remote_tar}")
    # Restore server/.env (extraction won't create it since it's gitignored)
    run(client, f"[ -f /tmp/_kujua_env_backup ] && cp /tmp/_kujua_env_backup {REMOTE_DIR}/server/.env || true", check=False)
    # Create a minimal server/.env if it still doesn't exist
    run(client, (
        f"[ -f {REMOTE_DIR}/server/.env ] || "
        f"echo 'JWT_SECRET=kujuatime-secret-2026\nCORS_ORIGIN=*\nREDIS_URL=redis://redis:6379' "
        f"> {REMOTE_DIR}/server/.env"
    ), check=False)

    print("Rebuilding and restarting containers...")
    run(client, f"cd {REMOTE_DIR} && docker compose -f docker-compose.deploy.yml build --no-cache client server nginx 2>&1 | tail -20")
    run(client, f"cd {REMOTE_DIR} && docker compose -f docker-compose.deploy.yml up -d --force-recreate client server nginx")

    print("Waiting for containers...")
    run(client, "sleep 4")
    run(client, f"cd {REMOTE_DIR} && docker compose -f docker-compose.deploy.yml ps", check=False)

    client.close()
    print("\nDone.")


if __name__ == "__main__":
    main()
