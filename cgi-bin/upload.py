#!/usr/bin/env python3
"""CGI upload endpoint for the portfolio site.

Saves uploaded screenshots into assets/img/ for the venture detail pages.
Only accepts images for predefined photo slots; everything else is rejected.
"""
import cgi
import json
import os
import sys
import traceback

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG_DIR = os.path.join(BASE, "assets", "img")
LOG_FILE = os.path.join(BASE, "cgi-bin", "upload.log")
ALLOWED_SLOTS = {
    "percify-dashboard-1", "percify-dashboard-2", "percify-dashboard-3",
    "percify-dashboard-4", "percify-dashboard-5", "percify-dashboard-6",
    "readycleans-1", "readycleans-2", "readycleans-3",
}
MAX_BYTES = 10 * 1024 * 1024  # 10 MB
ALLOWED_EXTS = {".png", ".jpg", ".jpeg", ".webp"}

def log_error(msg):
    try:
        with open(LOG_FILE, "a") as f:
            f.write(msg + "\n")
    except Exception:
        pass

def respond(code, payload):
    body = json.dumps(payload).encode("utf-8")
    statuses = {200: "200 OK", 400: "400 Bad Request", 405: "405 Method Not Allowed", 500: "500 Internal Server Error"}
    head = f"Status: {statuses.get(code, '400 Bad Request')}\r\nContent-Type: application/json\r\nContent-Length: {len(body)}\r\n\r\n"
    sys.stdout.flush()
    out = sys.stdout.buffer
    out.write(head.encode("utf-8"))
    out.write(body)
    out.flush()
    sys.exit(0)

def main():
    try:
        if os.environ.get("REQUEST_METHOD", "") != "POST":
            respond(405, {"ok": False, "error": "POST required"})

        try:
            form = cgi.FieldStorage()
        except Exception as exc:
            respond(400, {"ok": False, "error": f"Bad request body: {exc}"})

        try:
            slot = form.getvalue("slot", "")
        except TypeError:
            respond(400, {"ok": False, "error": "Empty request body"})

        if slot not in ALLOWED_SLOTS:
            respond(400, {"ok": False, "error": "Unknown photo slot"})

        item = form["file"]
        if item is None or not getattr(item, "filename", None):
            respond(400, {"ok": False, "error": "No file provided"})

        ext = os.path.splitext(item.filename)[1].lower()
        if ext not in ALLOWED_EXTS:
            respond(400, {"ok": False, "error": "Only PNG, JPG, JPEG or WEBP allowed"})

        data = item.file.read(MAX_BYTES + 1)
        if len(data) > MAX_BYTES:
            respond(400, {"ok": False, "error": "File too large (max 10 MB)"})

        filename = f"{slot}.png"
        try:
            with open(os.path.join(IMG_DIR, filename), "wb") as out:
                out.write(data)
        except Exception as exc:
            respond(500, {"ok": False, "error": f"Could not save file: {exc}"})

        respond(200, {"ok": True, "url": f"assets/img/{filename}"})
    except SystemExit:
        raise
    except Exception:
        log_error(traceback.format_exc())
        try:
            respond(500, {"ok": False, "error": "Internal server error"})
        except Exception:
            pass

if __name__ == "__main__":
    main()
