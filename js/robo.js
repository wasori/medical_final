"use script"

const urlParams = new URLSearchParams(window.location.search);
const hosName = urlParams.get('hos_name');

const id = document.getElementById("id");
const room = document.getElementById("room");
const sickbed = document.getElementById("sickbed");

const start = document.getElementById("start");
const patrol = document.getElementById("patrol");
const turn = document.getElementById("return");
const stop = document.getElementById("stop");
const pop = document.getElementById("popup");
const floor2 = document.getElementById("floor2");

const alert_list = document.getElementById("alarm-list");
const robo_move_list = document.getElementById("robo-move-list");

const canvas = document.getElementById('myCanvas');
const ctx= canvas.getContext("2d");

const  canvas2 = document.getElementById("myCanvas2");
const  ctx2 = canvas2.getContext("2d");

const floor2_height = floor2.offsetHeight;

let active = [0,0,0];
let xaxis = 0;
let yaxis = 0;
let num = 0;
let listnum = 0;
let easeFactor = 0.8;
let robotID = null;

let client = null;
let drawCircle = null;
let NextCircle = null;
let drow_location = null;

const get_today = () => {
    const date = new Date();
    const currentYear = date.getFullYear();
    const currentMonth = date.getMonth() + 1;
    const formattedMonth = (currentMonth < 10 ? '0' : '') + currentMonth;
    const today = currentYear + '-' + formattedMonth;

    return today;
}

const popup = (me) => {
    pop.style.display = "flex";

    let topic = "/request/data/alarm/one";
    let message = me.value;

    publish(topic, message);
}

const 물감지 = () => {
    let topic = "/response/alarm/sensor";
    let message = '{"robot_id":"ZK02","fine dust" : 300,"water discovery" : 1,"fire detection" : 1,"x":1046.249,"y":211.009}'

    publish(topic, message);
}

const popclose = () => {
    pop.style.display = "none";
}

const upalarm = (num) => {
    let comment = document.getElementById(num.value);

    let topic = "/request/update/alarm/one";
    let message = '{"num":"' + num.value + '","comment":"' + comment.value + '"}';

    publish(topic, message);

    popclose();

    if (comment.value !== "") {
        let listItem = document.querySelector('li button[value="' + num.value + '"]').closest('li');
        if (listItem) {
            listItem.classList.remove('blink');
        }
        handleAlarmAndRemoveCanvas(num.value);
    }
}

