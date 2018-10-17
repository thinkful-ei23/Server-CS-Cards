'use strict';

const mongoose = require('mongoose');

const { MONGODB_URI } = require('../config');

const User = require('../models/user');

const seedUsers = require('../db/seed/users');

mongoose.connect(MONGODB_URI)
  .then(() => mongoose.connection.db.dropDatabase())
  .then(() => {
    return Promise.all([
      User.insertMany(seedUsers),
      User.createIndexes()
    ]);
  })
  .then((results) => {
    console.log(`inserted ${results.length} users`);
  })
  .then(() => mongoose.disconnect())
  .catch(err => {
    console.log(err);
  });