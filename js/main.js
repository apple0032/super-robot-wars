var mainBGM = new Audio('./assets/bgm/srt_f_033.mp3');
var clickSound = new Audio('./assets/soundeffect/click.mp3');
var animationTime = 300;
var movingTime = 500;
var mapSize = 30;
var turn = 1;
var mission = 1;
var dialogCount = 0;

var isPlayerMove;   //Player turn
var isDoingMove = false;    //Playing selecting new position to move
var isDoingAttack = false;
var isAfterMove = false;
var focusRobot;

var isAiMove = false;   //Enemy turn
var isThirdMove = false;     //Third power turn

var show_map_border = true;

var attackRobot;
var attackWeaponIndex;
var isThirdAlly = robot.third.isAlly;

$("#newGameBtn").on("click", function() {
    ckSound();
    if ($(event.target).attr("id") === "newGameBtn") {

        if($(window).width() < 1300){
            $(".warning-notice").show();
            return;
        } else {
            $(".warning-notice").hide();
        }
        //mainBGM.play();

        $("#newGameBtn, #loadGameBtn , #main-header").css("display", "none");
        $("#map").css("display", "inline-block");


        //Game start
        createMap(mapSize);
        placeRobot();
        loadOpeningDialog("opening");

    }
});

function loadOpeningDialog(type) {

    const running = () => {
        //Default player move first
        isPlayerMove = true;
        clickBoxPlayerListener();
        activeMainMenuListener();
        updateMapViewer();
        showTurnNotice();
        enablePlayerActivity();
        $(".dialog").unbind();
        dialogCount = 0;
    };

    $("#mapDialog").html("");

    if (type === "opening") {
        if (dialog[mission].hasOwnProperty("opening") && ((dialog[mission]["opening"]).length) !== 0 ) {
            if (dialogCount < ((dialog[mission]["opening"]).length)) {
                dialogHTMLShow = dialogHTML.replace("#dialogType", "opening");
                dialogHTMLShow = dialogHTMLShow.replace("#speaker", dialog[mission]["opening"][dialogCount]["name"]);
                dialogHTMLShow = dialogHTMLShow.replace("#speech", dialog[mission]["opening"][dialogCount]["speech"]);
                dialogHTMLShow = dialogHTMLShow.replace("#face", dialog[mission]["opening"][dialogCount]["id"]);
                $("#mapDialog").append(dialogHTMLShow);
                disablePlayerActivity();
                if( dialog[mission]["opening"][dialogCount].hasOwnProperty("voice") ){
                    var voice = dialog[mission]["opening"][dialogCount]["voice"];
                    var audio = new Audio('./assets/voice/'+voice+'.mp3');
                    audio.volume = 0.3;
                    //audio.play();
                }
                if( dialog[mission]["opening"][dialogCount].hasOwnProperty("target") ){
                    var target = dialog[mission]["opening"][dialogCount]["target"];
                    var dialog_target = getRobotDataByID(target);
                    if(dialog_target != null) {
                        dialog_target = $(".data-box-"+dialog_target.x+"-"+dialog_target.y+" .box_layer");
                        dialog_target.css({"background-color" : "rgba(222,222,222,0.7)", "z-index" : 1});
                    }
                }
            }
        } else {
            running();
        }
    }

    $(".dialog").on("click", function() {
        ckSound();
        revertBoxLayer();
        if($(this).attr('data-dialog') === "opening") {
            dialogCount++;
            loadOpeningDialog(type);

            if (type === "opening") {
                if (dialogCount >= ((dialog[mission]["opening"]).length)) {
                    running();
                }
            }
        }
    });
}


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
    var mapHTML = "";

    for (i = 1; i <= row; i++) {
       mapHTML += '<div class="map-row data-row-'+i+'">';
        for (j = 1; j <= col; j++) {
            mapHTML += '<div class="mapbox data-box-'+j+'-'+i+'">';
            mapHTML += '<div class="box_layer"></div>';
            mapHTML += '<div class="developer-coordinate">'+j+'-'+i+'</div>';
            mapHTML += '</div>'
        }
        mapHTML += '</div>';
    }

    $("#mainMap").html(mapHTML); //Display the map HTML

    var mapViewer = "";
        mapViewer += '<div id="MapViewer_container">';
        mapViewer += '<div id="MapViewer" style="height: '+viewerHeight+'px; ">';
        mapViewer += '<i class="fas fa-dice" data-toggle="tooltip" title="現在回合"></i><br>';
        mapViewer += '<div class="turn_number">'+turn+'</div>';
        mapViewer += '<br><br>';
        mapViewer += '<i class="fas fa-chess-knight" data-toggle="tooltip" title="我方行動"></i><br>';
        mapViewer += '<div class="move_remain"></div>';
        mapViewer += '<br><br>';
        mapViewer += '<i class="fas fa-chess-king" data-toggle="tooltip" title="我方兵力"></i><br>';
        mapViewer += '<div class="player_robot_remain"></div>';
        mapViewer += '<br><br>';
        mapViewer += '<i class="fas fa-chess-rook" data-toggle="tooltip" title="敵方兵力"></i><br>';
        mapViewer += '<div class="ai_robot_remain"></div>';
        if (robot.third.hasOwnProperty("robotsElement") && Object.entries(robot.third.robotsElement).length > 0) {
            mapViewer += '<br><br>';
            mapViewer += '<i class="fas fa-chess-queen" data-toggle="tooltip" title="友軍勢力"></i><br>';
            mapViewer += '<div class="third_robot_remain"></div>';
        }
        mapViewer += '<br><br>';
        mapViewer += '<i class="fas fa-border-all" data-toggle="tooltip" title="顯示格線"></i><br>';
        mapViewer += '<div class="show_map_border"></div>';
    mapViewer += '</div>';

    $("#MapViewer_container").html(mapViewer);






    $('[data-toggle="tooltip"]').tooltip();  //display tooltip


    /**************************** PLACE MAP WALLPAPER & OBJECTS & ITEMS ****************************/

    //Step1 : Place base map
    var base = mapInfo[mission]["base"];
    $(".mapbox").addClass("mapbox_"+base);

    //Step2: Handle special background
    var base_range = mapInfo[mission]["base_range"];
    $.each( base_range, function( k1, v1 ) {
        $.each( v1 , function( k2, v2 ) {
            var pRangeFirst = range(parseInt(((v2.from).split(","))[0]), parseInt(((v2.to).split(","))[0]));
            var pRangeSec = range(parseInt(((v2.from).split(","))[1]), parseInt(((v2.to).split(","))[1]));
            var pRangeMatrix = getTwoPosMatrix(pRangeFirst,pRangeSec);
            $.each( pRangeMatrix , function( k3, v3 ) {
                $(".data-box-"+v3.x+"-"+v3.y).addClass("mapbox_"+k1);
            });
        });
    });

    //Step3: Handle object placement
    var mapObject = mapInfo[mission]["object"];
    $.each( mapObject, function( k1, v1 ) {
        $.each(v1, function (k2, v2) {
            var actualSizeX = (v2.sizeX) - 1;
            var actualSizeY = (v2.sizeY) - 1;
            var ImgSizeX = v2.sizeX * 40;
            var ImgSizeY = v2.sizeY * 40;

            if (v2.hasOwnProperty("put")) {
                var startX = parseInt(((v2.put).split(","))[0]);
                var startY = parseInt(((v2.put).split(","))[1]);

                if (v2.hasOwnProperty("boxes")) {
                    $.each(v2.boxes, function (k3, v3) {
                        var absX = parseInt(((v3).split(","))[0]);
                        var absY = parseInt(((v3).split(","))[1]);
                        $(".data-box-" + absX + "-" + absY).addClass("box-is-item");
                        $(".data-box-" + absX + "-" + absY).attr('data-mapItem', k1);
                        if (v2.pass === false) {
                            $(".data-box-" + absX + "-" + absY).addClass("box-is-block");
                        }
                        if (v2.copy === true) {
                            $(".data-box-" + absX + "-" + absY).prepend('<div class="map_base" style="position: absolute;"><img src="./assets/map/' + k1 + '.png" style="width: ' + ImgSizeX + 'px;height: ' + ImgSizeY + 'px;" draggable="false"></div>\n');
                        }
                    });
                } else {
                    var newX = (startX + actualSizeX);
                    var newY = (startY + actualSizeY);

                    var pRangeX = range(startX, newX);
                    var pRangeY = range(startY, newY);

                    var pRangeMatrix = getTwoPosMatrix(pRangeX, pRangeY);

                    //Add box-is-item class to identify the box has item
                    $.each(pRangeMatrix, function (k3, v3) {
                        $(".data-box-" + v3.x + "-" + v3.y).addClass("box-is-item");
                        $(".data-box-" + v3.x + "-" + v3.y).attr('data-mapItem', k1);
                        if (v2.pass === false) {
                            $(".data-box-" + v3.x + "-" + v3.y).addClass("box-is-block");
                        }
                    });
                }
                if ( !v2.hasOwnProperty("copy") || v2.copy === false) {
                    $(".data-box-" + startX + "-" + startY).prepend('<div class="map_base" style="position: absolute;"><img src="./assets/map/' + k1 + '.png" style="width: ' + ImgSizeX + 'px;height: ' + ImgSizeY + 'px;" draggable="false"></div>\n');
                }
            } else {
                var rangeStart = range(parseInt(((v2.from).split(","))[0]), parseInt(((v2.to).split(","))[0]));
                var rangeEnd = range(parseInt(((v2.from).split(","))[1]), parseInt(((v2.to).split(","))[1]));
                var rangeMatrix = getTwoPosMatrix(rangeStart,rangeEnd);
                $.each( rangeMatrix , function( k3, v3 ) {
                    $(".data-box-"+v3.x+"-"+v3.y).addClass("box-is-item");
                    $(".data-box-"+v3.x+"-"+v3.y).attr('data-mapItem', k1);
                    if (v2.pass === false) {
                        $(".data-box-" + v3.x + "-" + v3.y).addClass("box-is-block");
                    }
                    var ImgSizeX = v2.sizeX * 40;
                    var ImgSizeY = v2.sizeY * 40;
                    $(".data-box-"+v3.x+"-"+v3.y).prepend('<div class="map_base" style="position: absolute;"><img src="./assets/map/' + k1 + '.png" style="width: ' + ImgSizeX + 'px;height: ' + ImgSizeY + 'px;" draggable="false"></div>\n');
                });
            }
        });
    });

}

