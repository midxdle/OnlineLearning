const app = require("./index");
const http = require("http");

const server = http.createServer(app);
server.listen(process.env.PORT || 8000);
server.on("listening", () => {
  console.log("Server listening on http://localhost:%d", 8000);
});
