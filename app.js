'use strict';
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');

var socket = require('socket.io');

const { CLIENT_ORIGIN, PORT, MONGODB_URI } = require('./config');
const passport = require('passport');
const localStrategy = require('./passport/local');
const jwtStrategy = require('./passport/jwt');

/*=====Import Routers=====*/
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const quizRouter = require('./routes/quiz');

/*=========Create Express Application========*/
const app = express();

/*========Morgan Middleware to Log all requests=======*/
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'common', {
  skip: () => process.env.NODE_ENV === 'test'
}));

/*======CORS Middleware=====*/
const corsOption = { 
  origin: true, methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true
}; app.use(cors(corsOption));

/*=======Parse Request Body======*/
app.use(express.json());

/*======Utilize the given `stategy`=====*/
passport.use(localStrategy);
passport.use(jwtStrategy);

/*======Protect Endpoints Using JWT Strategy======*/
const jwtAuth = passport.authenticate('jwt', { session: false, failWithError: true });

/*=======Routing=======*/
app.get('/api/test', (req, res) => res.send('Hello World!'));
app.use('/api', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api',jwtAuth,quizRouter);

/*=======Custom 404 Not Found route handler=======*/
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/*==========Custom Error Handler==========*/
app.use((err, req, res, next) => {
  if (err.status) {
    const errBody = Object.assign({}, err, { message: err.message });
    res.status(err.status).json(errBody);
  } else {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/*====Connect to DB and Listen for incoming connections====*/

if (process.env.NODE_ENV !== 'test') {

  mongoose.connect(MONGODB_URI)
    .then(instance => {
      const conn = instance.connections[0];
      console.info(`Connected to: mongodb://${conn.host}:${conn.port}/${conn.name}`);
    })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      console.error('\n === Did you remember to start `mongod`? === \n');
      console.error(err);
    })
    .then(() => {
      let server = app.listen(PORT, function () {
        console.info(`Server listening on ${this.address().port}`);
      }).on('error', err => {
        console.error(err);
      });
      /*====Socket.io Server====*/
      let io = socket(server);

      io.on('connection', (socket) => {
        console.log(socket.id, 'socket ID');

        socket.on('SEND_MESSAGE', function(data){
          console.log(data, 'Messaged recieved!');
          io.emit('RECEIVE_MESSAGE', data);
        });
      });
    });
}

/*======= Export for testing =======*/
module.exports = app;