const pop_view = (msg) => {
    const json = JSON.parse(msg);

    if (json == "")
        return false;

    let pophtml = "";

    if (json[0]["comment"] == "" || json[0]["comment"] == null)
        json[0]["comment"] = "";

    switch (json[0]["content"]) {
        case "water":
            pophtml += '<div class="tit">' + json[0]["rid"] + ' 로봇 물 감지</div>';
            pophtml += '<div class="comment"><p>조치 행동</p>';
            pophtml += '<input type="text" id="' + json[0]["num"] + '" value="' + (json[0]["comment"] || "") + '"></div>';
            pophtml += '<div class="bn"><button type="button" value="' + json[0]["num"] + '" onclick="upalarm(this)">확인</button>';
            pophtml += '<button type="button" onclick="popclose();">취소</button>';
            pophtml += '</div>';
            break;
        case "fire":
            pophtml += '<div class="tit">' + json[0]["rid"] + ' 로봇 화재 감지</div>';
            pophtml += '<span>' + json[0]["value"] + 'mg/m<sup>3</sup></span>';
            pophtml += '<div class="comment"><p>조치 행동</p>';
            pophtml += '<input type="text" id= "' + json[0]["num"] + '" value="' + (json[0]["comment"] || "") + '"></div>';
            pophtml += '<div class="bn"><button type="button" value="' + json[0]["num"] + '" onclick="upalarm(this)">확인</button>';
            pophtml += '<button type="button" onclick="popclose();">취소</button>';
            pophtml += '</div>';
            break;
        case "dust":
            pophtml += '<div class="tit">' + json[0]["rid"] + ' 로봇 미세먼지 감지</div>';
            pophtml += '<div class="comment"><p>조치 행동</p>';
            pophtml += '<input type="text" id="' + json[0]["num"] + '" value="' + (json[0]["comment"] || '') + '"></div>';
            pophtml += '<div class="bn"><button type="button" value="' + json[0]["num"] + '" onclick="upalarm(this)">확인</button>';
            pophtml += '<button type="button" onclick="popclose();">취소</button>';
            pophtml += '</div>';
            break;
        case "distance":
            pophtml += '<div class="tit">' + json[0]["rid"] + ' 로봇 멈춤 감지</div>';
            pophtml += '<div class="comment"><p>조치 행동</p>';
            pophtml += '<input type="text" id="' + json[0]["num"] + '" value="' + (json[0]["comment"] || '') + '"></div>';
            pophtml += '<div class="bn"><button type="button" value="' + json[0]["num"] + '" onclick="upalarm(this)">확인</button>';
            pophtml += '<button type="button" onclick="popclose();">취소</button>';
            pophtml += '</div>';
            break;
        case "down":
            pophtml += '<div class="tit">' + json[0]["xaxis"] + '호실 ' + json[0]["yaxis"] + '병상 낙상 감지</div>';
            pophtml += '<div class="comment"><p>조치 행동</p>';
            pophtml += '<input type="text" id="' + json[0]["num"] + '" value="' + (json[0]["comment"] || '') + '"></div>';
            pophtml += '<div class="bn"><button type="button" value="' + json[0]["num"] + '" onclick="upalarm(this)">확인</button>';
            pophtml += '<button type="button" onclick="popclose();">취소</button>';
            pophtml += '</div>';
            break;
        case "pose":
            pophtml += '<div class="tit">' + json[0]["xaxis"] + '호실 ' + json[0]["yaxis"] + '병상 욕창 감지</div>';
            pophtml += '<div class="comment"><p>조치 행동</p>';
            pophtml += '<input type="text" id="' + json[0]["num"] + '" value="' + (json[0]["comment"] || '') + '"></div>';
            pophtml += '<div class="bn"><button type="button" value="' + json[0]["num"] + '" onclick="upalarm(this)">확인</button>';
            pophtml += '<button type="button" onclick="popclose();">취소</button>';
            pophtml += '</div>';
            break;

        default:
            break;
    }

    pop.innerHTML = pophtml;

}

const get_alert = (msg) => {

    const json = JSON.parse(msg);

    alert_list.innerHTML = "";
    if (json == "")
        return false;

    listnum = parseInt(json[0]["num"]);

    for (let idx in json) {

        const checkiptime = json[idx]["uptime"];
        const uptimepart = checkiptime.split("-");
        const hour = Number(uptimepart[0]);
        const month = Number(uptimepart[1]);
        const time = `${hour < 10 ? `0${hour}` : hour}-${month < 10 ? `0${month}` : month}`;

        if (json[idx]["content"] == "water") {
            let html_view = "";

            html_view += '<li>';
            html_view += '<span class="txt">' + json[idx]["rid"] + ' 로봇 물 감지</span>';
            html_view += '<span class="group"><span class="time">' + time + '</span>';
            html_view += '<button type="button" onclick="popup(this)" value="' + json[idx]["num"] + '">확인</button></span></li>';

            alert_list.innerHTML += html_view;
        }
        if (json[idx]["content"] == "fire") {
            let html_view = "";

            html_view += '<li>';
            html_view += '<span class="txt">' + json[idx]["rid"] + ' 로봇 화재 감지 </span>';
            html_view += '<span class="group"><span class="time">' + time + '</span>';
            html_view += '<button type="button" onclick="popup(this)" value="' + json[idx]["num"] + '">확인</button></span></li>';

            alert_list.innerHTML += html_view;
        }
        if (json[idx]["content"] == "dust") {
            let html_view = "";

            html_view += '<li>';
            html_view += '<span class="txt">' + json[idx]["rid"] + ' 로봇 먼지 감지 </span>';
            html_view += '<span class="group"><span class="time">' + time + '</span>';
            html_view += '<button type="button" onclick="popup(this)" value="' + json[idx]["num"] + '">확인</button></span></li>';

            alert_list.innerHTML += html_view;
        }
        if (json[idx]["content"] == "down") {
            let html_view = "";

            html_view += '<li>';
            html_view += '<span class="txt">' + json[idx]["xaxis"] + '호실 ' + json[idx]["yaxis"] + '병상 낙상 감지</span>';
            html_view += '<span class="group"><span class="time">' + time + '</span>';
            html_view += '<button type="button" onclick="popup(this)" value="' + json[idx]["num"] + '">확인</button></span></li>';

            alert_list.innerHTML += html_view;
        }

        if (json[idx]["content"] == "pose") {
            let html_view = "";

            html_view += '<li>';
            html_view += '<span class="txt">' + json[idx]["xaxis"] + '호실 ' + json[idx]["yaxis"] + '병상 욕창 감지</span>';
            html_view += '<span class="group"><span class="time">' + time + '</span>';
            html_view += '<button type="button" onclick="popup(this)" value="' + json[idx]["num"] + '">확인</button></span></li>';

            alert_list.innerHTML += html_view;
        }
    }
}


