//FUNCTIONS CALLED FROM EVENT LISTENERS
function updatePosition(e) { //update position based on mouse movement and sens
    angle -= e.movementX * 0.2 * sens
}

function lockChangeAlert() { //when user enters or exists pointer lock
    if (document.pointerLockElement === c) { //going from a pause menu to the game
        document.addEventListener("mousemove", updatePosition, false);
        gameTimer = Date.now()
    } else { //going from the game to a pause menu
        document.removeEventListener("mousemove", updatePosition, false);
        if ((!win) && (!dead)) { //only allows pause if gamer hasnt won yet and isnt dead
            ambience[level].pause()
            if (chasing) {
                chase[level].pause()
            }
            if (mute == 0) {
                pauseSound.play()
            }
            gameTimerCumulative += Date.now() - gameTimer
            pauseScreen = true
            gameScreen = false
            setTimeout(allowResume, 1500)
        }
    }
}

function allowResume() { //setTimeout calls this
    canClick = true
}

//SIDE FUNCTIONS
function hex(input, scale) { //converts hex colour to modified hex colour based on a scaling factor
    let result1 = (Math.round(parseInt(input.slice(1, 3), 16) * scale)).toString(16) //r
    let result2 = (Math.round(parseInt(input.slice(3, 5), 16) * scale)).toString(16) //g
    let result3 = (Math.round(parseInt(input.slice(5, 7), 16) * scale)).toString(16) //b
    if (result1.length == 1) {
        result1 = "0" + result1
    }
    if (result2.length == 1) {
        result2 = "0" + result2
    }
    if (result3.length == 1) {
        result3 = "0" + result3
    }
    return "#" + result1 + result2 + result3 //modified rgb string in form "#000000"
}

function sortFunction(a, b) { //sort function for javascript built-in (only works with index 2 (shortcut lol))
    if (a[2] === b[2]) {
        return 0;
    } else {
        return (a[2] < b[2]) ? -1 : 1;
    }
}

function angleFrom(a, b) { //gets angle from a to b (degrees, from right, anticlockwise)
    a = getTrueAngle(a)
    b = getTrueAngle(b)

    if (b > a) {
        if (b - a > 180) { //around the 0 angle
            return - (360 - (b - a))
        } else { //normal a to b
            return b - a
        }
    } else if (b - a < -180) { //b is smaller and by more than 180
        return 360 + b - a
    } else { //b is smaller and by less than 180
        return b - a
    }
}

function rand(min, max) { //generates a random number between min and max (inclusive)
    return Math.floor(Math.random() * (max - min + 1)) + min; //configuring the random func to be between params
}

function rad(val) { //degrees of val to radians
    return val * (Math.PI / 180)
}

function deg(val) { //radians of val to degrees
    return val / (Math.PI / 180)
}

function getTrueAngle(angle) { //converts angle to angle between 0 and 360 (not inclusive of 0 (dont ask why i decided this))
    if (angle > 0) {
        return angle % 360
    } else {
        return 360 - (Math.abs(angle) % 360)
    }
}

function next(value, direction) { //returns the distance to the next whole number
    if (Number.isInteger(value)) { //if whole number
        return direction //returns next whole number if upward, itself if downward
    } else if (direction == 1) {
        return Math.ceil(value) - value //distance upward
    } else {
        return Math.floor(value) - value //distance downward
    }
}

function nextInt(value, direction) { //returns what the next int is in a direction
    if (Number.isInteger(value)) { //if already whole number
        return value + direction //returns next whole number if upward, previous whole number if downward
    } else if (direction == 1) {
        return Math.ceil(value)
    } else {
        return Math.floor(value)
    }
}

function mouseInBounds(multX, multY, multX2, multY2) {
    if ((mouseX > startX + size * multX) && (mouseX < startX + size * multY) && (mouseY > startY + size * multX2) && (mouseY < startY + size * multY2)) {
        return true
    } else {
        return false
    }
}

//MAZE GENERATION FUNCTIONS
function generateTile(mazeY, mazeX) { //generates a tile of size [tileSize]

    let picker = rand(0, 100) //random picker
    let tile = [] //tile which will be returned
    let row = [] //rows for tile

    for (let i = 0; i < tileSize; i++) {
        row = []
        for (let j = 0; j < tileSize; j++) {
            row.push(0)
        }
        tile.push(row)
    }

    if (level == 0) { //level 0 generation
    

        if (picker < 90) { //tile type 1

            //remember that density should be proportional to tilesize squared!!
            let density = tileSize * tileSize * 0.002 //num of walls
            for (let i = 0; i < density; i++) { //placing walls
                let length = rand(Math.floor(tileSize / 10), Math.floor(tileSize / 2)) //length of wall
                let wallX = rand(0, tileSize - 1)
                let wallY = rand(0, tileSize - length)
                for (let j = 0; j < length; j++) {
                    tile[wallX][wallY + j] = 1
                }
                length = rand(Math.floor(tileSize / 10), Math.floor(tileSize / 2)) //length of wall
                wallX = rand(0, tileSize - 1)
                wallY = rand(0, tileSize - length)
                for (let j = 0; j < length; j++) {
                    tile[wallY + j][wallX] = 1
                }
            }

            let columns = rand(0, Math.ceil(tileSize * tileSize * 0.005)) //num of columns
            for (let i = 0; i < columns; i++) { //placing columns
                wallX = rand(1, tileSize - 2)
                wallY = rand(1, tileSize - 2)
                while ((tile[wallX][wallY] == 1) && (tile[wallX][wallY+1] == 1) && (tile[wallX][wallY-1] == 1) && (tile[wallX+1][wallY] == 1) && (tile[wallX+1][wallY+1] == 1) && (tile[wallX+1][wallY-1] == 1) && (tile[wallX-1][wallY] == 1) && (tile[wallX-1][wallY+1] == 1) && (tile[wallX-1][wallY-1] == 1)) {
                    wallX = rand(1, tileSize - 2)
                    wallY = rand(1, tileSize - 2)
                }
                tile[wallX][wallY] = 2
            }

            let lights = rand(1, Math.floor(tileSize * tileSize * 0.01)) //num of lights
            for (let i = 0; i < lights; i++) { //lights
                let rando = rand(0, tileSize - 2)
                let rando2 = rand(0, tileSize - 2)
                if (!(wallTiles.includes(tile[rando][rando2]))) {
                    tile[rando][rando2] = 3
                }
                if (!(wallTiles.includes(tile[rando+1][rando2]))) {
                    tile[rando+1][rando2] = 3
                }
                if (!(wallTiles.includes(tile[rando+1][rando2+1]))) {
                    tile[rando+1][rando2+1] = 3
                }
                if (!(wallTiles.includes(tile[rando][rando2+1]))) {
                    tile[rando][rando2+1] = 3
                }

            }
            if ((picker < 20 - 5 * difficulty) && (mazeX != "no")) { //elevator spawn (yes its manual, im lazy)
                let spotX = rand(0, tileSize - 4)
                let spotY = rand(0, tileSize - 4)
                tile[spotY][spotX] = 5
                tile[spotY+1][spotX] = 5
                tile[spotY+2][spotX] = 5
                tile[spotY+3][spotX] = 5
                tile[spotY+3][spotX+1] = 5
                tile[spotY+3][spotX+2] = 5
                tile[spotY+3][spotX+3] = 5
                tile[spotY][spotX+1] = 5
                tile[spotY][spotX+2] = 5
                tile[spotY][spotX+3] = 5
                tile[spotY + 1][spotX + 3] = 6
                tile[spotY + 2][spotX + 3] = 6
                tile[spotY + 1][spotX + 1] = 7
                tile[spotY + 2][spotX + 1] = 7
                tile[spotY + 1][spotX + 2] = 8
                tile[spotY + 2][spotX + 2] = 8
            }
        } else { //tile type 2 (pluses)
            tile = []
            let roww = []
            for (i = 0; i < 20; i++) {
                for (j = 0; j < 5; j++) {
                    roww = []
                    if ((j == 0) || (j == 2)) {
                        for (k = 0; k < 20; k++) {
                            roww.push(0)
                            roww.push(1)
                            roww.push(0)
                            roww.push(0)
                            roww.push(0)
                        }
                    } else if (j == 1) {
                        for (k = 0; k < 20; k++) {
                            roww.push(1)
                            roww.push(1)
                            roww.push(1)
                            roww.push(0)
                            roww.push(0)
                        }
                    } else {
                        for (k = 0; k < 20; k++) {
                            roww.push(0)
                            roww.push(0)
                            roww.push(0)
                            if (rand(0, 2) == 1) {
                                roww.push(3)
                                roww.push(3)
                            } else {
                                roww.push(0)
                                roww.push(0)
                            }
                        }
                    }
                    tile.push(roww)
                }
            }
        }

        if ((mazeX != "no") && (rand(1, 5 - 2 * difficulty) == 1)){ //probability of entity based on preference and difficulty
            let randEnt = rand(0, entityList.length - 1)
            let randPos = rand(0, tileSize - 1)
            let randPos2 = rand(0, tileSize - 1)
            while (wallTiles.includes(tile[randPos2][randPos])) { //making sure it doesnt spawn in wall
                randPos = rand(0, tileSize - 1)
                randPos2 = rand(0, tileSize - 1)
            }
            // if (entities.length < 3) {
            entities.push(new Entity(mazeX, mazeY, randPos + 0.5, randPos2 + 0.5, entityList[randEnt], shadowList[randEnt]))
            // }
        }
    } else if (level == 1) {

        // let numLeft = tileSize * tileSize
        // let randRoom = 0
        // let pos = [1, 0]

        // while (numLeft > 0) {
        //     randRoom = rand(1, 3)
        //     if (randRoom <= 2) {

        //     } else {

        //     }
        // }

        let randPos = 0
        let randPos2 = 0
        for (i = 0; i < tileSize * tileSize * 0.1; i++) {
            randPos = rand(0, tileSize - 1)
            randPos2 = rand(0, tileSize - 1)
            tile[randPos][randPos2] = 1
        }
    }

    return tile //returned tile
}

