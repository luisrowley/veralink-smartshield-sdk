const http = require('http');

function initializeListener() {
  const server = http.createServer((req, res) => {
      if (req.url === '/veralink') {
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end('OK');
      } else {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not found');
      }
  });
  
  server.listen(3001, () => {
      console.log('Server listening on port 3001');
  });
}

module.exports = { initializeListener };