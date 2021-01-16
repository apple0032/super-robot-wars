var mainBGM = new Audio('./assets/bgm/srt_f_033.mp3');
var clickSound = new Audio('./assets/soundeffect/click.mp3');
var animationTime = 300;
var movingTime = 500;
var mapSize = 30;
var turn = 1;

var isPlayerMove;   //Player turn
var isDoingMove = false;    //Playing selecting new position to move
var focusRobot;

var isAiMove = false;   //Enemy turn
var isThirdMove = false;     //Third power turn

$("#newGameBtn").on("click", function() {
    ckSound();
    if ($(event.target).attr("id") === "newGameBtn") {
        //mainBGM.play();

        $("#newGameBtn, #loadGameBtn , #main-header").css("display", "none");
        $("#map").css("display", "inline-block");

        //Default player move first
        isPlayerMove = true;

        //Game start
        createMap(mapSize);
        placeRobot();
        activeMainMenuListener();

        //Test AI auto moving

        //botMovingMain();

    }
});

$("#loadGameBtn").on("click", function() {
    ckSound();
});

function ckSound() {
    clickSound.play();
}


function createMap(size = 12){
    var col = size;
    var row = (col * 2)/3;
    var viewerHeight = parseInt(row) * 40;

    var i,j;
    var mapHTML = "<div id='mainMap'>";

    for (i = 1; i <= row; i++) {
       mapHTML += '<div class="map-row data-row-'+i+'">';
        for (j = 1; j <= col; j++) {
            mapHTML += '<div class="mapbox data-box-'+j+'-'+i+'">';
            mapHTML += '<div class="developer-coordinate">'+j+'-'+i+'</div>';
            mapHTML += '</div>'
        }
        mapHTML += '</div>';
    }

    mapHTML += '</div>';
    mapHTML += '<div id="MapViewer" style="height: '+viewerHeight+'px; ">MENU</div>';

    $("#map").html(mapHTML);
}


function placeRobot(){
    $.each( robot, function( key, value ) {
        $.each( value, function( key2, value2 ) {
            var robotPos = "data-box-"+value2.x+"-"+value2.y;
            if(key === "ai"){
                $("."+robotPos).append("<img src='./assets/robot"+value2.robotID+".png' data-robot='"+key2+"'>");
                $("."+robotPos).addClass("box-is-ai");
            }
            if(key === "player"){
                $("."+robotPos).append("<img src='./assets/robot"+value2.robotID+".png' data-robot='"+key2+"'>");
                $("."+robotPos).addClass("box-is-player");
            }
            if(key === "third"){
                $("."+robotPos).append("<img src='./assets/robot"+value2.robotID+".png' data-robot='"+key2+"'>");
                $("."+robotPos).addClass("box-is-third");
            }
                $("."+robotPos).css("background-size","cover");
        });
    });

    clickBoxPlayerListener();
}

function clickBoxPlayerListener() {

    if(isPlayerMove === true) {
        $("#player_move").unbind();
        $("#player_move").click(function (e) {
            ckSound();
            action(focusRobot);
            closeRobotMenu();
            closeMainMenu();
        });

        $('.mapbox').unbind();
        $(".mapbox").click(function (e) {
            if (!$(this).hasClass("box-is-player")) {
                closeRobotMenu();
                closeMainMenu();
            }
            if (isDoingMove === true && (!$(this).hasClass("available_move"))) {
                //Disable move action if 1. Doing move 2.Not inside move area
                $(".mapbox").removeClass("available_move");
                $(focusRobot).removeClass("isFocused");
                focusRobot = null;
                isDoingMove = false;
            }
            $('#afterMove_idle').click(); //idle anytime click outside after move a robot
        });

        $('.box-is-player').unbind();
        $('.box-is-player').click(function (e) {
            if ($(this).hasClass("box-is-player") === true && ( isAiMove === false) && (isThirdMove === false)  ) {
                ckSound();
                openRobotMenu(e);
                closeMainMenu();
                if (focusRobot != null) {
                    $('.available_move').unbind();
                    if (getRobotID($(this)) !== getRobotID(focusRobot)) {
                        $(".mapbox").removeClass("available_move");
                        $(".mapbox").removeClass("isFocused");
                    }
                }
                if (getRobotStatus(getRobotID($(this))) === false) {
                    focusRobot = $(this);
                    $("#player_move").removeClass("disable_move");
                } else {
                    $("#player_move").addClass("disable_move");
                }
            }
        });

        $("#mainMenu_endTurn").unbind();
        $("#mainMenu_endTurn").click(function (e) {
            ckSound();
            isPlayerMove = false;
            botMovingMain();

        });
    }
}

