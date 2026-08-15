import http.server
import socketserver
import sys

PORT = 8000

class ThreadingCGIServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    pass

handler = http.server.CGIHTTPRequestHandler
handler.cgi_directories = ["/cgi-bin"]

print(f"Starting multithreaded CGI server on port {PORT}...")
with ThreadingCGIServer(("", PORT), handler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nKeyboard interrupt received, exiting.")
        sys.exit(0)
