'use strict';

const express = require('express');
const QuizStat = require('../models/quizStat')

const router = express.Router();



router.get('/quiz',(req,res,next)=>{
    const userId = req.user._id
    QuizStat.findOne({userId})
    .then(result=> {
        res.json(result.questions[result.head].question)
    });
})



router.post('/submit',(req,res,next)=>{

    let {answer} = req.body
    const userId = req.user._id
    let data;
    let list;
    QuizStat.findOne({userId})
    .then(result=> {
        list = result
    });
    let lastNode; 
    for(let i = 0;l<list.questions.length;i++){
        if(list.questions[i].next === null){
            lastNode = i
        }
    }

    answer = answer.toLowerCase().trim(' ')

    if(list.questions[list.head].answer === answer){

        QuizStat.findOne({userId})
        .then((stats)=>{
            data = stats
            data.questions[data.head].m =data.questions[data.head].m*2
            let posToInsert = data.questions[data.head].m
            if(posToInsert > data.questions.length){
                data.questions[data.head].m = data.questions.length
                data.questions[lastNode].next = data.questions[data.head]
            }
            let currentNode = data.questions[data.head]
            let count = 0
            while(currentNode.next !== null){
                if(count === posToInsert){
                    currentNode.next = data.head
                }else{
                    currentNode = currentNode[currentNode.next]
                    count++
                }
            }
            
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