function action(robotEle, target = "player"){

    $(robotEle).addClass("isFocused");
    var robotClass = robotEle.attr('class').replace("mapbox", "").replace("box-is-player", "").replace("data-box-", "").trim();
    robotClass = robotClass.split("-");

    var focus_robot_x = parseInt(robotClass[0]);
    var focus_robot_y = parseInt(robotClass[1]);

    var robotID = getRobotID(robotEle);
    var RobotData = getRobotData(robotID,target);

    var moveLevel = RobotData.moveLevel;
    var avail_coordinate = [];

    var available_pos = [];
    avail_coordinate.push(focus_robot_x);
    avail_coordinate.push(focus_robot_y);
    for (i = 1; i <= moveLevel; i++) {
        available_pos.push({x: parseInt(focus_robot_x), y:parseInt(focus_robot_y) + i});
        available_pos.push({x: parseInt(focus_robot_x), y:parseInt(focus_robot_y) - i});
        avail_coordinate.push(parseInt(focus_robot_y) + i);
        avail_coordinate.push(parseInt(focus_robot_y) - i);
    }
    for (i = 1; i <= moveLevel; i++) {
        available_pos.push({x: parseInt(focus_robot_x) + i , y:parseInt(focus_robot_y)});
        available_pos.push({x: parseInt(focus_robot_x) - i, y:parseInt(focus_robot_y)});
        avail_coordinate.push(parseInt(focus_robot_x) + i);
        avail_coordinate.push(parseInt(focus_robot_x) - i);
    }
    avail_coordinate = avail_coordinate.filter(onlyUnique);
    var matrixPos = getMoveMatrix(avail_coordinate);

    $.each( matrixPos, function( key, value ) {
        var distance_x;
        var distance_y;
        if(focus_robot_x > value.x){
            distance_x = (focus_robot_x - value.x);
        } else {
            distance_x = (value.x - focus_robot_x);
        }

        if(focus_robot_y > value.y){
            distance_y = (focus_robot_y - value.y);
        } else {
            distance_y = (value.y - focus_robot_y);
        }

        distance = distance_x + distance_y;
        if(distance <= moveLevel){
            available_pos.push({x: value.x  , y:value.y});
        }
    });

    showMove(available_pos, target);

    if(target === "player") {
        moveListener();
    }

}

function showMove(available_pos, target = "player"){
    $.each( available_pos, function( key, value ) {
        var canMovePos = "data-box-"+value.x+"-"+value.y;
        if( (!$("."+canMovePos).hasClass("box-is-player")) && (!$("."+canMovePos).hasClass("box-is-ai"))
            && (!$("."+canMovePos).hasClass("box-is-third")) && (!$("."+canMovePos).hasClass("box-is-item"))
        ){  //Make sure position clicked dont have any robot or items etc....
            if(target === "player") {
                $("." + canMovePos).addClass("available_move");
            } else if(target === "ai") {
                $("." + canMovePos).addClass("available_move_ai");
            } else {
                $("." + canMovePos).addClass("available_move_third");
            }
        }
    });

    isDoingMove = true;
}

function moveListener() {
    $('.available_move').click(function() {
        if($(this).hasClass("available_move")) {
            robotMoveToNewPoint($(this),focusRobot)
        }
    });
}

function robotMoveToNewPoint(movedPosEle,robotEle, target = "player") {

    //Confirm to move a new pos
    isDoingMove = false;

    //Get robot data
    var robotID = getRobotID($(robotEle));
    var RobotData = getRobotData(robotID,target);

    //Find original position
    var xSource =  ($(robotEle).find("img"))[0].offsetLeft;
    var ySource =  ($(robotEle).find("img"))[0].offsetTop;

    //Find target position
    var xTarget = (movedPosEle[0].offsetLeft)+2;
    var yTarget = movedPosEle[0].offsetTop;

    //Add move animation
    $(robotEle).find("img").css({"position":"absolute", "left": xSource, "top" : ySource});
    ($(robotEle).find("img")).animate({left: xTarget, top: yTarget}, animationTime, "swing");

    $(robotEle).removeClass("isFocused"); //clear focused bot(remove orange border as well)
    $(robotEle).removeClass("box-is-player"); //因為移動了新的位置, 舊位置要移除player class, 而disable move不用因為還留在原位
    $(".mapbox").removeClass("available_move"); //clear all available move area
    $(".mapbox").removeClass("available_move_ai");

    if(target === "ai"){
        $(robotEle).removeClass("box-is-ai");
    }

    if(target === "third"){
        $(robotEle).removeClass("box-is-third");
    }

    setTimeout(function(){
        //When finishing move
        $(robotEle).find("img").remove(); //clear old pos robot
        $(movedPosEle).append("<img class='robot_moved' src='./assets/robot"+RobotData.robotID+".png' data-robot='"+robotID+"'>"); //new image show //控制二回移動

        if(target === "player") {
            $(movedPosEle).addClass("box-is-player");
        }
        if(target === "ai") {
            $(movedPosEle).addClass("box-is-ai");
        }
        if(target === "third") {
            $(movedPosEle).addClass("box-is-third");
        }

        //Update robot isMoved status to true;
        robot[target][robotID]["isMoved"] = true; //控制二回移動

        clickBoxPlayerListener(); //控制二回移動


        //Reset focused robot after moved to a new position
        focusRobot = null;

        //Update robot new coordinate
        var newCoordinate = getCoordinateByEle(movedPosEle);
        robot[target][robotID]["x"] = parseInt(newCoordinate[0]);
        robot[target][robotID]["y"] = parseInt(newCoordinate[1]);

        //clickBoxPlayerListener();

        if(target === "player") {
            //Apply attack/idle logic after move to a new pos
            openAfterMoveMenu(xTarget, yTarget);

            //choose either attack or idle
            $('#afterMove_idle').unbind(); //以防止double register listener
            $('#afterMove_idle').click(function () {
                ckSound();
                closeAfterMoveMenu();
            });

            $('#afterMove_attack').unbind();
            $('#afterMove_attack').click(function () {
                ckSound();
                attackAfterMove(movedPosEle);
            });
        }
    }, animationTime);

}

