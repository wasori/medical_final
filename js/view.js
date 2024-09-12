"use script"

const alert_list = document.getElementById("alarm-list");
const box = document.getElementsByClassName("box");
const floor2 = document.getElementById("floor2");
// const floor2_width = floor2.offsetWidth;
const floor2_height = floor2.offsetHeight;

const watertxt = box[0].getElementsByClassName("txt")[0];
const watertime = box[0].getElementsByClassName("time")[0];
const firetxt = box[1].getElementsByClassName("txt")[0];
const firetime = box[1].getElementsByClassName("time")[0];
const dusttxt = box[2].getElementsByClassName("txt")[0];
const dusttime = box[2].getElementsByClassName("time")[0];
const distancetxt = box[5].getElementsByClassName("txt")[0];
const distancetime = box[5].getElementsByClassName("time")[0];
const posetxt = box[4].getElementsByClassName("txt")[0];
const posetime = box[4].getElementsByClassName("time")[0];
const downtxt = box[3].getElementsByClassName("txt")[0];
const downtime = box[3].getElementsByClassName("time")[0];

const canvas = document.getElementById('myCanvas');
const ctx= canvas.getContext("2d");

let active = [0,0,0]; // drow_location, NextCircle, drawCircle 순서
let listnum = 0;
let num = 0;
let easeFactor = 0.8;
let client = null;
let robotID = null;
let color = null;
let drawCircle = null; // 로봇 좌표 수동
let NextCircle = null; // 엑셀 이용 로봇 좌표
let drow_location = null;  //로봇 좌표 자동

const get_today = () => {
    let date = new Date();
    let currentYear = date.getFullYear();
    let currentMonth = date.getMonth() + 1;
    let currentDate = date.getDate();
    let currentHours = date.getHours();
    let currentMinutes = date.getMinutes();
    let currentSeconds = date.getSeconds();

    let formattedMonth = (currentMonth < 10 ? '0' : '') + currentMonth;
    let formattedDate = (currentDate < 10 ? '0' : '') + currentDate;
    let formattedHours = (currentHours < 10 ? '0' : '') + currentHours;
    let formattedMinutes = (currentMinutes < 10 ? '0' : '') + currentMinutes;
    let formattedSeconds = (currentSeconds < 10 ? '0' : '') + currentSeconds;

    let today = currentYear + '-' + formattedMonth + '-' + formattedDate + ' ' + formattedHours + ':' + formattedMinutes + ':' + formattedSeconds;

    return today;
}

const get_alert = (msg) => {

    const json = JSON.parse(msg);
    

    if (json == "")
        return false;

    for(let idx in json){

        let robot_id = json[idx]["rid"];
        let xaxis = json[idx]["xaxis"];
        let yaxis = json[idx]["yaxis"];
        let content = json[idx]["content"];
        let uptime = json[idx]["uptime"];

        if (content == "water") {
            watertxt.innerHTML = robot_id + " 로봇 <span class='water'>물</span> 감지";
            watertime.innerText = uptime;
        }

        else if(content == "fire"){
            firetxt.innerHTML = robot_id + " 로봇 <span class='fire'>화재</span> 감지";
            firetime.innerText = uptime;
        }

        else if(content == "dust"){
            dusttxt.innerHTML = robot_id + " 로봇 <span class='dust'>먼지</span> 감지";
            dusttime.innerText = uptime;
        }

        else if(content == "pose"){
            posetxt.innerText = xaxis + "호실 " + yaxis + "병상 욕창 감지";
            posetime.innerText = uptime;
        }
        else if(content == "down"){
            downtxt.innerText = xaxis + "호실 " + yaxis + "병상 낙상 감지";
            downtime.innerText = uptime;
        }
    }

}

const get_vision = (msg) => {

    const json = JSON.parse(msg);

    if (json == "")
        return false;

    const room = json["room"];
    const sickbed = Number(json["sickbed"]);
    const uptime = json["uptime"];

    if (json["pose"] == "1") {
        color = "black";
        draw_alert_positions(json["rid"],"pose");
        box[4].classList.remove("yellow");
        setTimeout(() => {
            posetxt.innerText = room + "호실 " + sickbed + "병상 욕창 감지";
            posetime.innerText = uptime;
            box[4].classList.add("yellow");
        },50);
    }

    if (json["down"] == "1") {
        color = "orange";
        draw_alert_positions(json["rid"],"down");
        box[3].classList.remove("red");
        setTimeout(() => {
            downtxt.innerText = room + "호실 " + sickbed + "병상 낙상 감지";
            downtime.innerText = uptime;
            box[3].classList.add("red");
        },50);
        
    }
}

