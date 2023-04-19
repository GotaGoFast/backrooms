var c = document.getElementById("canvas"); //getting the canvas
var canvas = c.getContext("2d"); //getting canvas context

function rand(min, max) { //generates a random number between min and max (inclusive?)
    return Math.floor(Math.random() * (max - min + 1)) + min; //configuring the random func to be between params
}

function allowResume() {
    canClick = true
}

function menu() {
    if (paused) {
        canvas.beginPath()
        canvas.font = "60px Arial"
        canvas.strokeStyle = "#000000"
        canvas.textAlign = "center"
        canvas.fillText("Click here to resume", width / 2, height / 2)
        canvas.strokeText("Click here to resume", width / 2, height / 2)
        canvas.textAlign = "start"
        canvas.closePath()
    }
}


function rad(val) {
    return val * (Math.PI / 180)
}

function getTrueAngle(angle) {
        if (angle > 0) {
            return angle % 360
        } else {
            return 360 - (Math.abs(angle) % 360)
        }
}

function next(value, direction) { //returns the distance to the next whole number
    if (Number.isInteger(value)) { //if whole number
        return direction //returns next whole number if upward, itself if downward
    } else {
        if (direction == 1) {
            return Math.ceil(value) - value //distance upward
        } else {
            return Math.floor(value) - value //distance downward
        }
    }
}

function nextInt(value, direction) { //returns what the next int is
    if (Number.isInteger(value)) { //if already whole number
        return value + direction //returns next whole number if upward, previous whole number if downward
    } else {
        if (direction == 1) {
            return Math.ceil(value)
        } else {
            return Math.floor(value)
        }
    }
}

function generateTile() { //generates a tile of size [tileSize]

    let tile = []

    for (let i = 0; i < tileSize; i++) {
        let row = []
        for (let j = 0; j < tileSize; j++) {
            row.push(0)
        }
        tile.push(row)
    }

    let density = tileSize / 5
    for (let i = 0; i < density; i++) {
        let length = rand(Math.floor(tileSize / 10), Math.floor(tileSize / 2))
        let wallX = rand(0, tileSize - 1)
        let wallY = rand(0, tileSize - length)
        for (let j = 0; j < length; j++) {
            tile[wallX][wallY + j] = 1
        }
        length = rand(Math.floor(tileSize / 10), Math.floor(tileSize / 2))
        wallX = rand(0, tileSize - 1)
        wallY = rand(0, tileSize - length)
        for (let j = 0; j < length; j++) {
            tile[wallY + j][wallX] = 1
        }
    }

    let columns = rand(0, Math.ceil(tileSize / 10))
    for (let i = 0; i < columns; i++) {
        wallX = rand(0, tileSize - 2)
        wallY = rand(0, tileSize - 2)
        while ((tile[wallX][wallY] == 1) && (tile[wallX][wallY+1] == 1) && (tile[wallX][wallY-1] == 1) && (tile[wallX+1][wallY] == 1) && (tile[wallX+1][wallY+1] == 1) && (tile[wallX+1][wallY-1] == 1) && (tile[wallX-1][wallY] == 1) && (tile[wallX-1][wallY+1] == 1) && (tile[wallX-1][wallY-1] == 1)) {
            wallX = rand(0, tileSize - 2)
            wallY = rand(0, tileSize - 2)
        }
        tile[wallX][wallY] = 2
    }


    // let tile = [] //2d list columns (down to up) -> rows (left to right)
    // let row = []

    // for (let j = 0; j < tileSize; j++) {
    //     row = []
    //     for (let i = 0; i < tileSize; i++) {
    //         row.push(Math.round((rand(0, 51)/100)))
    //     }
    //     tile.push(row)
    // }

    return tile //as per [tileSize]
}

function initialiseMaze() { //creates initial maze and tiles
    let maze = [] //stores maze
    let row = [] //stores row of maze
    for (let i = 0; i < viewRadius * 2 + 1; i++) { //for each row
        row = [] //reset row
        for (let j = 0; j < viewRadius * 2 + 1; j++) { //for each space in row
            row.push(generateTile()) //inserts generated tile in row
        }
        maze.push(row) //adds rows to maze
    }
    return maze //4d list
}

