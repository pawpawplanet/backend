const http = require("http");

const server = http.createServer(function(request,response){
    response.setHeader('Content-Type', 'application/json');
    response.setHeader('charset', 'utf-8');

    if (request.method === 'GET' && request.url === '/') {
        response.writeHead(200);
        response.end(JSON.stringify({ 
            message: "Hello World from Node.js!",
            status: "success"
        }));
    } else {
        response.writeHead(404);
        response.end(JSON.stringify({
            error: "Not Found"
        }));
    }
})

server.listen(8080, () => {
    console.log(`伺服器運作中 @ http://localhost:8080`);
});
