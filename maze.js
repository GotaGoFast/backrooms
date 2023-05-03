var c = document.getElementById("canvas"); //getting the canvas
var canvas = c.getContext("2d"); //getting canvas context

class Entity {
    constructor(mazePosX, mazePosY, tilePosX, tilePosY, type) {
        this.eMazePosX = mazePosX
        this.eMazePosY = mazePosY
        this.eTilePosX = tilePosX
        this.eTilePosY = tilePosY
        this.type = type
        this.mood = 0
        this.eAngle = 0
        this.playerDist = 0
    }

    updateEntity() {
        if (self.type == "idle") {
            this.angle++
        }
    }
    
}

function sortFunction(a, b) {
    if (a[2] === b[2]) {
        return 0;
    }
    else {
        return (a[2] < b[2]) ? -1 : 1;
    }
}

function angleFrom(a, b) {
    a = getTrueAngle(a)
    b = getTrueAngle(b)

    if (b > a) {
        if (b - a > 180) {
            return - (360 - (b - a))
        } else {
            return b - a
        }
    } else {
        if (b - a < -180) {
            return 360 + (b - a)
        } else {
            return (b - a)
        }
    }
    // if ((-180 < (b - a)) && ((b - a) < 180)) {
    //     return b - a
    // } else {
    //     if (b > a) {
    //         return 360 - (b - a)
    //     } else {
    //         return 360 + (b - a)
    //     }
    // }
}

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

function degrees(val) {
    return val / (Math.PI / 180)
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
    maze[mazePosY][mazePosX][Math.floor(tilePosY)][Math.floor(tilePosX)] = 0 //making sure player doesn't spawn in a block
    entities.push(new Entity(mazePosX, mazePosY, rand(0, tileSize - 1) - 0.5, rand(0, tileSize - 1) - 0.5, entityList[rand(0, entityList.length - 1)]))
    return maze //4d list
}

