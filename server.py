#!/usr/bin/env python3
"""Loopback-only BountyPilot helper for one explicitly authorized passive HEAD check."""

from __future__ import annotations

import http.client
import ipaddress
import json
import os
import re
import socket
import ssl
import threading
import time
from datetime import datetime, timezone
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit

ROOT = os.path.dirname(os.path.abspath(__file__))
HOST = "127.0.0.1"
PORT = 8765
MAX_BODY = 4096
TIMEOUT_SECONDS = 6
MIN_INTERVAL_SECONDS = 30
last_request_by_host: dict[str, float] = {}
rate_lock = threading.Lock()


def public_addresses(host: str, port: int) -> list[tuple[int, str]]:
    """Resolve once and reject the whole name if any answer is non-public."""
    try:
        answers = socket.getaddrinfo(host, port, type=socket.SOCK_STREAM)
    except OSError as exc:
        raise ValueError("DNS resolution failed") from exc
    addresses: list[tuple[int, str]] = []
    for family, _socktype, _proto, _canonname, sockaddr in answers:
        address = ipaddress.ip_address(sockaddr[0].split("%", 1)[0])
        if not address.is_global:
            raise ValueError("The target resolves to a private, reserved, or non-public address")
        pair = (family, address.compressed)
        if pair not in addresses:
            addresses.append(pair)
    if not addresses:
        raise ValueError("No usable public IP address was returned")
    return addresses


class PinnedHTTPSConnection(http.client.HTTPSConnection):
    def __init__(self, host: str, port: int, ip: str, *, timeout: float):
        super().__init__(host, port, timeout=timeout, context=ssl.create_default_context())
        self.pinned_ip = ip

    def connect(self) -> None:
        raw = socket.create_connection((self.pinned_ip, self.port), self.timeout)
        try:
            self.sock = self._context.wrap_socket(raw, server_hostname=self.host)
        except Exception:
            raw.close()
            raise


class PinnedHTTPConnection(http.client.HTTPConnection):
    def __init__(self, host: str, port: int, ip: str, *, timeout: float):
        super().__init__(host, port, timeout=timeout)
        self.pinned_ip = ip

    def connect(self) -> None:
        self.sock = socket.create_connection((self.pinned_ip, self.port), self.timeout)


def clean_header(value: str, limit: int = 300) -> str:
    return re.sub(r"[\r\n\x00-\x1f\x7f]", " ", value).strip()[:limit]


