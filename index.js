require("dotenv").config();

const express = require("express"); // CommonJS
const pg = require("pg");
const cors = require("cors");

const Client = pg.Client;

const app = express();

app.use(express.json()); // middleware to deserialize JSON in request
app.use(cors()); // middleware to allow cross-domain AJAX requests

app.get("/api/posts", (request, response) => {
  const client = createClient();

  client.connect().then(() => {
    client.query("SELECT * FROM posts").then((queryResponse) => {
      response.json(queryResponse.rows);
    });
  });
});

app.get("/api/posts/:id", (request, response) => {
  const client = createClient();

  client.connect().then(() => {
    client
      .query("SELECT * FROM posts WHERE id = $1", [request.params.id])
      .then((queryResponse) => {
        if (queryResponse.rows.length >= 1) {
          response.json(queryResponse.rows[0]);
        } else {
          response.status(404).send();
        }
      });
  });
});

app.post("/api/posts", (request, response) => {
  const client = createClient();

  client.connect().then(() => {
    client
      .query("INSERT INTO posts (title, body) VALUES ($1, $2) RETURNING *", [
        request.body.title,
        request.body.body,
      ])
      .then((queryResponse) => {
        response.json(queryResponse.rows[0]);
      });
  });
});

function createClient() {
  const client = new Client({
    connectionString: process.env.CONNECTION_STRING,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  return client;
}

app.listen(process.env.PORT || 3000);