function openRobotMenu(e) {
    closeAfterMoveMenu();
    mouseX =  ((e.pageX) + 5) + "px";
    mouseY = ((e.pageY) + 5) + "px";
    $("#contextMenu").css({"display":"block", "left" : mouseX, "top" : mouseY});
}

function closeRobotMenu() {
    $("#contextMenu").css({"display":"none"});
}


function openAfterMoveMenu(mouseX,mouseY) {
    $("#AfterMoveMenu").css({"display":"block", "left" : (mouseX+ 25), "top" : (mouseY + 25)});
}

function closeAfterMoveMenu() {
    $("#AfterMoveMenu").css({"display": "none"});
}

function openMainMenu(e) {
    ckSound();
    if( (isDoingMove === false) && ( isAiMove === false) && (isThirdMove === false) ) {
        mouseX = ((e.pageX) + 5) + "px";
        mouseY = ((e.pageY) + 5) + "px";
        $("#MainMenu").css({"display": "block", "left": mouseX, "top": mouseY});
    }
}
function closeMainMenu() {
    $("#MainMenu").css({"display":"none"});
}



function activeMainMenuListener() {
    $("#main-container").on('contextmenu', function (e) {
        e.preventDefault();
        openMainMenu(e);
        closeRobotMenu();
        closeAfterMoveMenu();

    });
    $("#main-container").on('click', function (e) {
        e.preventDefault();
        closeMainMenu(e);
    });

    //Control key down "Z" to enable developer mode
    $(document).keypress(function(event){var keycode = (event.keyCode ? event.keyCode : event.which);if(keycode == "122"){$('#developer-btn').click();}});

    //Skip the right click action under development
    //$("#map").on('contextmenu', function (e) { e.stopPropagation(); });

    //prevent overlap bug of another contextmenu
    $("#contextMenu").on('contextmenu', function (e) { e.stopPropagation(); });
    $("#AfterMoveMenu").on('contextmenu', function (e) { e.stopPropagation(); });
}


function attackAfterMove(ele){
    ll(ele);
}


async function botMovingMain(){
    //Main Flow of the game

    //1. Player always move first, listen for end turn event

    //2. Bot move turn
    await aiMove();
    await delay(500);   //AI回合end, wait a moment....

    //3. Check if 第三方勢力(third) existed, if yes run third turn
    if ('third' in robot) {
        if(isPlayerMove === false) {
            await thirdMove();
        }
    }

    await delay(600);   //Wait a moment, before start player turn


    if(isThirdMove === false) {     //If no third group or if third robot finish their turn -> start new player turn
        isPlayerMove = true;
        resetMap(true);
        turn++;
    }
}

async function aiMove() {
    isAiMove = true; //flag of AI回合

    const aiMoving = async () => {

        //Will loop through all ai robot
        var aiRobot = robot.ai;
        for (const value of Object.keys(aiRobot)) {

            var currentRobot = aiRobot[value];
            var newX = (currentRobot.x) + 1;
            var newY = (currentRobot.y) + 1;

            action($(".data-box-"+currentRobot.x+"-"+currentRobot.y), "ai");
            setTimeout(function(){
                robotMoveToNewPoint($(".data-box-"+newX+"-"+newY),$(".data-box-"+currentRobot.x+"-"+currentRobot.y),"ai");
            }, movingTime);

            await delay(movingTime + 500);
        }


        await delay(movingTime + 300);

        isAiMove = false; //AI已完成所有行動, 結束回合
    };

    await aiMoving();

}


