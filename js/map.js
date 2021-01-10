var mainBGM = new Audio('./bgm/timetocome.MP3');
var og = new Audio('./bgm/og.MP3');

//////////////////////////   CLICK EVENTS delegation /////////////////////////////////////////
$("body").on("click", function() {

  // JQuery: selecting element to which .on() event handling method is attached.
  if ($(event.target).attr("id") == "newGameBtn") {
    mainBGM.play();
    game.newGame();
  } else if ($(event.target).hasClass("availableSquare")) {
    movementManager.movePlayer(game.activePlayer());
  } else if ($(event.target).hasClass("attackBtn")) {
    game.activePlayer().attack();
  } else if ($(event.target).hasClass("defendBtn")) {
    game.activePlayer().defend();
  }
});

//////////////////////   WEAPONS   ///////////////
class Weapons {
  constructor(allItems) {
    this.allItems = allItems; // array with weapon objects will be initialised in game object. Properties of each object: name, cssClass, damage.
    // collection of weapons to be generated on map when new game starts:
    this.pickable = () => {
      return this.allItems.filter(item => {
        return item.damage > 10;
      });
    };
    // choosing which weapon should be set as default:
    this.default = () => {
      return this.allItems[0];
    };
    // populate map randomly with pickable weapons:
    this.generateOnMap = () => {
      for (let weapon of this.pickable()) {
        let isOnMap = 0;
        while (isOnMap < 1) {
          let newWeapon = map.randomPosition(map.allSquares());
          if (newWeapon.className === "mapSquare") {
            $(newWeapon).addClass(weapon.cssClass);
            isOnMap++;
          }
        }
      }
    };
  }
}

//////////////////////////   PLAYER   /////////////////////////////////
class Player {
  constructor(cssClass, statboxId) {
    this.cssClass = cssClass;
    this.statboxId = statboxId;
    this.isActive = false;
    this.position = null;
    this.healthPoints = 100;
    this.Weapon = game.weapons.default();
    this.defenceMultiplier = 1;
    this.generatePosition = mapSquareCollectionName => {
      let isOnMap = 0;
      while (isOnMap < 1) {
        let newPlayer = map.randomPosition(mapSquareCollectionName); // generate new random position from selected collection of elements and check if it is available:
        if (newPlayer.className === "mapSquare") {
          $(newPlayer).addClass(this.cssClass);
          isOnMap++;
        }
        this.position = $(`.${this.cssClass}`)[0]; //jQuery: selecting first element within jQuery wrapper of this.cssClass (i.e. playerOne/ playerTwo) HTML collection.
        // Setting this element as player's position
      }
    };
    this.positionArray = () => {
      let currentId = this.position.id.split("-"); // element's id is a string by default. For navigation purpose, this function turns it into array of coordinate numbers
      currentId[0] = parseInt(currentId[0]);
      currentId[1] = parseInt(currentId[1]);
      return currentId;
    };

    this.attack = () => {
      mainBGM.pause();

      if (this.cssClass == "playerOne") {
        og.play();

        $(`#${this.statboxId} .weaponIcon`)
          .animate({ left: "+=500" }, "slow")
          .fadeOut(100)
          .animate({ left: "-=500" })
          .fadeIn(200);
      } else {
        $(`#${this.statboxId} .weaponIcon`)
          .animate({ left: "-=500" }, "slow")
          .fadeOut(100)
          .animate({ left: "+=500" })
          .fadeIn(200);
      }

      game.inactivePlayer().healthPoints =
        game.inactivePlayer().healthPoints -
        this.Weapon.damage * game.inactivePlayer().defenceMultiplier;
      game.inactivePlayer().defenceMultiplier = 1; // if opponent chosed to defend themselves, this sets defenceMultiplier back to initial value.
      // check if battle should continue
      if (game.inactivePlayer().healthPoints > 0) {
        game.inactivePlayer().createStatbox(); // update statbox for attacked player
        game.toggleBtnBox(); // active status is toggled along with attack/defend buttons
      } else if (game.inactivePlayer().healthPoints <= 0) {
        game.inactivePlayer().healthPoints = 0;
        game.inactivePlayer().createStatbox();
        game.btnBox().style.display = "none";
        alert(`Game over! Winner: ${this.cssClass}`);
      }
    };
    this.defend = () => {
      this.defenceMultiplier = 0.5; // opponent's attack will be multiplied by it.
      game.toggleBtnBox();
    };

    this.createStatbox = () => {
      let playerStatbox = $(`#${this.statboxId}`); // jQuery: selecting element with player's statbox id
      playerStatbox.html(""); // jQuery: using html() method to change elements's innerHTML
      playerStatbox.append("<table></table>");
      let playerTable = $(`#${this.statboxId} table`);
      playerTable.append(
        $(`<tr><td>HEALTH:</td> <td>${this.healthPoints}</td></tr>`)
      );
      playerTable.append(
        $(`<tr><td>WEAPON:</td> <td>${this.Weapon.name}</td></tr>`)
      );
      playerTable.append(
        $(`<tr><td>DAMAGE:</td> <td>${this.Weapon.damage}</td></tr>`)
      );
      playerStatbox.append(
        $("<div></div>").addClass(`weaponIcon ${this.Weapon.cssClass}`)
      ); // jQuery: appending new div and adding classes to it
    };
  }
}
/////////////////////////////    MAP   /////////////////////////////////////
let map = {
  allSquares: () => {
    return $(".mapSquare");
  }, // JQuery: checking HTML collection od mapSquare class elements. allSquares, firstRow and lastRow are collections for randomPosition method below

  firstRow: () => {
    return $("#mapGrid .mapGridRow:first .mapSquare"); //JQuery: selecting element, then inner elements of its first and last child
  },
  lastRow: () => {
    return $("#mapGrid .mapGridRow:last .mapSquare");
  },
  randomPosition: collectionName => {
    let randomIndex = Math.floor(Math.random() * collectionName.length);
    return collectionName[randomIndex]; // new random mapSquare element
  },
  generateDimmedSquares: amount => {
    // place dimmedSquare (unavailable) class only if randomly generated mapSquare is empty. Repeat until all dimmedSquares are on the map
    let totalDimmed = 0;
    while (totalDimmed < amount) {
      let newDimmedSquare = map.randomPosition(map.allSquares());

      if (newDimmedSquare.className === "mapSquare") {
        $(newDimmedSquare).addClass("dimmedSquare");
        totalDimmed++;
      }
    }
  },
  windowSize: () => {
    if ($(window).width() < 400) {
      return 9;
    } else {
      return 12;
    }
  },
  drawMapGrid: size => {
    for (let row = 0; row < size; row++) {
      $("#mapGrid").append($("<div></div").addClass("mapGridRow"));

      for (let column = 0; column < size; column++) {
        // JQuery: 1. Create div object,add mapSquareClass and id attribute (coordinates)
        let mapSquare = $("<div></div>")
          .addClass("mapSquare")
          .attr("id", `${[row]}-${[column + 1]}`);

        $(".mapGridRow:last").append(mapSquare);
      }
    }
  }
};
///////////////////////////// GAME //////////////////////////////////////////

