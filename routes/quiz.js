'use strict';
const express = require('express');
const mongoose = require('mongoose');
const QuizStat = require('../models/quizStat');

const router = express.Router();

router.get('/quiz',(req,res,next)=>{
  const userId = req.user._id;
  QuizStat.findOne({userId})
    .then(result=> {
      console.log(result.head, 'HEAD', result.questions.slice(0,4));
      res.json(result.questions[result.head].question);
    })
    .catch(err => {
      if (err.reason === 'Error GET /quiz') {
        return res.status(err.code).json(err);
      }
      next(err);
    });
});

router.get('/stats',(req,res,next)=>{
  const userId = req.user._id;
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

router.post('/submit',(req,res,next)=>{

  let { answer } = req.body;
  answer = answer.toLowerCase().trim(' ');
  const userId = req.user._id;
  let quizStats;
  let response;
  let correctAnswer;
  QuizStat.findOne({ userId })
    .then( userQuizData => {
      quizStats = userQuizData;
      
      let quizStatsHead = quizStats.head;
      
        
      let currentHead = userQuizData.head; // 0
      let answeredQuestion = userQuizData.questions[currentHead];
      userQuizData.head = answeredQuestion.next;
      let answeredQuestionIndex = currentHead;
      if ( quizStats.questions[quizStatsHead].answer == answer ) {
        answeredQuestion.m *= 2;	
      } else {
        answeredQuestion.m = 1;
      }
		
      let next;
      // if ( posToInsert >= userQuizData.questions.length ) {
      //   userQuizData.questions[currentHead].m = userQuizData.questions.length-1;
      //   userQuizData.questions[lastNode].next = userQuizData.questions[currentHead];
      //   next = userQuizData.questions[currentHead].next;
      //   posToInsert = userQuizData.questions.length - 1;
      // }
			
      // [{q: A, next: 1, m: 2}, {q: B, next: 2, m: 1 }, {q: C, next: 3, m: 1}, {q:D, next: null, m: 1 } ]
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
      userQuizData.recurringCorrect++;
      userQuizData.totalQuestions++;
      userQuizData.totalRight++;
      correctAnswer = userQuizData.questions[currentHead].answer;
      return QuizStat.findOneAndUpdate({ userId }, userQuizData);
    })
    .then( result => {
      
      response = {
        result,
        answer:'correct',
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