function createMaze() { //generates new maze to suit tiles

    if (mazePosX - viewRadius < 0) { //if view radius goes outside to the left
            for (let i = 0; i < exploredTiles.length; i++) {
                exploredTiles[i].unshift(generateTile()) //add an extra tile to front of row
            }
        mazePosX ++
        for (let i = 0; i < entities.length; i++) {
            entities[i].eMazePosX ++
        }
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
        mazePosY ++
        for (let i = 0; i < entities.length; i++) {
            entities[i].eMazePosY ++
        }
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
    let entitiesHit = [] //entities seen
    let distInWall = 0

    if (debug == 1) {
        canvas.beginPath()
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
        for (i = 0; i < entities.length; i++) {
            if ((entities[i].eMazePosX == mazePosX) && (entities[i].eMazePosY == mazePosY)) {
                canvas.strokeRect(startX + entities[i].eTilePosX * size/tileSize - 5, startY + size - (entities[i].eTilePosY) * size/tileSize - 5, 10, 10)
            }
        }

        canvas.arc(startX + tilePosX * size/tileSize, startY + size - (tilePosY) * size/tileSize, size / 10, rad(-angle - 30), rad(-angle + 30))

        canvas.stroke()

        canvas.closePath()
    }

    canvas.beginPath()
    canvas.fillStyle = "#87990f"
    canvas.fillRect(startX, startY, size, size/2)
    canvas.fillStyle = "#99940f"
    canvas.fillRect(startX, startY + size/2, size, size/2)
    canvas.closePath()

    for (let i = 0; i < spread; i++) {
        
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
        wallType = 0

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
        
        while ((hit == false) && (rendDist < renderDist + 1)) {

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
            wallType = 4
        }

        dist = Math.sqrt(Math.pow(- tilePosY + posY + tileSize * mazeModY, 2) + Math.pow( - tilePosX + posX + tileSize * mazeModX, 2)) / 4
        
        perpDist = dist * Math.cos(rad(Math.abs(angle - rayAngle)))

        wallHeight = size / perpDist //the derivation of height based on distance. assumed viewing angle
        if (wallHeight > size) {
            wallHeight = size
        }

        if (posX == Math.floor(posX)) {
            distInWall = posY % 1
        } else {
            distInWall = posX % 1
        }
    
        wallType = levelTextures[level][opaqueTextures[exploredTiles[mazePosY + mazeModY][mazePosX + mazeModX][currentSquareY][currentSquareX]]]
        
        rays.push([i, wallHeight, perpDist, wallType, dist * 4, distInWall])

    }

    rays.sort(sortFunction)

    let entityDist = 0
    let entityAngle = 0
    let entTotalX = 0
    let entTotalY = 0
    let plaTotalX = 0
    let plaTotalY = 0


    for (k = 0; k < entities.length; k++) {
        entTotalX = tileSize * entities[k].eMazePosX + entities[k].eTilePosX
        entTotalY = tileSize * entities[k].eMazePosY + entities[k].eTilePosY
        plaTotalX = tileSize * mazePosX + tilePosX
        plaTotalY = tileSize * mazePosY + tilePosY

        entityDist = Math.pow(Math.pow(entTotalX - plaTotalX, 2) + Math.pow(entTotalY - plaTotalY, 2), 0.5)

        if (entTotalX > plaTotalX) {
            if (entTotalY > plaTotalY) {
                entityAngle = degrees(Math.atan((entTotalY - plaTotalY) / (entTotalX - plaTotalX)))
            } else {
                entityAngle = 360 - degrees(Math.atan(-(entTotalY - plaTotalY) / (entTotalX - plaTotalX)))
            }
        } else {
            if (entTotalY < plaTotalY) {
                entityAngle = 180 + degrees(Math.atan((entTotalY - plaTotalY) / (entTotalX - plaTotalX)))
            } else {
                entityAngle = 180 - degrees(Math.atan(-(entTotalY - plaTotalY) / (entTotalX - plaTotalX)))
            }
        }

        if ((entityDist < renderDist) && (-(viewAngle/2) < angleFrom(angle, entityAngle)) && (angleFrom(angle, entityAngle) < viewAngle/2)) {
            entitiesHit.push([entityAngle, entities[k].type, entityDist])
            console.log(entityAngle)
            console.log(angleFrom(angle, entityAngle))
        }
    }

    entitiesHit.sort(sortFunction)

    rays.reverse()
    entitiesHit.reverse()

    let bruh = []

    for (d = 0; d < rays.length; d++) {
        bruh.push(rays[d][4])
    }
    // console.log(bruh)
    // console.log(entitiesHit)

    // if (threeDee) {
        canvas.fillStyle = "#FFFFFF"
        canvas.lineWidth = rayWidth + 1
        // canvas.lineWidth = 5
        let l = 0

        for (let k = 0; k < entitiesHit.length + 1; k++) {
            while ((l < rays.length) && ((k == entitiesHit.length) || (rays[l][4] > entitiesHit[k][2]))) {

                if (rays[l][3] == 1) {
                    canvas.strokeStyle = "#0a1463"
                } else if (rays[l][3] == 0) {
                    canvas.strokeStyle = "#0a6322"
                } else {
                    canvas.strokeStyle = "#000000"
                }
                
                if (threeDee) {
                canvas.beginPath()

                // canvas.drawImage(wallType, )

                canvas.moveTo(startX + (spread-rays[l][0]-0.5) * rayWidth, startY + size/ 2 - (rays[l][1] / 2));
                canvas.lineTo(startX + (spread-rays[l][0]-0.5) * rayWidth, startY + size/ 2 - (rays[l][1] / 2) + rays[l][1]);

                canvas.stroke()
        
                canvas.closePath()
                }

                l++
            }

            if (k != entitiesHit.length) {
                canvas.strokeStyle = "#000000"

                canvas.beginPath()
                // canvas.arc(startX + size - (angleFrom(angle, entityAngle) + viewAngle/2) * (size / viewAngle), startY + size / 2, size / entitiesHit[k][2] / 4, 0, Math.PI * 2)
                // canvas.stroke()
                canvas.drawImage(entitiesHit[k][1], startX + size - (angleFrom(angle, entitiesHit[k][0]) + 30) * (size / 60) - size / entitiesHit[k][2] * 2, startY + size / 2 - size / entitiesHit[k][2] * 2, size / entitiesHit[k][2] * 4, size / entitiesHit[k][2] * 4)
                canvas.closePath()

            }

            
        }
        canvas.lineWidth = 1
    // }
}

function checkKeys() {
    
    if ((angle > 360) || (angle < 0)) {
        angle = getTrueAngle(angle)
    }

    let moveDir = 0

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

    if ((keys["w"]) || (keys["a"]) || (keys["s"]) || (keys["d"])) {


        let verts = [[0.4, 0.4], [0.4, -0.4], [-0.4, -0.4], [-0.4, 0.4]]
        let mazeModX = 0
        let mazeModY = 0
        let tempTilePosX = 0
        let tempTilePosY = 0
        let collided = 0

        for (let j = 0; j < 3; j++) {

            if (j != 1) {
                tilePosX += 0.4 * Math.cos(rad(getTrueAngle(angle + moveDir)))
            }

            if (j != 2) {
                tilePosY += 0.4 * Math.sin(rad(getTrueAngle(angle + moveDir)))
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
            }

            if (collided == 1) {
                if (j != 1) {
                    tilePosX -= 0.4 * Math.cos(rad(getTrueAngle(angle + moveDir)))
                }
    
                if (j != 2) {
                    tilePosY -= 0.4 * Math.sin(rad(getTrueAngle(angle + moveDir)))
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

    createMaze()
}

function changeWindow() {
    if ((window.innerHeight != height) || (window.innerWidth != width)) {
        width = window.innerWidth - 30;
        height = window.innerHeight - 60;
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
    keys[String(e.key)] = true
}, false);

window.addEventListener('keyup', function (e) {
    keys[String(e.key)] = false
}, false);

function updatePosition(e) {
    angle -= e.movementX * 0.2

    if ((yOffAngle - e.movementY > -45) && (yOffAngle - e.movementY < 45)) {
        yOffAngle -= e.movementY
        yOffTop = Math.tan(rad(45 + yOffAngle))
        yOffBottom = Math.tan(rad(-45 + yOffAngle))
    }
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
//store
const tileSize = 20
const renderDist = 100
const spread = 200
const viewAngle = 60
const opaqueTiles = [1, 2]
const wallTiles = [1, 2]
const opaqueTextures = {1:0, 2:0}
const debug = 0
const threeDee = 1
const viewRadius = Math.ceil(renderDist / tileSize) + 1

const angus = new Image()
angus.src = "angus.png"

const roblox = new Image()
roblox.src = "roblox.png"

const obama = new Image()
obama.src = "obama.png"

const entityList = [angus, roblox, obama]

const L0W1 = new Image()
L0W1.src = "level_0_wall.png"

const levelTextures = [[L0W1]]

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
var angle = 0
var keys = {}
var entities = []
var exploredTiles = initialiseMaze()
var paused = true
var interval = 0
var canClick = true
var yOffAngle = 0
var yOffTop = 0
var yOffBottom = 0
var level = 0

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
