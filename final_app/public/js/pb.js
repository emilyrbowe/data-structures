/* global $*/

var writingType;

$(document).ready(function() {
  $(".btn").on('click', function(e) {

    $(this).addClass("active");
    $(this).siblings().removeClass('active')

    if (this.classList.contains('active')) {
      writingType = $(this).attr("id");
    }
    showTexts(writingType)
  });
});

function showSidebar(el) {
  $(el).addClass("selected");
  $(el).siblings().removeClass('selected')
  let sidebarContent = ($(el).html())
  $('#viewer').html(`${sidebarContent}`);
};

function showTexts(writingType) {
  var parameters = {
    thesisWriting: writingType,
  };

  console.log(parameters);

  //getting server endpoint
  $.get('/processblog', parameters, function(data) {
    console.log(data);
    let content = '';
    // console.log(data.pbtext);
    // data = data.pbtext;
    for (var i = 0; i < data.pbtext.length; i++) {
      content +=
        `
        <div class="writing" onclick="showSidebar(this)">
            ${data.pbtext[i].entry.S}
        </div>
        `
    };
    // console.log(content);
    $('#myWriting').html(`${content}`);
    $('#viewer').html('Click on one of the documents to preview it here');
  })
};
