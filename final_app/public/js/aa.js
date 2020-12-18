/*global $, moment*/

//filtering code from https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_filter_elements

var todayNum = moment().day().toString();
var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var todayName = days[todayNum];
// console.log(todayName);

var dayButtons = $('.btn');
console.log(dayButtons);

for (var btn of dayButtons){
    console(btn.attr("id"));
  if (btn.attr("id")==todayName){
      btn.classList.add("active")
  }
  else {
      btn.classList.remove("active")
  }
}

$(document).ready(function() {
    dayButtons.on('click', function(e) {
        let selectedDay = $(this).attr("id");
        $(this).toggleClass("active");
        
        let daysArray = [];
        for (btn in dayButtons) {
          if (btn.classList.contains('active')){
            daysArray.push(selectedDay);
          }
        }
        console.log(daysArray);
        
        // showMarkers(daysArray);
        
    });
});

function showMarkers(days){
  var parameters = {
    selectedDays: dayString,
  }
  
  $.get('/aa', parameters, function(data){
    
  })
}

function getResults(sliderVals, nowDayString) {

    sliderVals = $("#appearance1").roundSlider("option", "value").split(',');

    var parameters = { weekDays: nowDayString, lowerTimeBound: sliderVals[0], upperTimeBound: sliderVals[1] };
    console.log(parameters)

    //call endpoint on the server
    $.get('/aa', parameters, function (data) {

        // console.log(data)

        markers.clearLayers();

        var meetingDivs = document.querySelectorAll('.meeting-div')

        if (meetingDivs.length > 1) {
            meetingDivs.forEach(meeting => {
                // console.log(meeting)
                meeting.parentNode.removeChild(meeting)
            })
        }

        data.forEach(item => {
            console.log(item)

            var popupInfo = `<p class='add-title'>${item.meeting[0].streetaddress}</p>`;

            var ada = "Not Wheelchair Accessible";
            if (item.ada == "true") {
                ada = "Wheelchair Accessible"
            }

            for (const meeting of item.meeting) {

                popupInfo += `<br> <p class='grp-name'>${meeting.groupname}</p> <p>${meeting.weekday} from ${meeting.starttime} to ${meeting.endtime} ${meeting.ampm}</p>`;
                var parentDiv = document.createElement('div')
                parentDiv.className = "meeting-div"

                var meetingInfo = document.createElement('div')
                meetingInfo.className = "meeting-info"
                meetingInfo.setAttribute('addr', `${meeting.streetaddress.toLowerCase().split("new")[0]}`)
                meetingInfo.innerHTML = `<h3>${meeting.groupname}</h3><br><p class='mtg-type'>${meeting.typename} <br> ${meeting.interest}</p><br><p>${meeting.weekday} from ${meeting.starttime} to ${meeting.endtime} ${meeting.ampm}</p><br><p class="address">${meeting.streetaddress.toLowerCase().split("new")[0]}<br></p><p>${meeting.city}, ${meeting.state} ${meeting.zipcode}</p><br><p class='ada'>*${ada}</p>`

                parentDiv.appendChild(meetingInfo)

                meetingInfo.addEventListener('click', function () {
                    var address = this.getAttribute('addr')

                    $.each(map._layers, function (i, item) {
                        if (this._leaflet_id == address) {
                            this.openPopup();
                            console.log(map);
                            map.setView(this._latlng, 14)
                        }
                    });
                })

                var meetingsDiv = document.querySelector(".meetings")
                meetingsDiv.appendChild(parentDiv)
            }

            var mark = L.marker([item.lat, item.long])
            mark._leaflet_id = `${item.meeting[0].streetaddress.toLowerCase().split("new")[0]}`;
            mark.bindPopup(popupInfo).addTo(markers);


        })


    });
}

// // filterSelection("all")
// function filterSelection(c) {
//   var x, i;
//   x = document.getElementsByClassName("filterDiv");
//   if (c == "all") c = "";
//   // Add the "show" class (display:block) to the filtered elements, and remove the "show" class from the elements that are not selected
//   for (i = 0; i < x.length; i++) {
//     w3RemoveClass(x[i], "show");
//     if (x[i].className.indexOf(c) > -1) w3AddClass(x[i], "show");
//   }
// }

// // Show filtered elements
// function w3AddClass(element, name) {
//   var i, arr1, arr2;
//   arr1 = element.className.split(" ");
//   arr2 = name.split(" ");
//   for (i = 0; i < arr2.length; i++) {
//     if (arr1.indexOf(arr2[i]) == -1) {
//       element.className += " " + arr2[i];
//     }
//   }
// }

// // Hide elements that are not selected
// function w3RemoveClass(element, name) {
//   var i, arr1, arr2;
//   arr1 = element.className.split(" ");
//   arr2 = name.split(" ");
//   for (i = 0; i < arr2.length; i++) {
//     while (arr1.indexOf(arr2[i]) > -1) {
//       arr1.splice(arr1.indexOf(arr2[i]), 1);
//     }
//   }
//   element.className = arr1.join(" ");
// }

// // // Add active class to the current control button (highlight it)
// // var btnContainer = document.getElementById("buttondays");
// // var btns = btnContainer.getElementsByClassName("btn");
// // for (var i = 0; i < btns.length; i++) {
// //   btns[i].addEventListener("click", function() {
// //     var current = document.getElementsByClassName("active");
// //     current[0].className = current[0].className.replace(" active", "");
// //     this.className += " active";
// //   });
// // }