function range(start, end) {
    return Array(end - start + 1).fill().map((_, idx) => start + idx)
}

function placeRobot(){
    $.each( robot, function( key, value ) {
        $.each( value.robotsElement, function( key2, value2 ) {
            var robotPos = "data-box-"+value2.x+"-"+value2.y;
            if(key === "ai"){
                $("."+robotPos).append("<img src='./assets/robot"+value2.robotID+".png' data-robot='"+key2+"' class='is_robot' draggable='false'>");
                $("."+robotPos).addClass("box-is-ai");
            }
            if(key === "player"){
                $("."+robotPos).append("<img src='./assets/robot"+value2.robotID+".png' data-robot='"+key2+"' class='is_robot' draggable='false'>");
                $("."+robotPos).addClass("box-is-player");
            }
            if(key === "third"){
                $("."+robotPos).append("<img src='./assets/robot"+value2.robotID+".png' data-robot='"+key2+"' class='is_robot' draggable='false'>");
                $("."+robotPos).addClass("box-is-third");
            }
                $("."+robotPos).css("background-size","auto");
        });
    });

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

        $("#player_attack").unbind();
        $("#player_attack").click(function (e) {
            ckSound();
            closeRobotMenu();
            closeMainMenu();
            showWeaponList(focusRobot);
        });


        $('.mapbox').unbind();
        $(".mapbox").click(function (e) {
            if (!$(this).hasClass("box-is-player")) {
                closeRobotMenu();
                closeMainMenu();
            }
            if (isDoingMove === true && (!$(this).hasClass("available_move"))) {
                $(".mapbox").removeClass("available_move");
                $(".mapbox").removeClass("available_attack");
                revertBoxLayer();
                $(focusRobot).removeClass("isFocused");
                focusRobot = null;
                isDoingMove = false;
            }
            if(isDoingAttack === true && isAfterMove === true) {
                $("#AfterMoveMenu").css({"display":"block"});
                isDoingAttack = false;
                $(".mapbox").removeClass("available_attack");
            }
        });

        $('.box-is-player').unbind();
        $('.box-is-player').click(function (e) {
            if ($(this).hasClass("box-is-player") === true && ( isPlayerMove === true) && ( isAiMove === false) && (isThirdMove === false)  ) {
                ckSound();
                if(isDoingAttack === true && isAfterMove === true) {
                    $("#AfterMoveMenu").css({"display": "block"});
                } else {
                    openRobotMenu(e);
                }
                closeMainMenu();
                if (focusRobot != null) {
                    $('.available_move').unbind();
                    if (getRobotID($(this)) !== getRobotID(focusRobot)) {
                        $(".mapbox").removeClass("available_move");
                        revertBoxLayer();
                        $(".mapbox").removeClass("isFocused");
                    }
                }
                if( $(this).hasClass("box-is-player") ) {
                    if (getRobotStatus(getRobotID($(this))) === false) {
                        focusRobot = $(this);
                        $("#player_move").removeClass("disable_context_action");
                        $("#player_attack").removeClass("disable_context_action");
                        $("#player_spirit").removeClass("disable_context_action");
                    } else {
                        $("#player_move").addClass("disable_context_action");
                        $("#player_attack").addClass("disable_context_action");
                        $("#player_spirit").addClass("disable_context_action");
                    }
                }
            }

            if (isDoingMove === true && (!$(this).hasClass("available_move"))) {
                $(".mapbox").removeClass("available_move");
                $(".mapbox").removeClass("isFocused");
                revertBoxLayer();
                isDoingMove = false;
            }
        });

        $("#mainMenu_endTurn").unbind();
        $("#mainMenu_endTurn").click(function (e) {
            ckSound();
            isPlayerMove = false;
            botMovingMain();

        });
    }

    mapViewerListener();
}