const get_vision = (msg) => {
    const json = JSON.parse(msg);


    if (json == "")
        return false;

    const today = get_today();
    const pose = json["pose"];
    const down = json["down"];

    if (pose == "1") {
        listnum += 1;
        let html_view = "";

        html_view += '<span class="txt">' + json["room"] + '호실 ' + json["sickbed"] + '병상 욕창 감지</span>';
        html_view += '<span class="group"><span class="time">' + today + '</span>';
        html_view += '<button type="button" onclick="popup(this)" value="' + listnum + '">확인</button></span></li>';
        
        addNewAlert(html_view);
        draw_alert_positions(json["rid"],"pose");
    }
    if (down == "1") {
        listnum += 1;
        let html_view = "";

        html_view += '<span class="txt">' + json["room"] + '호실 ' + json["sickbed"] + '병상 낙상 감지</span>';
        html_view += '<span class="group"><span class="time">' + today + '</span>';
        html_view += '<button type="button" onclick="popup(this)" value="' + listnum + '">확인</button></span></li>';
        
        addNewAlert(html_view);
        draw_alert_positions(json["rid"],"down");
    }

}

const get_sensor = (msg) => {

    const json = JSON.parse(msg);

    if (json == "")
        return false;

    const today = get_today();

    const dust = parseFloat(json["fine dust"]).toFixed(2);
    const water = json["water discovery"];
    const fire = parseFloat(json["fire detection"]).toFixed(2);

    if (dust >= 0.01) {
        listnum += 1;
        let html_view = "";

        html_view += '<span class="txt">' + json["robot_id"] + ' 로봇 먼지 감지 </span>';
        html_view += '<span class="group"><span class="time">' + today + '</span>';
        html_view += '<button type="button" onclick="popup(this)" value="' + listnum + '">확인</button></span></li>';

        addNewAlert(html_view);
        draw_alert_positions(json["robot_id"],"dust");
    }
    if (water == "1") {
        listnum += 1;

        let html_view = "";

        html_view += '<span class="txt">' + json["robot_id"] + ' 로봇 물 감지</span>';
        html_view += '<span class="group"><span class="time">' + today + '</span>';
        html_view += '<button type="button" onclick="popup(this)" value="' + listnum + '">확인</button></span></li>';

        addNewAlert(html_view);
        draw_alert_positions(json["robot_id"],"water");
    }

    if (fire > 300) {
        listnum += 1;
        let html_view = "";

        html_view += '<span class="txt">' + json["robot_id"] + ' 로봇 화재 감지 </span>';
        html_view += '<span class="group"><span class="time">' + today + '</span>';
        html_view += '<button type="button" onclick="popup(this)" value="' + listnum + '">확인</button></span></li>';

        addNewAlert(html_view);
        draw_alert_positions(json["robot_id"],"fire");
    }

}

