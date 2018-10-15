const express = require('express');
const morgan = require('morgan');

/* ========== Create Express Application========== */
const app = express();

/* ========== Morgan Middleware to Log all requests ========== */
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'common', {
  skip: () => process.env.NODE_ENV === 'test'
}));
