"use script"

function calendarInit() {

    var date = new Date();
    var utc = date.getTime() + (date.getTimezoneOffset() * 60 * 1000);
    var kstGap = 9 * 60 * 60 * 1000;
    var today = new Date(utc + kstGap);

    var thisMonth = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    var currentYear = thisMonth.getFullYear();
    var currentMonth = thisMonth.getMonth() + 1;
    var currentDate = thisMonth.getDate();

    var todayDate = currentYear + '-' + (currentMonth < 10 ? '0' : '') + currentMonth + '-' + (currentDate < 10 ? '0' : '') + currentDate;
    var myInput = document.getElementById("search-input");

    myInput.value = todayDate;

    renderCalender(thisMonth);

    function renderCalender(thisMonth) {

        currentYear = thisMonth.getFullYear();
        currentMonth = thisMonth.getMonth();
        currentDate = thisMonth.getDate();

        var startDay = new Date(currentYear, currentMonth, 0);
        var prevDate = startDay.getDate();
        var prevDay = startDay.getDay();

        var endDay = new Date(currentYear, currentMonth + 1, 0);
        var nextDate = endDay.getDate();
        var nextDay = endDay.getDay();

        $('.year-month').text(currentYear + '.' + (currentMonth + 1));

        calendar = document.querySelector('.dates')
        calendar.innerHTML = '';

        for (var i = prevDate - prevDay + 1; i <= prevDate; i++) {
            calendar.innerHTML = calendar.innerHTML + '<div class="day prev disable">' + i + '</div>'
        }

        for (var i = 1; i <= nextDate; i++) {
            calendar.innerHTML = calendar.innerHTML + '<div class="day current">' + i + '</div>'
        }

        for (var i = 1; i <= (7 - nextDay == 7 ? 0 : 7 - nextDay); i++) {
            calendar.innerHTML = calendar.innerHTML + '<div class="day next disable">' + i + '</div>'
        }

        if (today.getMonth() == currentMonth) {
            todayDate = today.getDate();
            var currentMonthDate = document.querySelectorAll('.dates .current');
            currentMonthDate[todayDate - 1].classList.add('selected');
        }

        var currentMonthDates = document.querySelectorAll('.dates .day');
        currentMonthDates.forEach(function (dateElement) {
            dateElement.addEventListener('click', dateClickHandler);
        });
    }

    function dateClickHandler() {
        if (!this.classList.contains('disable')) {
            var selectedDate = document.querySelector('.day.selected');
            if (selectedDate) {
                selectedDate.classList.remove('selected');
            }

            this.classList.add('selected');

            var clickedDay = parseInt(this.textContent);
            var clickedMonth = currentMonth + 1;
            var clickedYear = currentYear;
            var formattedDate = clickedYear + '-' + (clickedMonth < 10 ? '0' : '') + clickedMonth + '-' + (clickedDay < 10 ? '0' : '') + clickedDay;

            var inputElement = document.querySelector('.search-cal input');
            inputElement.value = formattedDate;
            selectedDate = formattedDate;
        } else if (this.classList.contains('prev')) {
            goPrevMonth();

            var selectedDate = document.querySelector('.day.selected');
            if (selectedDate) {
                selectedDate.classList.remove('selected');
            }

            this.classList.add('selected');

            var clickedDay = parseInt(this.textContent);
            var clickedMonth = currentMonth + 1;
            var clickedYear = currentYear;
            var formattedDate = clickedYear + '-' + (clickedMonth < 10 ? '0' : '') + clickedMonth + '-' + (clickedDay < 10 ? '0' : '') + clickedDay;
            selec = clickedDay;

            var inputElement = document.querySelector('.search-cal input');
            inputElement.value = formattedDate;
            selectedDate = formattedDate;
        } else if (this.classList.contains('next')) {
            goNextMonth();

            var selectedDate = document.querySelector('.day.selected');
            if (selectedDate) {
                selectedDate.classList.remove('selected');
            }

            this.classList.add('selected');

            var clickedDay = parseInt(this.textContent);
            var clickedMonth = currentMonth + 1;
            var clickedYear = currentYear;
            var formattedDate = clickedYear + '-' + (clickedMonth < 10 ? '0' : '') + clickedMonth + '-' + (clickedDay < 10 ? '0' : '') + clickedDay;

            var inputElement = document.querySelector('.search-cal input');
            inputElement.value = formattedDate;
            selectedDate = formattedDate;
        }
    }

    $('.go-prev').on('click', function () {
        thisMonth = new Date(currentYear, currentMonth - 1, 1);
        renderCalender(thisMonth);
    });

    function goPrevMonth() {
        thisMonth = new Date(currentYear, currentMonth - 1, 1);
        renderCalender(thisMonth);
    }

    $('.go-next').on('click', function () {
        thisMonth = new Date(currentYear, currentMonth + 1, 1);
        renderCalender(thisMonth);
    });

    function goNextMonth() {
        thisMonth = new Date(currentYear, currentMonth + 1, 1);
        renderCalender(thisMonth);
    }
}