def passive_head(url_value: str, exact_host: str) -> dict:
    parsed = urlsplit(url_value)
    if parsed.scheme not in ("http", "https") or not parsed.hostname:
        raise ValueError("Only absolute HTTP(S) URLs are supported")
    if parsed.username or parsed.password or parsed.query or parsed.fragment:
        raise ValueError("Credentials, query strings, and fragments are not accepted")
    if parsed.hostname.lower().rstrip(".") != exact_host.lower().rstrip("."):
        raise ValueError("Target hostname does not exactly match the accepted host")
    try:
        port = parsed.port or (443 if parsed.scheme == "https" else 80)
    except ValueError as exc:
        raise ValueError("Invalid target port") from exc
    if port != (443 if parsed.scheme == "https" else 80):
        raise ValueError("Only the scheme's standard port is allowed")

    addresses = public_addresses(parsed.hostname, port)
    family, ip = addresses[0]
    del family
    now = time.monotonic()
    with rate_lock:
        if len(last_request_by_host) > 4096:
            cutoff = now - MIN_INTERVAL_SECONDS
            for key in [key for key, value in last_request_by_host.items() if value < cutoff]:
                last_request_by_host.pop(key, None)
        previous = last_request_by_host.get(parsed.hostname.lower(), 0)
        if now - previous < MIN_INTERVAL_SECONDS:
            raise ValueError("One passive check per hostname is allowed every 30 seconds")
        last_request_by_host[parsed.hostname.lower()] = now

    connection_type = PinnedHTTPSConnection if parsed.scheme == "https" else PinnedHTTPConnection
    connection = connection_type(parsed.hostname, port, ip, timeout=TIMEOUT_SECONDS)
    path = parsed.path or "/"
    try:
        # HEAD only: no request body, cookies, authorization header, or redirect following.
        connection.request("HEAD", path, headers={"User-Agent": "BountyPilot-Passive-Review/1.0", "Accept": "*/*", "Connection": "close"})
        response = connection.getresponse()
        raw_headers = response.getheaders()
        status = response.status
        reason = clean_header(response.reason or "", 120)
        peer_certificate = connection.sock.getpeercert() if parsed.scheme == "https" and connection.sock else {}
        response.close()
    except (OSError, ssl.SSLError, http.client.HTTPException, TimeoutError) as exc:
        raise ValueError(f"The passive HEAD request failed: {type(exc).__name__}") from exc
    finally:
        connection.close()

    grouped: dict[str, list[str]] = {}
    for key, value in raw_headers:
        grouped.setdefault(key.lower(), []).append(value)
    headers = {key: clean_header(values[-1]) for key, values in grouped.items()}
    set_cookies = grouped.get("set-cookie", [])
    cookie_flags = []
    for value in set_cookies[:20]:
        parts = [part.strip().lower() for part in value.split(";")[1:]]
        cookie_flags.append({"secure": "secure" in parts, "httpOnly": "httponly" in parts, "sameSite": any(part.startswith("samesite=") for part in parts)})

    csp = headers.get("content-security-policy", "")
    xfo = headers.get("x-frame-options", "")
    location = headers.get("location", "")
    redirect_host = urlsplit(location).hostname if location else None
    tls_expires_at = None
    tls_days_remaining = None
    if peer_certificate.get("notAfter"):
        expiry = datetime.fromtimestamp(ssl.cert_time_to_seconds(peer_certificate["notAfter"]), timezone.utc)
        tls_expires_at = expiry.isoformat()
        tls_days_remaining = (expiry - datetime.now(timezone.utc)).days
    return {
        "checkedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "method": "HEAD",
        "url": f"{parsed.scheme}://{parsed.netloc}{path}",
        "status": status,
        "reason": reason,
        "tlsVerified": parsed.scheme == "https",
        "tlsExpiresAt": tls_expires_at,
        "tlsDaysRemaining": tls_days_remaining,
        "resolvedAddressCount": len(addresses),
        "headers": {key: headers[key] for key in ("strict-transport-security", "content-security-policy", "x-content-type-options", "x-frame-options", "referrer-policy", "permissions-policy", "access-control-allow-origin", "server", "x-powered-by", "content-type", "cache-control") if key in headers},
        "checks": {
            "https": parsed.scheme == "https",
            "hstsPresent": "strict-transport-security" in headers,
            "cspPresent": "content-security-policy" in headers,
            "nosniffPresent": headers.get("x-content-type-options", "").lower() == "nosniff",
            "frameProtectionPresent": "frame-ancestors" in csp.lower() or bool(xfo),
            "referrerPolicyPresent": "referrer-policy" in headers,
            "permissionsPolicyPresent": "permissions-policy" in headers,
            "corsWildcard": headers.get("access-control-allow-origin", "").strip() == "*",
            "redirectHost": redirect_host,
        },
        "setCookieCount": len(set_cookies),
        "cookieFlags": cookie_flags,
        "limitations": ["HEAD response only; no response body was read.", "Redirects were not followed.", "Header presence or absence is a review signal, not proof of a vulnerability.", "Authentication, authorization, business logic, APIs, JavaScript, and source code were not assessed."],
    }


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def log_message(self, _format: str, *_args) -> None:
        # Do not put target URLs or researcher notes into routine logs.
        return

    def translate_path(self, path: str) -> str:
        # Serve only the static app assets; never expose workspace notes or follow symlinks.
        requested = urlsplit(path).path
        allowed = {"/": "index.html", "/index.html": "index.html", "/app.js": "app.js", "/styles.css": "styles.css"}
        filename = allowed.get(requested)
        if not filename:
            return os.path.join(ROOT, "__not_served__")
        return os.path.join(ROOT, filename)

    def do_OPTIONS(self) -> None:
        self.send_error(405)

    def do_POST(self) -> None:
        if self.path != "/api/passive-head":
            self.send_error(404)
            return
        if self.headers.get("Host") != f"{HOST}:{PORT}" or self.headers.get("Origin") != f"http://{HOST}:{PORT}":
            self.send_error(403, "Local same-origin requests only")
            return
        if self.headers.get_content_type() != "application/json":
            self.send_error(415, "application/json required")
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            self.send_error(400, "Invalid content length")
            return
        if length <= 0 or length > MAX_BODY:
            self.send_error(413, "Request too large")
            return
        try:
            payload = json.loads(self.rfile.read(length))
            if not isinstance(payload, dict):
                raise ValueError("JSON request must be an object")
            if payload.get("authorized") is not True:
                raise ValueError("Explicit authorization attestation is required")
            result = passive_head(str(payload.get("url", "")), str(payload.get("exactHost", "")))
            body = json.dumps({"ok": True, "result": result}).encode()
            self.send_response(200)
        except (ValueError, json.JSONDecodeError) as exc:
            body = json.dumps({"ok": False, "error": str(exc)}).encode()
            self.send_response(400)
        except Exception as exc:
            body = json.dumps({"ok": False, "error": f"Passive check failed: {type(exc).__name__}"}).encode()
            self.send_response(502)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)


if __name__ == "__main__":
    os.chdir(ROOT)
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    server.daemon_threads = True
    print(f"BountyPilot local workspace: http://{HOST}:{PORT}/")
    print("Loopback only. Passive checks are one authorized HEAD request; press Ctrl+C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping BountyPilot.")
    finally:
        server.server_close()
