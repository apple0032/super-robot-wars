var mainBGM = new Audio('./assets/bgm/srt_f_033.mp3');
var clickSound = new Audio('./assets/soundeffect/click.mp3');
var animationTime = 300;

var isPlayerMove;
var isDoingMove = false;
var focusRobot;

$("#newGameBtn").on("click", function() {
    ckSound();
    if ($(event.target).attr("id") === "newGameBtn") {
        //mainBGM.play();

        $("#newGameBtn, #loadGameBtn , #main-header").css("display", "none");
        $("#map").css("display", "block");

        //Game start
        createMap(25);
        placeRobot();
        isPlayerMove = true;
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
    var row = (col * 2)/3

    var i,j;
    var mapHTML = "";
    for (i = 1; i <= row; i++) {
       mapHTML += '<div class="map-row data-row-'+i+'">';
        for (j = 1; j <= col; j++) {
            mapHTML += '<div class="mapbox data-box-'+j+'-'+i+'">';
            mapHTML += '<div class="developer-coordinate">'+j+'-'+i+'</div>';
            mapHTML += '</div>'
        }
        mapHTML += '</div>';
    }

    $("#map").html(mapHTML);
}


function placeRobot(){
    $.each( robot, function( key, value ) {
        $.each( value, function( key2, value2 ) {
            var robotPos = "data-box-"+value2.x+"-"+value2.y;
            if(key === "ai"){
                $("."+robotPos).append("<img src='./assets/robot"+value2.robotID+".png'>");
                $("."+robotPos).addClass("box-is-ai");
            } else {
                $("."+robotPos).append("<img src='./assets/robot"+value2.robotID+".png' data-robot='"+key2+"'>");
                $("."+robotPos).addClass("box-is-player");
            }
                $("."+robotPos).css("background-size","cover");
        });
    });

    clickBoxPlayerListener();
}

function openRobotMenu(e) {
    mouseX =  ((e.pageX) + 5) + "px";
    mouseY = ((e.pageY) + 5) + "px";
    $("#contextMenu").css({"display":"block", "left" : mouseX, "top" : mouseY});
}

function closeRobotMenu() {
    $("#contextMenu").css({"display":"none"});
}


function clickBoxPlayerListener() {

    $("#player_move").click(function(e) {
        ckSound();
        action(focusRobot);
        closeRobotMenu();
    });

    $(".mapbox").click(function(e) {
        if(!$(this).hasClass("box-is-player")){
            closeRobotMenu();
        }
        if(isDoingMove === true && (!$(this).hasClass("available_move")) ){
            //Disable move action if 1. Doing move 2.Not inside move area
            $(".mapbox").removeClass("available_move");
            $(focusRobot).removeClass("isFocused");
            focusRobot = null;
        }
        $('#afterMove_idle').click(); //idle anytime click outside after move a robot
    });

    $('.box-is-player').click(function(e) {
        if($(this).hasClass("box-is-player") === true) {
            ckSound();
            openRobotMenu(e);
            if (focusRobot != null) {
                $('.available_move').unbind();
                if (getRobotID($(this)) !== getRobotID(focusRobot)) {
                    $(".mapbox").removeClass("available_move");
                    $(".mapbox").removeClass("isFocused");
                }
            }
            if(getRobotStatus(getRobotID($(this))) === false) {
                focusRobot = $(this);
                $("#player_move").removeClass("disable_move");
            } else {
                $("#player_move").addClass("disable_move");
            }
        }
    });
}

function action(robotEle){
    if(isPlayerMove === true){
        $(robotEle).addClass("isFocused");
        var robotClass = robotEle.attr('class').replace("mapbox", "").replace("box-is-player", "").replace("data-box-", "").trim();
        robotClass = robotClass.split("-");

        var focus_robot_x = parseInt(robotClass[0]);
        var focus_robot_y = parseInt(robotClass[1]);

        var robotID = getRobotID(robotEle);
        var RobotData = getRobotData(robotID);

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

        showMove(available_pos);
        moveListener();

    } else {
        alert("Not your turn!");
    }
}

function showMove(available_pos){
    $.each( available_pos, function( key, value ) {
        var canMovePos = "data-box-"+value.x+"-"+value.y;
        if( (!$("."+canMovePos).hasClass("box-is-player")) && (!$("."+canMovePos).hasClass("box-is-ai")) ){  //Make sure position clicked dont have any robot
            $("."+canMovePos).addClass("available_move");
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

function robotMoveToNewPoint(movedPosEle,robotEle) {
    //Get robot data
    var robotID = getRobotID($(robotEle));
    var RobotData = getRobotData(robotID);

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

    setTimeout(function(){
        //When finishing move
        $(robotEle).find("img").remove(); //clear old pos robot
        $(movedPosEle).css({"border":"2px solid blue"}); //Add back blue border to show the robot own by player //可於此處implement兩回以上移動的能力
        $(movedPosEle).append("<img class='player_moved' src='./assets/robot"+RobotData.robotID+".png' data-robot='"+robotID+"'>"); //new image show //可於此處implement兩回以上移動的能力
        $(movedPosEle).addClass("box-is-player");  //可於此處implement兩回以上移動的能力

        //Update robot isMoved status to true;
        robot.player[robotID]["isMoved"] = true; //可於此處implement兩回以上移動的能力

        //Reset focused robot after moved to a new position
        focusRobot = null;

        //Update robot new coordinate
        var newCoordinate = getCoordinateByEle(movedPosEle);
        robot.player[robotID]["x"] = parseInt(newCoordinate[0]);
        robot.player[robotID]["y"] = parseInt(newCoordinate[1]);

        clickBoxPlayerListener();

        //Apply attack/idle logic after move to a new pos
        openAfterMoveMenu(xTarget,yTarget);

        //choose either attack or idle
        $('#afterMove_idle').unbind(); //以防止double register listener
        $('#afterMove_idle').click(function() {
            ckSound();
            $("#AfterMoveMenu").css({"display":"none"});
        });

        $('#afterMove_attack').unbind();
        $('#afterMove_attack').click(function() {
            ckSound();
            attackAfterMove(movedPosEle);
        });
    }, animationTime);

}


function openAfterMoveMenu(mouseX,mouseY) {
    $("#AfterMoveMenu").css({"display":"block", "left" : (mouseX+ 25), "top" : (mouseY + 25)});
}

function attackAfterMove(ele){
    ll(ele);

}


function resetMap(resetRobotStatus = false) {
    //Remove and delete whole map element
    $("#map").html("");

    //Recreate new map
    createMap(25);

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
}

function getRobotID($element){
    var robotID = $element.find('img').attr('data-robot');
    return robotID;
}

function getRobotData(robotID){
    var robotData = robot.player[robotID];
    return robotData;
}








function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}


/* Developer mode button */
$('#developer-btn').on('click', function() {
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
    }
};