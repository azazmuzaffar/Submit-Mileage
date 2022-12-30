var nameWA,
  pinWA,
  bibWA,
  dateWA,
  mileageWA,
  mileskmWA,
  submissionArray = []; //N
var allFiles,
  file,
  fileProcessed = false,
  fileSubArray = [];
var responseA, responseB, position;
var userInfo;

var myModal = new bootstrap.Modal(document.getElementById("exampleModal"), {});

$("input[type=file]").change(function () {
  //N
  fileProcessed = false;
  console.log("File Changed!");
  fileSubArray = [];

  if ($(this).val() != "") {
    var t = $(this).val();
    console.log(t);
    var labelText = "File: " + t.substr(12, t.length);
    labelText = labelText.substr(0, 26) + "...";
    $(this).prev("label").text(labelText);
  } else {
    $(this).prev("label").text("");
  }
});

function formSubmit() {
  var name = $("#name").val();
  var pin = $("#pin").val();
  var bib = $("#bib").val();
  var date = $("#date").val();
  var mileage = $("#mileage").val();
  var mileskm = $("#mileskm").val(); //N

  console.log(name, pin, bib, date, mileage, mileskm); //N

  userInfo = getUserInfo(bib);
  console.log(userInfo);

  if (!userInfo) {
    bootbox.alert("Please enter a valid Bib Number");
    return;
  }

  nameWA = name;
  pinWA = pin;
  bibWA = bib;
  dateWA = date;
  mileageWA = mileage;
  mileskmWA = mileskm; //N

  if (name == "") {
    bootbox.alert("Please enter your name");
    return;
  }

  if (pin == "") {
    bootbox.alert("Please enter your PIN");
    return;
  }

  if (bib == "") {
    bootbox.alert("Please enter your Bib Number");
    return;
  }

  if (date == "") {
    bootbox.alert("Please enter the date in valid format");
    return;
  }

  //Date Check
  if (!validateDate(date)) {
    bootbox.alert("Ooops!! Looks like your date format is incorrect, You didn't input your Date of Birth did you? The date should be the date you did your mileage. Please use DD/MM/YYYY with the / and check you are submitting for the correct date.");
    return;
  }

  var startDate = new Date(2022, 11, 25); //Month has 0 Start
  var endDate = "";

  var today = new Date();
  today.setHours(23);
  today.setMinutes(59);
  today.setSeconds(59);

  var dateEntered = date;
  var splitDate = dateEntered.split("/");
  var date = splitDate[0];
  var month = splitDate[1];
  var year = splitDate[2];
  var dateEntered = new Date(year, month - 1, date);
  console.log(today);
  console.log(dateEntered);

  if (dateEntered.getTime() > today.getTime()) {
    bootbox.alert("Oops! You selected a date in the future, You cannot input future dates. Please check the date you are submitting for.");
    return;
  }

  if (dateEntered.getTime() < startDate.getTime()) {
    bootbox.alert("Ooops!! Looks like your date format is incorrect, You didn't input your Date of Birth did you? The date should be the date you did your mileage. Please use DD/MM/YYYY with the / and check you are submitting for the correct date.");
    return;
  }

  if (endDate != "") {
    if (dateEntered.getTime() > endDate.getTime()) {
      bootbox.alert(
        "Ooops!! Looks like your date format is incorrect, You didn't input your Date of Birth did you? The date should be the date you did your mileage. Please use DD/MM/YYYY with the / and check you are submitting for the correct date."
      );
      return;
    }
  }
  //Date Check

  if (mileage == "") {
    bootbox.alert("Please enter the mileage");
    return;
  }

  if (mileage < 0) {
    bootbox.alert("Please enter a mileage which is greater than 0");
    return;
  }

  if (mileage > 150 && mileskm == "Miles") {
    bootbox.alert("Please enter a mileage less than 150 miles");
    return;
  }

  //Miles Conversion - Based on Form & User Info
  if (mileskm == "Kms" && userInfo.userMilesOrKm == "Miles") {
    mileageWA = Math.round((mileageWA / 1.60934) * 100) / 100;
    console.log(mileageWA);
    if (mileageWA > 150) {
      bootbox.alert("Please enter a mileage less than 150 miles or 241.40 kms");
      return;
    }
  } else if (mileskm == "Miles" && userInfo.userMilesOrKm == "Kms") {
    mileageWA = Math.round(mileageWA * 1.60934 * 100) / 100;
    console.log(mileageWA);
  } else {
    mileageWA = Math.round(mileageWA * 100) / 100;
    console.log(mileageWA);
  }

  //mileageWA = units (km or miles) based on user
  //Miles Conversion - Based on Form & User Info

  submissionArray = [name, pin, bib, $("#date").val(), mileageWA];
  console.log(submissionArray);

  //Process Files
  allFiles = $("#file")[0].files;
  var noOfFiles = allFiles.length;
  console.log(noOfFiles);

  if (noOfFiles > 0) {
    //Check File Sizes
    for (z = 0; z < noOfFiles; z++) {
      file = allFiles[z];
      var filesize = (file.size / 1024 / 1024).toFixed(4); // MB
      console.log(filesize);
      if (filesize > 10) {
        bootbox.alert("Please make sure your files are less than 10 MB in size.");
        return;
      }
    }

    if (!fileProcessed) {
      var completedFiles = 0;
      $.LoadingOverlay("show");

      for (z = 0; z < 1; z++) {
        file = allFiles[z];
        var storage = firebase.storage().ref(file.name);
        var upload = storage.put(file);

        upload.on(
          "state_changed",
          function progress(snapshot) {
            var percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(percentage);
          },

          function error(err) {
            console.log(err);
            bootbox.alert("File Upload error, please try again or contact Admin.");
            $.LoadingOverlay("hide");
            return;
          },

          function complete() {
            upload.snapshot.ref.getDownloadURL().then(function (downloadURL) {
              console.log("File available at", downloadURL);
              fileProcessed = true;
              fileSubArray.push(downloadURL);
              submissionArray.push(fileSubArray.toString());
              submitMileage(submissionArray);
            });
          }
        );
      }
    } else if (fileProcessed) {
      submissionArray.push(fileSubArray.toString());
      $.LoadingOverlay("show");
      submitMileage(submissionArray);
    }
  } else {
    submissionArray.push(fileSubArray.toString());
    $.LoadingOverlay("show");
    submitMileage(submissionArray);
  }
}