function mapViewerListener() {
    $("#MapViewer").click(function(){
        $("#MapViewer").animate({width: "80px"}, 70 );

        setTimeout(function() {
            $("#MapViewer .turn_number").html("第"+turn+"回合");
            var mapData = getMapInformation();
            $("#MapViewer .move_remain").html("我方行動<br>"+mapData.player.player_not_moved+"/"+mapData.player.total_player_robot);
            $("#MapViewer .player_robot_remain").html("我方兵力<br>"+mapData.player.player_robot+"/"+mapData.player.total_player_robot);
            $("#MapViewer .ai_robot_remain").html("敵方兵力<br>"+mapData.ai.ai_robot+"/"+mapData.ai.total_ai_robot);
            $("#MapViewer .third_robot_remain").html("友軍勢力<br>"+mapData.third.third_robot+"/"+mapData.third.total_third_robot);
            $("#MapViewer .show_map_border").html("顯示格線");
        }, 100);
    });

    $("#MapViewer_container").mouseleave(function(){
        updateMapViewer();
        $("#MapViewer").animate({width: "25px"}, 70 );
    });

    $(".fa-border-all").unbind();
    $(".fa-border-all").click(function(){
        if(show_map_border === false){
            $(".mapbox").css("border","1px solid #8e8e8ede");
            show_map_border = true;
            $(".fa-border-none").addClass("fa-border-all");
            $(".fa-border-all").removeClass("fa-border-none");
        } else {
            $(".mapbox").css("border","none");
            show_map_border = false;
            $(".fa-border-all").addClass("fa-border-none");
            $(".fa-border-none").removeClass("fa-border-all");
        }
    });

    $(".box-is-ai").unbind();
    if(isPlayerMove === true) {
        $(".box-is-ai").hover(function () {
            if(isDoingMove === false) {
                var robotID = getRobotID($(this));
                var RobotData = getRobotData(robotID, "ai");

                var available_pos = getAvailableCoordinate(RobotData.x, RobotData.y, "move");
                showMove(available_pos, "ai");
            }
        });

        $(".box-is-ai").mouseleave(function () {
            //Remove previous hover
            if(isDoingMove === false) {
                $(".mapbox").removeClass("available_move_ai");
                revertBoxLayer();
            }
        });
    }

    $(".box-is-third").unbind();
    if(isPlayerMove === true) {
        $(".box-is-third").hover(function () {
            if(isDoingMove === false) {
                var robotID = getRobotID($(this));
                var RobotData = getRobotData(robotID, "third");

                var available_pos = getAvailableCoordinate(RobotData.x, RobotData.y, "move");
                showMove(available_pos, "third");
            }
        });

        $(".box-is-third").mouseleave(function () {
            //Remove previous hover
            if(isDoingMove === false) {
                $(".mapbox").removeClass("available_move_third");
                revertBoxLayer();
            }
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
    var available_pos = getAvailableCoordinate(focus_robot_x,focus_robot_y, "move");

    showMove(available_pos, target);

    if(target === "player") {
        $('.available_move').unbind();
        $('.available_move').click(function() {

            var canMove = false;
            var clickPos = getCoordinateByEle($(this));
            $.each( available_pos, function( key, value ) {
                if( (value.x === parseInt(clickPos[0])) && (value.y === parseInt(clickPos[1])) ){
                    canMove = true;
                }
            });

            if( ($(this).hasClass("available_move")) && (canMove === true) ) {
                robotMoveToNewPoint($(this),focusRobot)
            }
        });
    }

}

function showMove(available_pos, target = "player",action = "move"){
    $.each( available_pos, function( key, value ) {
        var canMovePos = "data-box-"+value.x+"-"+value.y;
        /*
        if( (!$("."+canMovePos).hasClass("box-is-player")) && (!$("."+canMovePos).hasClass("box-is-ai"))
            && (!$("."+canMovePos).hasClass("box-is-third")) && (!$("."+canMovePos).hasClass("box-is-block"))
        ){  //Make sure position clicked dont have any robot or items etc....
         */
            if(target === "player") {
                if(action === "move") {
                    $("." + canMovePos).addClass("available_move");
                    $("." + canMovePos + ' .box_layer').css("background-color", "#5e8bebb5");
                } else if(action === "attack"){
                    $("." + canMovePos).addClass("available_attack");
                    $("." + canMovePos +' .box_layer').css({"background-color":"#a21509b3" , "z-index" : "1"});
                }
            } else if(target === "ai") {
                $("." + canMovePos).addClass("available_move_ai");
                $("." + canMovePos +' .box_layer').css("background-color", "#d83c2fba");
            } else {
                $("." + canMovePos).addClass("available_move_third");
                $("." + canMovePos +' .box_layer').css("background-color", "rgba(255, 225, 46, 0.73)");
            }
    });

    if(target === "player") {
        isDoingMove = true;
    }
}



function robotMoveToNewPoint(movedPosEle,robotEle, target = "player") {

    //Confirm to move a new pos
    isDoingMove = false;
    isAfterMove = true;

    //Get robot data
    var robotID = getRobotID($(robotEle));
    var RobotData = getRobotData(robotID,target);

    //Find original position
    var xSource =  ($(robotEle).find(".is_robot"))[0].offsetLeft;
    var ySource =  ($(robotEle).find(".is_robot"))[0].offsetTop;

    //Find target position
    var xTarget = (movedPosEle[0].offsetLeft)+2;
    var yTarget = movedPosEle[0].offsetTop;

    //Add move animation
    $(robotEle).find(".is_robot").css({"position":"absolute", "left": xSource, "top" : ySource});
    ($(robotEle).find(".is_robot")).animate({left: xTarget, top: yTarget}, animationTime, "swing");

    $(robotEle).removeClass("isFocused"); //clear focused bot(remove orange border as well)
    $(robotEle).removeClass("box-is-player"); //因為移動了新的位置, 舊位置要移除player class, 而disable move不用因為還留在原位
    $(".mapbox").removeClass("available_move"); //clear all available move area
    $(".mapbox").removeClass("available_move_ai");
    $(".mapbox").removeClass("available_move_third");
    revertBoxLayer();

    if(target === "ai"){
        $(robotEle).removeClass("box-is-ai");
    }

    if(target === "third"){
        $(robotEle).removeClass("box-is-third");
    }

    setTimeout(function(){
        //When finishing move
        $(robotEle).find(".is_robot").remove(); //clear old pos robot
        $(movedPosEle).append("<img class='robot_moved is_robot' src='./assets/robot"+RobotData.robotID+".png' data-robot='"+robotID+"' draggable='false'>"); //new image show //控制二回移動

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
        robot[target]["robotsElement"][robotID]["isMoved"] = true; //控制二回移動

        clickBoxPlayerListener(); //控制二回移動


        //Reset focused robot after moved to a new position
        focusRobot = null;

        //Update robot new coordinate
        var newCoordinate = getCoordinateByEle(movedPosEle);
        robot[target]["robotsElement"][robotID]["x"] = parseInt(newCoordinate[0]);
        robot[target]["robotsElement"][robotID]["y"] = parseInt(newCoordinate[1]);


        if(target === "player") {
            //Apply attack/idle logic after move to a new pos
            openAfterMoveMenu(xTarget, yTarget);

            //choose either attack or idle
            $('#afterMove_idle').unbind(); //以防止double register listener
            $('#afterMove_idle').click(function () {
                ckSound();
                closeAfterMoveMenu();
                isAfterMove = false;
                isDoingAttack = false;

                $("#map").css("filter","none");
                $(robotEle).removeClass("isFocused");
                $(".mapbox").removeClass("available_attack");
                revertBoxLayer();
            });

            $('#afterMove_attack').unbind();
            $('#afterMove_attack').click(function () {
                if(isAfterMove === true) {
                    ckSound();
                    closeRobotMenu();
                    closeMainMenu();
                    showWeaponList(movedPosEle);
                    //attackAfterMove(movedPosEle);
                }
            });

            $('#afterMove_cancel').unbind();
            $('#afterMove_cancel').click(function () {
                if(isAfterMove === true) {
                    ckSound();
                    isAfterMove = false;
                    $(robotEle).append("<img class='is_robot' src='./assets/robot" + RobotData.robotID + ".png' data-robot='" + robotID + "' draggable='false'>");
                    $(robotEle).addClass("box-is-player");

                    $(movedPosEle).find(".is_robot").remove();
                    $(movedPosEle).removeClass("box-is-player");

                    var oldCoordinate = getCoordinateByEle(robotEle);
                    robot[target]["robotsElement"][robotID]["x"] = parseInt(oldCoordinate[0]);
                    robot[target]["robotsElement"][robotID]["y"] = parseInt(oldCoordinate[1]);
                    robot[target]["robotsElement"][robotID]["isMoved"] = false;

                    closeAfterMoveMenu();
                    clickBoxPlayerListener();
                    updateMapViewer();
                } else {
                    ll("Don't cheat!");
                }
            });

            updateMapViewer();
        }
    }, animationTime);

}

function openRobotMenu(e) {
    if($("#AfterMoveMenu").is(":visible")){
        $("#afterMove_cancel").click();
    } else {
        closeAfterMoveMenu();
        mouseX = ((e.pageX) + 5) + "px";
        mouseY = ((e.pageY) + 5) + "px";
        $("#contextMenu").css({"display": "block", "left": mouseX, "top": mouseY});
    }
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
    if( (isDoingMove === false) && ( isAiMove === false) && (isThirdMove === false) && ( isPlayerMove === true) ) {
        mouseX = ((e.pageX) + 5) + "px";
        mouseY = ((e.pageY) + 5) + "px";
        $("#MainMenu").css({"display": "block", "left": mouseX, "top": mouseY});
    }
}
function closeMainMenu() {
    $("#MainMenu").css({"display":"none"});
}

function disablePlayerActivity() {
    $("#MainMenu").css("pointer-events","none");
    $("#mainMap").css("pointer-events","none");
    $("#contextMenu").css("pointer-events","none");
}

function enablePlayerActivity() {
    $("#MainMenu").css("pointer-events","auto");
    $("#mainMap").css("pointer-events","auto");
    $("#contextMenu").css("pointer-events","auto");
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
    if(APP_DEVELOPER === "ON") {
        $(document).keypress(function (event) {
            var keycode = (event.keyCode ? event.keyCode : event.which);
            if (keycode == "122") {
                $('#developer-btn').click();
            }
        });
    }
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

    //2. AI Bot move turn
    await aiMove();
    await delay(500);   //AI回合end, wait a moment....

    //3. Check if 第三方勢力(third) existed, if yes run third turn
    if (robot.third.hasOwnProperty("robotsElement") && Object.entries(robot.third.robotsElement).length > 0) {
        if(isPlayerMove === false) {
            await thirdMove();
        }
    }

    await delay(200);   //Wait a moment, before start player turn


    if(isThirdMove === false && isPlayerMove === false) {     //If no third group or if third robot finish their turn -> start new player turn
        isPlayerMove = true;
        resetMap(true);
        turn++;

        updateMapViewer();
        await showTurnNotice();
        isAfterMove = false;
    }
}

async function aiMove() {
    isAiMove = true; //flag of AI回合
    updateMapViewer();
    await showTurnNotice(); //Notice for changing turn

    const aiMoving = async () => {

        //Will loop through all ai robot
        var aiRobot = robot.ai.robotsElement;
        for (const value of Object.keys(aiRobot)) {
            var currentRobot = aiRobot[value];
            if(isPlayerMove === false && currentRobot.isMoved === false && currentRobot.isDestroyed === false) {
                while (currentRobot.isMoved === false && isPlayerMove === false) {
                    var targetRobot = robot.player.robotsElement.robotID_6;

                    //1.Find attack target, if yes stop moving, do attack
                    var canAttack = aiAttackAction(currentRobot, "ai","before");

                    //2.Find move pos
                    if (canAttack === false) {
                        //Find all available POS
                        var available_pos = getAvailableCoordinate(currentRobot.x, currentRobot.y, "move");
                        var moveCoordinateByTarget = getMoveCoordinateByTarget(available_pos, targetRobot.x, targetRobot.y);
                        moveCoordinateByTarget.sort(sortByX);

                        var distanceX = (currentRobot.x - targetRobot.x);
                        var distanceY = (currentRobot.y - targetRobot.y);
                        if (((distanceX * distanceX) + (distanceY * distanceY)) > 1) { //If the distance = 1 (ie, they stand each other)
                            var newX, newY;
                            if ((distanceX > 2 || distanceX < -2) || ((distanceY > 2 || distanceY < -2))) {    //斜行
                                moveCoordinateByTarget = getMiddle(moveCoordinateByTarget, 0);
                                newX = moveCoordinateByTarget.x;
                                newY = moveCoordinateByTarget.y;
                            } else { //直行
                                newX = moveCoordinateByTarget[0].x;
                                newY = moveCoordinateByTarget[0].y;
                            }
                            action($(".data-box-" + currentRobot.x + "-" + currentRobot.y), "ai");
                            setTimeout(function () {
                                robotMoveToNewPoint($(".data-box-" + newX + "-" + newY), $(".data-box-" + currentRobot.x + "-" + currentRobot.y), "ai");
                            }, movingTime);
                        } else {
                            setTimeout(function () {
                                robotMoveToNewPoint($(".data-box-" + currentRobot.x + "-" + currentRobot.y), $(".data-box-" + currentRobot.x + "-" + currentRobot.y), "ai");
                            }, movingTime);
                        }
                    } else {
                        isPlayerMove = true;
                    }

                    await delay(movingTime + 500);
                }

                //isPlayerMove = true;
            }
        }


        await delay(movingTime + 300);

        isAiMove = false; //AI已完成所有行動, 結束回合
    };

    await aiMoving();

}


async function thirdMove() {
    isThirdMove = true; //flag of third turn moving
    updateMapViewer();
    await showTurnNotice();

    const thirdMoving = async () => {
        if(isAiMove === false) {    //Check if all AI done moving

            /*
            action($(".data-box-25-2"), "third");
            setTimeout(function () {
                robotMoveToNewPoint($(".data-box-6-3"), $(".data-box-25-2"), "third");
            }, movingTime);

            await delay(movingTime + 300);
            */
            var thirdRobot = robot.third.robotsElement;
            for (const value of Object.keys(thirdRobot)) {
                if(isPlayerMove === false) {
                    var currentRobot = thirdRobot[value];
                    var newX = (currentRobot.x) - 3;
                    var newY = (currentRobot.y);

                    action($(".data-box-" + currentRobot.x + "-" + currentRobot.y), "third");
                    setTimeout(function () {
                        robotMoveToNewPoint($(".data-box-" + newX + "-" + newY), $(".data-box-" + currentRobot.x + "-" + currentRobot.y), "third");
                    }, movingTime);

                    await delay(movingTime + 500);
                    //isPlayerMove = true;
                }
            }



            await delay(movingTime + 100);
            //Check if all third robot done action
            isThirdMove = false;
        }
    };


    await thirdMoving();

}





function updateMapViewer() {

    if(isPlayerMove === true){
        $("#MapViewer").css("background","rgba(87,138,236,0.75)");
    }

    if(isAiMove === true) {
        $("#MapViewer").css("background", "rgba(236,84,84,0.75)");
    }

    if(isThirdMove === true) {
        $("#MapViewer").css("background", "rgba(255,175,39,0.75)");
    }

    //Update turn
    $("#MapViewer .turn_number").html(turn);

    //Update isDestroyed
    MapData = getMapInformation();

    if(MapData.player.player_not_moved === 0 ) {
        $("#MapViewer .move_remain").html("<b style='color: #ff7878'>"+MapData.player.player_not_moved+"</b>");
    } else {
        $("#MapViewer .move_remain").html(MapData.player.player_not_moved);
    }

    $("#MapViewer .player_robot_remain").html(MapData.player.player_robot);
    $("#MapViewer .ai_robot_remain").html(MapData.ai.ai_robot);
    $("#MapViewer .third_robot_remain").html(MapData.third.third_robot);
    $("#MapViewer .show_map_border").html('');
}

function getMapInformation() {
    var MapData = {};

    var player_robot = 0;
    var total_player_robot = 0;
    var player_not_moved = 0;
    $.each( robot.player.robotsElement, function( key, value ) {
        total_player_robot++;
        if(value.isDestroyed === false){ player_robot++; }
        if(value.isDestroyed === false && value.isMoved === false){
            player_not_moved++;
        }
    });

    var ai_robot = 0;
    var total_ai_robot = 0;
    $.each( robot.ai.robotsElement, function( key, value ) {
        total_ai_robot++;
        if(value.isDestroyed === false){ ai_robot++; }
    });

    var third_robot = 0;
    var total_third_robot = 0;
    $.each( robot.third.robotsElement, function( key, value ) {
        total_third_robot++;
        if(value.isDestroyed === false){ third_robot++; }
    });

    MapData.player = {
        "player_robot" : player_robot, "total_player_robot" : total_player_robot, "player_not_moved" : player_not_moved
    };

    MapData.ai = {
        "ai_robot" : ai_robot , "total_ai_robot" :total_ai_robot
    };

    MapData.third = {
        "third_robot" : third_robot, "total_third_robot" : total_third_robot
    };

    return MapData;
}

async function showTurnNotice() {
    var left = $(".data-box-13-9")[0].offsetLeft;
    $("#turn_notice").css("left",left);

    if(isPlayerMove === true){
        $("#map").css("filter","blur(3px)");
        $("#turn_notice").html("我方回合");
        $("#turn_notice").css("background-color","rgb(35 105 243)");
        $("#turn_notice").show();
    }

    if(isAiMove === true){
        $("#map").css("filter","blur(3px)");
        $("#turn_notice").html("敵方回合");
        $("#turn_notice").css("background-color","rgb(193 61 51)");
        $("#turn_notice").show();
    }

    if(isThirdMove === true){
        $("#map").css("filter","blur(3px)");
        $("#turn_notice").html("友軍回合");
        $("#turn_notice").css("background-color","rgb(226 179 36)");
        $("#turn_notice").show();
    }


    setTimeout(function() {
        $("#map").css("filter","none");
        $("#turn_notice").hide();
    }, 1000);

    await delay(1000);
}


function resetMap(resetRobotStatus = false) {
    //Remove and delete whole map element
    $("#mainMap").html("");

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

function aiAttackAction(robotEle, target = "player",status) {

    var doAttack = false;

    if(robotEle.hasOwnProperty("weapons")){
        var aiWeapons = [...robotEle.weapons];
        aiWeapons.reverse();    //Default begin with the highest power weapon

        $.each( aiWeapons, function( k, v ) {
            //Validate weapon EN,morale,ammo,afterMove etc......
            var canAttack = true;
            if(1 > 2){
                canAttack = false;
            }

            if(canAttack === true) {
                attackWeaponIndex = (aiWeapons.length - 1 - k); //Get original index from reversed array
                var available_pos = getAvailableCoordinate(robotEle.x, robotEle.y, "attack");
                var available_target_num = 0;
                var available_target = [];

                $.each(available_pos, function (k2, v2) {
                    var enemy = $(".data-box-" + v2.x + "-" + v2.y);
                    if ((enemy.hasClass("box-is-player")) || (enemy.hasClass("box-is-third"))) {
                        available_target_num++;
                        available_target.push({x: v2.x, y: v2.y});
                    }
                });

                if( available_target.length > 0 ) {
                    //ll(available_target);
                    //ll(v);

                    var attackerEle =  $(".data-box-" + robotEle.x + "-" + robotEle.y);
                    var targetEle   =  $(".data-box-" + available_target[0].x + "-" + available_target[0].y);
                    showAttackAnimation(attackerEle,targetEle);
                    setTimeout(function() {
                        $(attackerEle).find(".flashRobot").remove();
                        revertBoxLayer();
                        disablePlayerActivity();
                        console.log("ai attack!")

                    }, (animationTime + 100) );

                    doAttack = true;
                    return false;
                }
            }

        });
    }

    return doAttack;
}

function showWeaponList(robotEle,type = "attack") {
    $(".mapbox").removeClass("available_attack");
    var attackRobotID = getRobotID(robotEle);
    var attackRobotData = getRobotData(attackRobotID);
    var not_allowed_weapon = [];

    $(robotEle).addClass("isFocused");

    $("#MainMenu").css("pointer-events","none");
    $("#contextMenu").css("pointer-events","none");
    $("#map").css("filter","blur(1px)");

    $("#WeaponMenu").show();
    $('#WeaponMenu').attr("data-robot",attackRobotID);


    $(".weaponList_weapons").html("");
    var weaponHTML = "";
    $.each( attackRobotData.weapons, function( k, v ) {
        var addClass = "";
        if( (parseInt(v.ammo) === 0) || ( attackRobotData.morale < v.morale ) ){
            addClass = "not_allowed_weapon";
            not_allowed_weapon.push(k);
        }
        if( (isAfterMove === true) && (v.afterMove === false) ){
            addClass = "not_allowed_weapon";
            not_allowed_weapon.push(k);
        }

        weaponHTML += '<div class="weaponList_item '+addClass+'">';
        weaponHTML += '<div class="weaponList_label weaponList_weapon">'+v.name+'</div>';
        weaponHTML += '<div class="weaponList_label weaponList_property">';
        if(v.afterMove === true) {
            weaponHTML += '<span class="Weapon_symbol">P</span> ';
        }
        if(v.isSeep === true) {
            weaponHTML += '<span class="Weapon_symbol">S</span>';
        }
        weaponHTML += '</div>';

        weaponHTML += '<div class="weaponList_label weaponList_power">'+v.power+'</div>';
        if(v.range === 1){
            weaponHTML += '<div class="weaponList_label weaponList_range">'+v.range+'</div>';
        } else {
            if(v.hasOwnProperty("range_from")){
                weaponHTML += '<div class="weaponList_label weaponList_range">'+v.range_from+' - ' + v.range + '</div>';
            } else {
                weaponHTML += '<div class="weaponList_label weaponList_range">1 - ' + v.range + '</div>';
            }
        }
        if(v.hasOwnProperty("en")) {
            weaponHTML += '<div class="weaponList_label weaponList_en">' + v.en + '</div>';
        } else {
            weaponHTML += '<div class="weaponList_label weaponList_en">0</div>';
        }

        if(v.hasOwnProperty("ammo")){
            weaponHTML += '<div class="weaponList_label weaponList_ammo">'+v.ammo+' / '+v.total_ammo+'</div>';
        } else {
            weaponHTML += '<div class="weaponList_label weaponList_ammo"> / </div>';
        }

        weaponHTML += '</div>';
    });

    $(".weaponList_weapons").append(weaponHTML);

    $(".fa-window-close").unbind();
    $(".fa-window-close").click(function (e) {
        $(this).parent().parent().hide();
        enablePlayerActivity();
        $("#map").css("filter","none");
        $(robotEle).removeClass("isFocused");
        isDoingAttack = false;
    });

    if(type === "attack") {
        $(".weaponList_item").unbind();
        $(".weaponList_item").click(function (e) {
            if ( (!$(this).hasClass("not_allowed_weapon")) && (not_allowed_weapon.includes($(this).index()) === false) ) {
                attackRobot = attackRobotID;
                attackWeaponIndex = $(this).index();
                $(".fa-window-close").click();
                getRobotAttackRange(robotEle);
                closeAfterMoveMenu();
            }
        });
    }

    $(".weaponInfo").html("");
    $(".weaponList_item").hover(function (e) {
        var openedRobot = $("#WeaponMenu").attr('data-robot');
        var hoverWeapon = (robot.player.robotsElement[openedRobot]["weapons"][$(this).index()]);
        $(".weaponInfo").html("");

        var newWeaponInfoHTML = "";
        //Left side
        newWeaponInfoHTML += '<div class="weaponInfo_left">';
            if(hoverWeapon.type === "warri") {
                newWeaponInfoHTML += '<div class="weaponInfoItem"><img src="./assets/crossed.png"> 近戰武器</div>';
            } else {
                newWeaponInfoHTML += '<div class="weaponInfoItem"><img src="./assets/beam.png"> 射擊武器</div>';
            }

            if(hoverWeapon.afterMove === true || hoverWeapon.isSeep === true) {
                newWeaponInfoHTML += '<div class="weaponInfoItem">';

                if(hoverWeapon.afterMove === true){
                    newWeaponInfoHTML += '<span class="Weapon_symbol">P</span> 移動後可攻擊 ';
                    if(hoverWeapon.isSeep === true){
                        newWeaponInfoHTML += ' / ';
                    }
                }

                if(hoverWeapon.isSeep === true){
                    newWeaponInfoHTML += '<span class="Weapon_symbol">S</span> 可貫穿護盾 ';
                }

                newWeaponInfoHTML += '</div>';
            }

            if(hoverWeapon.hasOwnProperty("morale")) {
                newWeaponInfoHTML += '<div class="weaponInfoItem">所需氣力 ';
                if(robot.player.robotsElement[openedRobot]['morale'] < hoverWeapon.morale){
                    newWeaponInfoHTML += '<span style="color: red">'+hoverWeapon.morale+'</span>';
                } else {
                    newWeaponInfoHTML += '<span>'+hoverWeapon.morale+'</span>';
                }
                newWeaponInfoHTML += '</div>';
            } else {
                newWeaponInfoHTML += '<div class="weaponInfoItem">所需氣力 </div>';
            }

            if(hoverWeapon.hasOwnProperty("hitRate")) {
                newWeaponInfoHTML += '<div class="weaponInfoItem">命中補正 <span>'+hoverWeapon.hitRate+'%</span> </div>';
            } else {
                newWeaponInfoHTML += '<div class="weaponInfoItem">命中補正 </div>';
            }

            if(hoverWeapon.hasOwnProperty("crt")) {
                newWeaponInfoHTML += '<div class="weaponInfoItem">會心補正 <span>'+hoverWeapon.crt+'%</span> </div>';
            } else {
                newWeaponInfoHTML += '<div class="weaponInfoItem">會心補正 </div>';
            }

        newWeaponInfoHTML += '</div>';

        var weaponsLv = robot.player.robotsElement[openedRobot]['weaponsLv'];
        weaponsLv = parseInt(weaponsLv) * 10;

        //Right side
        newWeaponInfoHTML += '<div class="weaponInfo_right">';

            newWeaponInfoHTML += '<div class="weaponInfoItem">強化狀態 <div class="progress"><div class="progress-bar" role="progressbar" aria-valuenow="'+weaponsLv+'" aria-valuemin="0" aria-valuemax="100" style="width:'+weaponsLv+'%"><span class="sr-only"></span></div></div></div>';
                newWeaponInfoHTML += '<div>特殊能力';
                    newWeaponInfoHTML += '<div class="weaponEffectBox">';
                        if(!hoverWeapon.hasOwnProperty("effect")){
                            newWeaponInfoHTML += ' 沒有 ';
                        } else {
                            $.each( hoverWeapon.effect, function( key, value ) {
                                newWeaponInfoHTML += Object.keys(value)[0]+':'+value[Object.keys(value)[0]]+'<br>';
                            });
                        }
                    newWeaponInfoHTML += '</div>';
                newWeaponInfoHTML += '</div>';
        newWeaponInfoHTML += '</div>';


        $(".weaponInfo").html(newWeaponInfoHTML);
    });

}

function getRobotAttackRange(robot) {
    var attackRobotID = getRobotID(robot);
    var attackRobotData = getRobotData(attackRobotID);

    var available_pos = getAvailableCoordinate(attackRobotData.x, attackRobotData.y, "attack");
    showMove(available_pos, "player","attack");

    isDoingMove = true;
    isDoingAttack = true;

    $(".available_attack").unbind();
    $('.available_attack').click(function() {

        var canAttack = false;
        var clickPos = getCoordinateByEle($(this));
        $.each( available_pos, function( key, value ) {
            if( (value.x === parseInt(clickPos[0])) && (value.y === parseInt(clickPos[1])) ){
                canAttack = true;
            }
        });

        if( ($(this).hasClass("available_attack")) && (canAttack === true) ) {
            if($(this).hasClass("box-is-ai") || $(this).hasClass("box-is-third")) {

                var targetEle = $(this);
                var attackerEle = $(".data-box-"+attackRobotData.x+"-"+attackRobotData.y);
                //Display attack animation
                showAttackAnimation(attackerEle,targetEle);

                setTimeout(function() {
                    $(attackerEle).find(".flashRobot").remove();
                    $(".mapbox").removeClass("available_attack");
                    revertBoxLayer();

                    ll(targetEle); ll(attackRobotData); ll(attackWeaponIndex);


                }, (animationTime + 100) );
            }
        } else {
            isDoingAttack = false;
            $(".mapbox").removeClass("available_attack");
            revertBoxLayer();
            if(isAfterMove === true) {
                $("#AfterMoveMenu").css({"display": "block"});
            }
        }
    });
}

function showAttackAnimation(attackerEle,targetEle) {
    var xSource =  ($(attackerEle).find(".is_robot"))[0].offsetLeft;
    var ySource =  ($(attackerEle).find(".is_robot"))[0].offsetTop;
    var xTarget = (targetEle[0].offsetLeft)+2;
    var yTarget = targetEle[0].offsetTop;

    var swingRobot =  '<img src="./assets/fight.png" draggable="false" class="flashRobot">';
    $(attackerEle).append(swingRobot);

    $(attackerEle).find(".flashRobot").css({"position":"absolute", "left": xSource, "top" : ySource ,"filter" : "grayscale(1)", "z-index" : 999});
    ($(attackerEle).find(".flashRobot")).animate({left: xTarget, top: yTarget}, animationTime, "swing");
}

function getCoordinateByEle(ele) {
    var coordinate = ele.find(".developer-coordinate");
    coordinate = coordinate.html();

    return coordinate.split("-");
}

function getMoveCoordinateByTarget(available_pos, targetX, targetY) {
    var minDistance = 45; //45 is the biggest distance of a 30X20 map
    var tempAvailablePosArr = {};
    var availablePos = [];

    $.each( available_pos, function( key, value ) {
        var distance_x;
        var distance_y;
        if(targetX > value.x){
            distance_x = (targetX - value.x);
        } else {
            distance_x = (value.x - targetX);
        }

        if(targetY > value.y){
            distance_y = (targetY - value.y);
        } else {
            distance_y = (value.y - targetY);
        }

        var distance = distance_x + distance_y;
        if(distance < minDistance){
            minDistance = distance;
        }

        if (distance in tempAvailablePosArr) {
            tempAvailablePosArr[distance].push(value);
        } else {
            tempAvailablePosArr[distance] = [];
            tempAvailablePosArr[distance].push(value);
        }
    });

    availablePos = tempAvailablePosArr[minDistance];
    availablePos = getUniqueArray(availablePos);

    return availablePos;
}

function getUniqueArray(array){
    var arr = {}
    arr["objects"] = array;

    const uniqueArray = arr.objects.filter((objects, index) => {
        const _objects = JSON.stringify(objects);
        return index === arr.objects.findIndex(obj => {
            return JSON.stringify(obj) === _objects;
        });
    });

    return uniqueArray;
}

function sortByX( a, b ) {
    if ( a.x < b.x ){
        return -1;
    }
    if ( a.x > b.x ){
        return 1;
    }
    return 0;
}


function getMiddle(array, i = 0) {
    if (i * 2 + 2 in array) return getMiddle( array, i + 1 )
    else return array[i];
}


function getAvailableCoordinate(eleX, eleY, action = "move") {
    var currentPos = [{x: eleX, y: eleY}];
    var ele = $(".data-box-" + eleX + "-" + eleY);
    var eleType = getRobotType(ele);

    if( action === "move") {
        //check the element around the target in four directions, block if robot surrounded by item and enemy when doing move
        var eleLeft = ($(".data-box-" + (eleX - 1) + "-" + eleY));
        var eleRight = ($(".data-box-" + (eleX + 1) + "-" + eleY));
        var eleTop = ($(".data-box-" + eleX + "-" + (eleY - 1)));
        var eleDown = ($(".data-box-" + eleX + "-" + (eleY + 1)));

        if ((eleLeft.hasClass("box-is-block")) && (eleRight.hasClass("box-is-block")) && (eleTop.hasClass("box-is-block")) && (eleDown.hasClass("box-is-block"))) {
            return null;
        }

        if (eleType === "player") {
            if (isThirdAlly === false) {
                if (((eleLeft.hasClass("box-is-ai")) || (eleLeft.hasClass("box-is-block")) || (eleLeft.hasClass("box-is-third"))) &&
                    ((eleRight.hasClass("box-is-ai")) || (eleRight.hasClass("box-is-block")) || (eleRight.hasClass("box-is-third"))) &&
                    ((eleTop.hasClass("box-is-ai")) || (eleTop.hasClass("box-is-block")) || (eleTop.hasClass("box-is-third"))) &&
                    ((eleDown.hasClass("box-is-ai")) || (eleDown.hasClass("box-is-block")) || (eleDown.hasClass("box-is-third")))
                ) {
                    return null;
                }
            } else {
                if (((eleLeft.hasClass("box-is-ai")) || (eleLeft.hasClass("box-is-block"))) &&
                    ((eleRight.hasClass("box-is-ai")) || (eleRight.hasClass("box-is-block"))) &&
                    ((eleTop.hasClass("box-is-ai")) || (eleTop.hasClass("box-is-block"))) &&
                    ((eleDown.hasClass("box-is-ai")) || (eleDown.hasClass("box-is-block")))
                ) {
                    return null;
                }
            }
        }

        if (eleType === "ai" || eleType === "third") {
            if (isThirdAlly === false) {
                if (((eleLeft.hasClass("box-is-player")) || (eleLeft.hasClass("box-is-block"))) &&
                    ((eleRight.hasClass("box-is-player")) || (eleRight.hasClass("box-is-block"))) &&
                    ((eleTop.hasClass("box-is-player")) || (eleTop.hasClass("box-is-block"))) &&
                    ((eleDown.hasClass("box-is-player")) || (eleDown.hasClass("box-is-block")))
                ) {
                    return currentPos;
                }
            } else {
                if (eleType === "ai") {
                    if (((eleLeft.hasClass("box-is-player")) || (eleLeft.hasClass("box-is-block")) || (eleLeft.hasClass("box-is-third"))) &&
                        ((eleRight.hasClass("box-is-player")) || (eleRight.hasClass("box-is-block")) || (eleRight.hasClass("box-is-third"))) &&
                        ((eleTop.hasClass("box-is-player")) || (eleTop.hasClass("box-is-block")) || (eleTop.hasClass("box-is-third"))) &&
                        ((eleDown.hasClass("box-is-player")) || (eleDown.hasClass("box-is-block")) || (eleDown.hasClass("box-is-third")))
                    ) {
                        return currentPos;
                    }
                } else {
                    if (((eleLeft.hasClass("box-is-player")) || (eleLeft.hasClass("box-is-block")) || (eleLeft.hasClass("box-is-ai"))) &&
                        ((eleRight.hasClass("box-is-player")) || (eleRight.hasClass("box-is-block")) || (eleRight.hasClass("box-is-ai"))) &&
                        ((eleTop.hasClass("box-is-player")) || (eleTop.hasClass("box-is-block")) || (eleTop.hasClass("box-is-ai"))) &&
                        ((eleDown.hasClass("box-is-player")) || (eleDown.hasClass("box-is-block")) || (eleDown.hasClass("box-is-ai")))
                    ) {
                        return currentPos;
                    }
                }
            }
        }
    }

    var robotID = getRobotID(ele);
    var robotData = getRobotData(robotID,eleType);
    var robotRange;
    var rangeStart = 0;

    if(action === "move") {
        robotRange = robotData.moveLevel;
    } else if(action === "attack") {
        robotRange = robotData.weapons[attackWeaponIndex]["range"];
        if(robotData.weapons[attackWeaponIndex].hasOwnProperty("range_from")){
            rangeStart = robotData.weapons[attackWeaponIndex]["range_from"];
        }
    }
    rangeStart = parseInt(rangeStart) - 1;

    var avail_coordinate = [];
    var available_pos = [];
    avail_coordinate.push(eleX);
    avail_coordinate.push(eleY);
    for (i = 1; i <= robotRange; i++) {
        if( i > rangeStart) {
            available_pos.push({x: parseInt(eleX), y: parseInt(eleY) + i});
            available_pos.push({x: parseInt(eleX), y: parseInt(eleY) - i});
        }
        avail_coordinate.push(parseInt(eleY) + i);
        avail_coordinate.push(parseInt(eleY) - i);
    }
    for (i = 1; i <= robotRange; i++) {
        if( i > rangeStart) {
            available_pos.push({x: parseInt(eleX) + i, y: parseInt(eleY)});
            available_pos.push({x: parseInt(eleX) - i, y: parseInt(eleY)});
        }
        avail_coordinate.push(parseInt(eleX) + i);
        avail_coordinate.push(parseInt(eleX) - i);
    }
    avail_coordinate = avail_coordinate.filter(onlyUnique);
    var matrixPos = getMoveMatrix(avail_coordinate);

    $.each( matrixPos, function( key, value ) {
        var distance_x;
        var distance_y;
        if(eleX > value.x){
            distance_x = (eleX - value.x);
        } else {
            distance_x = (value.x - eleX);
        }

        if(eleY > value.y){
            distance_y = (eleY - value.y);
        } else {
            distance_y = (value.y - eleY);
        }

        var distance = distance_x + distance_y;
        if(distance <= robotRange){
            if(distance > rangeStart) {
                available_pos.push({x: value.x, y: value.y});
            }
        }
    });

    available_pos = getUniqueArray(available_pos);



    //Filter all not allowed pos
    var newAvailable_pos = [];
    $.each( available_pos, function( key, value ) {
        var ele = $(".data-box-" + value.x + "-" + value.y);

        if(action === "move") {
            if ((!ele.hasClass("box-is-player")) && (!ele.hasClass("box-is-ai")) &&
                (!ele.hasClass("box-is-third")) && (!ele.hasClass("box-is-block")) && (ele.length > 0)
            ) {
                newAvailable_pos.push(value);
            }
        }

        if(action === "attack") {
            if(eleType === "player") {
                if (isThirdAlly === false) {
                    if ((!ele.hasClass("box-is-player")) && (!ele.hasClass("box-is-block")) && (ele.length > 0)
                    ) {
                        newAvailable_pos.push(value);
                    }
                } else {
                    if ((!ele.hasClass("box-is-player")) && (!ele.hasClass("box-is-third")) && (!ele.hasClass("box-is-block")) && (ele.length > 0)
                    ) {
                        newAvailable_pos.push(value);
                    }
                }
            } else if(eleType === "ai") {
                if (isThirdAlly === true) {
                    if ((!ele.hasClass("box-is-ai")) && (!ele.hasClass("box-is-block")) && (ele.length > 0)
                    ) {
                        newAvailable_pos.push(value);
                    }
                } else {
                    if ((!ele.hasClass("box-is-ai")) && (!ele.hasClass("box-is-third")) && (!ele.hasClass("box-is-block")) && (ele.length > 0)
                    ) {
                        newAvailable_pos.push(value);
                    }
                }
            } else {
                if (isThirdAlly === true) {
                    if ((!ele.hasClass("box-is-third")) && (!ele.hasClass("box-is-block")) && (!ele.hasClass("box-is-player")) && (ele.length > 0)
                    ) {
                        newAvailable_pos.push(value);
                    }
                } else {
                    if ( (!ele.hasClass("box-is-third")) && (!ele.hasClass("box-is-block")) && (ele.length > 0)
                    ) {
                        newAvailable_pos.push(value);
                    }
                }
            }
        }
    });

    return newAvailable_pos;
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


function getTwoPosMatrix(first= [], second = []){
    var matrixPos = [];
    $.each( first, function( k1, v1 ) {
        $.each( second, function( k2, v2 ) {
            matrixPos.push({x:v1, y:v2});
        });
    });

    return matrixPos;
}

function getRobotStatus(robotID){
    var robotStatus = robot.player.robotsElement[robotID]["isMoved"];
    return robotStatus;
}


function resetPlayerRobotStatus(){
    $.each( robot.player.robotsElement, function( key, value ) {
        robot.player.robotsElement[key]["isMoved"] = false;
    });
    $.each( robot.ai.robotsElement, function( key, value ) {
        robot.ai.robotsElement[key]["isMoved"] = false;
    });
    $.each( robot.third.robotsElement, function( key, value ) {
        robot.third.robotsElement[key]["isMoved"] = false;
    });
}

function getRobotID($element){
    var robotID = $element.find('.is_robot').attr('data-robot');
    return robotID;
}

function getRobotData(robotID, target = "player"){
    switch(target) {
        case "player":
            var robotData = robot.player.robotsElement[robotID];
            break;
        case "ai":
            var robotData = robot.ai.robotsElement[robotID];
            break;
        case "third":
            var robotData = robot.third.robotsElement[robotID];
            break;
        default:
            var robotData = robot.player.robotsElement[robotID];
    }

    return robotData;
}

function getRobotType(ele){
    var eleType;
    if(ele.hasClass("box-is-player")){
        eleType = "player";
    }
    if(ele.hasClass("box-is-ai")){
        eleType = "ai";
    }
    if(ele.hasClass("box-is-third")){
        eleType = "third";
    }

    return eleType;
}


function getRobotDataByID(target){

    var dialog_target = null; //robot["player"]["robotsElement"][target];

    $.each( robot.player.robotsElement, function( key, value ) {
        if(target === key){ dialog_target = value; return; }
    });
    $.each( robot.ai.robotsElement, function( key, value ) {
        if(target === key){ dialog_target = value; return; }
    });
    $.each( robot.third.robotsElement, function( key, value ) {
        if(target === key){ dialog_target = value; return; }
    });

    return dialog_target;
}

function revertBoxLayer() {
    $(".box_layer").css({"background-color":"transparent", "z-index" : "auto"});
}

const delay = ms => new Promise(res => setTimeout(res, ms));

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}















/*********************** ENVIRONMENT  RELATED ***********************/


//Listen for screen width size
$(window).on('resize', function(){
    var win = $(this);
    if (win.width() < 1300) {
        $("#map").hide();
        $(".warning-notice").show();
        $("#main-container").unbind();
    } else {
        $(".warning-notice").hide();
        $("#map").show();
        activeMainMenuListener();
    }
});

//Listen for error
window.onerror = function(error, url, line) {
    ll("error occur!");
};


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


if(APP_ENV === "PRODUCTION") {
    if (window.devtools.isOpen === true) {
        $("#main-container").remove();
        $(".developer-notice").show();
    }

    window.addEventListener('devtoolschange', event => {
        console.log('Is DevTools open:', event.detail.isOpen);
        //console.log('DevTools orientation:', event.detail.orientation);
        if (event.detail.isOpen === true) {
            $("#main-container").remove();
            $(".developer-notice").show();
        }
    });
}
