const async = require('async');

var thesisWriting = [];

class WritingEntry {
  constructor(writingtype, date, entry) {
    this.PK_category = {};
    this.PK_category.S = writingtype.toString();
    this.SK_date = {}; 
    this.SK_date.S = new Date(date).toDateString();
    this.entry = {};
    this.entry.S = entry;
    this.month = {};
    this.month.N = new Date(date).getMonth().toString();
  }
}

thesisWriting.push(new WritingEntry('Misc', 'July 07, 2020', `Random thought: What would it look like to expand understanding of "planning" beyond land development and real estate to something more expansive about education, water rights, environmental justice, and transportation? I.e. what do master plans really mean if you don't take these other things into account? And what would it mean to plan the growth of the southern section of the city under these terms?`));
thesisWriting.push(new WritingEntry('Memo', 'September 08, 2020', `What would it mean to look at the processes that created the data situations and the data assemblages as unique situations that can say something about San Antonino as a whole?

How have the histories collided with civic practices and ways of doing things?

What does this mean for lessons learned as we think about this School of Data Science? What does it mean for community knowledge?

The City as Data Machine: Local Governance in the Age of Big Data Baykurt, Burcu https://academiccommons.columbia.edu/doi/10.7916/d8-wta1-zj56

From Gray, 2019: Rather than focusing exclusively on the products of quantification or datafication, these projects may be viewed in relational terms – as 'data assemblages' (Kitchin, 2014; Kitchin & Lauriault, 2018) or 'media ensembles' (Moats, 2017) – in order to examine who and what data witnessing can attend to and assemble, in what capacity and to what end. (974)`));
thesisWriting.push(new WritingEntry('Interview Notes', 'July 05, 2020', `Spoke with Dee @ Thomas & Grace’s house over dinner re thesis and thinking about the segregation in SATX. She mentioned that when she used to work at the Catholic Worker House in SA and visiting nuns would come, they would ask her to take them on a tour of the city. She said she showed them two things: HEBs and Catholic Churches around the city. At the HEB, they were to look at the quality of the produce in the various locations. At the churches, they were to look at the crucifix. In her words: “the state of the cross told you a lot about the people that lived there and how they saw themselves. If it was a bloody, bruised Jesus with a crown of thorns, those people were suffering. If it was a post-resurrection Jesus, those people viewed themselves as past suffering(?).`));
thesisWriting.push(new WritingEntry('Interview Notes', 'September 04, 2020', `Today, I spoke with Sarah Serpas, a planner in the San Antonio Department of Planning. She was a speaker at the 2020 Hindsight Conference and is an alumna of the planning program at Pratt. We spoke for 2.5 hours (our allotted time was 1 hour) and although I was a bit all over the place at first, we ended up having a ton to talk about. 

After introducing myself and giving an overivew of my interests in San Antonio + thesis research, we started talking specifically about her work. That began with a question about her involvement on the steering committee of the Alamo Regional Data Alliance (ARDA), which I had seen on her CV. I mentioned that I was initially familar with both ARDA and Community Information Now (CI:Now) from digital inclusion work I had done at the 80/20 Foundation around 2016. She told me that ARDA and CI:Now had recently split because CI:Now ran out of the Area Foundation funding they had received. 

Sarah mentioned that despite serving as a member of the ARDA steering committee, she felt like the organization (which, for the record, is not a 501(c)3) had been plagued by a "whole lot of process, and not a lot of doing" which she suspected had made some members frustrated. To read between the lines a bit, ARDA had gotten too bogged down in *how* they were going to do things that they hadn't done much. 

We talked a bit about the differences between New York and San Antonio and Sarah made a comment about how refreshing it was to be in a place that felt like it responded to the actions of individual people, noting that "moving her...feels like you can have an impact."

From there, our conversation turned to her work at the City of San Antonio (COSA). We spoke briefly about the Office of Innovation (and whether I knew Emily Royall) and the Office of Equity. I said that I didn't totally understand how these different offices all worked together. She made an interesting point in noting "how competitive the departments are with each other," attributing former City Manager Sheryl Sculley's bottom-line conscious management style with fostering a kind of zero-sum perception which limited collaboration. The COSA Equity Committee and Equity Trainers (of which Sarah is one) is a cross-department counterpoint to this, albeit one that sounds as if it's been plagued by its own struggles to get going. According to Sarah, she was nominated to be on the committee by Emily Royall. 

After this, she mentioned that her interests are in "where people live and why people live there." I had noted earlier in the conversation that the UTSA website I'd found said she was focused on school districts and 

There was an interesting aside about the broadband survey that the Office of Innovation conducted this summer, where Sarah noted her (unexpressed) frustration at the fact that the survey to learn about citizens' access to broadband had been `));
thesisWriting.push(new WritingEntry('Memo', 'October 15, 2020', `Just talked to Jason and am feeling really excited by the things that came out of that conversation. I think I need to focus on the UTSA School of Data Science project.

The building of the SDS provides a moment for conversation about the limits of data science as a way of understanding the world and a moment to reflect on the city's "smart city" policies. The building gives me a "boundary object" to use to break apart what is happening and to convene a conversation about what critical data studies can look like within the context of urban planning.

Can I use the narrative structure of the building from architecture (site, form, ___, ___) as a lens to unpack the governing histories and narratives that flow thorugh the site? And then from there, can I begin to ask questions about what data can bring into siutations that are related to these concepts of (site, form, etc)? (Aka can I ask questions about water, computation, and something else to create art/practice that allows others to explore these questions with me?)

What would it mean to subvert the typical urban design problem within the building? How can the process of building this become a chance for a community to have a conversation about`));
thesisWriting.push(new WritingEntry('Memo', 'November 08, 2020', `The planning for the new School of Data Science (SDS) at the University of Texas at San Antonio (UTSA) represents an institutional formalization of economic development interests aided by governmental bodies in a city that has made data the yardstick of public policy and governance. This new program represents a sort of culmination of much public conversation and activity that revolved around the question of how to measure progress.

In 2010, then-Mayor Julian Castro introduced SA2020, a community visioning process that laid out targets for progress in San Antonio and created a network of organizations providing data to measure this progress. During the last 10 years, San Antonio has turned its focus towards the urban core of the city with policy aimed at encouraging new jobs, housing, and development downtown, all of which had quantified targets to reach by the year 2020. In 2014, San Antonio hosted Fellows from Code for America, which served to create conversations about open data and civic technology within the city government. As the City took small steps towards an "open data" policy and digital presence, new organizations brought tech-focused jobs into the downtown core and pushed the narrative of economic development through the creation of a more technical workforce. In 2015, when then-Secretary of Housing and Urban Development Julian Castro launched his ConnectHome initiative, San Antonio was chosen as one of 27 pilot cities for work to bridge the "digital divide" that existed within the city's public housing. This work brought together stakeholders from government (City of San Antonio, Bexar County, San Antonio Housing Authority), nonprofits (NTEN, San Antonio Public Library, 80/20 Foundation) and corporations (Google Fiber) and ultimately created a larger conversation about how digital literacy, access, and inclusion could be measured using data. These conversations spotlighted multiple community data "brokers," such as Community Information Now (CINow) and the Alamo Regional Data Alliance (ARDA). More recently, as COVID-19 has spread throughout the city, maps and data from the city's public health authority rely on these repositories of community data and show, yet again, that decades of "progress" have left the same parts of the city vulnerable physically, economically, and socially.

As UTSA SDS begins construction, there are institutional conversations bridging data science and urban governance through connections to UTSA's College of Architecture and City Planning (CACP) and the involvement of the city and county governments in the project's completion. These conversations will likely tend towards promotion of "smart city" policies, which will likely further divide an already unequal city. The building's construction provides time for San Antonio institutions to have conversations and critically understand data-driven technologies that serve to erase histories, narratives, and cultures and to chart a path forward for what "data-driven progress" should mean into the future.

The UTSA School of Data Science provides a "boundary object" to use to break apart what is happening policy-wise in the city and to convene a conversation about what critical data studies can look like within the context of urban planning. The building will sit physically, at its site, and culturally, in its creation, at the intersection of multiple governing narratives for the city. San Pedro Creek will be adjacent to the building and brings with it the histories and counterhistories of the use and power of water in San Antonio. This waterway sits between the famed tourist-centric Riverwalk and the long-forgotten Westside Creeks. These bodies of water are the result of urban planning policies aimed, unevenly, at "progress" for the city. Looking at these parallel histories, it becomes clear that there are important lessons to understand about local organizing, civic boosterism, and environmental consciousness to avoid blindly following visions for planning aided by urban data science.

Through interviews, textual analysis, and archival research of city policies, architectural documents, and planning records, I will work to understand the ways that use of "data" functions in civic discourse and also will find opportunities with institutional partners for creative exploration of data to better understand the city's uneven development.`));
thesisWriting.push(new WritingEntry('To Do List', 'November 11, 2020', `
Interviews to Follow Up On: 
- Sarah Serpas, AICP
- Claudia Guerra
- Molly Cox
- Kiran Bains
- Jordana Barton (now at MHM)
- Paul Flahive
- Brian Dillard
- Emily Royall
- Sidef @ UTSA

Events to transcribe:
- Hindsight 2020 Panel: San Antonio Past, Present and Future
- [Westside History Symposium](https://www.youtube.com/watch?v=P19Md9K89Hk)`));
thesisWriting.push(new WritingEntry('Memo', 'November 16, 2020', `The disparities highlighted by the COVID-19 pandemic, along with the direction of San Antonio's institutional economic development interests, are underscoring the ways that data has become the yardstick of public policy and governance within the city. Recent work—such as the new School of Data Science (SDS) at the University of San Antonio, the community-driven visioning and data measurement process SA2020, and the focus on digital inclusion initiatives–brings questions of how to measure progress into focus.

As with many other cities, notions of progress have not been evenly applied across San Antonio, particularly as population growth has nearly doubled the city's boundaries. The Westside, a 95% Latinx neighborhood immediately to the west of downtown San Antonio, is long-acknowledged as having been routinely passed over for important resources. The city government, under a discourse of "equity-based policy", is attempting to change this trajectory through investments in historic preservation, affordable housing, digital literacy and broadband access, and flood protection.

Against this backdrop, two situations unfold that affect the future of the Westside into the next era of policy-making: the Westside Sub-Area Plan in the SA Tomorrow comprehensive planning process and the expansion of the UTSA Downtown campus, including the creation of the School of Data Science. The Westside Sub-Area Plan is a 2-year planning process relying heavily on community outreach to craft parcel-level land-use plans for the Westside. This process was proceeding with in-person community meetings at the beginning of 2020, but the COVID-19 pandemic has shifted all outreach and engagement online, posing a major challenge for connecting with residents who live in a district that has been shown to have significantly less broadband access and digital literacy. One unintended consequence here is that planners and staff may rely increasingly on data collected by the city or other public agencies to navigate this planning process.

The expansion of UTSA Downtown physically affects the eastern edge of the Westside, but more significantly is shaping one image of the city's future economy, through investments in cybersecurity, data science, and "smart city" institutes. These programs, taken together, are being billed as a way to train the future workforce of San Antonio and represent the formalization of a push for "progress" within institutional economic development. This work stems partially from the strong influence of the three active military bases in San Antonio, but also presents

The convergence in time of the Westside Sub-Area Plan and the School of Data Science provide a valuable moment for conversation within San Antonio policy institutions about how and when community voices and data-driven policy intersect. It is necessary to critically understand data-driven technologies that serve to erase histories, narratives, and cultures and to chart a path forward for what "data-driven progress" should mean for San Antonio into the future.`));
// console.log(thesisWriting);

var AWS = require('aws-sdk');
AWS.config = new AWS.Config();
AWS.config.region = "us-east-1";

var dynamodb = new AWS.DynamoDB();

var params = {};
params.TableName = "process-blog-thesis";
// params.Item = blogEntries[0]; 

// eachSeries in the async module iterates over an array and operates on each item in the array in series
async.eachSeries(thesisWriting, function(value, callback) {
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