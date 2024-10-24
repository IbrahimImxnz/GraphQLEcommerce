const express = require("express");
const app = express();
require("dotenv").config();
const connectDB = require("./config");
const { graphqlHTTP } = require("express-graphql");
const userSchema = require("./GQLSchemas/schema");
const jwt = require("jsonwebtoken");

connectDB();

app.use(
  "/graphql",
  graphqlHTTP((req, res) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    let user = null;
    if (token) {
      try {
        user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      } catch (err) {
        console.error(err);
      }
    }

    return {
      schema: schema,
      context: { user },
      graphiql: {
        headerEditorEnabled: true, // Enable the headers editor
      },
    };
  })
);

const port = process.env.PORT || 443;
app.listen(port, () => console.log(`server running on ${port}`));
