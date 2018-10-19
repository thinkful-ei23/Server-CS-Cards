'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../app');
const jwt = require('jsonwebtoken');
const { TEST_MONGODB_URI } = require('../config');
const { JWT_SECRET } = require('../config');

const User = require('../models/user');
const seedUsers = require('../db/seed/users.json');
const QuizStat = require('../models/quizStat');
const seedQuestions = require('../db/seed/cscards.json'); 

const expect = chai.expect;
chai.use(chaiHttp);

describe('CS Cards API - Quiz', function () {

  before(function () {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });
  let token;
  let user;
  let seedQuizStat = {
    userId: '000000000000000000000001',
    recurringCorrect: 0,
    totalQuestions: 0,
    totalRight: 0,
    questions: seedQuestions,
    head: 0
  };

  beforeEach(function () {
    return Promise.all([
      User.insertMany(seedUsers),
      QuizStat.insertMany(seedQuizStat)
    ])
      .then(([users]) => {
        user = users[0];
        token = jwt.sign({ user }, JWT_SECRET, { subject: user.username });
      });
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });

  describe('GET /api/quiz', function () {

    it('should return a object containing current question user is on and answer', function () {
      return Promise.all([
        QuizStat.find({ userId: user.id }).sort('name'),
        chai.request(app)
          .get('/api/quiz')
          .set('Authorization', `Bearer ${token}`)
      ])
  
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('string');
        });
    });
  });
});