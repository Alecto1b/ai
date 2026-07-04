import http.server
import socketserver
import urllib.request
import urllib.error
import json
import sys

PORT = 8000

class ProxyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_OPTIONS(self):
        # Always allow CORS for local dev
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def do_POST(self):
        if self.path.startswith('/api/'):
            # Proxy request to NVIDIA NIM
            target_url = "https://integrate.api.nvidia.com" + self.path[4:]
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)

            # Copy headers
            headers = {
                'Content-Type': self.headers.get('Content-Type', 'application/json'),
                'Authorization': self.headers.get('Authorization', '')
            }

            req = urllib.request.Request(target_url, data=post_data, headers=headers, method='POST')
            try:
                with urllib.request.urlopen(req) as response:
                    self.send_response(response.status)
                    # Copy response headers from target
                    for key, val in response.getheaders():
                        if key.lower() not in ['content-encoding', 'transfer-encoding', 'content-length']:
                            self.send_header(key, val)
                    # Add CORS
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    
                    # Stream response back
                    while True:
                        chunk = response.read(1024)
                        if not chunk:
                            break
                        self.wfile.write(chunk)
            except urllib.error.HTTPError as e:
                self.send_response(e.code)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(e.read())
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode())
        else:
            super().do_POST()

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

# Use ThreadingMixIn to handle requests in separate threads.
# This prevents the single-threaded server from freezing when a proxy request blocks/hangs.
class ThreadingTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    allow_reuse_address = True

# Run the server
Handler = ProxyHTTPRequestHandler
with ThreadingTCPServer(("", PORT), Handler) as httpd:
    print(f"Serving project at http://localhost:{PORT} with multi-threaded API proxy...")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server.")
        sys.exit(0)