function initialiseMaze() { //creates initial maze and tiles
    let maze = [] //stores maze
    let row = [] //stores row of maze
    for (let i = 0; i < viewRadius * 2 + 1; i++) { //for each row
        row = [] //reset row
        for (let j = 0; j < viewRadius * 2 + 1; j++) { //for each space in row
            row.push(generateTile("no", "no")) //inserts generated tile in row
        }
        maze.push(row) //adds rows to maze
    }
    maze[mazePosY][mazePosX][Math.floor(tilePosY)][Math.floor(tilePosX)] = 0 //making sure player doesn't spawn in a block
    
    // let randEnte = rand(0, entityList.length - 1)
    // entities.push(new Entity(mazePosX, mazePosY, 5.5, 5.5, entityList[randEnte], shadowList[randEnte]))
    // entities.push(new Entity(mazePosX, mazePosY, rand(0, tileSize - 1) - 0.5, rand(0, tileSize - 1) - 0.5, entityList[randEnte], shadowList[randEnte]))

    // entities.push(new Entity(mazePosX, mazePosY, 10.5, 10.5, angus, angusOver))
    return maze //4d list
}

function createMaze() { //generates new maze to suit tiles
    let currentLength = exploredTiles[0].length
    if (mazePosX - viewRadius < 0) { //if view radius goes outside to the left
        //make sure to increment all maze pos xs by 1
        mazePosX ++
        for (let i = 0; i < entities.length; i++) {
            entities[i].eMazePosX = entities[i].eMazePosX + 1
            if (entities[i].targeting.length != 0) {
                entities[i].targeting[1] = entities[i].targeting[1] + 1
            }
            if (entities[i].seen.length != 0) {
                entities[i].seen[1] = entities[i].seen[1] + 1
            }
        }
        for (let i = 0; i < exploredTiles.length; i++) {
            exploredTiles[i].unshift(generateTile(i, 0)) //now add an extra tile to front of row
        }

    } else if (mazePosX + viewRadius > exploredTiles[0].length - 1) { //view radius goes outside to the right
        for (let i = 0; i < exploredTiles.length; i++) {
            exploredTiles[i].push(generateTile(i, currentLength)) //add an extra tile to front of row
        }
    }

    currentLength = exploredTiles.length

    if (mazePosY - viewRadius < 0) { //if view radius goes outside downward
        //make sure to increment all maze pos ys by 1
        mazePosY ++
        for (let i = 0; i < entities.length; i++) {
            entities[i].eMazePosY = entities[i].eMazePosY + 1
            if (entities[i].targeting.length != 0) {
                entities[i].targeting[0] = entities[i].targeting[0] + 1
            }
            if (entities[i].seen.length != 0) {
                entities[i].seen[0] = entities[i].seen[0] + 1
            }
        }
        let row = []
        for (let i = 0; i < exploredTiles[0].length; i++) {
            row.push(generateTile(0, i))
        }
        exploredTiles.unshift(row) //add empty row to front of list

    } else if (mazePosY + viewRadius > exploredTiles.length - 1) { //if view radius goes oustide upward
        let row = []
        for (let i = 0; i < exploredTiles[0].length; i++) {
            row.push(generateTile(currentLength, i))
        }
        exploredTiles.push(row) //add empty row to front of list
    }
}

//MAIN FUNCTIONS

