const express = require('express');
const cors = require('cors');
const { graphqlHTTP } = require('express-graphql');
require('dotenv').config();

const connectDB = require('./config/db');
const schema = require('./schema/schema');
const port = process.env.PORT || 5000;

const app = express();
connectDB();

app.use(cors());

app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    graphiql: process.env.NODE_ENV === 'development'
  })
);

app.listen(port, console.log(`server running on ${port}`));
