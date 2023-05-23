//FUNCTIONS CALLED FROM EVENT LISTENERS
function updatePosition(e) { //update position based on mouse movement and sens
    angle -= e.movementX * 0.2 * sens
}

function lockChangeAlert() { //when user enters or exists pointer lock
    if (document.pointerLockElement === c) { //going from a pause menu to the game
        document.addEventListener("mousemove", updatePosition, false);
        paused = false
        winTimer = Date.now()
    } else { //going from the game to a pause menu
        document.removeEventListener("mousemove", updatePosition, false);
        if ((!win) && (!dead)) { //only allows pause if gamer hasnt won yet and isnt dead
            ambience[level].pause()
            if (chasing) {
                chase[level].pause()
            }
            winTimerCumulative += Date.now() - winTimer
            paused = true
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

        // console.log(rand(1, 7 - 2 * difficulty) == 1)

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
            winTimerCumulative += Date.now() - winTimer
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


            for (let l = 0; l < entityDist; l++) {
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
        console.log("hi")
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

    if ((keys["t"]) && (sens < 2)) {
        sens += 0.15 * deltaTime
    }
    if ((keys["y"]) && (sens > 0.1)) {
        sens -= 0.15 * deltaTime
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

                if (wallTiles.includes(exploredTiles[mazePosY + mazeModY][mazePosX + mazeModX][Math.floor(tempTilePosY)][Math.floor(tempTilePosX)])) {
                    collided = 1
                    break
                }
                
                if ((exploredTiles[mazePosY + mazeModY][mazePosX + mazeModX][Math.floor(tempTilePosY)][Math.floor(tempTilePosX)] == 7) && !(wallTiles.includes(6))) {
                    opaqueTiles.push(6)
                    wallTiles.push(6)
                    win = true
                    winTimerCumulative += Date.now() - winTimer
                }
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
    winOption = 0 //make sure to reset the win option

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
            }
            if ((exploredTiles[mazePosY + mazeModY][mazePosX + mazeModX][currentSquareY][currentSquareX] == 6) && (rendDist < 5) && (!opened)) {
                //if the ray hits the closed elevator doors and you're close
                winOption = 1
            }

            floorDist = Math.sqrt(Math.pow(-tilePosY + posY + tileSize * mazeModY, 2) + Math.pow(-tilePosX + posX + tileSize * mazeModX, 2)) / 4 * Math.cos(rad(Math.abs(angle - rayAngle)))

            if (((size - (size / floorDist)) / 2 + (size * jumpP / floorDist) > 0) && (roofs[i].length < Math.floor(renderDist / 2))) {
                //normal ray hit
                roofs[i].push([floorDist, exploredTiles[mazePosY + mazeModY][mazePosX + mazeModX][currentSquareY][currentSquareX]])
            } else if (((size - (size / floorDist)) / 2 + (size * jumpP / floorDist) < 0) && (roofs[i].length < Math.floor(renderDist / 2))) {
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
    gradient.addColorStop(0, "#000000")
    gradient.addColorStop(1, "#bec242")
    canvas.fillStyle = gradient
    canvas.fillRect(startX, startY + size/2, size, size/2)

    canvas.closePath()

    canvas.lineWidth = rayWidth

    for (let m = 0; m < roofs.length; m++) { //for each slice
        for (let n = 0; n < roofs[m].length - 1; n++) { //for each segment
            canvas.fillStyle = "#000000"

            if (!(roofs[m][n][1] == 3)) {
                canvas.fillStyle = hex(roofColours[level][roofs[m][n][1]], 1 / (roofs[m][n][0] + 1))
            } else {
                canvas.fillStyle = roofColours[level][roofs[m][n][1]]
            }

            canvas.beginPath()

            if (rayWidth != 1) {

                canvas.fillRect(startX + Math.floor((roofs.length - m - 1) * rayWidth), startY + Math.floor(Math.floor((size - (size / roofs[m][n][0])) / 2 + (size * jumpP / roofs[m][n][0]))), rayWidth + 1, Math.ceil(((size - (size / roofs[m][n+1][0])) / 2 + (size * jumpP / roofs[m][n+1][0])) - ((size - (size / roofs[m][n][0])) / 2 + (size * jumpP / roofs[m][n][0]))))

            } else {

                canvas.fillRect(startX + Math.floor((roofs.length - m - 1) * rayWidth), startY + Math.floor(Math.floor((size - (size / roofs[m][n][0])) / 2 + (size * jumpP / roofs[m][n][0]))), rayWidth, Math.ceil(((size - (size / roofs[m][n+1][0])) / 2 + (size * jumpP / roofs[m][n+1][0])) - ((size - (size / roofs[m][n][0])) / 2 + (size * jumpP / roofs[m][n][0]))))

            }
            
            canvas.closePath()
        }
    }

    let l = 0
  
    for (let k = 0; k < entitiesHit.length + 1; k++) { //for each entity that is hit
        while ((l < rays.length) && ((k == entitiesHit.length) || (rays[l][4] > entitiesHit[k][2]))) {
            //draw rays from back until each entity
            canvas.beginPath()

            if (Math.ceil(rays[l][5] * 125 + rayWidth * 500 / rays[l][1]) <= 125) {
                canvas.drawImage(levelTextures[level][rays[l][3]], Math.floor(rays[l][5] * 125), 0, rayWidth * 500 / rays[l][1], 500, startX + (spread-rays[l][0]-1) * rayWidth, startY + size / 2 - (rays[l][1] / 2) + (size * jumpP / rays[l][2]) + 1, rayWidth, rays[l][1])
            } else {
                canvas.drawImage(levelTextures[level][rays[l][3]], 125 - rayWidth * 500 / rays[l][1], 0, rayWidth * 500 / rays[l][1], 500, startX + (spread-rays[l][0]-1) * rayWidth, startY + size/ 2 - (rays[l][1] / 2) + (size * jumpP / rays[l][2]) + 1, rayWidth, rays[l][1])
            }

            canvas.fillStyle = "rgba(0, 0, 0, " + String(1 - 1 / (rays[l][2] + 1)) + ")"
            canvas.fillRect(Math.floor(startX + (spread-rays[l][0]-1) * rayWidth), startY + size/ 2 - (rays[l][1] / 2) + (size * jumpP / rays[l][2]), rayWidth, Math.ceil(rays[l][1]) + 2)
    
            canvas.closePath()

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
    if ((winOption == 1) && (!opened)) {
        canvas.fillText("Press 'E' to open door", startX + 0.5 * size, startY + 0.5 * size)
    }

    canvas.fillStyle = "rgba(255, 255, 255, 0.5)"
    if (rand(0, Math.floor(1/(4 * deltaTime))) != 0) {
        canvas.fillText(entityClose, startX + 0.5 * size, startY + 0.4 * size)
    }

    if (win) {
        canvas.fillStyle = "rgba(255, 255, 255, " + String(winTrans) + ")"
        canvas.fillRect(startX, startY, size, size)
    }

    canvas.font = String(size/40) + "px Arial"
    canvas.textAlign = "left"
    canvas.fillStyle = "#000000"
    
    if (!win) {
        canvas.fillText("FPS: " + String(Math.floor(1000 / (deltaTime * 1000))) + " | Graphics: " + String(renderModes[render]) + " | Mouse sensitivity: " + String(Math.floor(sens * 100) / 100) + " | Difficulty: " + String(difficulties[difficulty]), startX + 0.05 * size, startY + 0.08 * size)
    }

    canvas.fillStyle = "#000000"
    canvas.fillRect(startX + 0.85 * size, startY + 0.05 * size, 0.1 * size, 0.05 * size)
    canvas.fillStyle = "#FFFFFF"
    canvas.fillRect(startX + 0.86 * size, startY + 0.06 * size, 0.0075 * size, 0.03 * size)
    canvas.fillRect(startX + 0.875 * size, startY + 0.06 * size, 0.0075 * size, 0.03 * size)
    canvas.font = String(size/40) + "px Arial"
    canvas.fillText("esc", startX + 0.89 * size, startY + 0.085 * size)

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
            startX = (width - (height - height % render)) / 2
        } else {
            startX = 0
            size = width - width % render
            startY = Math.floor((height - (width - width % render)) / 2)
        }

        spread = size / render
        rayWidth = size / spread
    }
    
    if (startFlag || paused) {

        if (tutorialCount == 0) {
            canvas.font = String(size/6) + "px Arial"
            canvas.textAlign = "center"
            canvas.fillText("LOADING...", startX + size / 2, startY + size / 2)
        }

        canvas.drawImage(startImages[tutorialCount], startX, startY, size, size)
    }

    if (win) {
        if (winTrans > 1) {
            canvas.font = String(size/12) + "px Arial"
            canvas.textAlign = "left"
            canvas.drawImage(winImg, startX, startY, size, size)
            // canvas.fillText("congrats, you escaped!", startX + size / 2, startY + size * 0.2)
            // canvas.fillText("game made by oscar", startX + size / 2, startY + size * 0.6)
            canvas.fillText(String(winTimerCumulative / 1000), startX + size * 0.1, startY + size * 0.55)
            // canvas.fillText("click to restart", startX + size / 2, startY + size * 0.8)
            document.exitPointerLock()
        } else {
            winTrans += 0.2 * deltaTime
            if (ambience[level].volume > 0.2 * deltaTime) {
                ambience[level].volume -= 0.2 * deltaTime
            }
            if (winTrans > 1) {
                ambience[level].pause()
                winSound.loop = true
                winSound.play()
            }
        }
    }

    if (dead) {
        if (jumpscare > 1) {
            canvas.font = String(size/12) + "px Arial"
            canvas.textAlign = "left"
            canvas.drawImage(deathImg, startX, startY, size, size)
            // canvas.fillText("you died", startX + size / 2, startY + size * 0.2)
            // canvas.fillText("game made by oscar", startX + size / 2, startY + size * 0.6)
            canvas.fillText(String(winTimerCumulative / 1000), startX + 0.1 * size, startY + size * 0.55)
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

    if (paused) {
        canvas.drawImage(pauseImg, startX, startY, size, size)
    }

    // canvas.fillStyle = "#FFFFFF"
    // canvas.fillRect(0, 0, canvas.canvas.width, startY)
    // canvas.fillRect(0, size + startY, canvas.canvas.width, canvas.canvas.height - (size + startY))

    // canvas.strokeStyle = "#000000"
    // canvas.lineWidth = Math.ceil(size/100)
    // canvas.strokeRect(startX, startY, size, size)
    // canvas.strokeRect(0, 0, canvas.canvas.width, canvas.canvas.height)
}

//MAINLOOP
function mainloop() { //controls all function

    if (!(isNaN((Date.now() - deltaTimer) / 1000))) { //this would actually be a win

        deltaTime = (Date.now() - deltaTimer) / 1000 //gets time between frames to make the game frame independent

    }

    deltaTimer = Date.now() //initialise timer for between frames

    changeWindow() //adjusts window size, pause, win, lose, initial screens

    if ((!paused) && (!startFlag) && (!(winTrans > 1)) && (!dead)) {

        physicsGameProcessing()

        keysGameProcessing()

        if (!win) {

            entitiesGameProcessing()

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
var opaqueTiles = [1, 2, 5, 6] //tiles which you can't see through
var wallTiles = [1, 2, 5, 6] //tiles which you can't walk through
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
var levelTextures = [{1: false, 2: false, 5: false, 6: false}]
for (let i = 0; i < levelTextures.length; i++) {
    let j = 0
    for (let property in levelTextures[i]) {
        levelTextures[i][property] = new Image()
        levelTextures[i][property].src = "images/walls/level_" + String(i) + "_wall_" + String(j) + ".png"
        j++
    }
}

const roofColours = [{0: "#f2ec90", 3: "#ffffff", 6: "#666459", 7: "#666459", 8: "#666459"}]

//SLIDES
var startImages = []

for (i = 0; i < 10; i++) {
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

const jumpscareSound = new Audio()
jumpscareSound.src = "sounds/jumpscare.mp3"

//VARS
var width = window.innerWidth - 30; //width of canvas
var height = window.innerHeight - 30; //height of canvas
var rayWidth = 0 //width in pixels of each ray, should be int
var size = 0 //size of game screen
var startX = 0 //pixel dist between canvas edge and game screen X
var startY = 0 //pixel dist between canvas edge and game screen Y
var tilePosX = 0.5 //position on the tile X
var tilePosY = 0.5 //position on the tile Y
var mazePosX = viewRadius //position of tile on maze X
var mazePosY = viewRadius //position of tile on maze Y
var angle = 0 //angle of player from right anticlockwise
var keys = {} //keys pressed
var entities = [] //list of entities as objects
var level = 0 //current level (obsolete for now)
var exploredTiles = [] //maze 4d array
var paused = false //paused
var canClick = true //can user enter pointer lock
var sprint = 5 // seconds of sprint
var sprinting = false //is sprinting
var sprintTimer = 0 //timer for sprint to start going back up
var startFlag = true //can user click to start game
var deltaTime = 0 //time per frame in seconds
var viewAngle = 60 //angle that user can see (60 is good)
var jump = false //is jumping
var jumpP = 0 //jump height
var timeSinceJump = 0 //time since jump using deltatime
var speed = 1 //speed of player modifier
var deltaTimer = 0 //helps with deltatime
var render = 5 //pixels per slice
var spread = 250 //number of rays based on pixels per slice
var winOption = 0 //able to open elevator doors
var opened = false //elevator doors open?
var win = false //user has won
var winTrans = 0 //transparency of win fade
var winTimer = 0 //timer of game
var winTimerCumulative = 0 //timer of game helper
var dead = false //us dead
var jumpscare = 0 //jumpscare timer
var entityKilled = 0 //entity which killed player
var entitiesHit = [] //entities which are in view
var difficulty = 1 //difficulty
var sens = 1 //sentitivity multiplier
var entityClose = "" //entity text
var tutorial = false //has tutorial been completed
var tutorialCount = 0 //page of tutorial
var canChooseDifficulty = false //whether user can choose difficulty screen
var chasing = false

//EVENT LISTENERS
document.addEventListener("pointerlockchange", lockChangeAlert, false);

c.addEventListener("click", async () => {
    if (tutorial) {
        if (startFlag) {
            startFlag = false
            winTimer = Date.now()
        }
        if ((canClick) && (!win)) { //only will go from paused to unpaused if gamer hasnt won yet and isnt already in game
            canClick = false
            paused = false
            keys = {}
            ambience[level].loop = true
            ambience[level].play()
            if (chasing) {
                chase[level].play()
            }
            if(!document.pointerLockElement) {
            await c.requestPointerLock({
                unadjustedMovement: true,
            })
            }
        } else if ((winTrans > 1) || (jumpscare > 1)) {
            window.location.reload()
        }
    } else {
        if ((tutorialCount != 8) && (tutorialCount != 9)) {
            tutorialCount ++
        }
        if (tutorialCount == 8) {
            canChooseDifficulty = true
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
        
        if (String(e.key).toLowerCase() == "r") {
            if (render < 8) {
                render+= 2
            } else {
                render = 1
            }
        }

        if ((String(e.key).toLowerCase() == "e") && (winOption == 1)) {
            winOption = 0
            opaqueTiles.splice(opaqueTiles.indexOf(6), 1)
            wallTiles.splice(wallTiles.indexOf(6), 1)
            opened = true
        }

        if (canChooseDifficulty) {
            if ((String(e.key).toLowerCase() == "x")) {
                difficulty = 0
                tutorial = true
                canChooseDifficulty = false
                console.log(tutorialCount, "huh")
                tutorialCount++
                exploredTiles = initialiseMaze()
            } else if ((String(e.key).toLowerCase() == "c")) {
                difficulty = 1
                tutorial = true
                canChooseDifficulty = false
                tutorialCount++
                exploredTiles = initialiseMaze()
            } else if ((String(e.key).toLowerCase() == "v")) {
                difficulty = 2
                tutorial = true
                canChooseDifficulty = false
                tutorialCount++
                exploredTiles = initialiseMaze()
            }
        }

        if (!startFlag) {

            if ((String(e.key).toLowerCase() == "p") && (tutorialCount == 9)) {
                window.open("https://docs.google.com/document/d/1pMc_EMAaEXr7hqRP8DBKRCGqPtd_estMuHSFS0-Qa_k/edit?usp=sharing")
            }
            if ((String(e.key).toLowerCase() == "o") && (tutorialCount == 9)) {
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