//game processing
function entitiesGameProcessing() { //moves entities and moderates behaviour from array of classes
    // console.log("ALL ENTITY START \n \n \n \n \n")
    let entityDist = 0
    let entityAngle = 0
    let entTotalX = 0
    let entTotalY = 0
    let plaTotalX = 0
    let plaTotalY = 0
    let targetTotalX = 0
    let targetTotalY = 0
    let xDiff = 0
    let yDiff = 0
    let target = []
    let hit = 0
    let extraAngle = 0
    entityClose = ""

    // console.log("player", mazePosX, mazePosY)

    entitiesHit = [] //entities seen

    for (k = 0; k < entities.length; k++) {
        entityDist = 0
        entityAngle = 0
        entTotalX = 0
        entTotalX = 0
        plaTotalX = 0
        plaTotalY = 0
        targetTotalX = 0
        targetTotalY = 0
        xDiff = 0
        yDiff = 0
        target = []
        hit = 1
        extraAngle = 0

        // if ((entities[k].eMazePosX == mazePosX) && (entities[k].eMazePosY == mazePosY)) {
        //     entityClose = "entitiy on tile"
        // }

        // console.log(entities[k].eMazePosY, entities[k].eMazePosX, mazePosY, mazePosX)

        // console.log("entity start!!!!!!")
        // console.log("I'm at", entities[k].eMazePosY, entities[k].eMazePosX, entities[k].eTilePosY, entities[k].eTilePosX)
        // console.log("for reference, the player is at", mazePosY, mazePosX, tilePosY, tilePosX)
        entTotalX = tileSize * entities[k].eMazePosX + entities[k].eTilePosX
        entTotalY = tileSize * entities[k].eMazePosY + entities[k].eTilePosY
        plaTotalX = tileSize * mazePosX + tilePosX
        plaTotalY = tileSize * mazePosY + tilePosY

        entityDist = Math.pow(Math.pow(entTotalX - plaTotalX, 2) + Math.pow(entTotalY - plaTotalY, 2), 0.5)
        // console.log("i'm ", entityDist, " away from the player")

        if (entityDist < 2) {
            dead = true
            gameScreen = false
            gameTimerCumulative += Date.now() - gameTimer
            entityKilled = entities[k].type
            ambience[level].pause()
            jumpscareSound.currentTime = 3
            jumpscareSound.play()
            document.exitPointerLock()

        }

        // if (entityDist < renderDist / 2) {
        //     entityClose = "be careful..."
        // }
        
        if (entityDist < renderDist) {
            if ((entityClose != "watch out...") && (entityClose != "RUN.") && (entityClose != "IT'S COMING")) {
                entityClose = "be careful..."
            }
            hit = 0
        
            xDiff = plaTotalX - entTotalX
            yDiff = plaTotalY - entTotalY


            for (let l = 1; l < entityDist; l++) {
                // console.log(Math.floor((entTotalY + l * yDiff / entityDist) / tileSize), Math.floor((entTotalX + l * xDiff / entityDist) / tileSize), Math.floor((entTotalY + l * yDiff / entityDist) % tileSize), Math.floor((entTotalX + l * xDiff / entityDist) % tileSize))
                if (opaqueTiles.includes(exploredTiles[Math.floor((entTotalY + l * yDiff / entityDist) / tileSize)][Math.floor((entTotalX + l * xDiff / entityDist) / tileSize)][Math.floor((entTotalY + l * yDiff / entityDist) % tileSize)][Math.floor((entTotalX + l * xDiff / entityDist) % tileSize)])) {
                    hit = 1
                    // console.log("wall in the way")
                    break
                }
            }

            if (hit == 0) {
                entities[k].targeting = [mazePosY, mazePosX, tilePosY, tilePosX]
                // console.log("I CAN SEE YOU")
                // if (entities[k].targeting.length == 0) {
                //     // console.log("hit player")
                //     // console.log("new target @ ",[[mazePosY], [mazePosX], [tilePosY], [tilePosX]])
                //     entities[k].targeting = [mazePosY, mazePosX, tilePosY, tilePosX]
                // } else {
                    // console.log("saving this for later hehe")
                //     entities[k].seen = [mazePosY, mazePosX, tilePosY, tilePosX]
                // }
            }


            if (entTotalX > plaTotalX) {
                if (entTotalY > plaTotalY) {
                    entityAngle = deg(Math.atan((entTotalY - plaTotalY) / (entTotalX - plaTotalX)))
                } else {
                    entityAngle = 360 - deg(Math.atan(-(entTotalY - plaTotalY) / (entTotalX - plaTotalX)))
                }
            } else {
                if (entTotalY < plaTotalY) {
                    entityAngle = 180 + deg(Math.atan((entTotalY - plaTotalY) / (entTotalX - plaTotalX)))
                } else {
                    entityAngle = 180 - deg(Math.atan(-(entTotalY - plaTotalY) / (entTotalX - plaTotalX)))
                }
            }

            if (angleFrom(angle, entityAngle) > 0) {
                extraAngle = - deg(Math.atan(2 / entityDist))
            } else {
                extraAngle = + deg(Math.atan(2 / entityDist))
            }

            if (entities[k].targeting.length != 0) {
                target = entities[k].targeting
                // console.log("there is currently a target:", target)
                targetTotalX = tileSize * target[1] + target[3]
                targetTotalY = tileSize * target[0] + target[2]
    
                if ((Math.abs(targetTotalX - entTotalX) < 1) && (Math.abs(targetTotalY - entTotalY) < 1)) {
                    // console.log("im at the target")
                    entities[k].targeting = []
                } else {
                    entities[k].eTilePosX += Math.abs(Math.cos(Math.atan(Math.abs(targetTotalY - entTotalY) / Math.abs(targetTotalX - entTotalX)))) * Math.sign(targetTotalX - entTotalX) * deltaTime * (7 + 3 * difficulty)
                    entities[k].eTilePosY += Math.abs(Math.sin(Math.atan(Math.abs(targetTotalY - entTotalY) / Math.abs(targetTotalX - entTotalX)))) * Math.sign(targetTotalY - entTotalY) * deltaTime * (7 + 3 * difficulty)
                    if (entities[k].eTilePosX < 0) {
                        entities[k].eMazePosX --
                        entities[k].eTilePosX += tileSize
                    } else if (entities[k].eTilePosX >= tileSize) {
                        entities[k].eMazePosX ++
                        entities[k].eTilePosX -= tileSize
                    }
                    if (entities[k].eTilePosY < 0) {
                        entities[k].eMazePosY --
                        entities[k].eTilePosY += tileSize
                    } else if (entities[k].eTilePosY >= tileSize) {
                        entities[k].eMazePosY++
                        entities[k].eTilePosY -= tileSize
                    }
                    // console.log("end position", entities[k].eMazePosX, entities[k].eMazePosY, entities[k].eTilePosX, entities[k].eTilePosY)
                }
            // } else if (entities[k].seen.length != 0) {
            //     // console.log("i dont have a target, but im assigning one now from 'seen':", entities[k].seen)
            //     entities[k].targeting = entities[k].seen
            //     entities[k].seen = []
            }

            // if (entityDist > viewRadius * tileSize) {
            //     console.log(entities)
            //     entities.splice(k, 1)
            //     console.log("removed")

            if ((-(viewAngle/2) < angleFrom(angle, entityAngle) + extraAngle) && (angleFrom(angle, entityAngle) + extraAngle < viewAngle/2)) {
                // console.log("entity is in view!!", entityDist, -(angleFrom(angle, entityAngle)))
                if ((entityClose != "RUN.") && (entityClose != "IT'S COMING")) {
                    entityClose = "watch out..."
                }
                entitiesHit.push([entityAngle, entities[k], entityDist])
            }
        }
        if (entities[k].targeting.length != 0) {
            if (entityClose != "RUN.") {
                entityClose = "IT'S COMING"
            }
        }

        if (hit == 0) {
            entityClose = "RUN."
        }
    }

    if (chasing) {
        if (entityClose == "be careful...") {
            chase[level].volume = 0.1
        }
        
        if (entityClose == "watch out...") {
            chase[level].volume = 0.2
        }
        
        if (entityClose == "IT'S COMING") {
            chase[level].volume = 0.5
        }
        
        if (entityClose == "RUN.") {
            chase[level].volume = 0
            ambience[level].volume = 0
        } else {
            ambience[level].volume = 1
        }
    }

    if ((entityClose != 0) && (!chasing)) {
        chasing = true
        chase[level].play()
    } else if ((entityClose == "") && (chasing)) {
        chasing = false
        chase[level].pause()
    }

    entitiesHit.sort(sortFunction)
    entitiesHit.reverse()
}

function physicsGameProcessing() { //moderates background things
    if ((sprintTimer < 2) && (sprint < 5) && !(keys["shift"])) {
        sprintTimer += deltaTime
    }

    if ((sprint < 5) && (sprintTimer >= 2)) {
        sprint += deltaTime
    }

    if (jump) {

        jumpP = 1.4 * timeSinceJump - 1.75 * timeSinceJump * timeSinceJump

        if (jumpP < 0) {
            jumpP = 0
            jump = false
            timeSinceJump = 0
        } else {
            timeSinceJump += deltaTime
        }
    }

    if (!(sprinting) && (speed > 1) && (!jump)) {
        speed -= 2 * deltaTime
    } else if (!(sprinting) && (speed > 1) && (jump)) {
        speed -= 0.2 * deltaTime
    }

    if ((angle > 360) || (angle < 0)) {
        angle = getTrueAngle(angle)
    }
}

