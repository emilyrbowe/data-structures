/* global $*/

var writingType;

$(document).ready(function() {
    $(".btn").on('click', function(e) {
        
        $(this).addClass("active");
        $(this).siblings().removeClass('active')
        
        if (this.classList.contains('active')){
            writingType = $(this).attr("id");
        }
        showTexts(writingType)
    });
  
  //show texts in a sidebar
  $(".writing").on('click', function(e) {
    $(this).addClass("active");
    $(this).siblings().removeClass('active')
    
    if (this.classList.contains('active')){
        var writingToShow = $(this).html();
        $('#viewer').html(`${writingToShow}`);
    }
  showTexts(writingType)
  });
});


function showTexts(writingType){
  var parameters = {
    thesisWriting: writingType,
  };
  
  console.log(parameters);
  
  //getting server endpoint
  $.get('/processblog', parameters, function(data){
    console.log(data);
    let content ='';
    // console.log(data.pbtext);
    data = data.pbtext;
    for (var i=0; i<data.length; i++) {
        content += `
        <div class="writing ${data[i].PK_category.S}">
            ${data[i].entry.S}
        </div>
        `
        };
    // console.log(content);
    $('#myWriting').html(`${content}`);
    $('#viewer').html();
    })
};