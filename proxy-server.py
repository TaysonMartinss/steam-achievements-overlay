# Servidor Proxy simples para contornar CORS
# Execute com: python proxy-server.py

from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs, unquote
import urllib.request
import json

class ProxyHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Parse da URL
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/api/':
            # Extrair a URL target dos parâmetros
            params = parse_qs(parsed_path.query)
            
            if 'url' not in params:
                self.send_error(400, 'URL não fornecida')
                return
            
            target_url = unquote(params['url'][0])
            
            try:
                print(f'Proxy request: {target_url}')
                
                # Fazer a requisição
                with urllib.request.urlopen(target_url) as response:
                    data = response.read()
                
                # Enviar resposta com CORS headers
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
                self.send_header('Access-Control-Allow-Headers', 'Content-Type')
                self.end_headers()
                self.wfile.write(data)
                
            except Exception as e:
                print(f'Erro no proxy: {e}')
                self.send_error(500, str(e))
        else:
            self.send_error(404, 'Rota não encontrada')
    
    def do_OPTIONS(self):
        # Handle preflight requests
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

def run_server(port=3000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, ProxyHandler)
    print(f'🚀 Servidor proxy rodando em http://localhost:{port}')
    print(f'📝 Use: http://localhost:{port}/api/?url=SUA_URL_AQUI')
    httpd.serve_forever()

if __name__ == '__main__':
    run_server()
