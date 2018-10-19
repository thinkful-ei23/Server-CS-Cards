'use strict';
const express = require('express');
const mongoose = require('mongoose');
const QuizStat = require('../models/quizStat');

const router = express.Router();

/*======GET Endpoint for quiz questions=====*/
router.get('/quiz',(req,res,next)=>{
  const userId = req.user._id;
	
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  QuizStat.findOne({userId})
    .then(result=> {
      res.json(result.questions[result.head].question);
    })
    .catch(err => {
      if (err.reason === 'Error GET /quiz') {
        return res.status(err.code).json(err);
      }
      next(err);
    });
});

/*======GET Endpoint for user stats=======*/
router.get('/stats',(req,res,next)=>{
  const userId = req.user._id;
	
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  QuizStat.findOne({userId})
    .then(stats =>{
      res.json({recurringCorrect: stats.recurringCorrect, totalQuestions:stats.totalQuestions,totalRight:stats.totalRight});
    })
    .catch(err => {
      if (err.reason === 'Error GET /stats') {
        return res.status(err.code).json(err);
      }
      next(err);
    });
});

/*=====POST Submiting answer endpoint Spaced Repetition Alogrithm====*/
router.post('/submit',(req,res,next)=>{
  let { answer } = req.body;
  answer = answer.toLowerCase().trim(' ');
  const userId = req.user._id;
	
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }
  if (!answer) {
    const err = new Error('Missing `answer` on Submit');
    err.status = 400;
    return next(err);
  }

  let response;
  let correctAnswer;
	
  QuizStat.findOne({ userId })
    .then( userQuizData => {
      let quizStatsHead = userQuizData.head;
      let currentHead = userQuizData.head; // 0
      let answeredQuestion = userQuizData.questions[currentHead];
      userQuizData.head = answeredQuestion.next;
      let answeredQuestionIndex = currentHead;
      // When user answers question correct we double m value to put question deeper in the list.  When incorrect we dived the m value to have it show up sooner.
      if ( userQuizData.questions[quizStatsHead].answer == answer ) {
        answeredQuestion.m *= 2;
        if (answeredQuestion.m >= userQuizData.questions.length) {
          answeredQuestion.m = userQuizData.questions.length;
        }
        answer = 'correct';
        userQuizData.totalRight++;
        userQuizData.recurringCorrect++;
      } else {
        answeredQuestion.m = Math.floor(answeredQuestion.m / 2);
        if (answeredQuestion.m === .5) {
          answeredQuestion.m = 1; 
        }
        answer = 'incorrect';
        userQuizData.recurringCorrect = 0;
      }
      let currentNode = answeredQuestion;
      for ( let i = 0; i < answeredQuestion.m; i++ ) {
        const nextIndex = currentNode.next;
        if (currentNode.next === null) {
          break;
        }
        currentNode = userQuizData.questions[nextIndex];
      }
      answeredQuestion.next = currentNode.next;
      currentNode.next = answeredQuestionIndex;
      userQuizData.totalQuestions++;
      correctAnswer = userQuizData.questions[currentHead].answer;
      return QuizStat.findOneAndUpdate({ userId }, userQuizData);
    })
    .then( result => {
      response = {
        result,
        answer: answer,
        correctAnswer: correctAnswer
      };
      return res.json(response);
    })
    .catch(err => {
      if (err.reason === 'Error Updating /submit') {
        return res.status(err.code).json(err);
      }
      next(err);
    });
});

module.exports = router;