const get_sensor = (msg) => {
    const json = JSON.parse(msg);

    if (json == "")
        return false;

    const today = get_today();

    const robot_id = json["robot_id"];
    const water = Number(json["water discovery"]);
    const fire = parseFloat(json["fire detection"]).toFixed(2);
    const dust = parseFloat(json["fine dust"]).toFixed(2);
    const distance = Number(json["distance"]);

    if (water == 1) {
        color = "blue";
        draw_alert_positions(json["robot_id"],"water");
        box[0].classList.remove("blue");
        setTimeout(() => {
            watertxt.innerHTML = robot_id + " 로봇 <span class='water white'>물</span> 감지";
            watertime.innerText = today;
            box[0].classList.add("blue");
        },50);
    }

    if (fire > 300) {
        color = "red";
        draw_alert_positions(json["robot_id"],"fire");
        box[1].classList.remove("red");
        setTimeout(() => {
            firetxt.innerHTML = robot_id + " 로봇 <span class='fire white'>화재</span> 감지";
            firetime.innerText = today;
            box[1].classList.add("red");
        },50);
    }

    if (dust > 0.01) {
        color = "green";
        draw_alert_positions(json["robot_id"],"dust");
        box[2].classList.remove("green");
        setTimeout(() => {
            dusttxt.innerHTML = robot_id + " 로봇 <span class='dust white'>먼지</span> 감지";
            dusttime.innerText = today;
            box[2].classList.add("green");
        },50);
    }
}

const get_sensor_key = (keycode) => {

    const today = get_today();

    console.log(keycode);

    const robot_id = "ZK02";
    const water = 1;
    const fire = 313.23;
    const dust = 0.02;
    // const distance = Number(json["distance"]);

    if (keycode === 122) {
        robotPositions["ZK02"] = [1046,211];
        color = "blue";
        draw_alert_positions("ZK02","water",1046,211);
        box[0].classList.remove("blue");
        setTimeout(() => {
            watertxt.innerHTML = robot_id + " 로봇 <span class='water white'>물</span> 감지";
            watertime.innerText = "2023-11-24 15:00:21";
            box[0].classList.add("blue");
        },50);
    }

    if (keycode === 99) {
        robotPositions["ZK02"] = [1154, 293];
        // robotPositions["ZK02"] = [1113,212];
        color = "red";
        draw_alert_positions("ZK02","fire",1113,212);
        box[1].classList.remove("red");
        setTimeout(() => {
            firetxt.innerHTML = robot_id + " 로봇 <span class='fire white'>화재</span> 감지";
            firetime.innerText = "2023-11-24 15:05:51";
            box[1].classList.add("red");
        },50);
    }

    if (keycode === 99) {
        robotPositions["ZK02"] = [1114,213];
        color = "green";
        draw_alert_positions("ZK02","dust",1114,213);
        box[2].classList.remove("green");
        setTimeout(() => {
            dusttxt.innerHTML = robot_id + " 로봇 <span class='dust white'>먼지</span> 감지";
            dusttime.innerText = "2023-11-24 15:05:52";
            box[2].classList.add("green");
        },50);
    }

    if (keycode === 118) {
        robotPositions["ZK02"] = [960,385];
        color = "black";
        draw_alert_positions("ZK02","pose",960,385);
        box[4].classList.remove("yellow");
        setTimeout(() => {
            posetxt.innerText = "208호실 6병상 욕창 감지";
            posetime.innerText = "2023-11-24 15:22:40";
            box[4].classList.add("yellow");
        },50);
    }

    if (keycode === 98) {
        robotPositions["ZK02"] = [970,96];
        color = "orange";
        draw_alert_positions("ZK02","down",970,96);
        box[3].classList.remove("red");
        setTimeout(() => {
            downtxt.innerText = "209호실 2병상 낙상 감지";
            downtime.innerText = "2023-11-24 15:09:01";
            box[3].classList.add("red");
        },50);
    }
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

const draw_alert_positions = (robotId,type,xx,yy) => {

    let x = xx;
    let y = yy;

    const img2 = document.createElement("img");
    img2.id = "img" + num;
    img2.src = "../img/"+type+".png";
    img2.style.position = "absolute";
    img2.style.width = "30px";
    img2.style.height = "30px";
    img2.style.setProperty('top', (floor2_height-y-15)+"px");
    img2.style.setProperty('left', 'calc(12.5% + '+(x-15)+'px)');

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

const onConnect = () => {
    client.subscribe("/response/view/alarm");
    client.subscribe("/response/alarm/vision");
    client.subscribe("/response/alarm/sensor");
    client.subscribe("/response/location/xlsx");
    client.subscribe("/response/robot/create");
    client.subscribe("/response/keyaction");
    client.subscribe("robot_position");
}

const onConnectionLost = (responseObject) => {
    if (responseObject.errorCode !== 0) {
        console.log(responseObject.errorMessage);
    }
}

const onMessageArrived = (message) => {
    let topic = message.destinationName;
    let msg = message.payloadString;

    switch (topic) {
        case "/response/view/alarm":
            get_alert(msg);
            break;
        case "/response/alarm/vision":
            get_vision(msg);
            break;
        case "/response/alarm/sensor":
            get_sensor(msg);
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

document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);

// 키 이벤트 핸들러
function handleKeyPress(event) {
    get_sensor_key(event.keyCode);
}

// 이벤트 리스너 등록
document.addEventListener('keypress', handleKeyPress);

draw_robot_positions();

window.onload = () => {
    connect();
    start_draw_robot();
}

window.document.oncontextmenu = new Function("return false");
window.document.onselectstart = new Function("return false");
window.document.ondragstart = new Function("return false");