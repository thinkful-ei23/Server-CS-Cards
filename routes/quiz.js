'use strict';
const express = require('express');
const mongoose = require('mongoose');
const QuizStat = require('../models/quizStat');

const router = express.Router();

router.get('/quiz',(req,res,next)=>{
  const userId = req.user._id;
  QuizStat.findOne({userId})
    .then(result=> {
      res.json(result.questions[result.head].question);
    });
});

router.get('/stats',(req,res,next)=>{
  const userId = req.user._id;
  QuizStat.findOne({userId})
    .then(stats =>{
      res.json({recurringCorrect: stats.recurringCorrect, totalQuestions:stats.totalQuestions,totalRight:stats.totalRight});
    });

});

router.post('/submit',(req,res,next)=>{

  let { answer } = req.body;
  answer = answer.toLowerCase().trim(' ');
  const userId = req.user._id;
  let quizStats;
  let response;
  QuizStat.findOne({ userId })
    .then( result => {
      quizStats = result;
      let lastNode; 
      let quizStatsHead = quizStats.head;
      for( let i = 0; i < quizStats.questions.length; i++ ) {
        if ( quizStats.questions[i].next === null ) {
          lastNode = i;
        }
      }
      console.log(quizStats.head)
      if ( quizStats.questions[quizStatsHead].answer == answer ) {
        
        let correctAnswer;
        QuizStat.findOne({userId})
          .then(userQuizData => {
            let currentHead = userQuizData.head; // 0
            userQuizData.questions[currentHead].m *= 2;
            let posToInsert = userQuizData.questions[currentHead].m;
            let next;
            if ( posToInsert >= userQuizData.questions.length ) {
              userQuizData.questions[currentHead].m = userQuizData.questions.length-1;
              userQuizData.questions[lastNode].next = userQuizData.questions[currentHead];
              next = userQuizData.questions[currentHead].next
            }
                
            let currentNode = userQuizData.questions[currentHead];
            let nextNode = currentNode.next;
            
            for(let i=1; i <posToInsert;i++){
                if(i === posToInsert){
                    currentNode = userQuizData.head // 0             posToinsert is 2     question 1,2
                    // postoinserts nodes .next to currenNode
                }else{
                    currentNode = userQuizData.questions[currentNode.next];                    
                }
            }
            userQuizData.recurringCorrect++;
            userQuizData.totalQuestions++;
            userQuizData.totalRight++;

            userQuizData.head = nextNode
            // userQuizData.questions[lastNode].next = null;
            correctAnswer = userQuizData.questions[currentHead].answer;
            console.log(userQuizData)
            return QuizStat.findOneAndUpdate({userId},userQuizData);
          })
          .then( result => {
            response = {
              result,
              answer:'correct',
              correctAnswer: correctAnswer
            };
            return res.json(response);
          });
      } else {
        // User answered Incorrectly 
        let correctAnswer;
        QuizStat.findOne({ userId })
          .then(userQuizData => {
            
            let currentHead = userQuizData.head;
            userQuizData.questions[currentHead].m = 1; 
            userQuizData.recurringCorrect = 0;
            userQuizData.totalQuestions++;
            let posToInsert = 1;
            userQuizData.head = userQuizData.questions[currentHead].next;
            let currentHeadNext = userQuizData.questions[userQuizData.head].next;
            userQuizData.questions[userQuizData.head].next = currentHead;
            userQuizData.questions[currentHead].next = currentHeadNext;
            correctAnswer = userQuizData.questions[currentHead].answer;
            return QuizStat.findOneAndUpdate({userId}, userQuizData);
          })
          .then( result => {
            response = {
              result,
              answer:'incorrect',
              correctAnswer: correctAnswer
            };
            return res.json(response);
          })
          .catch(err => {
            if (err.reason === 'ValidationError') {
              return res.status(err.code).json(err);
            }
            next(err);
          });
      }	
    });
});

module.exports = router;