function keysGameProcessing() { //moderates keys that can be held

    if ((!jump) && (keys["shift"]) && (((sprint > 0) && (sprintTimer <= 0)) || (sprint > 1))) {
        sprinting = true
        sprintTimer = 0
        if (speed < 1.5) {
            speed += 4 * deltaTime
        }
        sprint -= deltaTime
    } else if ((jump) && (keys["shift"]) && (((sprint > 0) && (sprintTimer <= 0)) || (sprint > 1))) {
        sprint -= 3 * deltaTime
    } else {
        sprinting = false
    }

    let moveDir = "no"

    if ((keys["a"]) && !(keys["d"])) {
        if ((keys["s"]) && !(keys["w"])) {
            moveDir = 135
        } else if ((keys["w"]) && !(keys["s"])) {
            moveDir = 45
        } else {
            moveDir = 90
        }
    } else if ((keys["d"]) && !(keys["a"])) {
        if ((keys["s"]) && !(keys["w"])) {
            moveDir = 225
        } else if ((keys["w"]) && !(keys["s"])) {
            moveDir = 315
        } else {
            moveDir = 270
        }
    } else if ((keys["w"]) && !(keys["s"])) {
        moveDir = 0
    } else if ((keys["s"]) && !(keys["w"])) {
        moveDir = 180
    }

    if (((keys["w"]) || (keys["a"]) || (keys["s"]) || (keys["d"])) && (moveDir != "no")) {
        let verts = [[0.4, 0.4], [0.4, -0.4], [-0.4, -0.4], [-0.4, 0.4]]
        let mazeModX = 0
        let mazeModY = 0
        let tempTilePosX = 0
        let tempTilePosY = 0
        let collided = 0

        for (let j = 0; j < 3; j++) {

            if (j != 1) {
                tilePosX += speed * (12 * deltaTime) * Math.cos(rad(getTrueAngle(angle + moveDir)))
            }

            if (j != 2) {
                tilePosY += speed * (12 * deltaTime) * Math.sin(rad(getTrueAngle(angle + moveDir)))
            }

            collided = 0

            for (let i = 0; i < 4; i++) {

                mazeModX = 0
                mazeModY = 0
                tempTilePosX = 0
                tempTilePosY = 0

                tempTilePosX = tilePosX + verts[i][0]
                tempTilePosY = tilePosY + verts[i][1]

                if (tempTilePosX < 0) {
                    mazeModX --
                    tempTilePosX += tileSize
                } else if (tempTilePosX >= tileSize) {
                    mazeModX ++
                    tempTilePosX -= tileSize
                }
                if (tempTilePosY < 0) {
                    mazeModY --
                    tempTilePosY += tileSize
                } else if (tempTilePosY >= tileSize) {
                    mazeModY ++
                    tempTilePosY -= tileSize
                }

                if (wallTiles.includes(exploredTiles[mazePosY + mazeModY][mazePosX + mazeModX][Math.floor(tempTilePosY)][Math.floor(tempTilePosX)]) && !((exploredTiles[mazePosY + mazeModY][mazePosX + mazeModX][Math.floor(tempTilePosY)][Math.floor(tempTilePosX)] == 6) && (elevatorOpened == 1))) {
                    collided = 1
                    break
                }
                
                // if ((exploredTiles[mazePosY + mazeModY][mazePosX + mazeModX][Math.floor(tempTilePosY)][Math.floor(tempTilePosX)] == 7) && !(wallTiles.includes(6))) {
                //     opaqueTiles.push(6)
                //     wallTiles.push(6)
                //     win = true
                //     gameTimerCumulative += Date.now() - gameTimer
                // }
            }

            if (collided == 1) {
                if (j != 1) {
                    tilePosX -= speed * (12 * deltaTime) * Math.cos(rad(getTrueAngle(angle + moveDir)))
                }
    
                if (j != 2) {
                    tilePosY -= speed * (12 * deltaTime) * Math.sin(rad(getTrueAngle(angle + moveDir)))
                }
            } else {
                break
            }
        }
    }

    if (tilePosX < 0) {
        mazePosX --
        tilePosX += tileSize
    } else if (tilePosX >= tileSize) {
        mazePosX ++
        tilePosX -= tileSize
        
    }
    if (tilePosY < 0) {
        mazePosY --
        tilePosY += tileSize
    } else if (tilePosY >= tileSize) {
        mazePosY ++
        tilePosY -= tileSize
    }

    tileOn = exploredTiles[mazePosY][mazePosX][Math.floor(tilePosY)][Math.floor(tilePosX)]
}

function raysGameProcessing() { //raycasts from player and gets wall and ceiling values
    let rays = [] //stores ray info
    let rayAngle = 0 //angle of current ray
    let hit = false //whether or not a ray has hit an opaque wall
    let rendDist = 0 //how many tile edges the ray has hit (limits ray dist)
    let dist = 0 //distance from ray hit to player
    let perpDist = 0 //adjusted perpendicular distance from ray hit to player
    let posX = 0 //ray pos x
    let posY = 0 //ray pos y
    let directionX = 0 //direction of ray x
    let directionY = 0 //direction of ray y
    let modX = 0 //int case modifier x
    let modY = 0 //int case modifier y
    let wallType = 0 //walltype: top/bottom wall, or left/right wall
    let mazeModX = 0 //ray mod for when it goes outside of tile x
    let mazeModY = 0 //ray mod for when it goes outside of tile y
    let currentSquareX = 0 //what square on grid is being checked
    let currentSquareY = 0 //what square on grid is being checked
    let distInWall = 0 //distance in wall (for textures)
    let roofs = [] //list of roofs (3d i think)
    let floorDist = 0 //dist to a certain floor
    elevatorOpenOption = 0 //make sure to reset the win option
    elevatorCloseOption = 0

    for (let i = 0; i < spread; i++) { //for each ray according to spread
        posX = tilePosX //start from tile pos x
        posY = tilePosY //start from tile pos y
        hit = false //it hasnt hit anything yet silly
        mazeModX = 0
        mazeModY = 0
        rendDist = 0
        dist = 0
        perpDist = 0
        rayAngle = getTrueAngle(angle - (viewAngle / 2) + i * viewAngle / (spread - 1)) //ray angle from i and viewAngle
        currentSquareX = 0
        currentSquareY = 0
        wallType = 0
        roofs.push([0])
        floorDist = 0

        if (rayAngle > 180) {
            directionY = -1
        } else {
            directionY = 1
        }

        if ((90 < rayAngle) && (rayAngle < 270)) {
            directionX = -1
        } else {
            directionX = 1
        }
        
        while ((hit == false) && (rendDist < renderDist + 1)) { //while the ray hasnt hit anything or gone too far
            if (Math.abs(next(posX, directionX) / Math.cos(rad(rayAngle))) < Math.abs(next(posY, directionY) / Math.sin(rad(rayAngle)))) {
                //this is for if horizontal diagonally closer
                posY = posY + (next(posX, directionX) * Math.tan(rad(rayAngle)))
                posX = nextInt(posX, directionX)
            } else {
                //this is for if vertical diagonally closer
                posX = posX + next(posY, directionY) / Math.tan(rad(rayAngle))
                posY = nextInt(posY, directionY)
            }

            if (posX == Math.floor(posX)) {
                modX = (directionX - 1) / 2 //shortcut for: if directionX = 1, modX = 0, if directionX = -1, modX = -1
            } else {
                modX = 0
            }

            if (posY == Math.floor(posY)) {
                modY = (directionY - 1) / 2 //shortcut for: if directionY = 1, modX = 0, if directionY = -1, modX = -1
            } else {
                modY = 0
            }
            
            if (posX == tileSize) { //if the ray is outside the tile (right)
                mazeModX++
                posX = 0
                currentSquareX = 0
            } else if (posX + modX < 0) { //if the ray is outside the tile (left)
                mazeModX--
                posX = tileSize + posX
                currentSquareX = tileSize - 1
            } else {
                currentSquareX = Math.floor(posX + modX)
            }

            if (posY == tileSize) { //if the ray is outside the tile (top)
                mazeModY++
                posY = 0
                currentSquareY = 0
            } else if (posY + modY < 0) { //if the ray is outside the tile (bottom)
                mazeModY--
                posY = tileSize + posY
                currentSquareY = tileSize - 1
            } else {
                currentSquareY = Math.floor(posY + modY)
            }

            if (opaqueTiles.includes(exploredTiles[mazePosY + mazeModY][mazePosX + mazeModX][currentSquareY][currentSquareX])) {
                //if the ray hits something opaque
                hit = true
                if ((elevatorOpened) && (exploredTiles[mazePosY + mazeModY][mazePosX + mazeModX][currentSquareY][currentSquareX] == 6)) {
                    hit = false
                }
            }
            
            if ((exploredTiles[mazePosY + mazeModY][mazePosX + mazeModX][currentSquareY][currentSquareX] == 6) && (rendDist < 5)) {
                if (elevatorOpened) {
                    elevatorCloseOption = 1
                } else {
                //if the ray hits the closed elevator doors and you're close
                    elevatorOpenOption = 1
                }
            } else if ((exploredTiles[mazePosY + mazeModY][mazePosX + mazeModX][currentSquareY][currentSquareX] == 6) && (rendDist > 10)) {
                elevatorOpened = false
            }

            floorDist = Math.sqrt(Math.pow(-tilePosY + posY + tileSize * mazeModY, 2) + Math.pow(-tilePosX + posX + tileSize * mazeModX, 2)) / 4 * Math.cos(rad(Math.abs(angle - rayAngle)))

            if (((size - (size / floorDist)) / 2 + (size * jumpP / floorDist) > 0) && (roofs[i].length < ceilRenderDist)) {
                //normal ray hit
                roofs[i].push([floorDist, exploredTiles[mazePosY + mazeModY][mazePosX + mazeModX][currentSquareY][currentSquareX]])
            } else if (((size - (size / floorDist)) / 2 + (size * jumpP / floorDist) < 0) && (roofs[i].length < ceilRenderDist)) {
                //ray hit out of camera
                roofs[i][0] = [1 - 2 * jumpP, exploredTiles[mazePosY + mazeModY][mazePosX + mazeModX][currentSquareY][currentSquareX]]
            // } else if (roofs[i].length == Math.floor(renderDist / 2)) {
            //     roofs[i].push([floorDist, 0])
            }
            rendDist++
        }

        wallType = exploredTiles[mazePosY + mazeModY][mazePosX + mazeModX][currentSquareY][currentSquareX]

        if (rendDist >= renderDist + 1) { //just sets walltype to normal at certain dist
            wallType = 1
        }

        dist = Math.sqrt(Math.pow(- tilePosY + posY + tileSize * mazeModY, 2) + Math.pow( - tilePosX + posX + tileSize * mazeModX, 2)) / 4
        perpDist = dist * Math.cos(rad(Math.abs(angle - rayAngle))) //remove some fisheye!

        wallHeight = size / perpDist //the derivation of height based on distance. assumed viewing angle

        if (posX == Math.floor(posX)) {
            distInWall = posY % 1
        } else {
            distInWall = posX % 1
        }
    
        // wallType = levelTextures[level][opaqueTextures[exploredTiles[mazePosY + mazeModY][mazePosX + mazeModX][currentSquareY][currentSquareX]]]
        
        rays.push([i, wallHeight, perpDist, wallType, dist * 4, distInWall])
    }

    rays.sort(sortFunction) //cheeky shortcut with perdist as index 2 lol
    rays.reverse() //optimise: angle goes right to left but data is taken left to right

    graphicsProcessing(rays, roofs)
}

