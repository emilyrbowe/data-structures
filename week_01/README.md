# Week 1 Assignment
#### Due: September 8, 2020 6pm

## Objective: Request HTML for 10 web pages and save as separate text files

In this assignment, I was asked to write some javascript that could get the HTML content from ten webpages. The pages showed the locations for the ten zones of New York City Alcoholics Anonymous, with each zone having its own page.

------

## Instructions

1. Using Node.js (in Cloud 9), make a request for each of the ten "Meeting List Agenda" zone pages for Manhattan. **Important: show the code for all ten requests.**
```
https://parsons.nyc/aa/m01.html  
https://parsons.nyc/aa/m02.html  
https://parsons.nyc/aa/m03.html  
https://parsons.nyc/aa/m04.html  
https://parsons.nyc/aa/m05.html  
https://parsons.nyc/aa/m06.html  
https://parsons.nyc/aa/m07.html  
https://parsons.nyc/aa/m08.html  
https://parsons.nyc/aa/m09.html  
https://parsons.nyc/aa/m10.html
```

2. Using Node.js: For each of the ten files you requested, save the body as a text file to your "local" environment (in AWS Cloud9).

3. Study the HTML structure and tags and begin to think about how you might parse these files to extract relevant data for these AA meetings.

4. Update your GitHub repository with the relevant files: your js file and ten txt files, plus a md file with your documentation. In Canvas, submit the URL of the specific location of this work within your data-structures GitHub repository.

------

## Starter Code
We were given starter code that first used the terminal to install node package manager and also create a folder called "data" in the root directory.

```
npm install request
mkdir data
```
The next step was to create a starter file `fetch.js` with the following code, which allowed me to download the HTML from [this URL](https://parsons.nyc/thesis-2020) into a text file in my newly created data directory.

```javascript
"use strict"
var request = require('request');
var fs = require('fs');

request('https://parsons.nyc/thesis-2020/', function(error, response, body){
    if (!error && response.statusCode == 200) {
        fs.writeFileSync(`${__dirname}/data/thesis.txt`, body);
    }else{
        console.log(`GET request failed: ${response.statusCode} "${response.statusMessage}"`)
    }
});
```
From here, I had to figure out how to get the same outcome, but for 10 different URLs (and ideally do it programmatically).

------

## Process Documentation

In thinking about how to achieve the goal of the assignment programmatically (as opposed to copying the code 10 times and changing the URLs), I knew a loop of some kind would be necessary.

I started the assignment by calling two node modules that I knew I would need.

```JavaScript
var get = require('simple-get');
var fs = require('fs');
```

### Attempt 1: For loop with nested function
I started with the idea to create an array of the URLs that I would be able to loop through.

```javascript
var aaPages = ['https://parsons.nyc/aa/m01.html', 'https://parsons.nyc/aa/m02.html', 'https://parsons.nyc/aa/m03.html', 'https://parsons.nyc/aa/m04.html', 'https://parsons.nyc/aa/m05.html', 'https://parsons.nyc/aa/m06.html', 'https://parsons.nyc/aa/m07.html', 'https://parsons.nyc/aa/m08.html', 'https://parsons.nyc/aa/m09.html', 'https://parsons.nyc/aa/m10.html'];
```

I then tried to take the starter code and add a `for` loop with the `request()` function inside the loop, which is below. I used an index variable `i` that I incremented up by 1 until it reached the last element (noted with `i<aaPages.length`) I created a variable `zone` that was created by indexing each object in `aaPages` at a specific value (the 24th and 25th characters) to create a zone ID that I could append to the base URL. I used a [template string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) `${zone}` to be able to pass the zone value through into directory location that would change for each URL.

```javascript
for (var i=0; i<aaPages.length; i++) {
    var zone = aaPages[i][24] + aaPages[i][25];
    get.concat(aaPages[i], function(err, res, data){
       if (!err && res.statusCode == 200) {
           fs.writeFileSync(`${__dirname}/data/m${zone}.txt`, data);
       }else{
           console.log(`GET request failed: ${res.statusCode} "${res.statusMessage}"`);
       }
}
````

When I did that, I quickly found that the function would only create a .txt file for district 10 (m10.txt), which puzzled me for a while...until I came across an error message telling me that I didn't have variable closure. After much googling about what that meant, I realized the asynchronous quality of JavaScript had foiled my homework. So, onto a different approach...

### Attempt 2: Writing separate functions

My second attempt was built around writing two separate functions that could do the work of actually requesting the HTML and saving to a .txt file and looping through an array separately.

In the function `getHTML()`, an array is passed through and then the function loops through each object in the array creating both a value for the zone ID and calling another function called `HTMLtoTXT()`.

```javascript
function getHTML(array) {
    for (var i=0; i<array.length; i++) {
        var zone = array[i][24] + array[i][25];
        HTMLtoTXT(array[i], zone);
    }
};
````
In the function `HTMLtoTXT()`, an URL and text snipped are passed through and the URL's HTML is saved to a .txt file that is named using the text snippet.

```JavaScript
function HTMLtoTXT(pageURL, txt_name) {
     get.concat(pageURL, function(err, res, data){
        if (!err && res.statusCode == 200) {
            fs.writeFileSync(`${__dirname}/data/m${txt_name}.txt`, data);
        }else{
            console.log(`GET request failed: ${res.statusCode} "${res.statusMessage}"`);
        }
    });
}
````

From there, the last step was to combine the work of the two functions by calling `getHTML(aaPages);`.

### Success! 👾
