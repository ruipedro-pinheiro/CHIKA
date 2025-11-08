#!/usr/bin/env python3
"""Simple HTTP server for Chika Zen frontend"""
import http.server
import socketserver

PORT = 3001

Handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"🎯 Chika Zen frontend running on http://localhost:{PORT}")
    print(f"📡 Backend API: http://localhost:8000")
    print(f"🔥 Press Ctrl+C to stop")
    httpd.serve_forever()
