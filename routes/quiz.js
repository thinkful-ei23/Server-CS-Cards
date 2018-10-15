'use strict';

const express = require('express');
const mongoose = require('mongoose');
const questionList = require('../utils/create-linked-list')

const router = express.Router();


router.get('/api/quiz',(req,res,next)=>{
    res.json(questionList.first.question)
})