async function thirdMove() {
    isThirdMove = true; //flag of third turn moving

    const thirdMoving = async () => {
        if(isAiMove === false) {    //Check if all AI done moving
            action($(".data-box-25-2"), "third");
            setTimeout(function () {
                robotMoveToNewPoint($(".data-box-21-2"), $(".data-box-25-2"), "third");
            }, movingTime);

            await delay(movingTime + 300);




            //Check if all third robot done action
            isThirdMove = false;
        }
    };


    await thirdMoving();

}







function resetMap(resetRobotStatus = false) {
    //Remove and delete whole map element
    $("#map").html("");

    //Recreate new map
    createMap(mapSize);

    //Place Robot , init the game
    placeRobot();

    //Init listener
    clickBoxPlayerListener();

    if(resetRobotStatus === true){
        resetPlayerRobotStatus();
    }
}

function getCoordinateByEle(ele) {
    var coordinate = ele.find(".developer-coordinate");
    coordinate = coordinate.html();

    return coordinate.split("-");
}


function getMoveMatrix(available_pos= []){
    var matrixPos = [];
    $.each( available_pos, function( k1, v1 ) {
        $.each( available_pos, function( k2, v2 ) {
            matrixPos.push({x:v1, y:v2});
        });
    });

    return matrixPos;
}

function getRobotStatus(robotID){
    var robotStatus = robot.player[robotID]["isMoved"];
    return robotStatus;
}


function resetPlayerRobotStatus(){
    $.each( robot.player, function( key, value ) {
        robot.player[key]["isMoved"] = false;
    });
    $.each( robot.ai, function( key, value ) {
        robot.ai[key]["isMoved"] = false;
    });
    $.each( robot.third, function( key, value ) {
        robot.third[key]["isMoved"] = false;
    });
}

function getRobotID($element){
    var robotID = $element.find('img').attr('data-robot');
    return robotID;
}

function getRobotData(robotID, target = "player"){
    switch(target) {
        case "player":
            var robotData = robot.player[robotID];
            break;
        case "ai":
            var robotData = robot.ai[robotID];
            break;
        case "third":
            var robotData = robot.third[robotID];
            break;
        default:
            var robotData = robot.player[robotID];
    }

    return robotData;
}


















window.onerror = function(error, url, line) {
    ll("error occur!");
};



const delay = ms => new Promise(res => setTimeout(res, ms));

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}


/* Developer mode button */
$('#developer-btn').on('click', function() {
    $("#map").on('contextmenu', function (e) { e.stopPropagation(); });
    resetMap(true);
    var $this = $(this);
    //$this.button('loading');
    if($this.parent().hasClass("in-develop")){
        $this.parent().removeClass("in-develop");
        $this.css({"background-color": "#337ab7", "border": "none"});
        developerMode(enable = false);
    } else {
        $this.parent().addClass("in-develop");
        $this.css({"background-color": "red", "border": "none"});
        developerMode(enable = true);
    }
    setTimeout(function() {
        $this.button('reset');
    }, 500);
});

function developerMode(enable = true){
    if(enable === true){
        $(".developer-coordinate").css('display',"block");
    } else {
        $(".developer-coordinate").css('display',"none");
    }
}

function ll(log){
    console.log(log);
}


var robot = {
    'player':{
        'robotID_3_1' : {x:2, y:2, robotID: 7, moveLevel : 25, isMoved: false},
        'robotID_3_2' : {x:3, y:3, robotID: 3, moveLevel : 3, isMoved: false},
        'robotID_5_1' : {x:3, y:4, robotID: 5, moveLevel : 3, isMoved: false},
        'robotID_5_2' : {x:2, y:5, robotID: 5, moveLevel : 3, isMoved: false},
        'robotID_6': {x:14, y:11, robotID: 6, moveLevel : 4, isMoved: false}
    },
    'ai':{
        'robotID_4_1' : {x:15, y:12, robotID: 4, moveLevel : 4, isMoved: false},
        'robotID_4_2' : {x:16, y:11, robotID: 4, moveLevel : 4, isMoved: false},
        'robotID_4_3' : {x:17, y:11, robotID: 4, moveLevel : 4, isMoved: false},
        'robotID_4_4' : {x:18, y:12, robotID: 4, moveLevel : 4, isMoved: false},
    },
    // 'third':{
    //     'robotID_4_1' : {x:25, y:2, robotID: 8, moveLevel : 5, isMoved: false},
    //     'robotID_4_2' : {x:26, y:3, robotID: 9, moveLevel : 7, isMoved: false}
    // }
};