function submitMileage(submissionArray) {
  console.log(submissionArray);
  var scriptURL = "https://script.google.com/macros/s/AKfycbx8zu-4kNHpw_wnKPGZmSIULoz26eynal5ZQpxYWdngccwpiQsL7XjxLLhT-tXy/exec";

  var request = $.ajax({
    crossDomain: true,
    url: scriptURL,
    method: "GET",
    data: {
      primary: [submissionArray],
      action: "submitMileage",
    },
    dataType: "jsonp",
  });
  console.log(request);
  request.done(function (response, textStatus, jqXHR) {
    //console.log(response);
    var message = response.message;
    var key = response.key;
    var status = response.status;
    postFormSubmission(message, key, status);
  });
}

function postFormSubmission(message, key, status) {
  var indexOfError = message.indexOf("Error");
  if (indexOfError > -1) {
    $.LoadingOverlay("hide");
    bootbox.alert(message);
  } else {
    //New
    ajax1(key);
  }
}

function ajax1(key) {
  var url = "https://e2e-2023-default-rtdb.europe-west1.firebasedatabase.app/leaderboardDetails/" + bibWA + "/.json?auth=" + key;
  var request = $.ajax({
    crossDomain: true,
    url: url,
    async: true,
    method: "GET",
    contentType: "application/json",
    dataType: "json",
  });

  console.log(request);
  request.done(function (response, textStatus, jqXHR) {
    console.log(response);
    console.log(textStatus);
    if (textStatus == "success") {
      responseA = response;
      //Proceed to Update Page
      proceedUpdatePage(key);
    }
  });
  request.fail(function (response, textStatus) {
    console.log(response);
    console.log(textStatus);
    $.LoadingOverlay("hide");
    bootbox.alert("X002 Error, Please Try Again.");
  });
}