let game = {
  playerOne: "",
  playerTwo: "",
  mapgrid: $("#mapGrid"),
  weapons: new Weapons([
    { name: "Snowball", cssClass: "snowball", damage: 10 },
    { name: "Fish", cssClass: "fish", damage: 15 },
    { name: "Small stone", cssClass: "smallStone", damage: 20 },
    { name: "Big stone", cssClass: "bigStone", damage: 30 }
  ]),
  newGame: () => {
    $("#newGameBtn, #loadGameBtn , #main-header").css("display","none");

    game.mapgrid.fadeOut(5);
    game.mapgrid
      .html("")
      .removeClass("disabled")
      .fadeIn(300); // JQuery: using fadeIn() and fadeOut() effects, clearing mapGrid and removing pointer events blockade from previous game
    $(".btnBox").css("display", "none"); //hides fightMode button elements

    map.drawMapGrid(map.windowSize());
    $(".stats-window").css("display", "block"); // sets statbox display to block ("none" before the game starts)
    game.playerOne = new Player("playerOne", "statboxOne");
    game.playerTwo = new Player("playerTwo", "statboxTwo");
    map.generateDimmedSquares(15);
    game.playerOne.generatePosition(map.firstRow());
    game.playerTwo.generatePosition(map.lastRow());
    game.playerOne.isActive = true;
    movementManager.checkAvailableSquares(game.activePlayer());
    game.weapons.generateOnMap();
    game.playerOne.createStatbox();
    game.playerTwo.createStatbox();
  },
  fightMode: () => {
    game.mapgrid.addClass("disabled");
    game.btnBox().style.display = "block";
    movementManager.clearAccessible();
  },

  activePlayer: () => {
    if (game.playerOne.isActive) {
      return game.playerOne;
    } else {
      return game.playerTwo;
    }
  },
  inactivePlayer: () => {
    if (!game.playerOne.isActive) {
      return game.playerOne;
    } else {
      return game.playerTwo;
    }
  },
  toggleIsActive: () => {
    if (game.activePlayer() == game.playerOne) {
      game.playerOne.isActive = false;
      game.playerTwo.isActive = true;
    } else {
      game.playerTwo.isActive = false;
      game.playerOne.isActive = true;
    }
  },
  btnBox: () => {
    let btn = "";
    if (game.activePlayer() == game.playerOne) {
      btn = $(".btnBox").get(0);
    } else {
      btn = $(".btnBox").get(1);
    }
    return btn;
  },
  toggleBtnBox: () => {
    game.btnBox().style.display = "none";
    game.toggleIsActive();
    game.btnBox().style.display = "block";
  }
};

