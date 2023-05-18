var c = document.getElementById("canvas"); //getting the canvas
var canvas = c.getContext("2d"); //getting canvas context

class Entity {
    constructor(mazePosX, mazePosY, tilePosX, tilePosY, type, shadow) {
        this.eMazePosX = mazePosX
        this.eMazePosY = mazePosY
        this.eTilePosX = tilePosX
        this.eTilePosY = tilePosY
        this.type = type //main image
        this.shadow = shadow //shadow image
        this.targeting = []
        this.seen = []
    }
}

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
    return "#" + result1 + result2 + result3 //modified rgb
}

function cropImageData(array, width, sx, sy, swidth, sheight) { //OBSOLETE TEST FUNCTION
    let result = []
    for (let y = sy; y < sy + sheight; y++) {
        for (let x = sx * 4; x < (sx + swidth) * 4; x++) {
            result.push(array[4 * y * width + x])
        }
    }
    // console.log(result)
    result = new ImageData(new Uint8ClampedArray(result), swidth, sheight)
    // console.log(result.data)
    return result
}

function convertArr(arr, x, y) { // OBSOLETE TEST FUNCTION
    let result = []

    for (let i = 0; i < arr.length / 4; i+=4) {
        result.push(arr.slice(i, i+4))
    }

    return result
}

