/*global $, moment*/

var dayArray;
var todayNum = moment().day().toString();
var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday",
  "Saturday"
];
var todayName = days[todayNum];
console.log(todayName);

var dayButtons = $(".btn");

for (var btn of dayButtons) {
  if (btn.id == todayName) {
    btn.classList.add("active")
  } else {
    btn.classList.remove("active")
  }
}

function toggleDay() {
  dayArray = [];
  for (var btn of dayButtons) {
    if (btn.classList.contains('active')) {
      dayArray.push(btn.id);
    }
  }
  // console.log(dayArray);
}

$(document).ready(function() {
  dayButtons.on('click', function(e) {
    $(this).toggleClass("active");
    toggleDay();
    showMarkers(dayArray);
  });
});

function showMarkers(dayArray) {
  var parameters = {
    selectedDays: dayArray,
  };

  console.log(parameters);

  //getting server endpoint
  $.get('/aa', parameters, function(data) {
    //clear the map layers from the original layer
    markers.clearLayers();
    //  console.log("data", data.mtgdata);
    //  let meetinfo = data.mtgdata;
    let content = '';
    console.log(data.meetings);
    data = data.meetings;
    for (var i = 0; i < data.length; i++) {
      for (var j = 0; j < data[i].meetinfo.length; j++) {
        markers.addLayer(L.marker([data[i].mtglat, data[i].mtglng]).bindPopup(
          '<b>' + data[i].meetinfo[j].name + '</b></br></br>' + data[i]
          .meetinfo[j].loc + '</br>' + data[i].meetinfo[j].address +
          '</br></br>' + data[i].meetinfo[j].types + '</br></br>' +
          data[i].meetinfo[j].day + '</br>' + data[i].meetinfo[j].friendlyTime +
          '</br>'));

        content +=
          `<div class="meetingcard ${data[i].meetinfo[j].day}">
            <b>${data[i].meetinfo[j].name}</b></br>
            ${data[i].meetinfo[j].day} ${data[i].meetinfo[j].friendlyTime}</br>
            ${data[i].meetinfo[j].loc}</br>
            ${data[i].meetinfo[j].address}</br>
            ${data[i].meetinfo[j].types}</br>
            </div>
            `
      }
    };
    mymap.addLayer(markers);
    console.log(content);
    $('#meetingObjects').html(`${content}`);
  });
}