//graphics processing
function graphicsProcessing(rays, roofs) { //does a lot lmao...

    canvas.beginPath()
    
    canvas.fillStyle = "#000000"
    canvas.fillRect(startX, startY, size, size/2) //black top background

    let gradient = canvas.createLinearGradient(startX + size / 2, startY + size / 2, startX + size / 2, startY + size)

    if (level == 1) {
        gradient.addColorStop(1, floorColours[level])
        gradient.addColorStop(0, "#000000")
        canvas.fillStyle = gradient
        canvas.fillRect(startX, startY, size, size/2)
    } else {
        gradient.addColorStop(0, "#000000")
        gradient.addColorStop(1, floorColours[level])
        canvas.fillStyle = gradient
        canvas.fillRect(startX, startY + size/2, size, size/2)
    }

    canvas.closePath()

    canvas.lineWidth = rayWidth

    for (let m = 0; m < roofs.length; m++) { //for each slice
        for (let n = 0; n < roofs[m].length - 1; n++) { //for each segment
            canvas.fillStyle = "#000000"

            if (!(roofs[m][n][1] == 3)) {
                canvas.fillStyle = hex(roofColours[level][roofs[m][n][1]], (levelLights[level] / 2) / (roofs[m][n][0] + (levelLights[level] / 2)))
            } else {
                canvas.fillStyle = roofColours[level][roofs[m][n][1]]
            }

            canvas.fillRect(startX + (roofs.length - m - 1) * rayWidth, startY + Math.floor(Math.floor((size - (size / roofs[m][n][0])) / 2 + (size * jumpP / roofs[m][n][0]))), rayWidth, Math.ceil(((size - (size / roofs[m][n+1][0])) / 2 + (size * jumpP / roofs[m][n+1][0])) - ((size - (size / roofs[m][n][0])) / 2 + (size * jumpP / roofs[m][n][0]))))
        }
    }

    let l = 0
  
    for (let k = 0; k < entitiesHit.length + 1; k++) { //for each entity that is hit
        while ((l < rays.length) && ((k == entitiesHit.length) || (rays[l][4] > entitiesHit[k][2]))) {
            //draw rays from back until each entity
            // canvas.beginPath()

            if (Math.ceil(rays[l][5] * 125 + rayWidth * 500 / rays[l][1]) <= 125) {
                canvas.drawImage(levelTextures[level][rays[l][3]], rays[l][5] * 125, 0, rayWidth * 500 / rays[l][1], 500, startX + (spread-rays[l][0]-1) * rayWidth, startY + size / 2 - (rays[l][1] / 2) + (size * jumpP / rays[l][2]) + 1, rayWidth, rays[l][1])
            } else {
                canvas.drawImage(levelTextures[level][rays[l][3]], 125 - rayWidth * 500 / rays[l][1], 0, rayWidth * 500 / rays[l][1], 500, startX + (spread-rays[l][0]-1) * rayWidth, startY + size / 2 - (rays[l][1] / 2) + (size * jumpP / rays[l][2]) + 1, rayWidth, rays[l][1])
            }

            canvas.fillStyle = "rgba(0, 0, 0, " + String(1 - levelLights[level] / (rays[l][2] + levelLights[level])) + ")"
            canvas.fillRect(startX + (spread-rays[l][0]-1) * rayWidth, startY + size / 2 - (rays[l][1] / 2) + (size * jumpP / rays[l][2]), rayWidth, rays[l][1] + 2)

            if (level == 1) {
                canvas.fillStyle = "rgba(0, 0, 255, 0.5)"
                canvas.fillRect(startX + (spread-rays[l][0]-1) * rayWidth, startY + size / 2 - (rays[l][1] / 2) + (size * jumpP / rays[l][2]) + 0.9 * (rays[l][1] + 2), rayWidth, size - (size / 2 - (rays[l][1] / 2) + (size * jumpP / rays[l][2]) + 0.9 * (rays[l][1] + 2)))
            }
    
            // canvas.closePath()

            l++
        }

        if (k != entitiesHit.length) { //unless k is last
            canvas.strokeStyle = "#000000"

            canvas.beginPath()

            canvas.drawImage(entitiesHit[k][1].type, startX + size - (angleFrom(angle, entitiesHit[k][0]) + 30) * (size / 60) - size / entitiesHit[k][2] * 2, startY + size / 2 - size / entitiesHit[k][2] * 2 + (size * jumpP * 4 / entitiesHit[k][2]), size / entitiesHit[k][2] * 4, size / entitiesHit[k][2] * 4)
            canvas.globalAlpha = 1 - 3 / (entitiesHit[k][2] + 3)

            canvas.drawImage(entitiesHit[k][1].shadow, startX + size - (angleFrom(angle, entitiesHit[k][0]) + 30) * (size / 60) - size / entitiesHit[k][2] * 2, startY + size / 2 - size / entitiesHit[k][2] * 2 + (size * jumpP * 4 / entitiesHit[k][2]), size / entitiesHit[k][2] * 4, size / entitiesHit[k][2] * 4)
            canvas.globalAlpha = 1
            
            canvas.closePath()
        } 
    }

    canvas.fillStyle = "#000000"
    canvas.fillRect(startX + 0.1 * size, startY + 0.9 * size, 0.2 * size, 0.05 * size)

    canvas.fillStyle = "#FFFFFF"
    canvas.fillRect(startX + 0.11 * size, startY + 0.91 * size, 0.18 * size * (sprint/5), 0.03 * size)

    canvas.font = String(size/15) + "px Arial"
    canvas.textAlign = "center"

    if ((elevatorOpenOption == 1) && (!elevatorOpened)) {
        canvas.fillText("Press 'E' to open door", startX + 0.5 * size, startY + 0.5 * size)
    }
    
    if ((elevatorOpened) && (tileOn == 7) && (elevatorCloseOption == 1)) {
        canvas.fillText("Press 'E' to close door", startX + 0.5 * size, startY + 0.5 * size)
    }

    canvas.fillStyle = "rgba(255, 255, 255, 0.5)"
    if (rand(0, Math.floor(1/(4 * deltaTime))) != 0) {
        canvas.fillText(entityClose, startX + 0.5 * size, startY + 0.4 * size)
    }

    canvas.font = String(size/40) + "px Arial"
    canvas.textAlign = "left"
    canvas.fillStyle = "#000000"
    
    if (!win) {
        canvas.fillText("FPS: " + String(Math.floor(1000 / (deltaTime * 1000))) + " | Difficulty: " + String(difficulties[difficulty]), startX + 0.05 * size, startY + 0.08 * size)
    }

    canvas.fillStyle = "#000000"
    canvas.fillRect(startX + 0.85 * size, startY + 0.05 * size, 0.1 * size, 0.05 * size)
    canvas.fillStyle = "#FFFFFF"
    canvas.fillRect(startX + 0.86 * size, startY + 0.06 * size, 0.0075 * size, 0.03 * size)
    canvas.fillRect(startX + 0.875 * size, startY + 0.06 * size, 0.0075 * size, 0.03 * size)
    canvas.font = String(size/40) + "px Arial"
    if (win != 1) {
        canvas.fillText("esc", startX + 0.89 * size, startY + 0.085 * size)
    }

    canvas.fillStyle = "#FFFFFF"
    canvas.fillRect(0, 0, width, startY)
    canvas.fillRect(0, size + startY, width, height - size - startY)
    canvas.fillRect(0, startY, startX, size)
    canvas.fillRect(startX + size, startY, width - size - startX, size)
}

