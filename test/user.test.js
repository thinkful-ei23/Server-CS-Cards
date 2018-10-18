'use strict';
const app = require('../app');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const { TEST_MONGODB_URI } = require('../config');

const User = require('../models/user');

const expect = chai.expect;

chai.use(chaiHttp);

describe('CS-CARDS API - Users', function () {
  const username = 'exampleUser';
  const password = 'examplePass';
  const firstName = 'Example User';

  before(function () {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function () {
    return User.createIndexes();
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });
  
  describe('/api/users', function () {
    describe('POST', function () {
      it('Should create a new user', function () {
        const testUser = { username, password, firstName };

        let res;
        return chai
          .request(app)
          .post('/api/users')
          .send(testUser)
          .then(_res => {
            res = _res;
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.keys('_id', 'username', 'password', 'firstName', '__v');

            expect(res.body._id).to.exist;
            expect(res.body.username).to.equal(testUser.username);
            expect(res.body.firstName).to.equal(testUser.firstName);
            return User.findOne({ username });
          })
          .then(user => {
            expect(user).to.exist;
            expect(user.id).to.equal(res.body._id);
            expect(user.firstName).to.equal(testUser.firstName);
            return user.validatePassword(password);
          })
          .then(isValid => {
            expect(isValid).to.be.true;
          });
      });
      it('Should reject users with missing username', function () {
        const testUser = { password, firstName };
        return chai.request(app).post('/api/users').send(testUser)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.message).to.equal('Missing \'username\' in request body');
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.location).to.equal('username');
          });
      });
      it('Should reject users with missing password',
        function () {
          const testUser = { username, firstName };
          return chai.request(app).post('/api/users').send(testUser)
            .then(res => {
              expect(res).to.have.status(422);
              expect(res.body.message).to.equal('Missing \'password\' in request body');
              expect(res.body.reason).to.equal('ValidationError');
              expect(res.body.location).to.equal('password');
            });
        });
      it('Should reject users with non-string username', function () {
        const testUser = { username: 45, firstName, password};
        return chai.request(app).post('/api/users').send(testUser)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Incorrect field type: expected string');
            expect(res.body.location).to.equal('username');
          });
      });
      it('Should reject users with non-string password', function () {
        const testUser = { username, firstName, password: 45 };
        return chai.request(app).post('/api/users').send(testUser)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Incorrect field type: expected string');
            expect(res.body.location).to.equal('password');
          });
      });
      it('Should reject users with non-trimmed username', function () {
        const testUser = { username: ' badUsername ', firstName, password };
        return chai.request(app).post('/api/users').send(testUser)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Cannot start or end with whitespace');
            expect(res.body.location).to.equal('username');
          });
      });
      it('Should reject users with non-trimmed password', function () {
        const testUser = { username, firstName, password: ' badPassword ' };
        return chai.request(app).post('/api/users').send(testUser)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Cannot start or end with whitespace');
            expect(res.body.location).to.equal('password');
          });
      });
      it('Should reject users with empty username', function () {
        const testUser = { username: '', firstName, password };
        return chai.request(app).post('/api/users').send(testUser)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Must be at least 1 characters long');
            expect(res.body.location).to.equal('username');
          });
      });
      it('Should reject users with password less than 8 characters', function () {
        const testUser = { username, firstName, password: '' };
        return chai.request(app).post('/api/users').send(testUser)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Must be at least 8 characters long');
            expect(res.body.location).to.equal('password');
          });
      });
      it('Should reject users with password greater than 72 characters', function () {
        const tooLongPassword = 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyza';
        const testUser = { username, firstName, password: tooLongPassword };
        return chai.request(app).post('/api/users').send(testUser)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Must be at most 72 characters long');
            expect(res.body.location).to.equal('password');
          });
      });
      it('Should reject users with duplicate username', function () {
        return User.create({
          username,
          password,
          firstName
        })
          .then(() =>
            chai.request(app).post('/api/users').send({
              username,
              password,
              firstName
            })
          )
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }
            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Username already taken'
            );
            expect(res.body.location).to.equal('username');
          });
      });
    });
  });
});