'use strict';

const express = require('express');
const QuizStat = require('../models/quizStat')

const router = express.Router();



router.get('/quiz',(req,res,next)=>{
    QuizStat.find({userId})
    .then(result=> {
    res.json(result.head.value.question)
    });
})



router.post('/submit',(req,res,next)=>{

    let {answer} = req.body
    const userId = req.user._id
    let data;
    let list;
    QuizStat.find({userId})
    .then(result=> {
        list = result.questions
    });
    let lastNode = list.findLast()
    let questionNumber = list.head.value.number

    answer = answer.toLowerCase().trim(' ')

    if(list.head.value.answer === answer){

        QuizStat.findOne({userId})
        .then((stats)=>{
            if(!data.QuizStat[questionNumber]){
                data.QuizStat[questionNumber]=list.head.value
            }            
            data.QuizStat[questionNumber].m = data.QuizStat[questionNumber].m*2

            data = stats
            data.recurringCorrect++
            data.totalQuestions++
            data.totalRight++
            return QuizStat.findOneAndUpdate({userId},data)
        })
        .then((result)=>{
            lastNode.next = list.head
            list.head = list.head.next
            lastNode.next = null

            res.json({
                result,
                answer:'correct',
                correctAnswer: lastNode.value.answer})
        })
    }else{
        QuizStat.findOne({userId})
        .then((stats)=>{
            if(!data.QuizStat[questionNumber]){
                data.QuizStat[questionNumber]=list.head.value
            }
            data.QuizStat[questionNumber].m =1
            
            data = stats
            data.recurringCorrect = 0
            data.totalQuestions++
            return QuizStat.findOneAndUpdate({userId},data)
        })
        .then((result)=>{
            lastNode.next = list.head
            list.head = qlist.head.next
            lastNode.next = null
        res.json({
            result,
            answer:'incorrect',
            correctAnswer: lastNode.value.answer})
        })
    }


});

router.get('/stats',(req,res,next)=>{
    const userId = req.user._id
    QuizStat.findOne({userId})
    .then(stats =>{
        console.log(stats)
        res.json({recurringCorrect: stats.recurringCorrect, totalQuestions:stats.totalQuestions,totalRight:stats.totalRight})
    })

})
module.exports = router