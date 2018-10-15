'use strict';

const express = require('express');
const mongoose = require('mongoose');
const questionList = require('../utils/create-linked-list')

const router = express.Router();


router.get('/quiz',(req,res,next)=>{
    res.json(questionList.first.question)
})


router.get('/submit',(req,res,next)=>{
    const {answer} = req.body
    if(questionList.first.answer === answer){
        res.json({answer:'correct'})
    }else{
        res.json({answer:'incorrect'})
    }
})

module.exports = router