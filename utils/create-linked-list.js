const LinkedList = require('./../models/linked-list');
const cscards = require('./../db/seed/cscards.json');

const questionList = new LinkedList();

cscards.forEach(card => questionList.insertLast(card));

module.exports = questionList;