//other
class Entity { //entity class
    constructor(mazePosX, mazePosY, tilePosX, tilePosY, type, shadow) {
        this.eMazePosX = mazePosX
        this.eMazePosY = mazePosY
        this.eTilePosX = tilePosX
        this.eTilePosY = tilePosY
        this.type = type //main image
        this.shadow = shadow //shadow image
        this.targeting = [] //block targeting
        this.seen = [] //block last seen player
    }
}

function changeWindow() { //changes window size and puts menus? CHANGE
    if ((window.innerHeight != height) || (window.innerWidth != width)) {
        width = window.innerWidth - 20;
        height = window.innerHeight - 20;
        startX = 0
        startY = 0

        canvas.canvas.width = width;
        canvas.canvas.height = height;
        
        if (width > height) {
            startY = 0
            size = height - height % render
            startX = Math.floor((width - (height - height % render)) / 2)
        } else {
            startX = 0
            size = width - width % render
            startY = Math.floor((height - (width - width % render)) / 2)
        }

        spread = size / render
        rayWidth = size / spread
    }

    if (menuScreen) {
        canvas.strokeStyle = "#000000"

        if (((logoFlicker < 1) && (rand(0, 2/deltaTime) != 0))) {
            canvas.font = String(size/10) + "px Arial"
            canvas.textAlign = "center"
            canvas.fillText("ENDROOMS", startX + size * 0.5, startY + size * 0.15)
            canvas.fillText("ONLINE", startX + size * 0.5, startY + size * 0.26)
        } else {
            logoFlicker += rand(0, (1 / deltaTime) / 20)
            if (logoFlicker >= (1 / deltaTime) / 5) {
                logoFlicker = 0
            }
        }
    
        canvas.font = String(size/20) + "px Arial"
        canvas.textAlign = "center"
        canvas.fillText("Enter the Endrooms...", startX + size * 0.5, startY + size * 0.41)
        canvas.strokeRect(startX + size * 0.12, startY + size * 0.34, size * 0.76, size * 0.1)

        canvas.strokeStyle = "#000000"
        canvas.font = String(size/20) + "px Arial"
        canvas.textAlign = "center"
        canvas.fillText("Settings", startX + size * 0.5, startY + size * 0.52)
        canvas.strokeRect(startX + size * 0.12, startY + size * 0.45, size * 0.76, size * 0.1)

        canvas.strokeStyle = "#000000"
        canvas.font = String(size/20) + "px Arial"
        canvas.textAlign = "center"
        canvas.fillText("How to Play", startX + size * 0.5, startY + size * 0.63)
        canvas.strokeRect(startX + size * 0.12, startY + size * 0.56, size * 0.76, size * 0.1)

    } else if (difficultyScreen) {
        canvas.font = String(size/10) + "px Arial"
        canvas.textAlign = "center"
        canvas.fillText("choose difficulty", startX + size * 0.5, startY + size * 0.15)

        canvas.font = String(size/20) + "px Arial"
        canvas.textAlign = "center"
        canvas.fillText("Easy", startX + size * 0.5, startY + size * 0.41)
        canvas.strokeRect(startX + size * 0.12, startY + size * 0.34, size * 0.76, size * 0.1)

        canvas.strokeStyle = "#000000"
        canvas.font = String(size/20) + "px Arial"
        canvas.textAlign = "center"
        canvas.fillText("Medium", startX + size * 0.5, startY + size * 0.52)
        canvas.strokeRect(startX + size * 0.12, startY + size * 0.45, size * 0.76, size * 0.1)

        canvas.strokeStyle = "#000000"
        canvas.font = String(size/20) + "px Arial"
        canvas.textAlign = "center"
        canvas.fillText("Hard", startX + size * 0.5, startY + size * 0.63)
        canvas.strokeRect(startX + size * 0.12, startY + size * 0.56, size * 0.76, size * 0.1)

        canvas.strokeStyle = "#000000"
        canvas.font = String(size/20) + "px Arial"
        canvas.textAlign = "center"
        canvas.fillText("Go Back", startX + size * 0.5, startY + size * 0.74)
        canvas.strokeRect(startX + size * 0.12, startY + size * 0.67, size * 0.76, size * 0.1)

    } else if (startScreen) {
        canvas.font = String(size/10) + "px Arial"
        canvas.textAlign = "center"
        canvas.fillText("click to start", startX + size * 0.5, startY + size * 0.15)
    }

    if ((elevatorOpened == 0) && ((tileOn == 7) || (tileOn == 8)) || (keys["b"])) {
    // if ((elevatorOpened == 0) && ((tileOn == 7) || (tileOn == 8))) {
        ambience[level].pause()
        chase[level].pause()
        level++
        ambience[level].loop = true
        ambience[level].play()
        entities = []
        keys = {}
        tilePosX = 0.5 //position on the tile X
        tilePosY = 0.5 //position on the tile Y
        mazePosX = viewRadius //position of tile on maze X
        mazePosY = viewRadius //position of tile on maze Y
        exploredTiles = initialiseMaze()
    }

    if (dead) {
        if (jumpscare > 1) {
            canvas.font = String(size/12) + "px Arial"
            canvas.textAlign = "left"
            canvas.drawImage(deathImg, startX, startY, size, size)
            // canvas.fillText("you died", startX + size / 2, startY + size * 0.2)
            // canvas.fillText("game made by oscar", startX + size / 2, startY + size * 0.6)
            canvas.fillText(String(gameTimerCumulative / 1000), startX + 0.1 * size, startY + size * 0.55)
            // canvas.fillText("click to restart", startX + size / 2, startY + size * 0.8)
        } else {
            jumpscare += deltaTime
            if (rand(0, Math.ceil(0.1 / deltaTime)) == 0) {
                canvas.fillStyle = "#4d0b0b"
            } else {
                canvas.fillStyle = "#000000"
            }
            canvas.fillRect(startX, startY, size, size)
            canvas.drawImage(entityKilled, startX + rand(0, Math.ceil(tileSize / 100)), startY + rand(0, Math.ceil(tileSize / 100)), 0.9 * size, 0.9 * size)
            if (jumpscare > 1) {
                jumpscareSound.pause()
                deathSound.loop = true
                deathSound.play()
            }
        }
    }

    if ((pauseScreen) || (settingsScreen)) {
        // canvas.drawImage(pauseImg, startX, startY, size, size)

        canvas.fillStyle = "#000000"
        canvas.lineWidth = size / 250

        canvas.font = String(size/5) + "px Arial"
        canvas.textAlign = "left"
        canvas.fillText("Paused.", startX + size * 0.13, startY + size * 0.2)

        canvas.font = String(size/10) + "px Arial"
        if (pauseScreen) {
            canvas.fillText("click to resume", startX + size * 0.13, startY + size * 0.3)
        } else {
            canvas.fillText("click to go back", startX + size * 0.13, startY + size * 0.3)
        }

        canvas.font = String(size/20) + "px Arial"
        canvas.textAlign = "left"
        canvas.fillText("Textures         -                         +", startX + size * 0.13, startY + size * 0.41)
        canvas.textAlign = "center"
        canvas.font = String(size/20) + "px Arial"
        canvas.fillText(String(renderModes[render]), startX + size * 0.65, startY + size * 0.41)
        canvas.font = String(size/15) + "px Arial"
        canvas.strokeStyle = "#000000"
        canvas.strokeRect(startX + size * 0.12, startY + size * 0.34, size * 0.76, size * 0.1)
        canvas.strokeRect(startX + size * 0.41, startY + size * 0.34, size * 0.1, size * 0.1)
        canvas.strokeRect(startX + size * 0.78, startY + size * 0.34, size * 0.1, size * 0.1)

        canvas.font = String(size/20) + "px Arial"
        canvas.textAlign = "left"
        canvas.fillText("Sensitivity       -                         +", startX + size * 0.13, startY + size * 0.52)
        canvas.textAlign = "center"
        canvas.font = String(size/20) + "px Arial"
        canvas.fillText(String(Math.floor(sens * 100) / 100), startX + size * 0.65, startY + size * 0.52)
        canvas.font = String(size/15) + "px Arial"
        canvas.strokeStyle = "#000000"
        canvas.strokeRect(startX + size * 0.12, startY + size * 0.45, size * 0.76, size * 0.1)
        canvas.strokeRect(startX + size * 0.41, startY + size * 0.45, size * 0.1, size * 0.1)
        canvas.strokeRect(startX + size * 0.78, startY + size * 0.45, size * 0.1, size * 0.1)

        canvas.font = String(size/20) + "px Arial"
        canvas.textAlign = "left"
        canvas.fillText("Music               ON            OFF", startX + size * 0.13, startY + size * 0.63)
        canvas.textAlign = "center"
        canvas.font = String(size/15) + "px Arial"
        canvas.strokeStyle = "#000000"
        canvas.strokeRect(startX + size * 0.12, startY + size * 0.56, size * 0.76, size * 0.1)
        canvas.lineWidth = size / 250 * (2-mute)
        canvas.strokeRect(startX + size * 0.41, startY + size * 0.56, size * 0.235, size * 0.1)
        canvas.lineWidth = size / 250 * (1+ mute)
        canvas.strokeRect(startX + size * 0.645, startY + size * 0.56, size * 0.235, size * 0.1)
        canvas.lineWidth = size / 250

        canvas.font = String(size/20) + "px Arial"
        canvas.textAlign = "left"
        canvas.fillText("render dist.     -                         +", startX + size * 0.13, startY + size * 0.74)
        canvas.textAlign = "center"
        canvas.font = String(size/20) + "px Arial"
        canvas.fillText(String(ceilRenderDist), startX + size * 0.65, startY + size * 0.74)
        canvas.font = String(size/15) + "px Arial"
        canvas.strokeStyle = "#000000"
        canvas.strokeRect(startX + size * 0.12, startY + size * 0.67, size * 0.76, size * 0.1)
        canvas.strokeRect(startX + size * 0.41, startY + size * 0.67, size * 0.1, size * 0.1)
        canvas.strokeRect(startX + size * 0.78, startY + size * 0.67, size * 0.1, size * 0.1)
    }

    if (tutorialScreen) {
        canvas.drawImage(startImages[tutorialCount], startX, startY, size, size)
    }

    // canvas.fillStyle = "#FFFFFF"
    // canvas.fillRect(0, 0, canvas.canvas.width, startY)
    // canvas.fillRect(0, size + startY, canvas.canvas.width, canvas.canvas.height - (size + startY))

    // canvas.strokeStyle = "#000000"
    // canvas.lineWidth = Math.ceil(size/100)
    // canvas.strokeRect(startX, startY, size, size)
    // canvas.strokeRect(0, 0, canvas.canvas.width, canvas.canvas.height)
}

