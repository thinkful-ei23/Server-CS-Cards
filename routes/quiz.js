'use strict';

const express = require('express');
const mongoose = require('mongoose');
const questionList = require('../utils/create-linked-list')
const passport = require('passport')

const router = express.Router();

router.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));


router.get('/quiz',(req,res,next)=>{
    res.json(questionList.head.value.question)
})



router.post('/submit',(req,res,next)=>{
    let {answer} = req.body
    const userId = req.user.id
    answer = answer.toLowerCase().trim(' ')
    if(questionList.head.value.answer === answer){
        return QuizStat.findById({_id: userId})
        .then((stats)=>{
            stats.recuringCorrect++
            stats.totalQuestions++
        })
        .then(()=>{
            res.json({
                data,
                answer:'correct',
                correctAnswer: questionList.head.value.answer})
        })
    }else{
        return QuizStat.findById({_id: userId})
        .then((stats)=>{
            stats.recuringCorrect = 0
            stats.totalQuestions++
        })
        .then(()=>{
        res.json({
            data,
            answer:'incorrect',
            correctAnswer: questionList.head.value.answer})
        })
    }
    const lastNode = questionList.findLast()
    lastNode.next = questionList.head
    questionList.head = questionList.head.next
});

router.get('/stats',(req,res,next)=>{
    const userId = req.user.id
    QuizStat.findById({_id:userId})
    .then(stats =>{
        res.json(stats)
    })

})
module.exports = router