function createMaze() { //generates new maze to suit tiles

    if (mazePosX - viewRadius < 0) { //if view radius goes outside to the left
            for (let i = 0; i < exploredTiles.length; i++) {
                exploredTiles[i].unshift(generateTile()) //add an extra tile to front of row
            }
        mazePosX += 1
    } else if (mazePosX + viewRadius > exploredTiles[0].length - 1) { //view radius goes outside to the right
        for (let i = 0; i < exploredTiles.length; i++) {
            exploredTiles[i].push(generateTile()) //add an extra tile to front of row
        }
    }

    if (mazePosY - viewRadius < 0) { //if view radius goes outside downward
        let row = []
        for (let i = 0; i < exploredTiles[0].length; i++) {
            row.push(generateTile())
        }
        exploredTiles.unshift(row) //add empty row to front of list
        mazePosY += 1
    } else if (mazePosY + viewRadius > exploredTiles.length - 1) { //if view radius goes oustide upward
        let row = []
        for (let i = 0; i < exploredTiles[0].length; i++) {
            row.push(generateTile())
        }
        exploredTiles.push(row) //add empty row to front of list
    }
}

function rayCast() {

    canvas.strokeStyle = "#000000"
    // canvas.font = "30px Arial"
    // canvas.strokeText("angle: " + angle, 20, 50)
    // canvas.strokeText("pos: " + tilePosX.toFixed(2) + ", "+ tilePosY.toFixed(2), 20, 90)
    // canvas.strokeText("mazePos: " + mazePosX + " " + mazePosY + " of " + exploredTiles[0].length + " " + exploredTiles.length, 20, 130)

    rays = [] //stores ray info

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

    if (debug == 1) {
        for (let y = 0; y < tileSize; y++) {
            for (let x = 0; x < tileSize; x++) {
                if (opaqueTiles.includes(exploredTiles[mazePosY][mazePosX][y][x])) {
                    canvas.fillStyle = "#FF0000";
                } else {
                    canvas.fillStyle = "#00FF00";
                }
                canvas.fillRect(startX + x * size/tileSize, startY + size - (y+1) * size/tileSize, size/tileSize, size/tileSize)
                canvas.strokeRect(startX + x * size/tileSize, startY + size - (y+1) * size/tileSize, size/tileSize, size/tileSize)
            }
        }
        canvas.fillStyle = "#234742";

        canvas.fillRect(startX + tilePosX * size/tileSize - 5, startY + size - (tilePosY) * size/tileSize - 5, 10, 10)
    }

    for (let i = 0; i < spread; i++) {
        canvas.beginPath()

        if (debug == 1) {
            canvas.strokeStyle = "#FFFFFF"
            canvas.moveTo(startX + tilePosX * size/tileSize, startY + size - (tilePosY) * size/tileSize) //coords of player
        }
        
        posX = tilePosX
        posY = tilePosY
        hit = false
        mazeModX = 0
        mazeModY = 0
        rendDist = 0
        dist = 0
        perpDist = 0
        rayAngle = getTrueAngle(angle - (viewAngle / 2) + i * viewAngle / (spread - 1))
        currentSquareX = 0
        currentSquareY = 0
        wallType = 2

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

        // if (i == 1) {
        //     console.log("angle: ", angle, "pos: ", posX, " ", posY)
        // }
        
        while ((hit == false) && (rendDist < renderDist + 1)) {

            if (Math.abs(next(posX, directionX) / Math.cos(rad(rayAngle))) < Math.abs(next(posY, directionY) / Math.sin(rad(rayAngle)))) {
                //this is for if horizontal diagonally closer
                wallType = 0
                posY = posY + (next(posX, directionX) * Math.tan(rad(rayAngle)))
                posX = nextInt(posX, directionX)
            } else {
                //this is for if vertical diagonally closer
                wallType = 1
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
            
            if (posX == tileSize) {
                mazeModX++
                posX = 0
                currentSquareX = 0
            } else if (posX + modX < 0) {
                mazeModX--
                posX = tileSize + posX
                currentSquareX = tileSize - 1
            } else {
                currentSquareX = Math.floor(posX + modX)
            }

            if (posY == tileSize) {
                mazeModY++
                posY = 0
                currentSquareY = 0
            } else if (posY + modY < 0) {
                mazeModY--
                posY = tileSize + posY
                currentSquareY = tileSize - 1
            } else {
                currentSquareY = Math.floor(posY + modY)
            }

            // if (posY + modY < 0) {
            //     currentSquareY = Math.floor(tileSize - 1)
            // } else {
            //     currentSquareY = Math.floor(posY + modY)
            // }

            // if (posX + modX < 0) {
            //     currentSquareX = Math.floor(tileSize - 1)
            // } else {
            //     currentSquareX = Math.floor(posX + modX)
            // }

            // if (debug == 1) {
            //     if ((mazeModX == 0) && (mazeModY == 0)) {
            //         canvas.lineTo(startX + posX * size/tileSize, startY + size - posY * size/tileSize)
            //         canvas.stroke()
            //     }
            // }

            // if (i == 1) {
            //     console.log("newpos: ", posX, " ", posY, "mazemod: ", mazeModX, " ", mazeModY)
            //     console.log(exploredTiles[mazePosY + mazeModY][mazePosX + mazeModX][currentSquareY][currentSquareX])
            // }

            if (hit == false) {
                try {
                    if (opaqueTiles.includes(exploredTiles[mazePosY + mazeModY][mazePosX + mazeModX][currentSquareY][currentSquareX])) {
                        hit = true
                    }
                } catch {
                    hit = true
                }
            }
            rendDist++
        }

        if (rendDist >= renderDist + 1) {
            wallType = 2
        }

        dist = Math.sqrt(Math.pow(- tilePosY + posY + tileSize * mazeModY, 2) + Math.pow( - tilePosX + posX + tileSize * mazeModX, 2)) / 4

        // if (i == 1) {
        //     console.log()
        //     console.log("x dist: ", tileSize * mazeModX - tilePosX + posX, "y dist: ", tileSize * mazeModY - tilePosY + posY, "total: ", Math.sqrt(Math.pow(tilePosY - posY + tileSize * mazeModY, 2) + Math.pow(tilePosX - posX  + tileSize * mazeModX, 2)))}
        
        perpDist = dist * Math.cos(rad(Math.abs(angle - rayAngle)))

        wallHeight = size / perpDist //the derivation of height based on distance. assumed viewing angle
        // if (wallHeight > size) {
        //     wallHeight = size
        // }

        canvas.fillStyle = "#FFFFFF"
        if (wallType == 1) {
            canvas.strokeStyle = "#FFFF00"
        } else if (wallType == 0) {
            canvas.strokeStyle = "#FF00FF"
        } else {
            canvas.strokeStyle = "#000000"
        }
        
        canvas.lineWidth = rayWidth
        canvas.moveTo(startX + (spread-i-0.5) * rayWidth, startY + size/ 2 - (wallHeight / 2));
        canvas.lineTo(startX + (spread-i-0.5) * rayWidth, startY + size/ 2 - (wallHeight / 2) + wallHeight);
        canvas.stroke()
        canvas.lineWidth = 1
        
        //rays.push([i*rayWidth, wallHeight, perpDist, wallType])

        canvas.closePath()



    }
}

function updateGraphics() {
    canvas.fillStyle = "#FFFFFF"
    for (let i = 0; i < spread; i++) {
        canvas.beginPath()
        if (rays[i][3] == 1) {
            canvas.strokeStyle = "#FFFF00"
        } else {
            canvas.strokeStyle = "#FF00FF"
        }
        canvas.rect(start[0] + rays[i][0], start[1] + height / 2 - (rays[i][1] / 2), rayWidth, rays[i][1])
        canvas.fillStyle = "#FFFFFF"
        canvas.stroke()
        canvas.closePath()
    }
}

function checkKeys() {
    
    if ((angle > 360) || (angle < 0)) {
        angle = getTrueAngle(angle)
    }

    if ((keysPressed["w"] == true) && (keysPressed["s"] == false)) {
        if ((keysPressed["a"] == true) && (keysPressed["d"] == false)) {
            tilePosX += 0.4 * Math.cos(rad(getTrueAngle(angle - 45)))
            tilePosY += 0.4 * Math.sin(rad(getTrueAngle(angle - 45)))
        } else if ((keysPressed["d"] == true) && (keysPressed["a"] == false)) {
            tilePosX += 0.4 * Math.cos(rad(getTrueAngle(angle + 45)))
            tilePosY += 0.4 * Math.sin(rad(getTrueAngle(angle + 45)))
        } else {
            tilePosX += 0.4 * Math.cos(rad(angle))
            tilePosY += 0.4 * Math.sin(rad(angle))
        }
    } else if ((keysPressed["s"] == true) && (keysPressed["w"] == false)) {
        if ((keysPressed["a"] == true) && (keysPressed["d"] == false)) {
            tilePosX -= 0.4 * Math.cos(rad(getTrueAngle(angle + 45)))
            tilePosY -= 0.4 * Math.sin(rad(getTrueAngle(angle + 45)))
        } else if ((keysPressed["d"] == true) && (keysPressed["a"] == false)) {
            tilePosX -= 0.4 * Math.cos(rad(getTrueAngle(angle - 45)))
            tilePosY -= 0.4 * Math.sin(rad(getTrueAngle(angle - 45)))
        } else {
            tilePosX -= 0.4 * Math.cos(rad(angle))
            tilePosY -= 0.4 * Math.sin(rad(angle))
        }
    }

    if (tilePosX < 0) {
        mazePosX --
        tilePosX = tileSize + tilePosX
    } else if (tilePosX >= tileSize) {
        mazePosX ++
        tilePosX = tilePosX - tileSize
    }
    if (tilePosY < 0) {
        mazePosY --
        tilePosY = tileSize + tilePosY
    } else if (tilePosY >= tileSize) {
        mazePosY ++
        tilePosY = tilePosY - tileSize
    }

    createMaze()
}

function changeWindow() {
    if ((window.innerHeight != height) || (window.innerWidth != width)) {
        width = window.innerWidth - 30;
        height = window.innerHeight - 30;
        startX = 0
        startY = 0

        canvas.canvas.width = width;
        canvas.canvas.height = height;

        if (width > height) {
            startX = (width - height) / 2
            startY = 0
            size = height
        } else {
            startX = 0
            startY = (height - width) / 2
            size = width
        }


        rayWidth = size / spread
    }
}

function mainloop() {

    changeWindow()

    canvas.stroke()

    if (!paused) {

    checkKeys()

    rayCast()

    }

    menu()

    //updateGraphics()
}

window.addEventListener('keydown', function (e) {
    keysPressed[String(e.key)] = true
}, false);

window.addEventListener('keyup', function (e) {
    keysPressed[String(e.key)] = false
}, false);

function updatePosition(e) {
    angle -= e.movementX * 0.2
}

function lockChangeAlert() {
    if (document.pointerLockElement === c) {
        document.addEventListener("mousemove", updatePosition, false);
        paused = false
    } else {
        document.removeEventListener("mousemove", updatePosition, false);
        paused = true
        setTimeout(allowResume, 1500)
    }
}

c.addEventListener("click", async () => {
    if (canClick) {
        clearInterval(interval)
        canClick = false
        interval = setInterval(mainloop, 1000/30)
        paused = false
        if(!document.pointerLockElement) {
        await c.requestPointerLock({
            unadjustedMovement: true,
        })
        }
    }
})

document.addEventListener("pointerlockchange", lockChangeAlert, false);

//store
const tileSize = 100
const renderDist = 200
const spread = 500
const viewAngle = 60
const opaqueTiles = [1, 2]
const debug = 0
const viewRadius = Math.ceil(renderDist / tileSize)

var width = window.innerWidth - 30;
var height = window.innerHeight - 30;
var rayWidth = 0
var size = 0
var startX = 0
var startY = 0
var tilePosX = tileSize/2 + 0.5
var tilePosY = tileSize/2 + 0.5
var mazePosX = viewRadius
var mazePosY = viewRadius
var rays = []
var angle = 0
var keysPressed = {}
var exploredTiles = initialiseMaze()
var paused = true
var interval = 0
var canClick = true

canvas.canvas.width = width;
canvas.canvas.height = height;

canvas.beginPath()
canvas.font = "60px Arial"
canvas.strokeStyle = "#000000"
canvas.textAlign = "center"
canvas.fillText("Click here to start", width / 2, height / 2)
canvas.strokeText("Click here to start", width / 2, height / 2)
canvas.textAlign = "start"
canvas.closePath()