function misc() {
    if ((pauseScreen) && (pauseSound.volume + deltaTime < 1))  {
        pauseSound.volume += 0.25 * deltaTime
    }
}

//MAINLOOP
function mainloop() { //controls all function

    if (!(isNaN((Date.now() - deltaTimer) / 1000))) { //this would actually be a win

        deltaTime = (Date.now() - deltaTimer) / 1000 //gets time between frames to make the game frame independent

    }

    deltaTimer = Date.now() //initialise timer for between frames

    changeWindow() //adjusts window size, pause, win, lose, initial screens

    misc()

    if (gameScreen) {

        physicsGameProcessing()

        keysGameProcessing()

        if (!win) {

            entitiesGameProcessing()

        }

        if (level == 1) {
            entityClose = "new level coming soon..."
        }

        raysGameProcessing()

        createMaze()

    }

    canvas.strokeStyle = "#000000"
    canvas.lineWidth = Math.ceil(size/100)
    canvas.strokeRect(0, 0, canvas.canvas.width, canvas.canvas.height)
    canvas.strokeRect(startX, startY, size, size)
    
    
    requestAnimationFrame(mainloop)

}

//CANVAS VARS
var c = document.getElementById("canvas"); //getting the canvas
var canvas = c.getContext("2d"); //getting canvas context

//STORES
const tileSize = 100 //size of each tile
const renderDist = 100 //distance, in blocks, that player can see (technically not straight distance)
const opaqueTiles = [1, 2, 5, 6] //tiles which you can't see through
const wallTiles = [1, 2, 5, 6] //tiles which you can't walk through
const viewRadius = Math.ceil(renderDist/tileSize) + 1 //how many tiles which can be generated away
const renderModes = ["", "super high", "", "high", "", "medium", "", "low", "", "ultra low"] //shortcut list for render modes
const difficulties = ["easy", "medium", "hard"] //list for difficulties

//ENTITIES
var entityList = []
var shadowList = []
for (let i = 0; i < 3; i++) {
    entityList.push(new Image())
    entityList[i].src = "images/entities/entity_" + String(i) + ".png"
    shadowList.push(new Image())
    shadowList[i].src = "images/entities/entity_" + String(i) + "_shadow.png"
}

//WALL TEXTURES
var levelTextures = [{1: false, 2: false, 5: false, 6: false}, {1: false}]
for (let i = 0; i < levelTextures.length; i++) {
    let j = 0
    for (let property in levelTextures[i]) {
        levelTextures[i][property] = new Image()
        levelTextures[i][property].src = "images/walls/level_" + String(i) + "_wall_" + String(j) + ".png"
        j++
    }
}

const roofColours = [{0: "#f2ec90", 3: "#ffffff", 6: "#666459", 7: "#666459", 8: "#666459"}, {0: "#EEEEEE"}]
const floorColours = ["#bec242", "#bfc9c9"]
const levelLights = [2, 10]

//SLIDES
var startImages = []

for (i = 0; i < 7; i++) {
    startImages.push(new Image())
    startImages[i].src = "images/screens/start_" + String(i) + ".png"
}

//OTHER SCREENS
const pauseImg = new Image()
pauseImg.src = "images/screens/paused.png"
const deathImg = new Image()
deathImg.src = "images/screens/deathScreen.png"
const winImg = new Image()
winImg.src = "images/screens/winScreen.png"

//SOUNDS
var ambience = []
var chase = []
for (let i = 0; i < levelTextures.length; i++) {
    ambience.push(new Audio())
    ambience[i].src = "sounds/level_" + String(i) + "_ambience.mp3"
    chase.push(new Audio())
    chase[i].src = "sounds/level_" + String(i) + "_chase.mp3"
}


const deathSound = new Audio()
deathSound.src = "sounds/death.mp3"
const winSound = new Audio()
winSound.src = "sounds/win.mp3"
const pauseSound = new Audio()
pauseSound.src = "sounds/pause.mp3"
pauseSound.loop = true

const jumpscareSound = new Audio()
jumpscareSound.src = "sounds/jumpscare.mp3"

//VARS

//canvas
var width = window.innerWidth - 30; //width of canvas
var height = window.innerHeight - 30; //height of canvas
var startX = 0 //pixel dist between canvas edge and game screen X
var startY = 0 //pixel dist between canvas edge and game screen Y
var size = 0 //size of game screen
var rayWidth = 0 //width in pixels of each ray, should be int
var spread = 250 //number of rays based on pixels per slice

//map
var exploredTiles = [] //maze 4d array
var level = 0 //current level (obsolete for now)