///////////////////////// MOVEMENT ///////////////////////////
let movementManager = {
  availableSquares: () => {
    return $(".availableSquare");
  },
  checkAvailableSquares: player => {
    function check(player, index, multiplier) {
      let x = player.positionArray()[0]; // index 0 in positionArray is a row number extracted from mapSquare's id of where active player is currently placed
      let y = player.positionArray()[1]; // index 1 is a column number

      for (let i = 0; i < 3; i++) {
        // 1. index calculates which direction (row or column) is browsed for available squares
        if (index === 1) {
          y = player.positionArray()[index] + (i + 1) * multiplier; // 2. multiplied by 1 or -1 calculates squares behind or in fron of player's current position
        } else if (index === 0) {
          x = player.positionArray()[index] + (i + 1) * multiplier;
        }

        let newCheck = `${x}-${y}`; // 3. creates mapSquare id with calculated coordinates
        let newCheckId = $(`#${newCheck}`); // 4. creates jQuery object of calculated mapSquare

        // 5. if it calculated mapSquare doesn't exist (border), loop breaks:
        if (newCheckId == null) {
          break;
        }
        // 6. if first checked mapSquare contains player's css class, battle begins:
        else if (
          i == 0 &&
          (newCheckId.hasClass("playerOne") || newCheckId.hasClass("playerTwo")) // (JQuery: hasClass method)
        ) {
          game.fightMode();
          break;
        } // 7. if another player is further, but still within 3 squares distance, available squares are not added on and beyond it (active player can't jump over the opponent)
        else if (
          newCheckId.hasClass("playerOne") ||
          newCheckId.hasClass("playerTwo")
        ) {
          break;
          // 8. loop breaks if checked square has dimmedSquare class:
        } else if (newCheckId.hasClass("dimmedSquare")) {
          break;
        } // 9. if no obstacles, code loops three times:
        else {
          newCheckId.addClass("availableSquare");
        }
      }
    }
    // 10:  execute function above in four directions:
    check(player, 0, -1); //up
    check(player, 0, 1); //down
    check(player, 1, -1); //left
    check(player, 1, 1); //right
  },
  takePlayerAway: player => {
    $(`#${player.position.id}`).removeClass(`${player.cssClass}`);
  },
  clearAccessible: () => {
    while (movementManager.availableSquares().length) {
      movementManager
        .availableSquares()
        [movementManager.availableSquares().length - 1].classList.remove(
          "availableSquare"
        );
    }
  },
  movePlayer: player => {
    movementManager.clearAccessible();
    movementManager.takePlayerAway(player);
    let chosenSquare = $(event.target); // returns event target element in jQuery object wrapper
    chosenSquare.addClass(player.cssClass);
    player.position = chosenSquare[0]; // accesing html element within jQuery wrapper

    // check if target mapSquare contains weapon
    for (let i = 0; i < game.weapons.allItems.length; i++) {
      if (chosenSquare.hasClass(`${game.weapons.allItems[i].cssClass}`)) {
        console.log(`grabbed ${game.weapons.allItems[i].cssClass}`);
        chosenSquare.addClass(`${player.Weapon.cssClass}`);
        player.Weapon = game.weapons.allItems.find(item => {
          return item.cssClass == game.weapons.allItems[i].cssClass;
        });
        chosenSquare.removeClass(`${game.weapons.allItems[i].cssClass}`);
        i = game.weapons.allItems.length;
      }
    }

    game.toggleIsActive();
    player.createStatbox();
    movementManager.checkAvailableSquares(game.activePlayer());
  }
};
