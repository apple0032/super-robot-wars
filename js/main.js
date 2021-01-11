var mainBGM = new Audio('./bgm/timetocome.MP3');
var og = new Audio('./bgm/og.MP3');
var isPlayerMove;
var focusRobot;

$("#newGameBtn").on("click", function() {
    if ($(event.target).attr("id") === "newGameBtn") {
        //mainBGM.play();

        $("#newGameBtn, #loadGameBtn , #main-header").css("display", "none");
        $("#map").css("display", "block");

        createMap(20);
        placeRobot();
        isPlayerMove = true;
    }
});

function createMap(size = 12){
    var col = size;
    var row = (col * 2)/3

    var i,j;
    var mapHTML = "";
    for (i = 1; i <= row; i++) {
       mapHTML += '<div class="map-row data-row-'+i+'">';
        for (j = 1; j <= col; j++) {
            mapHTML += '<div class="mapbox data-box-'+j+'-'+i+'" style="background-color:lavender;">';
            mapHTML += '<div class="developer-coordinate">'+j+'-'+i+'</div>';
            mapHTML += '</div>'
        }
        mapHTML += '</div>';
    }

    $("#map").html(mapHTML);
}

var robot = {
    'player':{
        'robotID_3_1' : {x:2, y:2, robotID: 3, moveLevel : 3, isMoved: false},
        'robotID_3_2' : {x:3, y:3, robotID: 3, moveLevel : 3, isMoved: false},
        'robotID_5_1' : {x:3, y:4, robotID: 5, moveLevel : 3, isMoved: false},
        'robotID_5_2' : {x:2, y:5, robotID: 5, moveLevel : 3, isMoved: false},
        'robotID_6': {x:8, y:8, robotID: 6, moveLevel : 4, isMoved: false}
    },
    'ai':{
        'robotID_4_1' : {x:15, y:12, robotID: 4, moveLevel : 4, isMoved: false},
        'robotID_4_2' : {x:16, y:11, robotID: 4, moveLevel : 4, isMoved: false},
        'robotID_4_3' : {x:17, y:11, robotID: 4, moveLevel : 4, isMoved: false},
        'robotID_4_4' : {x:18, y:12, robotID: 4, moveLevel : 4, isMoved: false},
    }
};

function placeRobot(){
    $.each( robot, function( key, value ) {
        //console.log( key + ": " + value );
        $.each( value, function( key2, value2 ) {
            var robotPos = "data-box-"+value2.x+"-"+value2.y;
            if(key === "ai"){
                $("."+robotPos).css({"border":"2px solid red"});
                $("."+robotPos).html("<img src='./assets/robot"+value2.robotID+".png'>");
                $("."+robotPos).addClass("box-is-ai");
            } else {
                $("."+robotPos).css({"border":"2px solid blue"});
                $("."+robotPos).html("<img src='./assets/robot"+value2.robotID+".png' data-robot='"+key2+"'>");
                $("."+robotPos).addClass("box-is-player");
            }
                $("."+robotPos).css("background-size","cover");
        });
    });

    $('.box-is-player').click(function() {
        if(focusRobot != null) {
            focusRobot.css({"border":"2px solid blue"});
            if(getRobotID($(this)) !== getRobotID(focusRobot)){
                $(".mapbox").removeClass("available_move");
            }
        }
        focusRobot = $(this);

        //var robotID = focusRobot.find('img').attr('data-robot');
        action($(this));
    });
}


function action(robot){
    if(isPlayerMove === true){
        $(robot).css({"border":"2px solid orange"});
        var robotClass = robot.attr('class').replace("mapbox", "").replace("box-is-player", "").replace("data-box-", "").trim();
        robotClass = robotClass.split("-");

        var focus_robot_x = parseInt(robotClass[0]);
        var focus_robot_y = parseInt(robotClass[1]);

        var robotID = getRobotID(robot);
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

    } else {
        alert("Not your turn!");
    }
}

function showMove(available_pos){
    $.each( available_pos, function( key, value ) {
        var canMovePos = "data-box-"+value.x+"-"+value.y;
        //$("."+canMovePos).css({"background-color":"#5E8BEB"});
        $("."+canMovePos).addClass("available_move");
    });
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
    var $this = $(this);
    $this.button('loading');
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

function log(log){
    console.log(log);
}