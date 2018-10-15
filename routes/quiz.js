'use strict';

const express = require('express');
const mongoose = require('mongoose');
const questionList = require('../utils/create-linked-list')

const router = express.Router();


router.get('/quiz',(req,res,next)=>{
    res.json(questionList.head.value.question)
})

router.post('/submit',(req,res,next)=>{
    let {answer} = req.body
    answer = answer.toLowerCase().trim(' ')
    if(questionList.head.value.answer === answer){
        res.json({answer:'correct'})
    }else{
        res.json({answer:'incorrect'})
    }
})
module.exports = router