function sortFunction(a, b) { //sort function (only works with index 2 (shortcut lol))
    if (a[2] === b[2]) {
        return 0;
    } else {
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
    } else if (b - a < -180) {
        return 360 + (b - a)
    } else {
        return (b - a)
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

function rad(val) {
    return val * (Math.PI / 180)
}

function deg(val) {
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
    } else if (direction == 1) {
        return Math.ceil(value) - value //distance upward
    } else {
        return Math.floor(value) - value //distance downward
    }
}

function nextInt(value, direction) { //returns what the next int is
    if (Number.isInteger(value)) { //if already whole number
        return value + direction //returns next whole number if upward, previous whole number if downward
    } else if (direction == 1) {
        return Math.ceil(value)
    } else {
        return Math.floor(value)
    }
}

function generateTile(mazeY, mazeX) { //generates a tile of size [tileSize]

    let tile = []

    for (let i = 0; i < tileSize; i++) {
        let row = []
        for (let j = 0; j < tileSize; j++) {
            row.push(0)
        }
        tile.push(row)
    }


    let picker = rand(0, 100)

    if (level == 0) {
        if (picker < 80) {

            let density = tileSize * tileSize * 0.002
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

            let columns = rand(0, Math.ceil(tileSize * tileSize * 0.005))
            for (let i = 0; i < columns; i++) {
                wallX = rand(1, tileSize - 2)
                wallY = rand(1, tileSize - 2)
                while ((tile[wallX][wallY] == 1) && (tile[wallX][wallY+1] == 1) && (tile[wallX][wallY-1] == 1) && (tile[wallX+1][wallY] == 1) && (tile[wallX+1][wallY+1] == 1) && (tile[wallX+1][wallY-1] == 1) && (tile[wallX-1][wallY] == 1) && (tile[wallX-1][wallY+1] == 1) && (tile[wallX-1][wallY-1] == 1)) {
                    wallX = rand(1, tileSize - 2)
                    wallY = rand(1, tileSize - 2)
                }
                tile[wallX][wallY] = 2
            }

            let lights = rand(1, Math.floor(tileSize * tileSize * 0.01))
            for (let i = 0; i < lights; i++) {
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
            if (picker < 25) {
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
        } else {
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

        // if ((mazeX != "no") && (rand(0, 3 - difficulty) == 0)){
        if (mazeX != "no") {
            let randEnt = rand(0, entityList.length - 1)
            let randPos = rand(0, tileSize - 1)
            let randPos2 = rand(0, tileSize - 1)
            while (!wallTiles.includes(tile[randPos][randPos2])) {
                randPos = rand(0, tileSize - 1)
                randPos2 = rand(0, tileSize - 1)
            }
            // console.log("yes")
            if (entities.length < 3) {
                entities.push(new Entity(mazeY, mazeX, randPos + 0.5, randPos2 + 0.5, entityList[randEnt], shadowList[randEnt]))
            }
        }
    }

    return tile

    // let tile = []

    // for (let i = 0; i < tileSize; i++) {
    //     let row = []
    //     for (let j = 0; j < tileSize; j++) {
    //         row.push(0)
    //     }
    //     tile.push(row)
    // }

    // let density = tileSize * tileSize * 0.002
    // for (let i = 0; i < density; i++) {
    //     let length = rand(Math.floor(tileSize / 10), Math.floor(tileSize / 2))
    //     let wallX = rand(0, tileSize - 1)
    //     let wallY = rand(0, tileSize - length)
    //     for (let j = 0; j < length; j++) {
    //         tile[wallX][wallY + j] = 1
    //     }
    //     length = rand(Math.floor(tileSize / 10), Math.floor(tileSize / 2))
    //     wallX = rand(0, tileSize - 1)
    //     wallY = rand(0, tileSize - length)
    //     for (let j = 0; j < length; j++) {
    //         tile[wallY + j][wallX] = 1
    //     }
    // }

    // let columns = rand(0, Math.ceil(tileSize * tileSize * 0.005))
    // for (let i = 0; i < columns; i++) {
    //     wallX = rand(1, tileSize - 2)
    //     wallY = rand(1, tileSize - 2)
    //     while ((tile[wallX][wallY] == 1) && (tile[wallX][wallY+1] == 1) && (tile[wallX][wallY-1] == 1) && (tile[wallX+1][wallY] == 1) && (tile[wallX+1][wallY+1] == 1) && (tile[wallX+1][wallY-1] == 1) && (tile[wallX-1][wallY] == 1) && (tile[wallX-1][wallY+1] == 1) && (tile[wallX-1][wallY-1] == 1)) {
    //         wallX = rand(1, tileSize - 2)
    //         wallY = rand(1, tileSize - 2)
    //     }
    //     tile[wallX][wallY] = 2
    // }

    // let lights = rand(1, Math.floor(tileSize * tileSize * 0.01))
    // for (let i = 0; i < lights; i++) {
    //     let rando = rand(0, tileSize - 2)
    //     let rando2 = rand(0, tileSize - 2)
    //     if (!(wallTiles.includes(tile[rando][rando2]))) {
    //         tile[rando][rando2] = 3
    //     }
    //     if (!(wallTiles.includes(tile[rando+1][rando2]))) {
    //         tile[rando+1][rando2] = 3
    //     }
    //     if (!(wallTiles.includes(tile[rando+1][rando2+1]))) {
    //         tile[rando+1][rando2+1] = 3
    //     }
    //     if (!(wallTiles.includes(tile[rando][rando2+1]))) {
    //         tile[rando][rando2+1] = 3
    //     }

    // }

    // return tile //as per [tileSize]
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
    let randEnte = rand(0, entityList.length - 1)
    entities.push(new Entity(mazePosX, mazePosY, tileSize - 0.5, tileSize - 0.5, entityList[randEnte], shadowList[randEnte]))
    // entities.push(new Entity(mazePosX, mazePosY, rand(0, tileSize - 1) - 0.5, rand(0, tileSize - 1) - 0.5, entityList[randEnte], shadowList[randEnte]))

    // entities.push(new Entity(mazePosX, mazePosY, 10.5, 10.5, angus, angusOver))



    return maze //4d list
}

function createMaze() { //generates new maze to suit tiles
    let currentLength = exploredTiles.length
    if (mazePosX - viewRadius < 0) { //if view radius goes outside to the left
        mazePosX ++
        for (let i = 0; i < entities.length; i++) {
            entities[i].eMazePosX ++
            if (entities[i].targeting.length != 0) {
                entities[i].targeting[1] = entities[i].targeting[1] + 1
            }
            if (entities[i].seen.length != 0) {
                entities[i].seen[1] = entities[i].seen[1] + 1
            }
        }
        for (let i = 0; i < exploredTiles.length; i++) {
            exploredTiles[i].unshift(generateTile(i, 0)) //add an extra tile to front of row
        }
    } else if (mazePosX + viewRadius > exploredTiles[0].length - 1) { //view radius goes outside to the right
        for (let i = 0; i < exploredTiles.length; i++) {
            exploredTiles[i].push(generateTile(i, currentLength)) //add an extra tile to front of row
        }
    }

    if (mazePosY - viewRadius < 0) { //if view radius goes outside downward
        mazePosY ++
        for (let i = 0; i < entities.length; i++) {
            entities[i].eMazePosY ++
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

function rayCast() {
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
    let distInWall = 0 //distance in wall
    let roofs = []
    let floorDist = 0
    winOption = 0

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
                if (opaqueTiles.includes(exploredTiles[mazePosY + mazeModY][mazePosX + mazeModX][currentSquareY][currentSquareX])) {
                    hit = true
                }
                if ((exploredTiles[mazePosY + mazeModY][mazePosX + mazeModX][currentSquareY][currentSquareX] == 6) && (rendDist < 5) && (opened == 0)) {
                    winOption = 1
                }
            }

            floorDist = Math.sqrt(Math.pow(-tilePosY + posY + tileSize * mazeModY, 2) + Math.pow(-tilePosX + posX + tileSize * mazeModX, 2)) / 4 * Math.cos(rad(Math.abs(angle - rayAngle)))
            
            if (((size - (size / floorDist)) / 2 + (size * jumpP / floorDist) > 0) && (roofs[i].length < Math.floor(renderDist / 2))) {
                roofs[i].push([floorDist, exploredTiles[mazePosY + mazeModY][mazePosX + mazeModX][currentSquareY][currentSquareX]])
            } else if (((size - (size / floorDist)) / 2 + (size * jumpP / floorDist) < 0) && (roofs[i].length < Math.floor(renderDist / 2))) {
                roofs[i][0] = [1 - 2 * jumpP, exploredTiles[mazePosY + mazeModY][mazePosX + mazeModX][currentSquareY][currentSquareX]]
            // } else if (roofs[i].length == Math.floor(renderDist / 2)) {
            //     roofs[i].push([floorDist, 0])
            }
            rendDist++
        }


        wallType = exploredTiles[mazePosY + mazeModY][mazePosX + mazeModX][currentSquareY][currentSquareX]

        if (rendDist >= renderDist + 1) {
            wallType = 1
        }

        dist = Math.sqrt(Math.pow(- tilePosY + posY + tileSize * mazeModY, 2) + Math.pow( - tilePosX + posX + tileSize * mazeModX, 2)) / 4
        perpDist = dist * Math.cos(rad(Math.abs(angle - rayAngle)))

        wallHeight = size / perpDist //the derivation of height based on distance. assumed viewing angle

        if (posX == Math.floor(posX)) {
            distInWall = posY % 1
        } else {
            distInWall = posX % 1
        }
    
        // wallType = levelTextures[level][opaqueTextures[exploredTiles[mazePosY + mazeModY][mazePosX + mazeModX][currentSquareY][currentSquareX]]]
        
        rays.push([i, wallHeight, perpDist, wallType, dist * 4, distInWall])
    }

    rays.sort(sortFunction)
    rays.reverse()

    canvas.beginPath()
    canvas.fillStyle = "#000000"
    canvas.fillRect(startX, startY, size, size/2)

    let gradient = canvas.createLinearGradient(startX + size / 2, startY + size / 2, startX + size / 2, startY + size)
    gradient.addColorStop(0, "#000000")
    gradient.addColorStop(1, "#bec242")
    canvas.fillStyle = gradient
    canvas.fillRect(startX, startY + size/2, size, size/2)

    canvas.closePath()

    canvas.lineWidth = rayWidth
    for (let m = 0; m < roofs.length; m++) {
        for (let n = 0; n < roofs[m].length - 1; n++) {
            canvas.fillStyle = "#000000"

            if (!(roofs[m][n][1] == 3)) {
                canvas.fillStyle = hex(roofColours[level][roofs[m][n][1]], 1 / (roofs[m][n][0] + 1))
            } else {
                canvas.fillStyle = roofColours[level][roofs[m][n][1]]
            }

            canvas.beginPath()

            // canvas.fillRect(startX + (roofs.length - m-1) * rayWidth, startY + Math.floor((size - (size / roofs[m][n][0])) / 2 + (size * jumpP / roofs[m][n][0])), rayWidth, Math.floor((size - (size / (roofs[m][n+1][0] - roofs[m][n+1][0]))) / 2))
            canvas.fillRect(startX + (roofs.length - m - 1) * rayWidth, startY + Math.floor(Math.floor((size - (size / roofs[m][n][0])) / 2 + (size * jumpP / roofs[m][n][0]))), rayWidth, Math.ceil(((size - (size / roofs[m][n+1][0])) / 2 + (size * jumpP / roofs[m][n+1][0])) - ((size - (size / roofs[m][n][0])) / 2 + (size * jumpP / roofs[m][n][0]))))
            
            canvas.closePath()
            // canvas.beginPath()
            // canvas.moveTo(startX + (roofs.length - m - 0.5) * rayWidth, startY + Math.floor((size - (size / roofs[m][n][0])) / 2 + (size * jumpP / roofs[m][n][0])))
            // canvas.lineTo(startX + (roofs.length - m - 0.5) * rayWidth, startY + Math.ceil((size - (size / roofs[m][n+1][0])) / 2 + (size * jumpP / roofs[m][n+1][0])))
            // canvas.stroke()
            // canvas.closePath()
            // canvas.strokeStyle = "#FFFFFF"
            // canvas.beginPath()
            // canvas.strokeStyle = "#000000"
            // canvas.lineTo(startX + (roofs.length - m - 1) * size/roofs.length, startY + roofs[m][n+1][0] + 1)
            // canvas.stroke()
            // canvas.closePath()
        }
    }

    let l = 0
    // var idata = canvas.createImageData(125, 500);
    // idata.data.set(L0W1Arr);
    // canvas.putImageData(idata, 0, 0);    
    for (let k = 0; k < entitiesHit.length + 1; k++) {
        while ((l < rays.length) && ((k == entitiesHit.length) || (rays[l][4] > entitiesHit[k][2]))) {
            canvas.beginPath()

            if (Math.ceil(rays[l][5] * 125 + rayWidth * 500 / rays[l][1]) <= 125) {

                // canvas.putImageData(cropImageData(levelTextures2[level][rays[l][3]].data, 125, Math.floor(rays[l][5] * 125), 0, Math.ceil(rayWidth * 500 / rays[l][1]), 500), startX + (spread-rays[l][0]-1) * rayWidth, startY + size/ 2 - (rays[l][1] / 2) + (size * jumpP / rays[l][2]))
                canvas.drawImage(levelTextures[level][rays[l][3]], Math.floor(rays[l][5] * 125), 0, rayWidth * 500 / rays[l][1], 500, startX + (spread-rays[l][0]-1) * rayWidth, startY + size / 2 - (rays[l][1] / 2) + (size * jumpP / rays[l][2]) + 1, rayWidth, rays[l][1])

            } else {
                // canvas.putImageData(cropImageData(levelTextures2[level][rays[l][3]].data, 125, Math.floor(125 - rayWidth * 500 / rays[l][1]), 0, Math.floor(rayWidth * 500 / rays[l][1]), 500), startX + (spread-rays[l][0]-1) * rayWidth, startY + size/ 2 - (rays[l][1] / 2) + (size * jumpP / rays[l][2]))
                canvas.drawImage(levelTextures[level][rays[l][3]], 125 - rayWidth * 500 / rays[l][1], 0, rayWidth * 500 / rays[l][1], 500, startX + (spread-rays[l][0]-1) * rayWidth, startY + size/ 2 - (rays[l][1] / 2) + (size * jumpP / rays[l][2]) + 1, rayWidth, rays[l][1])
            }

            canvas.fillStyle = "rgba(0, 0, 0, " + String(1 - 1 / (rays[l][2] + 1)) + ")"
            canvas.fillRect(Math.floor(startX + (spread-rays[l][0]-1) * rayWidth), startY + size/ 2 - (rays[l][1] / 2) + (size * jumpP / rays[l][2]), rayWidth, Math.ceil(rays[l][1]) + 2)
            
            // canvas.moveTo(startX + (spread-rays[l][0]-0.5) * rayWidth, startY + size/ 2 - (rays[l][1] / 2));
            // canvas.lineTo(startX + (spread-rays[l][0]-0.5) * rayWidth, startY + size/ 2 - (rays[l][1] / 2) + rays[l][1]);
            // canvas.stroke()
    
            canvas.closePath()

            l++
        }

        if (k != entitiesHit.length) {
            canvas.strokeStyle = "#000000"

            if (entitiesSpawn == 1) {
                canvas.beginPath()
                // canvas.arc(startX + size - (angleFrom(angle, entityAngle) + viewAngle/2) * (size / viewAngle), startY + size / 2, size / entitiesHit[k][2] / 4, 0, Math.PI * 2)
                // canvas.stroke()
                canvas.drawImage(entitiesHit[k][1].type, startX + size - (angleFrom(angle, entitiesHit[k][0]) + 30) * (size / 60) - size / entitiesHit[k][2] * 2, startY + size / 2 - size / entitiesHit[k][2] * 2 + (size * jumpP * 4 / entitiesHit[k][2]), size / entitiesHit[k][2] * 4, size / entitiesHit[k][2] * 4)
                console.log(entitiesHit[k][2], 1 - 3 / (entitiesHit[k][2] + 3))
                canvas.globalAlpha = 1 - 3 / (entitiesHit[k][2] + 3)
                canvas.drawImage(entitiesHit[k][1].shadow, startX + size - (angleFrom(angle, entitiesHit[k][0]) + 30) * (size / 60) - size / entitiesHit[k][2] * 2, startY + size / 2 - size / entitiesHit[k][2] * 2 + (size * jumpP * 4 / entitiesHit[k][2]), size / entitiesHit[k][2] * 4, size / entitiesHit[k][2] * 4)
                canvas.globalAlpha = 1
                
                canvas.closePath()

            }
        } 
    }

    canvas.fillStyle = "#000000"
    canvas.fillRect(startX + 0.1 * size, startY + 0.9 * size, 0.2 * size, 0.05 * size)

    canvas.fillStyle = "#FFFFFF"
    canvas.fillRect(startX + 0.11 * size, startY + 0.91 * size, 0.18 * size * (sprint/5), 0.03 * size)

    canvas.font = String(size/40) + "px Arial"
    if (!win) {
        canvas.fillText("FPS: " + String(Math.floor(1000 / (deltaTime * 1000))) + " | Graphics: " + String(renderModes[render]) + " | Mouse sensitivity: " + String(Math.floor(sens * 100) / 100), startX + 0.05 * size, startY + 0.08 * size)
    }

    canvas.font = String(size/15) + "px Arial"
    canvas.textAlign = "center"
    if ((winOption == 1) && (opened == 0)) {
        canvas.fillText("Press 'E' to open door", startX + 0.5 * size, startY + 0.5 * size)
    }

    canvas.fillStyle = "rgba(255, 255, 255, 0.5)"
    console.log(entityClose)
    if (rand(0, Math.floor(1/(4 * deltaTime))) != 0) {
        canvas.fillText(entityClose, startX + 0.5 * size, startY + 0.5 * size)
    }

    if (win) {
        winTrans += 0.2 * deltaTime
        canvas.fillStyle = "rgba(255, 255, 255, " + String(winTrans) + ")"
        canvas.fillRect(startX, startY, size, size)
    }


    canvas.fillStyle = "#FFFFFF"
    canvas.fillRect(0, 0, width, startY)
    canvas.fillRect(0, size + startY, width, height - size - startY)
    canvas.fillRect(0, startY, startX, size)
    canvas.fillRect(startX + size, startY, width - size - startX, size)

    canvas.strokeStyle = "#000000"
    canvas.lineWidth = Math.ceil(size/100)
    canvas.strokeRect(startX, startY, size, size)
    canvas.strokeRect(0, 0, width, height)
}

function updateEntities() {
    console.log("ALL ENTITY START \n \n \n \n \n")
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


        // console.log("entity start!!!!!!")
        // console.log("I'm at", entities[k].eMazePosY, entities[k].eMazePosX, entities[k].eTilePosY, entities[k].eTilePosX)
        // console.log("for reference, the player is at", mazePosY, mazePosX, tilePosY, tilePosX)
        entTotalX = tileSize * entities[k].eMazePosX + entities[k].eTilePosX
        entTotalY = tileSize * entities[k].eMazePosY + entities[k].eTilePosY
        plaTotalX = tileSize * mazePosX + tilePosX
        plaTotalY = tileSize * mazePosY + tilePosY

        entityDist = Math.pow(Math.pow(entTotalX - plaTotalX, 2) + Math.pow(entTotalY - plaTotalY, 2), 0.5)
        console.log("i'm ", entityDist, " away from the player")

        if (entityDist < 2) {
            dead = true
            winTimerCumulative += Date.now() - winTimer
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
                entities[k].eTilePosX += Math.sign(targetTotalX - entTotalX) * deltaTime * (7 + 3 * difficulty)
                entities[k].eTilePosY += Math.sign(targetTotalY - entTotalY) * deltaTime * (7 + 3 * difficulty)
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
        } else if (entities[k].seen.length != 0) {
            // console.log("i dont have a target, but im assigning one now from 'seen':", entities[k].seen)
            entities[k].targeting = entities[k].seen
            entities[k].seen = []
        }
        
        if (entityDist < renderDist) {
            entityClose = "be careful..."
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
                if (entities[k].targeting.length == 0) {
                    // console.log("hit player")
                    // console.log("new target @ ",[[mazePosY], [mazePosX], [tilePosY], [tilePosX]])
                    entities[k].targeting = [mazePosY, mazePosX, tilePosY, tilePosX]
                } else {
                    // console.log("saving this for later hehe")
                    entities[k].seen = [mazePosY, mazePosX, tilePosY, tilePosX]
                }
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

            // if (entityDist > viewRadius * tileSize) {
            //     console.log(entities)
            //     entities.splice(k, 1)
            //     console.log("removed")

            if ((-(viewAngle/2) < angleFrom(angle, entityAngle) + extraAngle) || (angleFrom(angle, entityAngle) + extraAngle < viewAngle/2)) {
                // console.log("entity is in view!!", entityDist, -(angleFrom(angle, entityAngle)))
                if (entityDist < 20) {
                    entityClose = "watch out..."
                }
                entitiesHit.push([entityAngle, entities[k], entityDist])
            }
        }

        if (hit == 0) {
            entityClose = "RUN."
        }
    }
    entitiesHit.sort(sortFunction)
    entitiesHit.reverse()
}

function updatePhysics() {
    if ((sprintTimer < 2) && (sprint < 5) && !(keys["shift"])) {
        sprintTimer += deltaTime
    }

    if ((sprint < 5) && (sprintTimer >= 2)) {
        sprint += deltaTime
    }

    if (jump == 1) {

        jumpP = 1.4 * timeSinceJump - 1.75 * timeSinceJump * timeSinceJump

        if (jumpP < 0) {
            jumpP = 0
            jump = 0
            timeSinceJump = 0
        } else {
            timeSinceJump += deltaTime
        }
    }

    if (!(sprinting) && (speed > 1) && (jump == 0)) {
        speed -= 2 * deltaTime
    } else if (!(sprinting) && (speed > 1) && (jump == 1)) {
        speed -= 0.2 * deltaTime
    }

}

function checkKeys() {

    if ((jump == 0) && (keys["shift"]) && (((sprint > 0) && (sprintTimer <= 0)) || (sprint > 1))) {
        sprinting = 1
        sprintTimer = 0
        if (speed < 1.5) {
            speed += 4 * deltaTime
        }
        sprint -= deltaTime
    } else if ((jump == 1) && (keys["shift"]) && (((sprint > 0) && (sprintTimer <= 0)) || (sprint > 1))) {
        sprint -= 3 * deltaTime
    } else {
        sprinting = 0
    }

    if ((keys["t"]) && (sens < 2)) {
        sens += 0.15 * deltaTime
    }
    if ((keys["y"]) && (sens > 0.1)) {
        sens -= 0.15 * deltaTime
    }
    
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

function changeWindow() {
    if ((window.innerHeight != height) || (window.innerWidth != width)) {
        width = window.innerWidth - 20;
        height = window.innerHeight - 20;
        startX = 0
        startY = 0

        canvas.canvas.width = width;
        canvas.canvas.height = height;

        // if (width > height) {
        //     startX = (width - Math.floor(height / spread) * spread) / 2
        //     startY = 0
        //     size = Math.floor(height / spread) * spread
        // } else {
        //     startX = 0
        //     startY = (height - Math.floor(width / spread) * spread) / 2
        //     size = Math.floor(width / spread) * spread
        // }
        
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
        canvas.fillStyle = "#FFFFFF"
        canvas.fillRect(0, 0, canvas.canvas.width, startY)
        canvas.fillRect(0, size + startY, canvas.canvas.width, canvas.canvas.height - (size + startY))

        canvas.strokeStyle = "#000000"
        canvas.lineWidth = Math.ceil(size/100)
        canvas.strokeRect(startX, startY, size, size)
        canvas.strokeRect(0, 0, canvas.canvas.width, canvas.canvas.height)

        canvas.drawImage(startImages[tutorialCount], startX, startY, size, size)
    }

    if ((win) && (winTrans >= 1)) {
        winTrans = 1
        canvas.fillStyle = "#FFFFFF"
        canvas.fillRect(startX, startY, size, size)
        canvas.fillStyle = "#000000"
        canvas.font = String(size/12) + "px Arial"
        canvas.textAlign = "center"
        canvas.fillText("congrats, you escaped!", startX + size / 2, startY + size * 0.2)
        canvas.fillText("game made by oscar", startX + size / 2, startY + size * 0.6)
        canvas.fillText("your time: " + String(winTimerCumulative / 1000) + " seconds!", startX + size / 2, startY + size * 0.4)
        canvas.fillText("click to restart", startX + size / 2, startY + size * 0.8)
        actualWin = true
        document.exitPointerLock()
    }

    if (dead) {
        if (jumpscare > 1) {
            canvas.font = String(size/12) + "px Arial"
            canvas.textAlign = "center"
            canvas.fillText("you died", startX + size / 2, startY + size * 0.2)
            canvas.fillText("game made by oscar", startX + size / 2, startY + size * 0.6)
            canvas.fillText("your time: " + String(winTimerCumulative / 1000) + " seconds!", startX + size / 2, startY + size * 0.4)
            canvas.fillText("click to restart", startX + size / 2, startY + size * 0.8)
            document.exitPointerLock()
        } else {
            jumpscare += deltaTime
            canvas.drawImage(alexmJump, startX, startY, size, size)
        }
    }

    if (paused) {
        canvas.drawImage(pauseImg, startX, startY, size, size)
    }
}

function mainloop() {

    if (!(isNaN((Date.now() - deltaTimer) / 1000))) {

        deltaTime = (Date.now() - deltaTimer) / 1000

    }

    deltaTimer = Date.now()

    changeWindow()

    if ((!paused) && (!startFlag) && (!actualWin) && (!dead)) {

        updatePhysics()

        checkKeys()

        if (!win) {

        updateEntities()

        }

        rayCast()

        createMaze()

    }
    
    requestAnimationFrame(mainloop)

}

window.addEventListener('keydown', function (e) { //activates whenever a key is pressed
    if (!(e.repeat)) {
        if (String(e.key).toLowerCase() == " ") {
            e.preventDefault()
            if (jump == 0) {
                jump = 1
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
            opened = 1
        }
        if (canChooseDifficulty) {
            if ((String(e.key).toLowerCase() == "x")) {
                difficulty = 0
                tutorial = true
                canChooseDifficulty = false
                tutorialCount++
            } else if ((String(e.key).toLowerCase() == "c")) {
                difficulty = 1
                tutorial = true
                canChooseDifficulty = false
                tutorialCount++
            } else if ((String(e.key).toLowerCase() == "v")) {
                difficulty = 2
                tutorial = true
                canChooseDifficulty = false
                tutorialCount++
            }
        }
        keys[String(e.key).toLowerCase()] = true
    }
}, false);

window.addEventListener('keyup', function (e) { //activates whenever a key is released
    keys[String(e.key).toLowerCase()] = false
}, false);

function updatePosition(e) {
    angle -= e.movementX * 0.2 * sens

    // if ((yOffAngle - e.movementY > -45) && (yOffAngle - e.movementY < 45)) {
    //     yOffAngle -= e.movementY
    //     yOffTop = Math.tan(rad(45 + yOffAngle))
    //     yOffBottom = Math.tan(rad(-45 + yOffAngle))
    // }
}

function lockChangeAlert() {
    if (document.pointerLockElement === c) { //going from a pause menu to the game
        document.addEventListener("mousemove", updatePosition, false);
        paused = false
        winTimer = Date.now()
    } else { //going from the game to a pause menu
        document.removeEventListener("mousemove", updatePosition, false);
        if ((!win) && (!dead)) { //only allows pause if gamer hasnt won yet and isnt dead
            winTimerCumulative += Date.now() - winTimer
            paused = true
            setTimeout(allowResume, 1500)
        }
    }
}
//store
const tileSize = 100
const renderDist = 100
var opaqueTiles = [1, 2, 4, 5, 6]
var wallTiles = [1, 2, 4, 5, 6]
const debug = 0
const threeDee = 1
const floors = 1
const entitiesSpawn = 1
const viewRadius = Math.ceil(renderDist/tileSize) + 1
const renderModes = ["", "super high", "", "high", "", "medium", "", "low", "", "ultra low"]
const difficulties = ["easy", "medium", "hard"]

var imagesLoaded = 0

const angus = new Image()
angus.src = "images/angus.png"
const angusOver = new Image()
angusOver.src = "images/angus_overlay.png"
const alexm = new Image()
alexm.src = "images/alexm.png"
const alexmOver = new Image()
alexmOver.src = "images/alexm_overlay.png"
const alexy = new Image()
alexy.src = "images/alexy.png"
const alexyOver = new Image()
alexyOver.src = "images/alexy_overlay.png"

const entityList = [angus, alexm, alexy]
const shadowList = [angusOver, alexmOver, alexyOver]

const alexmJump = new Image()
alexmJump.src = "images/alexm_jumpscare.png"

const L0W1 = new Image()
L0W1.src = "images/level_0_wall.png"
const L0W2 = new Image()
L0W2.src = "images/level_0_column.png"
const L0W3 = new Image()
L0W3.src = "images/level_0_elevator_wall.png"
const L0W4 = new Image()
L0W4.src = "images/level_0_elevator_door.png"

const levelTextures = [{1: L0W1, 2: L0W2, 5: L0W3, 6: L0W4}]
const roofColours = [{0: "#f2ec90", 3: "#ffffff", 6: "#666459", 7: "#666459", 8: "#666459"}]

const start0 = new Image()
start0.src = "images/start_0.png"
const start1 = new Image()
start1.src = "images/start_1.png"
const start2 = new Image()
start2.src = "images/start_2.png"
const start3 = new Image()
start3.src = "images/start_3.png"
const start4 = new Image()
start4.src = "images/start_4.png"
const start5 = new Image()
start5.src = "images/start_5.png"
const startImages = [start0, start1, start2, start3, start4, start5]

const pauseImg = new Image()
pauseImg.src = "images/paused.png"

var width = window.innerWidth - 30;
var height = window.innerHeight - 30;
var rayWidth = 0
var size = 0
var startX = 0
var startY = 0
var tilePosX = 0.5
var tilePosY = 0.5
var mazePosX = viewRadius
var mazePosY = viewRadius
var angle = 0
var keys = {}
var entities = []
var level = 0
var exploredTiles = initialiseMaze()
var paused = false
var interval = 0
var canClick = true
// var yOffAngle = 0
// var yOffTop = 0
// var yOffBottom = 0
var sprint = 5 // seconds
var sprinting = 0
var sprintTimer = 0
var startFlag = true
var deltaTime = 0
var viewAngle = 60
var jump = 0
var jumpV = 0
var jumpP = 0
var jumpPress = 0
var timeSinceJump = 0
var speed = 1
var annoying = 0
var deltaTimer = 0
var render = 5
var spread = 250
var winOption = 0
var opened = 0
var win = false
var winTrans = 0
var actualWin = false
var winTimer = 0
var winTimerCumulative = 0
var dead = false
var jumpscare = 0
var entitiesHit = []
var difficulty = 1
var start = false
var sens = 1
var entityClose = ""
var tutorial = false
var tutorialCount = 0
var canChooseDifficulty = false

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
            if(!document.pointerLockElement) {
            await c.requestPointerLock({
                unadjustedMovement: true,
            })
            }
        } else if (actualWin || dead) {
            window.location.reload()
        }
    } else {
        if ((tutorialCount != 4) && (tutorialCount != 5)) {
            tutorialCount ++
        }
        if (tutorialCount == 4) {
            canChooseDifficulty = true
        }
    }
})

document.addEventListener("pointerlockchange", lockChangeAlert, false);

mainloop()