function proceedUpdatePage(key) {
  console.log(masterData);
  console.log(responseA);
  console.log(position);
  console.log(userInfo);

  var dateEntered = dateWA;
  var splitDate = dateEntered.split("/");
  var date = splitDate[0].replace(/^0+/, "");
  var month = splitDate[1].replace(/^0+/, "");
  var year = splitDate[2];

  console.log(year, month, date);
  //Exisiting Mileaage

  if (responseA == null) {
    responseA = {};
  }

  if (responseA[year] == null || responseA[year] == undefined) {
    responseA[year] = {};
  }

  if (responseA[year][month] == null || responseA[year][month] == undefined) {
    responseA[year][month] = {};
  }

  responseA[year][month][date] = Number(mileageWA);
  var newTotalMileage = 0;
  for (var year in responseA) {
    for (var month in responseA[year]) {
      for (var date in responseA[year][month]) {
        var mileage = responseA[year][month][date];
        if (mileage != null) {
          newTotalMileage += Number(mileage);
        }
      }
    }
  }
  console.log(newTotalMileage);
  if (newTotalMileage > userInfo.userTotalDistance) {
    newTotalMileage = userInfo.userTotalDistance;
  }

  var updatePositon = false;

  for (z = 0; z < masterData.length; z++) {
    if (masterData[z][1] == bibWA) {
      console.log(masterData[z]);
      var newLeft = userInfo.userTotalDistance - newTotalMileage;
      masterData[z][2] = newTotalMileage.toFixed(2);
      masterData[z][3] = newLeft.toFixed(2);
      console.log(masterData[z]);

      var userDetails = masterData[z];
      break;
    }
  }

  //Update Firebase
  updateFirebase(position, updatePositon, userDetails, key);

  $("#myInput").val("");
  buildAndUpdatePage(userInfo.userRaceType);

  var message = "EXCELLENT!!! You just logged your mileage and it has been successfully updated! Please check your position on the map and in the leaderboard. You are another step closer to the finish line! Keep up the great work!";
  message += "<br>Name: " + nameWA;
  message += "<br>BIB: " + bibWA;
  message += "<br>Date: " + dateWA;
  message += "<br>Distance: " + mileageWA + " " + userInfo.userMilesOrKm;
  bootbox.alert(message);
}

function updateFirebase(position, updatePositon, userDetails, key) {
  var FBCount = 0;
  var completed = false;
  var completedUpdate = false;
  var leaderboardUpdate = false;
  var leaderboardDetailsUpdate = false;

  var dateEntered = dateWA;
  var splitDate = dateEntered.split("/");
  var date = splitDate[0].replace(/^0+/, "");
  var month = splitDate[1].replace(/^0+/, "");
  var year = splitDate[2];

  //Leaderboard
  var url = "https://e2e-2023-default-rtdb.europe-west1.firebasedatabase.app/leaderboard/" + bibWA + "/.json?auth=" + key;
  var requestB = $.ajax({
    url: url,
    method: "PUT",
    contentType: "application/json",
    dataType: "json",
    data: JSON.stringify(userDetails),
  });

  console.log(requestB);
  requestB.done(function (response, textStatus, jqXHR) {
    console.log(response);
    console.log(textStatus);
    if (textStatus == "success") {
      leaderboardUpdate = true;
    }
    FBCount++;
    if (FBCount == 2) {
      submissionArray.push(userDetails[2], completed, completedUpdate, leaderboardUpdate, leaderboardDetailsUpdate, new Date().toString());
      updateLog(submissionArray, key, FBCount);
    }
  });
  requestB.fail(function (response, textStatus) {
    console.log(response);
    console.log(textStatus);
    $.LoadingOverlay("hide");
    bootbox.alert("X005 Error, Please Try Again.");
    FBCount++;
    if (FBCount == 2) {
      submissionArray.push(userDetails[2], completed, completedUpdate, leaderboardUpdate, leaderboardDetailsUpdate, new Date().toString());
      updateLog(submissionArray, key, FBCount);
    }
  });

  //Leaderboard Details
  var url = "https://e2e-2023-default-rtdb.europe-west1.firebasedatabase.app/leaderboardDetails/" + bibWA + "/" + year + "/" + month + "/" + date + "/.json?auth=" + key;
  var requestC = $.ajax({
    url: url,
    method: "PUT",
    contentType: "application/json",
    dataType: "json",
    data: JSON.stringify(mileageWA),
  });

  console.log(requestC);
  requestC.done(function (response, textStatus, jqXHR) {
    console.log(response);
    console.log(textStatus);
    if (textStatus == "success") {
      leaderboardDetailsUpdate = true;
    }
    FBCount++;
    if (FBCount == 2) {
      submissionArray.push(userDetails[2], completed, completedUpdate, leaderboardUpdate, leaderboardDetailsUpdate, new Date().toString());
      updateLog(submissionArray, key, FBCount);
    }
  });
  requestC.fail(function (response, textStatus) {
    console.log(response);
    console.log(textStatus);
    $.LoadingOverlay("hide");
    bootbox.alert("X006 Error, Please Try Again.");
    FBCount++;
    if (FBCount == 2) {
      submissionArray.push(userDetails[2], completed, completedUpdate, leaderboardUpdate, leaderboardDetailsUpdate, new Date().toString());
      updateLog(submissionArray, key, FBCount);
    }
  });
  //Log
}

