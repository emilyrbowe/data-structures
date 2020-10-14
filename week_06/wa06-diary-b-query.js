 // npm install aws-sdk
var AWS = require('aws-sdk');
AWS.config = new AWS.Config();
AWS.config.region = "us-east-1";

var dynamodb = new AWS.DynamoDB();

var params = {
    TableName : "processblog",
    // KeyConditionExpression: "pk >= :primaryKeyVal and thesisWork = :workBoolean and feeling_1_5 > :minFeeling", // the query expression
     KeyConditionExpression: "pk = :primaryKeyVal and thesisWork = :workBoolean", // the query expression
    // ExpressionAttributeNames: { // name substitution, used for reserved words in DynamoDB
    // },
    ExpressionAttributeValues: { // the query values
        ":primaryKeyVal" : {"S": "0"},
        ":workBoolean": {"B": "true"},
        // ":minFeeling": {"N": "3"}
    }
};

dynamodb.query(params, function(err, data) {
    if (err) {
        console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
        console.log("Query succeeded.");
        data.Items.forEach(function(item) {
            console.log("***** ***** ***** ***** ***** \n", item);
        });
    }
});