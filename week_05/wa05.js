const async = require('async');

var blogEntries = [];

class BlogEntry {
  constructor(primaryKey, date, thesisWork, poms, thesisTalk, focus_1_5, feeling_1_5, feeling_word, notes) {
    this.pk = {};
    this.pk.S = primaryKey.toString();
    
    this.date = {}; 
    this.date.S = new Date(date).toDateString();
    
    //thesisWork is a boolean answering the question "Did you work on your thesis today?"
    this.thesisWork = {};
    this.thesisWork.BOOL = thesisWork;
    
    //poms is a number answering the question, "Roughly how much time (in poms) did you spend on thesis today?"
    if (poms != null) {
      this.poms = {};
      this.poms.N = poms.toString();
    }
    
    //thesisTalk is a list containing strings of people who I spoke to that day
    if (thesisTalk != null) {
      this.thesisTalk = {};
      this.thesisTalk.SS = thesisTalk; 
    }
    
    //focus_1_5 is a number answering the question, "On a scale of 1-5, with 1 being 'Not Very Focused' and 5 being 'Very Focused', how focused did you feel? "
    if (focus_1_5 != null){
      this.focus_1_5 = {};
      this.focus_1_5.N = focus_1_5.toString();
    }
    
    //feeling_1_5 is a number answering the question, "On a scale of 1-5, with 1 being 'Feeling Badly' and 5 being 'Feeling Great', how do you feel about your thesis right now?"
    if (feeling_1_5 != null){
      this.feeling_1_5 = {};
      this.feeling_1_5.N = feeling_1_5.toString();
    }
    
    //feeling_word is a word representing the answer to the question, "How do you feel about your thesis right now?"
    if (feeling_word != null){
       this.feeling_word = {}; 
      this.feeling_word.S = feeling_word;
    }
  
    //notes is a string that contains any notes that were relevant for the day
    if (notes != null) {
      this.notes = {};
      this.notes.S = notes; 
    }
    this.month = {};
    this.month.N = new Date(date).getMonth().toString();
  }
}

//(primaryKey, date, thesisWork, poms, thesisTalk, focus_1_5, feeling_1_5, feeling_word, notes)
blogEntries.push(new BlogEntry(0, 'October 5, 2020', true, 8, ["Miguel", "Miodrag", "Bill"], 2, 2, "Unsure", "Today was review day and it didn't go well. Left the review feeling drained and like my project was doomed. Am considering switching away from SA."));
blogEntries.push(new BlogEntry(1, 'October 6, 2020', true, 4, ["Blake", "Amy"], 2, 4, "Excited", "I talked to Blake and felt much more reassured about where I am in the process. And my chat with Amy left me feeling so much better about my initial insticts about following water and planning processes in San Antonio."));
blogEntries.push(new BlogEntry(2, 'October 7, 2020', true, 3, ["Shannon"], 2, 4, "Curious", "Did a lot of random googling today and watched part of a recording of a SAWS board meeting, which was fascinating. Talked to Shannon, which was also incredibly clarifying."));

// console.log(blogEntries);

var AWS = require('aws-sdk');
AWS.config = new AWS.Config();
AWS.config.region = "us-east-1";

var dynamodb = new AWS.DynamoDB();

var params = {};
params.TableName = "processblog";
// params.Item = blogEntries[0]; 

// eachSeries in the async module iterates over an array and operates on each item in the array in series
async.eachSeries(blogEntries, function(value, callback) {
    params.Item = value;
    
    // console.log(value.date);
    
    dynamodb.putItem(params, function (err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else     console.log(`Blog posted`);           // successful response
    });

    // sleep for a couple seconds before making the next request
    setTimeout(callback, 2000);
}, function() {
    console.log('*** *** *** *** ***');
    console.log(`Number of blog posts added: ${Object.entries(params).length}`);
});


