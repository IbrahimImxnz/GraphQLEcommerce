const express = require("express");
const app = express();
require("dotenv").config();
const connectDB = require("./config");
const { graphqlHTTP } = require("express-graphql");
const userSchema = require("./GQLSchemas/userSchema");

connectDB();

app.use(
  "/graphql",
  graphqlHTTP({
    schema: userSchema,
    graphiql: true,
  })
);

const port = process.env.PORT || 443;
app.listen(port, () => console.log(`server running on ${port}`));