const patrol_started = (msg) => {
    const json = JSON.parse(msg);
    const today = get_today();

    if (json == "")
        return false;

    let html_view = "";

    html_view += '<p class="txt">' + json["robot_id"] + '로봇 이동 시작</p>';
    html_view += '<p class="time">' + today + '</p>';

    addNewAlert(html_view);
}

const patrol_done = (msg) => {
    const json = JSON.parse(msg);
    const today = get_today();

    if (json == "")
        return false;

    let html_view = "";

    html_view += '<li><p class="txt">' + json["robot_id"] + '로봇 복귀 명령</p>';
    html_view += '<span class="group"><span class="time">' + today + '</span></span></li>';

    robo_move_list.insertAdjacentHTML('afterbegin', html_view);
}

const force_stop = (msg) => {
    const json = JSON.parse(msg);
    const today = get_today();

    if (json == "")
        return false;

    let html_view = "";

    html_view += '<li><p class="txt">' + json["robot_id"] + '로봇 정지 명령</p>';
    html_view += '<span class="group"><span class="time">' + today + '</span></span></li>';

    robo_move_list.insertAdjacentHTML('afterbegin', html_view);
}

const return_base = (msg) => {
    const json = JSON.parse(msg);
    const today = get_today();

    if (json == "")
        return false;

    let html_view = "";

    html_view += '<li><p class="txt">' + json["robot_id"] + '로봇 복귀 명령</p>';
    html_view += '<span class="group"><span class="time">' + today + '</span></span></li>';

    robo_move_list.insertAdjacentHTML('afterbegin', html_view);
}

const do_patrol = (msg) => {
    const json = JSON.parse(msg);
    const today = get_today();

    if (json == "")
        return false;

    let html_view = "";

    html_view += '<li><p class="txt">' + json["robot_id"] + '로봇 패트롤 명령</p>';
    html_view += '<span class="group"><span class="time">' + today + '</span></span></li>';

    robo_move_list.insertAdjacentHTML('afterbegin', html_view);
}

const addNewAlert = (html) => {
    const newLi = document.createElement("li");
    newLi.innerHTML = html;

    if (alert_list.firstChild) {
        alert_list.insertBefore(newLi, alert_list.firstChild);
    } else {
        alert_list.appendChild(newLi);
    }

    alert_list.scrollTop = 0;
};

const onConnectionLost = (responseObject) => {
    if (responseObject.errorCode !== 0) {
        alert(responseObject.errorMessage);
    }
}

const onConnect = () => {
    client.subscribe("/response/main/alarm/view");
    client.subscribe("/response/alarm/vision");
    client.subscribe("/response/alarm/sensor");
    client.subscribe("/response/data/alarm/one");
    client.subscribe("/response/location/xlsx");
    client.subscribe("/response/robot/create");
    client.subscribe("/response/keyaction");
    client.subscribe("robot_position");
    client.subscribe("ros_cmd/patrol_started");
    client.subscribe("ros_cmd/patrol_done");
    client.subscribe("web_cmd/do_patrol");
    client.subscribe("web_cmd/return_base");
    client.subscribe("web_cmd/force_stop");

    // 병원이름을 포함한 메시지 생성
    const payload = JSON.stringify({ hospital_name: hosName });

    setTimeout(publish("/request/main/alarm/all",payload, "0"), 2000);
}

