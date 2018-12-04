'use strict';

const mongoose = require('mongoose');

const { MONGODB_URI } = require('../config');

const User = require('../models/user');
const QuizStats = require('../models/quizStat');

const seedUsers = require('../db/seed/users');
const seedQuizStats = require('../db/seed/quizStats');

mongoose.connect(MONGODB_URI)
  .then(() => mongoose.connection.db.dropDatabase())
  .then(() => {
    return Promise.all([
      User.insertMany(seedUsers),
      QuizStats.insertMany(seedQuizStats),
      User.createIndexes(),
      QuizStats.createIndexes()
    ]);
  })
  .then((results) => {
    console.log(`inserted ${results.length} users`);
  })
  .then(() => mongoose.disconnect())
  .catch(err => {
    console.log(err);
  });