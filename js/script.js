//console.log = function() {};

$.LoadingOverlay("show");
var masterData = [];

//Get Leaderboard and Build Page
var leaderboardJSON = $.getJSON("https://e2e-2023-default-rtdb.europe-west1.firebasedatabase.app/leaderboard/.json", function (data) {
  console.log(data);
  for (var prop in data) {
    if (Object.prototype.hasOwnProperty.call(data, prop)) {
      masterData.push(data[prop]);
    }
  }
  console.log(masterData);
  buildAndUpdatePage();
});

//Build Page on Page Load / Data Load
function buildAndUpdatePage(type = "500-miles") {
  //Participants Data - Sort First
  masterData.sort(sortFunctionSecond);
  masterData.sort(sortFunction);

  for (m = 0; m < masterData.length; m++) {
    masterData[m][2] = Number(masterData[m][2]).toFixed(2);
    masterData[m][3] = Number(masterData[m][3]).toFixed(2);
  }
  console.log(masterData);

  //Appending Leaderboard - 500-miles
  var html = "";
  html += '<table style="" class="table" id="myTable">';
  html += "<thead><tr><th>Name</th><th style='text-align:center;'>Bib</th><th style='text-align:center;'>Covered (M)</th><th style='text-align:center;'>Left (M)</th></tr></thead>";
  html += "<tbody>";
  for (i = 0; i < masterData.length; i++) {
    var name = masterData[i][0].replace(/ /g, "_");
    var bib = masterData[i][1];
    var distanceCovered = masterData[i][2];
    var totalDistance = masterData[i][3];
    var raceType = masterData[i][6];

    if (raceType === type) {
      var thisArray = [name, distanceCovered, bib, raceType];

      html += "<tr onclick=markerClicked('" + thisArray + "')>";
      html += "<td>" + masterData[i][0] + "</td>";
      html += "<td style='text-align:center;'>" + masterData[i][1] + "</td>";
      html += "<td style='text-align:center;'>" + masterData[i][2] + "</td>";
      html += "<td style='text-align:center;'>" + masterData[i][3] + "</td>";
      html += "</tr>";
    }
  }
  html += "</tbody>";
  html += "</table>";

  console.log(html);
  $("#leaderboard").html(html);
  tableStripe();

  changeSelect(type);

  $.LoadingOverlay("hide"); //Moved it
}

//Sort Functions
function sortFunction(a, b) {
  if (Number(a[4]) === Number(b[4])) {
    return 0;
  } else {
    return Number(a[4]) < Number(b[4]) ? -1 : 1;
  }
}

function sortFunctionSecond(a, b) {
  if (Number(a[2]) === Number(b[2])) {
    return 0;
  } else {
    return Number(a[2]) > Number(b[2]) ? -1 : 1;
  }
}

function sortFunctionThird(a, b) {
  if (Number(a[1]) === Number(b[1])) {
    return 0;
  } else {
    return Number(a[1]) > Number(b[1]) ? -1 : 1;
  }
}