function updateLog(submissionArray, key) {
  submissionArray.push(new Date().getTime());
  var url = "https://e2e-2023-default-rtdb.europe-west1.firebasedatabase.app/logs/.json?auth=" + key; //Altered
  var requestC = $.ajax({
    url: url,
    method: "POST",
    contentType: "application/json",
    dataType: "json",
    data: JSON.stringify(submissionArray),
  });

  console.log(requestC);
  requestC.done(function (response, textStatus, jqXHR) {
    console.log(response);
    console.log(textStatus);
  });
  requestC.fail(function (response, textStatus) {
    console.log(response);
    console.log(textStatus);
    $.LoadingOverlay("hide");
    bootbox.alert("X007 Error, Please Notify the Admin");
  });
}

var file,
  reader = new FileReader();

function validateDate(dateEntered) {
  var res = dateEntered.match(
    /(^(((0[1-9]|1[0-9]|2[0-8])[\/](0[1-9]|1[012]))|((29|30|31)[\/](0[13578]|1[02]))|((29|30)[\/](0[4,6,9]|11)))[\/](19|[2-9][0-9])\d\d$)|(^29[\/]02[\/](19|[2-9][0-9])(00|04|08|12|16|20|24|28|32|36|40|44|48|52|56|60|64|68|72|76|80|84|88|92|96)$)/gi
  );
  console.log(res);
  if (res == null) {
    return false;
  } else {
    return true;
  }
}

function checkLogPre() {
  bootbox.prompt("Please Enter Bib No!", function (bibNo) {
    console.log(bibNo);
    if (bibNo != null) {
      //Loading Show
      var url = "https://e2e-2023-default-rtdb.europe-west1.firebasedatabase.app/leaderboardDetails/" + bibNo + "/.json";
      var request = $.ajax({
        crossDomain: true,
        url: url,
        async: true,
        method: "GET",
        contentType: "application/json",
        dataType: "json",
      });

      console.log(request);
      request.done(function (response, textStatus, jqXHR) {
        console.log(response);
        console.log(textStatus);
        if (textStatus == "success") {
          //Process
          if (response != null) {
            var label = "Mileage Log for " + bibNo;
            $("#exampleModalLabel").html(label);

            var html = "";
            html += '<table class="table">';
            html += "<thead><tr><th style='text-align:center;'>Date</th><th style='text-align:center;'>Mileage</th></tr></thead>";
            html += "<tbody>";

            for (var year in response) {
              for (var month in response[year]) {
                for (var date in response[year][month]) {
                  console.log(date, month, year);
                  console.log(response[year][month][date]);
                  var fullDate = date + "/" + month + "/" + year;
                  var mileage = response[year][month][date];
                  if (mileage != null && mileage != 0 && mileage != "0") {
                    html += "<tr>";
                    html += "<td style='text-align:center;'>" + fullDate + "</td>";
                    html += "<td style='text-align:center;'>" + Number(response[year][month][date]).toFixed(2) + "</td>";
                    html += "</tr>";
                  }
                }
              }
            }

            html += "</tbody>";
            html += "</table>";
            $("#exampleModalBody").html(html);

            myModal.show();
          } else {
            bootbox.alert("Please check the Bib No you have entered");
          }
        }
      });
      request.fail(function (response, textStatus) {
        console.log(response);
        console.log(textStatus);
        bootbox.alert("X002A Error, Please Try Again.");
      });
      //Loading Hide
    }
  });
}

$(document).ready(() => {
  $("#select-selected").html("500 Miles");
});

function getUserInfo(bib) {
  console.log(masterData);

  for (i = 0; i < masterData.length; i++) {
    if (Number(masterData[i][1]) === Number(bib)) {
      var raceType = masterData[i][6];
      var milesOfKm = masterData[i][5];

      var userTotalDistance = 0;
      if (raceType.indexOf("500") > -1) {
        userTotalDistance = 500;
      } else if (raceType.indexOf("1000") > -1) {
        userTotalDistance = 1000;
      } else if (raceType.indexOf("2023") > -1) {
        userTotalDistance = 2023;
      }

      return {
        userMilesOrKm: milesOfKm,
        userTotalDistance: userTotalDistance,
        userRaceType: raceType,
      };
    }
  }

  return false;
}

// Your web app's Firebase configuration
//newTotalMileage = Number(newTotalMileage.toFixed(2)) + Number(mileage.toFixed(2));
var firebaseConfig = {
  apiKey: "AIzaSyB9VKoZsQ_29-5gaHLtmEQPed3bx-1Hix0",
  authDomain: "lands-end-3.firebaseapp.com",
  databaseURL: "https://lands-end-3.firebaseio.com",
  projectId: "lands-end-3",
  storageBucket: "lands-end-3.appspot.com",
  messagingSenderId: "929451729761",
  appId: "1:929451729761:web:db2f422403abd2179c9b20",
  measurementId: "G-PLDDEZX8SN",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
