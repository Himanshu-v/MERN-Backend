const connectToMongo = require("./db");
const express = require("express");
var cors = require("cors");

connectToMongo();

const app = express();
const port = 5000;
app.use(cors()); // Middleware to allow CORS.
app.use(express.json()); // Middleware to allow access to the request body.

app.use("/api/auth", require("./routes/auth"));
app.use("/api/notes", require("./routes/notes"));

app.listen(port, () => {
  console.log(`iNotebook app listening on port ${port}`);
});