//Custom Select
var x, i, j, l, ll, selElmnt, a, b, c;
/*look for any elements with the class "custom-select":*/
x = document.getElementsByClassName("custom-select");
l = x.length;
for (i = 0; i < l; i++) {
  selElmnt = x[i].getElementsByTagName("select")[0];
  ll = selElmnt.length;
  /*for each element, create a new DIV that will act as the selected item:*/
  a = document.createElement("DIV");
  a.setAttribute("class", "select-selected");
  a.id = "select-selected";
  a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
  x[i].appendChild(a);
  /*for each element, create a new DIV that will contain the option list:*/
  b = document.createElement("DIV");
  b.setAttribute("class", "select-items select-hide");
  for (j = 1; j < ll; j++) {
    /*for each option in the original select element,
        create a new DIV that will act as an option item:*/
    c = document.createElement("DIV");
    c.innerHTML = selElmnt.options[j].innerHTML;
    c.addEventListener("click", function (e) {
      /*when an item is clicked, update the original select box,
            and the selected item:*/
      var y, i, k, s, h, sl, yl;
      s = this.parentNode.parentNode.getElementsByTagName("select")[0];
      sl = s.length;
      h = this.parentNode.previousSibling;
      for (i = 0; i < sl; i++) {
        if (s.options[i].innerHTML == this.innerHTML) {
          //console.log(this.innerHTML);
          selectHandler(this.innerHTML);
          s.selectedIndex = i;
          h.innerHTML = this.innerHTML;
          y = this.parentNode.getElementsByClassName("same-as-selected");
          yl = y.length;
          for (k = 0; k < yl; k++) {
            y[k].removeAttribute("class");
          }
          this.setAttribute("class", "same-as-selected");
          break;
        }
      }
      h.click();
    });
    b.appendChild(c);
  }
  x[i].appendChild(b);
  a.addEventListener("click", function (e) {
    /*when the select box is clicked, close any other select boxes,
          and open/close the current select box:*/
    e.stopPropagation();
    closeAllSelect(this);
    this.nextSibling.classList.toggle("select-hide");
    this.classList.toggle("select-arrow-active");
  });
}

function closeAllSelect(elmnt) {
  /*a function that will close all select boxes in the document,
      except the current select box:*/
  var x,
    y,
    i,
    xl,
    yl,
    arrNo = [];
  x = document.getElementsByClassName("select-items");
  y = document.getElementsByClassName("select-selected");
  xl = x.length;
  yl = y.length;
  for (i = 0; i < yl; i++) {
    if (elmnt == y[i]) {
      arrNo.push(i);
    } else {
      y[i].classList.remove("select-arrow-active");
    }
  }
  for (i = 0; i < xl; i++) {
    if (arrNo.indexOf(i)) {
      x[i].classList.add("select-hide");
    }
  }
}

/*if the user clicks anywhere outside the select box,
    then close all select boxes:*/
document.addEventListener("click", closeAllSelect);

function selectHandler(typeOrg) {
  console.log(typeOrg);
  var type = "";

  switch (typeOrg) {
    case "500 Miles":
      type = "500-miles";
      break;
    case "500 Kms":
      type = "500-km";
      break;
    case "1000 Miles":
      type = "1000-miles";
      break;
    case "1000 Kms":
      type = "1000-km";
      break;
    case "2023 Miles":
      type = "2023-miles";
      break;
    case "2023 Kms":
      type = "2023-km";
      break;
  }

  buildAndUpdatePage(type);
}

function changeSelect(type) {
  switch (type) {
    case "500-miles":
      $("#select-selected").html("500 Miles");
      break;
    case "500-km":
      $("#select-selected").html("500 Kms");
      break;
    case "1000-miles":
      $("#select-selected").html("1000 Miles");
      break;
    case "1000-km":
      $("#select-selected").html("1000 Kms");
      break;
    case "2023-miles":
      $("#select-selected").html("2023 Miles");
      break;
    case "2023-km":
      $("#select-selected").html("2023 Kms");
      break;
  }
}
//Custom Select

//4
function searchFilter() {
  var input, filter, table, tr, td, i, txtValue;
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();
  table = document.getElementById("myTable");
  tr = table.getElementsByTagName("tr");
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[0];
    if (td) {
      txtValue = td.textContent || td.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
  if (filter != "") {
    $("#myTable")[0].style.display = "";
    $("#leaderboardButton").html("Hide Leaderboard");
    tableStripe();
  }
  tableStripe();
}

//3
function tableStripe() {
  $("tr:visible").each(function (index) {
    $(this).css("background-color", !!(index & 1) ? "rgba(0,0,0,.05)" : "rgba(0,0,0,0)");
  });
}

//9 - Marker Clicked
function markerClicked(arrayString) {
  console.log(arrayString);
  var markerArray = arrayString.split(",");
}