//player
var tilePosX = 0.5 //position on the tile X
var tilePosY = 0.5 //position on the tile Y
var mazePosX = viewRadius //position of tile on maze X
var mazePosY = viewRadius //position of tile on maze Y
var angle = 0 //angle of player from right anticlockwise
var viewAngle = 60 //angle that user can see (60 is good)
var tileOn = 0

//entities
var entities = [] //list of entities as objects
var entityClose = "" //entity text
var entityKilled = 0 //entity which killed player
var entitiesHit = [] //entities which are in view
var chasing = false //is there entity message on screen

//movement
var keys = {} //keys pressed
var mouseX = 0
var mouseY = 0
var sprint = 5 // seconds of sprint
var sprinting = false //is sprinting
var sprintTimer = 0 //timer for sprint to start going back up
var jump = false //is jumping
var jumpP = 0 //jump height
var timeSinceJump = 0 //time since jump using deltatime
var speed = 1 //speed of player modifier

//gameplay
var elevatorOpenOption = 0 //able to open elevator doors
var elevatorCloseOption = 0 //able to close elevator doors
var elevatorOpened = false //elevator doors open?
var win = false //user has won
var dead = false //user dead
var gameTimer = 0 //timer of game
var gameTimerCumulative = 0 //timer of game helper
var difficulty = 1 //difficulty

//mainloop
var deltaTime = 0 //time per frame in seconds
var deltaTimer = 0 //helps with deltatime

//screen vars
var pauseScreen = false //pause screen (from game)
var startFlag = true //can user click to start game
var canClick = false //can user enter pointer lock
var jumpscare = 0 //jumpscare timer
var canStart = false //has tutorial been completed
var tutorialCount = 0 //page of tutorial
var canChooseDifficulty = false //whether user can choose difficulty screen
var settings = false
var tutorialStart = false
var logoFlicker = 0
var howToPlay = false

var menuScreen = true
var settingsScreen = false
var tutorialScreen = false
var difficultyScreen = false
var startScreen = false
var gameScreen = false

//settings
if (localStorage.graphics) {
    var render = Number(localStorage.graphics) //pixels per slice
} else {
    var render = 5
}

if (localStorage.sensitivity) {
    var sens = Number(localStorage.sensitivity) //sens
} else {
    var sens = 1
}

if (localStorage.musicMute) {
    var mute = Number(localStorage.musicMute) //pixels per slice
} else {
    var mute = 0
}

if (localStorage.ceilDist) {
    var ceilRenderDist = Number(localStorage.ceilDist)
} else {
    var ceilRenderDist = 50
}

//EVENT LISTENERS
document.addEventListener("pointerlockchange", lockChangeAlert, false);

c.addEventListener("click", async (e) => {
    mouseX = e.clientX - c.getBoundingClientRect().left
    mouseY = e.clientY - c.getBoundingClientRect().top

    let clickOut = true

    if (gameScreen) {
        if (mouseInBounds(0.85, 0.95, 0.05, 0.1)) {
            gameScreen = false
            pauseScreen = true
            setTimeout(allowResume, 1500)
        }
    }

    if ((pauseScreen) || (settingsScreen)) {
        clickOut = false

            if (mouseInBounds(0.41, 0.51, 0.34, 0.44)) {
                if (render < 9) {
                    render += 2
                    localStorage.graphics = String(render)
                }
            } else if (mouseInBounds(0.78, 0.88, 0.34, 0.44)) {
                if (render > 1) {
                    render -= 2
                    localStorage.graphics = String(render)
                }
            } else if (mouseInBounds(0.41, 0.51, 0.45, 0.55)) {
                if (sens > 0.12) {
                    sens -= 0.1
                    localStorage.sensitivity = String(sens)
                }
            } else if (mouseInBounds(0.78, 0.88, 0.45, 0.55)) {
                if (sens < 1.9) {
                    sens += 0.1
                    localStorage.sensitivity = String(sens)
                }
            } else if (mouseInBounds(0.41, 0.645, 0.56, 0.66)) {
                if (mute == 1) {
                    mute = 0

                    if (pauseScreen) {
                        pauseSound.play()
                    }

                    winSound.volume = 1
                    deathSound.volume = 1
                    localStorage.musicMute = 0
                }
            } else if (mouseInBounds(0.645, 0.88, 0.56, 0.66)) {
                if (mute == 0) {
                    mute = 1

                    if (pauseScreen) {
                        pauseSound.pause()
                    }

                    winSound.volume = 0
                    deathSound.volume = 0
                    localStorage.musicMute = 1
                }
            } else if (mouseInBounds(0.41, 0.51, 0.67, 0.77)) {
                if (ceilRenderDist - 4 > 25) {
                    ceilRenderDist -= 4
                    localStorage.ceilDist = ceilRenderDist
                }
            } else if (mouseInBounds(0.78, 0.88, 0.67, 0.77)) {
                if (ceilRenderDist + 4 < renderDist * 0.75) {
                    ceilRenderDist += 4
                    localStorage.ceilDist = ceilRenderDist
                }

            } else {
                clickOut = true
                if (settingsScreen) {
                    settingsScreen = false
                    menuScreen = true
                }
            }

    }

    if ((startScreen) || ((canClick) && (clickOut))) {
        startScreen = false
        pauseScreen = false
        gameScreen = true
        pauseSound.pause()
        pauseSound.volume = 0
        canClick = false
        keys = {}
        ambience[level].loop = true
        ambience[level].play()
        if (chasing) {
            chase[level].play()
        }
        if (!document.pointerLockElement) {
            await c.requestPointerLock({
                unadjustedMovement: true,
            })
        }
    } else if (jumpscare > 1) {
        window.location.reload()
    } else if (menuScreen) {
        if (mouseInBounds(0.12, 0.76, 0.34, 0.44)) {
            difficultyScreen = true
            menuScreen = false
        } else if (mouseInBounds(0.12, 0.76, 0.45, 0.55)) {
            settingsScreen = true
            menuScreen = false
        } else if (mouseInBounds(0.12, 0.76, 0.56, 0.66)) {
            tutorialScreen = true
            menuScreen = false
        }
    } else if (difficultyScreen) {
        if (mouseInBounds(0.12, 0.88, 0.34, 0.44)) {
            difficulty = 0
            startScreen = true
            difficultyScreen = false
            exploredTiles = initialiseMaze()
        } else if (mouseInBounds(0.12, 0.88, 0.45, 0.55)) {
            difficulty = 1
            startScreen = true
            difficultyScreen = false
            exploredTiles = initialiseMaze()
        } else if (mouseInBounds(0.12, 0.88, 0.56, 0.66)) {
            difficulty = 2
            startScreen = true
            difficultyScreen = false
            exploredTiles = initialiseMaze()
        } else if (mouseInBounds(0.12, 0.88, 0.67, 0.87)) {
            menuScreen = true
            difficultyScreen = false
        }
    } else if (tutorialScreen) {
        tutorialCount++
        if (tutorialCount == 7) {
            tutorialCount = 0
            tutorialScreen = false
            menuScreen = true
        }
    }
})

window.addEventListener('keydown', function (e) { //activates whenever a key is pressed
    if (!(e.repeat)) { //moderates keys that aren't held
        if (String(e.key).toLowerCase() == " ") {
            e.preventDefault()
            if (!jump) {
                jump = true
            }
        }

        if (String(e.key).toLowerCase() == "e") {
            if (elevatorOpenOption == 1) {
                elevatorOpenOption = 0
                elevatorOpened = true
            }
            if (elevatorCloseOption == 1) {
                elevatorCloseOption = 0
                elevatorOpened = false
            }
        }

        if (tutorialCount == 7) {

            if (String(e.key).toLowerCase() == "p") {
                window.open("https://docs.google.com/document/d/1pMc_EMAaEXr7hqRP8DBKRCGqPtd_estMuHSFS0-Qa_k/edit?usp=sharing")
            }
            if (String(e.key).toLowerCase() == "o") {
                window.open("https://docs.google.com/document/d/1Wt2AdKdIfuwpbc7C2yA4vDrZmIs2LJPcsr0EcVpdMzU/edit?usp=sharing")
            }

        }

        keys[String(e.key).toLowerCase()] = true
    }
}, false);

window.addEventListener('keyup', function (e) { //activates whenever a key is released
    keys[String(e.key).toLowerCase()] = false
}, false);

mainloop() //starting the program