const onMessageArrived = (message) => {
    let topic = message.destinationName;
    let msg = message.payloadString;

    switch (topic) {
        case "/response/main/alarm/view":
            get_alert(msg, hosName);
            break;
        case "/response/alarm/vision":
            get_vision(msg);
            break;
        case "/response/alarm/sensor":
            get_sensor(msg);
            console.log(msg);
            break;
        case "/response/data/alarm/one":
            pop_view(msg);
            break;
        case "/response/location/xlsx":
            get_xlsx(msg);
            break;
        case "/response/robot/create":
            robot_create(msg);
            break;
        case "/response/keyaction":
            key_action(msg);
            break;
        case "robot_position":
            get_robot_position(msg);
            break;
        case "ros_cmd/patrol_done":
            patrol_done(msg);
            break;
        case "web_cmd/do_patrol":
            do_patrol(msg);
            break;
        case "web_cmd/return_base":
            return_base(msg);
            break;
        case "web_cmd/force_stop":
            force_stop(msg);
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

const connect = () => {

    const clientnum = Math.floor(Math.random() * 101);

    client = new Paho.Client('35.223.130.173', 9001, "Medical" + String(clientnum));

    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;

    client.connect({
        onSuccess: onConnect
    });
}

const robotPositions = {
    "ZK01": [],
    "ZK02": [],
    "ZK03": [],
    "ZK04": [],
    "ZK05": [],
    "ZK06": []
};

const get_robot_position = (msg) => {
    const json = JSON.parse(msg);
    let robotId = json["robot_id"];
    
    if(robotId == "" || robotId == "/")
        robotId = "ZK04";

    if (robotPositions.hasOwnProperty(robotId)) {
        const robo_x = parseFloat(json["x"]);
        const robo_y = parseFloat(json["y"]);
        const robo_yaw = parseFloat(json["yaw"]);

        robotPositions[robotId] = [robo_x, robo_y, robo_yaw];
    }
}

const draw_alert_positions = (robotId,type) => {
    let x = parseFloat(robotPositions[robotId][0]);
    let y = parseFloat(robotPositions[robotId][1]);

    const img2 = document.createElement("img");
    img2.id = "img" + num;
    img2.src = "../img/"+type+".png";
    img2.style.position = "absolute";
    img2.style.width = "30px";
    img2.style.height = "30px";
    img2.style.setProperty('top', (floor2_height-y-15)+"px");
    img2.style.setProperty('left', (x-15)+"px");

    img2.style.border = "none";
    floor2.appendChild(img2);

    if(type=="pose" || type=="down"){
        for(let i=1;i<41;i++){
            if(i%2 == 0){
                setTimeout(() => {img2.src = "../img/"+type+"up.png";}, i*500);
            }
            else{
                setTimeout(() => {img2.src = "../img/"+type+".png";}, i*500);
            }
        }
    }
    num+=1;

}

const draw_robot_positions = () => {  

    if(active[0]==0){
        return false;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const [robotId, coordinates] of Object.entries(robotPositions)) {

        const [x, y, yaw] = coordinates;
        let color = '';

        switch (robotId) {
            case "ZK01":
                color = 'red';
                break;
            case "ZK02":
                color = 'blue';
                break;
            case "ZK03":
                color = 'gray';
                break;
            case "ZK04":
                color = 'green';
                break;
            case "ZK05":
                color = 'orange';
                break;
            case "ZK06":
                color = 'black';
                break;
            default:
                break;
        }

        if (color !== '') {
            ctx.beginPath();
            ctx.arc(x, y, 14, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.fillStyle = color;
            ctx.fill();

            const arrowLength = 40;
            const arrowWidth = 15;

            const adjustedYaw = (yaw + 360) % 360;

            const arrowX1 = x + arrowLength * Math.cos((adjustedYaw) * (Math.PI / 180));
            const arrowY1 = y + arrowLength * Math.sin((adjustedYaw) * (Math.PI / 180));

            const arrowX2 = arrowX1 + arrowWidth * Math.cos((adjustedYaw + 140) * (Math.PI / 180));
            const arrowY2 = arrowY1 + arrowWidth * Math.sin((adjustedYaw + 140) * (Math.PI / 180));

            const arrowX3 = arrowX1 + arrowWidth * Math.cos((adjustedYaw - 140) * (Math.PI / 180));
            const arrowY3 = arrowY1 + arrowWidth * Math.sin((adjustedYaw - 140) * (Math.PI / 180));

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(arrowX1, arrowY1);
            ctx.moveTo(arrowX1, arrowY1);
            ctx.lineTo(arrowX2, arrowY2);
            ctx.moveTo(arrowX1, arrowY1);
            ctx.lineTo(arrowX3, arrowY3);
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.stroke();
        }
    }
};

const start_draw_robot = () => {
    clear();

    active[0]=1;

    robotPositions["ZK01"] = [];
    robotPositions["ZK02"] = [];
    robotPositions["ZK03"] = [];
    robotPositions["ZK04"] = [];
    robotPositions["ZK05"] = [];
    robotPositions["ZK06"] = [];

    drow_location = setInterval(draw_robot_positions, 500);
}

const circle_key = {
    x: 915,
    y: 300,
    radius: 14,
    speed: 0.05,
    dx: 0,
    dy: 0
};

const drawCircle_key = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.arc(circle_key.x, circle_key.y, circle_key.radius, 0, Math.PI * 2);

    switch (robotID) {
        case "ZK01":
            ctx.fillStyle = 'red';
            break;
        case "ZK02":
            ctx.fillStyle = 'blue';
            break;
        case "ZK03":
            ctx.fillStyle = 'gray';
            break;
        case "ZK04":
            ctx.fillStyle = 'green';
            break;
        case "ZK05":
            ctx.fillStyle = 'orange';
            break;
        case "ZK06":
            ctx.fillStyle = 'black';
            break;
        default:
            break;
    }
    ctx.fill();
    ctx.closePath();
}

const update = () => {
    const targetX = circle_key.x + circle_key.dx;
    const targetY = circle_key.y + circle_key.dy;

    circle_key.x += (targetX - circle_key.x) * easeFactor;
    circle_key.y += (targetY - circle_key.y) * easeFactor;

    if (circle_key.x - circle_key.radius < 0) {
        circle_key.x = circle_key.radius;
    }
    if (circle_key.x + circle_key.radius > canvas.width) {
        circle_key.x = canvas.width - circle_key.radius;
    }
    if (circle_key.y - circle_key.radius < 0) {
        circle_key.y = circle_key.radius;
    }
    if (circle_key.y + circle_key.radius > canvas.height) {
        circle_key.y = canvas.height - circle_key.radius;
    }
    robotPositions[robotID] = [circle_key.x,circle_key.y];
}

const keyDownHandler = (e) => {
    if (e.key === 'R' || e.key === 'r') 
    {
        publish("/response/keyaction","reset");
    } 
    else if (e.key === '+') 
    {
        publish("/response/keyaction","plus");
    }
    else if (e.key === '-') 
    {   
        publish("/response/keyaction","minus");
    } 
    else 
    {
        if (e.key === 'Right' || e.key === 'ArrowRight') 
        {
            publish("/response/keyaction","right");
        } 
        else if (e.key === 'Left' || e.key === 'ArrowLeft') 
        {
            publish("/response/keyaction","left");

        } 
        else if (e.key === 'Down' || e.key === 'ArrowDown') 
        {
            publish("/response/keyaction","down");
        } 
        else if (e.key === 'Up' || e.key === 'ArrowUp') {
            publish("/response/keyaction","up");
        }   
    }
}

const keyUpHandler = (e) => {
    if (e.key === 'Right' || e.key === 'Left' || e.key === 'ArrowRight' || e.key === 'ArrowLeft') 
    {
        publish("/response/keyaction","stop-left-right");
    } 
    else if (e.key === 'Down' || e.key === 'Up' || e.key === 'ArrowDown' || e.key === 'ArrowUp') 
    {
        publish("/response/keyaction","stop-up-down");
    }
}

const gameLoop = () => {
    if(active[2]==0){
        return false;
    }
    update();
    requestAnimationFrame(gameLoop);
}

const robot_create = (msg) => {

    clear();
    active[2]=1;
    
    robotID = msg;
    circle_key.x = 915;
    circle_key.y = 300;
    gameLoop();
    drawCircle = setInterval(drawCircle_key,250);
}

const get_xlsx = (msg) => {

    clear();
    active[1]=1;

    const json = JSON.parse(msg);
    const radius = 14;
    let drawIndex = 0;

    function drawCircle2(robotId,x,y){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.beginPath();
        ctx.arc(x,y,radius,0,2*Math.PI);

        switch (robotId) {
            case "ZK01":
                ctx.fillStyle = 'red';
                break;
            case "ZK02":
                ctx.fillStyle = 'blue';
                break;
            case "ZK03":
                ctx.fillStyle = 'gray';
                break;
            case "ZK04":
                ctx.fillStyle = 'green';
                break;
            case "ZK05":
                ctx.fillStyle = 'orange';
                break;
            case "ZK06":
                ctx.fillStyle = 'black';
                break;
            default:
                break;
        }
        ctx.fill();
    }

    function drawNextCircle(){

        if(active[1]==0){
            return false;
        }

        if(drawIndex < json.length){
            let robotId = json[drawIndex][0];
            let x = json[drawIndex][1];
            let y = json[drawIndex][2];
            robotPositions[robotId] = [x,y];
            drawCircle2(robotId,x,y);
            drawIndex++;
        }else{
            clearInterval(intervalId);
        }
    }
    NextCircle = setInterval(drawNextCircle,300);
}

const clear = () => {
    clearInterval(drow_location);
    clearInterval(drawCircle);
    clearInterval(NextCircle);
    cancelAnimationFrame(gameLoop);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const imgtag = floor2.getElementsByTagName("img");

    for(let i=imgtag.length;i>2;i--){
        imgtag[i-1].remove();
    }

    active[0]=0;
    active[1]=0;
    active[2]=0;
}

const key_action = (msg) => {
    switch (msg) {
        case "reset":
            start_draw_robot();
            break;
        case "plus":
            easeFactor += 0.1; 
            break;
        case "minus":
            easeFactor -= 0.1;
            break;
        case "right":
            circle_key.dx = circle_key.speed;
            break;
        case "left":
            circle_key.dx = -circle_key.speed;
            break;
        case "down":
            circle_key.dy = -circle_key.speed;
            break;
        case "up":
            circle_key.dy = circle_key.speed;
            break;
        case "stop-left-right":
            circle_key.dx = 0;
            break;
        case "stop-up-down":
            circle_key.dy = 0;
            break;
        default:
            break;
    }
}

function handleAlarmAndRemoveCanvas(alarmNum) {
    const alarmNum2 = alarmNum;
    const canvas = document.getElementById("canvas-" + alarmNum2);
    if (canvas) {
        canvas.parentNode.removeChild(canvas);
    }
}

canvas2.addEventListener("click", function (event) {
    const x = event.clientX - canvas2.getBoundingClientRect().left;
    const y = canvas2.height - (event.clientY - canvas2.getBoundingClientRect().top);

    xaxis = x.toFixed(2);
    yaxis = y.toFixed(2);

    ctx2.clearRect(0, 0, canvas2.width, canvas2.height);

    ctx2.beginPath();
    ctx2.arc(x, y, 7, 0, 2 * Math.PI);
    ctx2.stroke();
});

start.addEventListener("click", () => {

    let robo = null;

    if (id.value != 0) {
        robo = id.value;
    }

    const topic = "web_cmd/goto_position";

    for (let idx in locationdata) {
        if (locationdata[idx]["room"] == room.value && locationdata[idx]["sickbed"] == sickbed.value) {
            xaxis = locationdata[idx]["xaxis"];
            yaxis = locationdata[idx]["yaxis"];

            break;
        }
    }

    const message = '{"robot_id":"' + robo + '","x":' + xaxis + ',"y":' + yaxis + '}';

    publish(topic, message);

});

patrol.addEventListener("click", () => {
    let robo = null;

    if (id.value != 0) {
        robo = id.value;
    }

    const topic = "web_cmd/do_patrol";
    const message = '{"robot_id":"' + robo + '"}';

    publish(topic, message);
});

turn.addEventListener("click", () => {
    let robo = null;

    if (id.value == 0) {
        robo = "";
    }

    const topic = "web_cmd/return_base";
    const message = '{"robot_id":"' + robo + '"}';

    publish(topic, message);
});

stop.addEventListener("click", () => {
    let robo = null;

    if (id.value != 0) {
        robo = id.value;
    }

    const topic = "web_cmd/force_stop";
    const message = '{"robot_id":"' + robo + '"}';

    publish(topic, message);
});

document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);

window.onload = () => {
    connect();
    start_draw_robot();
}

window.document.oncontextmenu = new Function("return false");
window.document.onselectstart = new Function("return false");
window.document.ondragstart = new Function("return false");