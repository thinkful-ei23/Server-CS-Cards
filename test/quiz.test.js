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
  let badUserIdtoken;
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
    it('should return a 400 status when no authorization header is sent', function () {
      return chai.request(app).get('/api/quiz')
        .then(res => {
          expect(res).to.have.status(401);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.name).to.equal('AuthenticationError');
          expect(res.body.message).to.equal('Unauthorized');
        });
    });
    it('should return a 400 status when bad id is sent in', function () {
      badUserIdtoken = jwt.sign({ user:'badstuff' }, JWT_SECRET, { subject: user.username });
      return chai.request(app)
        .get('/api/quiz')
        .set('Authorization', `Bearer ${badUserIdtoken}`)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('The `id` is not valid');
        });
    });
  });
  describe('GET /api/stats', function () {
    it('should return a object containing ', function () {
      return Promise.all([
        QuizStat.findOne({ userId: user.id }).sort('name'),
        chai.request(app)
          .get('/api/stats')
          .set('Authorization', `Bearer ${token}`)
      ])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.all.keys('recurringCorrect', 'totalQuestions', 'totalRight');
          expect(res.body.recurringCorrect).to.be.a('number');
          expect(res.body.totalQuestions).to.be.a('number');
          expect(res.body.totalRight).to.be.a('number');
          expect(res.body.recurringCorrect).to.equal(data.recurringCorrect);
          expect(res.body.totalQuestions).to.equal(data.totalQuestions);
          expect(res.body.totalRight).to.equal(data.totalRight);
        });
    });
    it('should return a 400 status when no authorization header is sent', function () {
      return chai.request(app).get('/api/stats')
        .then(res => {
          expect(res).to.have.status(401);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.name).to.equal('AuthenticationError');
          expect(res.body.message).to.equal('Unauthorized');
        });
    });
  });
  it('should return a 400 status when bad id is sent in', function () {
    badUserIdtoken = jwt.sign({ user:'badstuff' }, JWT_SECRET, { subject: user.username });
    return chai.request(app)
      .get('/api/stats')
      .set('Authorization', `Bearer ${badUserIdtoken}`)
      .then(res => {
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body.message).to.equal('The `id` is not valid');
      });
  });
  describe('POST /api/submit', function () {
    it('should return a object containing current question user is on and answer', function () {
      let answer = {answer:'queue'};
      return Promise.all([
        QuizStat.findOne({ userId: user.id }),
        chai.request(app)
          .post('/api/submit')
          .set('Authorization', `Bearer ${token}`)
          .send(answer)
      ])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.result).to.have.all.keys('questions', '_id','recurringCorrect', 'totalQuestions', 'totalRight', 'head', 'userId');
          expect(res.body.answer).to.equal('correct');
          expect(res.body.correctAnswer).to.equal('queue');
          expect(res.body.result.head).to.equal(data.head);
          expect(res.body.result.questions.length).to.equal(data.questions.length);
        });
    });
    it('should return a object when user sends incorrect answer', function () {
      let answer = {answer:'incorrect answer'};
      return chai.request(app)
        .post('/api/submit')
        .set('Authorization', `Bearer ${token}`)
        .send(answer)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.result).to.have.all.keys('questions', '_id','recurringCorrect', 'totalQuestions', 'totalRight', 'head', 'userId');
          expect(res.body.answer).to.equal('incorrect');
          expect(res.body.correctAnswer).to.equal('queue');
        });
    });
    it('should trim an answer and if correct return as normal correct answer ', function () {
      let answer = {answer:'  queue  '};
      return chai.request(app)
        .post('/api/submit')
        .set('Authorization', `Bearer ${token}`)
        .send(answer)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.answer).to.equal('correct');
        });
    });
    it('should be able to handle different character cases in submitted answer and if correct return as normal correct answer ', function () {
      let answer = {answer:'QueUe'};
      return chai.request(app)
        .post('/api/submit')
        .set('Authorization', `Bearer ${token}`)
        .send(answer)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.answer).to.equal('correct');
        });
    });
    it('should return a 400 error and message when sending blank answer', function () {
      let answer = {answer:''};
      return chai.request(app)
        .post('/api/submit')
        .set('Authorization', `Bearer ${token}`)
        .send(answer)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.all.keys('status', 'message');
          expect(res.body.status).to.equal(400);
          expect(res.body.message).to.equal('Missing `answer` on Submit');
        });
    });
    it('should return a 400 status when no authorization header is sent', function () {
      return chai.request(app).post('/api/submit')
        .then(res => {
          expect(res).to.have.status(401);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.name).to.equal('AuthenticationError');
          expect(res.body.message).to.equal('Unauthorized');
        });
    });
    it('should return a 400 status when bad id is sent in', function () {
      badUserIdtoken = jwt.sign({ user:'badstuff' }, JWT_SECRET, { subject: user.username });
      let answer = {answer:'queue'};
      return chai.request(app)
        .post('/api/submit')
        .set('Authorization', `Bearer ${badUserIdtoken}`)
        .send(answer)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('The `id` is not valid');
        });
    });
  });
});