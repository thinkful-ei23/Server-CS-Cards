const LinkedList = require('./../models/linked-list');
const cscards = require('./../db/seed/cscards.json');

const questionList = new LinkedList();

cscards.foreach(card => questionList.insertlast(card));

module.exports = questionList;