var toggleButtons = document.querySelectorAll(".toggle-button");
var activeButton;

var tableContainers = document.querySelectorAll(".result-lookup-table");
var table2Containers = document.querySelectorAll(".result-lookup-right-1");
var table3Containers = document.querySelectorAll(".result-lookup-right-2");

toggleButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        toggleButtons.forEach(function (btn) {
            btn.classList.remove("active");
        });
        button.classList.add("active");
        activeButton = document.querySelector(".toggle-button.active");
    });
});

function getDate() {

    var targetId = activeButton.getAttribute("data-target");
    tableContainers.forEach(function (container) {
        if (container.id === targetId) {
            container.style.display = "block";
        } else {
            container.style.display = "none";
        }
    });
    table2Containers.forEach(function (container) {
        if (container.id === targetId) {
            container.style.display = "block";
        } else {
            container.style.display = "none";
        }
    });
    table3Containers.forEach(function (container) {
        if (container.id === targetId) {
            container.style.display = "block";
        } else {
            container.style.display = "none";
        }
    });
}

const pop = document.getElementById("popup");

const popup = (x, y, id) => {
    if (id === "ZK02" || id === "ZK03" || id === "ZK01") {
        floor2.style.display = "block";
        floor3.style.display = "none";

        const canvas = document.getElementById('myCanvas');
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        pop.style.display = "flex";

        ctx.beginPath();
        ctx.arc(x, y, 7, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fillStyle = "red";
        ctx.fill();
    } else if (id === "ZK05" || id === "ZK06") {

        floor2.style.display = "none";
        floor3.style.display = "block";

        const canvas2 = document.getElementById('myCanvas2');
        const ctx2 = canvas2.getContext("2d");

        ctx2.clearRect(0, 0, canvas2.width, canvas2.height);

        pop.style.display = "flex";

        ctx2.beginPath();
        ctx2.arc(x, y, 7, 0, 2 * Math.PI);
        ctx2.stroke();
        ctx2.fillStyle = "red";
        ctx2.fill();
    }
}

const popclose = () => {
    pop.style.display = "none";
}

const location_tbody = document.getElementById("location-tbody");
const location_tr = location_tbody.getElementsByTagName("tr");

const vis_tbody = document.getElementById("vis-tbody");
const vis_tr = vis_tbody.getElementsByTagName("tr");

const iot_tbody = document.getElementById("iot-tbody");
const iot_tr = vis_tbody.getElementsByTagName("tr");

const data_bn = document.getElementById("data-button");

const clientnum = Math.floor(Math.random() * 101);

const urlParams = new URLSearchParams(window.location.search);
const num = urlParams.get('num');
const comment = urlParams.get('comment');
const time = urlParams.get('time');

const location_view = (data) => {
    const json = JSON.parse(data);

    location_tbody.innerHTML = "";
    if (json == "")
        return false;

    for (let idx in json) {

        let robo_id = json[idx]["rid"];
        let x_loc = json[idx]["xaxis"];
        let y_loc = json[idx]["yaxis"];

        let html_view = "";

        html_view += '<tr height="50">';
        html_view += "<td>" + json[idx]["rid"] + "</td>";
        html_view += '<td><button type="button" onclick="popup(' + x_loc + ',' + y_loc + ',\'' + robo_id + '\')">지도</button></td>';
        html_view += "<td>" + json[idx]["uptime"] + "</td>";
        html_view += "</tr>";

        location_tbody.innerHTML += html_view;
    }
}

const vision_view = (data) => {
    const json = JSON.parse(data);

    if (json == "") {
        vis_tbody.innerHTML = "";
        return false;
    }

    vis_tbody.innerHTML = "";
    for (let idx in json) {
        let html_view = "";

        if (json[idx]["content"] == "pose") {
            html_view += '<tr height="50">';
            html_view += "<td>" + json[idx]["room"] + "</td>";
            html_view += "<td>" + json[idx]["sickbed"] + "</td>";
            html_view += "<td>욕창발생</td>";
            html_view += "<td>" + json[idx]["uptime"] + "</td>";
            html_view += "</tr>";
        }
        if (json[idx]["content"] == "down") {
            html_view += '<tr height="50">';
            html_view += "<td>" + json[idx]["room"] + "</td>";
            html_view += "<td>" + json[idx]["sickbed"] + "</td>";
            html_view += "<td>낙상발생</td>";
            html_view += "<td>" + json[idx]["uptime"] + "</td>";
            html_view += "</tr>";
        }

        vis_tbody.innerHTML += html_view;
    }
}

const iot_view = (data) => {

    const json = JSON.parse(data);

    if (json == "") {
        iot_tbody.innerHTML = "";
        return false;
    }

    iot_tbody.innerHTML = "";
    for (let idx in json) {

        let robo_id = json[idx]["rid"];
        let x_loc = json[idx]["xaxis"];
        let y_loc = json[idx]["yaxis"];

        let html_view = "";

        let dust = parseFloat(json[idx]["dust"]).toFixed(2);
        let fire = parseFloat(json[idx]["fire"]).toFixed(2);

        if (dust >= 0.03) {
            html_view += '<tr height="50">';
            html_view += "<td>" + json[idx]["rid"] + "</td>";
            html_view += '<td><button type="button" onclick="popup(' + x_loc + ',' + y_loc + ',\'' + robo_id + '\')">지도</button></td>';
            html_view += "<td>먼지 감지</td>";
            html_view += "<td>" + dust + " mg/m<sup>3</sup></td>";
            html_view += "<td>" + json[idx]["uptime"] + "</td>";
            html_view += "</tr>";
        }

        if (json[idx]["water"] == '1') {
            html_view += '<tr height="50">';
            html_view += "<td>" + json[idx]["rid"] + "</td>";
            html_view += '<td><button type="button" onclick="popup(' + x_loc + ',' + y_loc + ',\'' + robo_id + '\')">지도</button></td>';
            html_view += "<td>물 감지</td>";
            html_view += "<td>-</td>";
            html_view += "<td>" + json[idx]["uptime"] + "</td>";
            html_view += "</tr>";
        }

        if (fire >= 300) {
            html_view += '<tr height="50">';
            html_view += "<td>" + json[idx]["rid"] + "</td>";
            html_view += '<td><button type="button" onclick="popup(' + x_loc + ',' + y_loc + ',\'' + robo_id + '\')">지도</button></td>';
            html_view += "<td>화재 감지</td>";
            html_view += "<td>" + fire + " mg/m<sup>3</sup></td>";
            html_view += "<td>" + json[idx]["uptime"] + "</td>";
            html_view += "</tr>";
        }

        iot_tbody.innerHTML += html_view;
    }
}

let client = "";

const onConnect = () => {
    client.subscribe("/response/data/location");
    client.subscribe("/response/data/vision");
    client.subscribe("/response/data/iot");
    client.subscribe("data_num");
}

const onMessageArrived = (message) => {
    let topic = message.destinationName;
    let msg = message.payloadString;

    switch (topic) {
        case "/response/data/location":
            location_view(msg);
            break;
        case "/response/data/vision":
            vision_view(msg);
            break;
        case "/response/data/iot":
            iot_view(msg);
            break;
        case "data_num":
            break;
        default:
            break;
    }
}

const publish = (topic, message) => {

    let msg = new Paho.Message(message);
    msg.destinationName = topic;
    client.send(msg);
}

const onConnectionLost = (responseObject) => {
    if (responseObject.errorCode !== 0) {
        alert(responseObject.errorMessage);
    }
}

const connect = () => {

    client = new Paho.Client('35.223.130.173', 9001, "Medical" + String(clientnum));

    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;

    client.connect({
        onSuccess: onConnect
    });
}

const disconnecter = () => {
    if (client != "") {
        client.disconnect();
        client = "";
    }
}

data_bn.addEventListener("click", () => {
    let activeBn = document.querySelector(".active");
    let activeId = activeBn.id;
    let activedate = document.getElementById("search-input");

    let topic = "/request/data";
    let msg = '{"type":"' + activeId + '","date":"' + activedate.value + '"}';

    publish(topic, msg);
})

window.onload = () => {
    connect();
    calendarInit();
}

window.document.oncontextmenu = new Function("return false");
window.document.onselectstart = new Function("return false");
window.document.ondragstart = new Function("return false");