
//convert the game data to string for database
function gridToString(object){
    var string = "C";
    //the first value is CELL_SIZE
    string = string.concat(object.CELL_SIZE.toString());
    string = string.concat("X");
    //second is X
    string = string.concat(object.X.toString());
    string = string.concat("Y");
    //third is Y
    string = string.concat(object.Y.toString());
    string = string.concat("L");
    //the remainings are the coordinates of the cells that have state of ALIVE
    for(var i = 0; i < object.WIDTH; i++) {
        for(var z = 0; z < object.HEIGHT; z++) {
            if(object.grid[z][i]==object.ALIVE){
                var xCoord = z;
                var yCoord = i;
                var tempS = "";
                tempS = tempS.concat(xCoord.toString(),",",yCoord.toString());
                string = string.concat(tempS);
                string = string.concat("/");
            }
        }
    }
    string = string.concat("E");
    return string;
};
// Converts canvas to an image
function convertCanvasToImage(canvas,context) {

}

function initialiseObject(object, cellSize, canvas){

    object.CELL_SIZE = cellSize;
    object.X = (canvas.width-canvas.width%object.CELL_SIZE)*2;
    object.Y = (canvas.height-canvas.height%object.CELL_SIZE)*2;
    object.WIDTH = object.X / object.CELL_SIZE;
    object.HEIGHT = object.Y / object.CELL_SIZE;
    object.DEAD = 0;
    object.ALIVE = 1;
    object.DELAY = 500;
    object.STOPPED = 0;
    object.RUNNING = 1;

    object.minimum = 2;
    object.maximum = 3;
    object.spawn = 3;

    object.state = object.STOPPED;
    object.interval = null;

    object.grid = Array.matrix(object.HEIGHT, object.WIDTH, 0);

    object.counter = 0;
};
//convert string from database to grid to load the game
function stringToGrid(str,object){
    object.CELL_SIZE = parseInt(str.substring(str.indexOf("C")+1,str.indexOf("X")));
    object.X = parseInt(str.substring(str.indexOf("X")+1,str.indexOf("Y")));
    object.Y = parseInt(str.substring(str.indexOf("Y")+1,str.indexOf("L")));
    object.WIDTH = object.X / object.CELL_SIZE;
    object.HEIGHT = object.Y / object.CELL_SIZE;
    var coord = str.slice(str.indexOf("L")+1);
    object.grid = Array.matrix(object.Y, object.X, 0);

    while(!coord.startsWith("E")){
        var coords = coord.substring(0,coord.indexOf("/"));
        var loc = coords.split(",");
        object.grid[parseInt(loc[0])][parseInt(loc[1])] = 1;
        coord = coord.slice(coord.indexOf("/")+1);
    }
};

function pause(life){
    if(life.state == life.RUNNING){
        clearInterval(life.interval);
        life.state = life.STOPPED;
    }
};
function sleep(milliseconds) {
    var starting = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - starting) > milliseconds){
            break;
        }
    }
}
Array.matrix = function (m, n, initial) {
    var a, i, j, mat = [];
    for (i = 0; i < m; i += 1) {
        a = [];
        for (j = 0; j < n; j += 1) {
            a[j] = 0;
        }
        mat[i] = a;
    }
    return mat;
};
var Life = {};

document.addEventListener("DOMContentLoaded", function() {
    // From JavaScript: The good parts - Chapter 6. Arrays, Section 6.7. Dimensions
    var gridCanvas = document.getElementById('game_canvas');
    var counterSpan = document.getElementById("counter");
    var controlLinkStart = document.getElementById("start");
    var controlLinkStop = document.getElementById("stop");
    var clearLink = document.getElementById("clearLink");
    var zoomInLink = document.getElementById("zoomin");
    var zoomOutLink = document.getElementById("zoomout");
    var speedUpLink = document.getElementById("speedup");
    var speedDownLink = document.getElementById("speeddown");
    var speedRangeLink = document.getElementById("speed");
    var saveLink = document.getElementById("save");
    var loadLink = document.getElementById("load");
    var deleteLink = document.getElementById("delete");
    var convertLink = document.getElementById("convert");

    deleteLink.onclick = function(){
        localStorage.removeItem("lastGrid");

    };
    var width = gridCanvas.width;
    var height = gridCanvas.height;
    initialiseObject(Life,8,gridCanvas);
    //var testString = gridToString(Life);
    var testString ="C8X1600Y800L1,1/1,2/1,3/E";

    //stringToGrid(testString,Life);
    var context = gridCanvas.getContext('2d');
    context.clearRect(0, 0, width, height);
    drawGrid(context,Life.CELL_SIZE);
    updateAnimations();
    console.log(testString);

    //for save and load games
    var savedLife = {};
    savedLife.grid = Array.matrix(Life.HEIGHT, Life.WIDTH, 0);


    saveGrid();
    Life.updateState = function() {
        var neighbours;

        var nextGenerationGrid = Array.matrix(Life.HEIGHT, Life.WIDTH, 0);

        for (var h = 0; h < Life.HEIGHT; h++) {
            for (var w = 0; w < Life.WIDTH; w++) {
                neighbours = Life.calculateNeighbours(h, w);
                if (Life.grid[h][w] == Life.ALIVE) {
                    if ((neighbours >= Life.minimum) && (neighbours <= Life.maximum)) {
                        nextGenerationGrid[h][w] = Life.ALIVE;
                    }
                } else {
                    if (neighbours == Life.spawn) {
                        nextGenerationGrid[h][w] = Life.ALIVE;
                    }
                }
            }
        }
        copyGrid(nextGenerationGrid, Life.grid);
        Life.counter++;
    };

    Life.calculateNeighbours = function(y, x) {
        if(Life.grid[y][x]==Life.DEAD){
            var total = 0;
        }else{
            var total = -1;
        }
        for (var h = -1; h <= 1; h++) {
            for (var w = -1; w <= 1; w++) {
                if (Life.grid[(Life.HEIGHT + (y + h)) % Life.HEIGHT][(Life.WIDTH + (x + w)) % Life.WIDTH] !== Life.DEAD) {
                    total++;
                }
            }
        }
        return total;
    };



    function Cell(row, column) {
        this.row = row;
        this.column = column;
    };
    function start(life){
        if(life.state == life.STOPPED){
            life.interval = setInterval(function() {
                update();
            }, life.DELAY);
            life.state = life.RUNNING;
        }
    };
    convertLink.onclick = function(){
        var canvasSVGContext = new CanvasSVG.Deferred();
        var smallCanvas = document.getElementById("small_canvas");

        canvasSVGContext.wrapCanvas(smallCanvas);

        var context = smallCanvas.getContext('2d');
        context.clearRect(0, 0, smallCanvas.width, smallCanvas.height);
        drawGrid(context,Life.CELL_SIZE*(smallCanvas.width/width));
        for (var h = 0; h < Life.HEIGHT; h++) {
            for (var w = 0; w < Life.WIDTH; w++) {
                if (Life.grid[h][w] === Life.ALIVE) {
                    context.fillStyle = "#262626";

                } else {
                    context.fillStyle = "#cccccc";
                    //context.clearRect();
                }
                context.fillRect(
                    w * Life.CELL_SIZE*(smallCanvas.width/width) +1,
                    h * Life.CELL_SIZE*(smallCanvas.width/width) +1,
                    Life.CELL_SIZE*(smallCanvas.width/width) -1,
                    Life.CELL_SIZE*(smallCanvas.width/width) -1);
                }
            }
        document.getElementById("captions").appendChild(context.getSVG());
        console.log(context.getSVG().innerHTML);
    };
    // start button execution
    controlLinkStart.onclick = function() {
        start(Life);
    };

    // stop button execution
    controlLinkStop.onclick = function() {
        pause(Life);
    };

    // clean button execution
    clearLink.onclick = function() {
        Life.grid = Array.matrix(Life.HEIGHT, Life.WIDTH, 0);
        Life.counter = 0;
        clearInterval(Life.interval);
        Life.state = Life.STOPPED;
        update();
    };
    //speed up button execution
    speedUpLink.onclick = function() {
        if(Life.state == Life.RUNNING){
            if(Life.DELAY>=100){
                Life.DELAY-=50;
            }
            clearInterval(Life.interval);

            Life.interval = setInterval(function() {
                update();
            }, Life.DELAY);
        }
    };

    //speed down button execution
    speedDownLink.onclick = function() {
        if(Life.state == Life.RUNNING){
            if(Life.DELAY<=450){
                Life.DELAY+=50;
            }
            clearInterval(Life.interval);

            Life.interval = setInterval(function() {
                update();
            }, Life.DELAY);
        }
    };

    speedRangeLink.onclick = function() {
        if(Life.state == Life.RUNNING){
            Life.DELAY = 520 - speedRangeLink.value;
            clearInterval(Life.interval);

            Life.interval = setInterval(function() {
                update();
            }, Life.DELAY);
        }
    };

    zoomInLink.onclick = function(){
        if(Life.CELL_SIZE<=28){
            Life.CELL_SIZE+=4;
            Life.X = (gridCanvas.width-gridCanvas.width%Life.CELL_SIZE)*2;
            Life.Y = (gridCanvas.height-gridCanvas.height%Life.CELL_SIZE)*2;
            Life.WIDTH = Life.X / Life.CELL_SIZE;
            Life.HEIGHT = Life.Y / Life.CELL_SIZE;
            var context = gridCanvas.getContext('2d');
            context.clearRect(0, 0, width, height);
            drawGrid(context,Life.CELL_SIZE);
            updateAnimations();
        }
    };
    zoomOutLink.onclick = function(){
        var flag = 0;
        if(Life.CELL_SIZE>=12){
            if(Life.state === Life.RUNNING){
                pause(Life);
                sleep(1);
                flag = 1;
                Life.CELL_SIZE-=4;
                Life.X = (gridCanvas.width-gridCanvas.width%Life.CELL_SIZE)*2;
                Life.Y = (gridCanvas.height-gridCanvas.height%Life.CELL_SIZE)*2;
                Life.WIDTH = Life.X / Life.CELL_SIZE;
                Life.HEIGHT = Life.Y / Life.CELL_SIZE;
                saveGrid();
                sleep(1);

                loadGrid();
                Life.updateState();
                updateAnimations();
            }else{
                Life.CELL_SIZE-=4;
                Life.X = (gridCanvas.width-gridCanvas.width%Life.CELL_SIZE)*2;
                Life.Y = (gridCanvas.height-gridCanvas.height%Life.CELL_SIZE)*2;
                Life.WIDTH = Life.X / Life.CELL_SIZE;
                Life.HEIGHT = Life.Y / Life.CELL_SIZE;
                var context = gridCanvas.getContext('2d');
                context.clearRect(0, 0, width, height);
                drawGrid(context,Life.CELL_SIZE);
                updateAnimations();
            }

        }
        if(flag == 1){
            start(Life);
        }
    };
    function save_local(object){
        if (typeof(Storage) !== "undefined") {
            // Code for localStorage/sessionStorage.
            var grid = gridToString(object);
            localStorage.setItem("lastGrid", grid);

        } else {
            // Sorry! No Web Storage support..
            alert("Web storage is unsupported in your browser.");

        }
    };
    function load_local(object){
        if (typeof(Storage) !== "undefined") {
            // Code for localStorage/sessionStorage.
            if(localStorage.getItem("lastGrid") != null){
                if(localStorage.lastGrid.toString()!=""){
                    stringToGrid(localStorage.lastGrid.toString(),Life);
                    var context = gridCanvas.getContext('2d');
                    context.clearRect(0, 0, width, height);
                    drawGrid(context,Life.CELL_SIZE);
                    updateAnimations();
                    console.log(testString);
                }
            }


        } else {
            // Sorry! No Web Storage support..
            alert("Web storage is unsupported in your browser.");

        }
    };
    //save button execution
    saveLink.onclick = function(){
        save_local(Life);
    };
    //load button execution
    loadLink.onclick = function(){
        load_local(Life);
        updateAnimations();
    };

    function update() {
        Life.updateState();
        updateAnimations();
    };

    //copy grid from source to target
    function copyGrid(source,target){
        for (var h = 0; h < Life.HEIGHT; h++) {
            target[h] = source[h].slice(0);
        }
    };
    //save function
    function saveGrid(){
        savedLife.CELL_SIZE = Life.CELL_SIZE;
        savedLife.X = Life.X;
        savedLife.Y = Life.Y;
        savedLife.WIDTH = Life.WIDTH;
        savedLife.HEIGHT = Life.HEIGHT;
        copyGrid(Life.grid,savedLife.grid);

    };
    //load function
    function loadGrid(){
        Life.CELL_SIZE = savedLife.CELL_SIZE;
        Life.X = savedLife.X;
        Life.Y = savedLife.Y;
        Life.WIDTH = savedLife.WIDTH;
        Life.HEIGHT = savedLife.HEIGHT;
        var context = gridCanvas.getContext('2d');
        context.clearRect(0, 0, width, height);
        drawGrid(context,Life.CELL_SIZE);
        copyGrid(savedLife.grid,Life.grid);
    };

    function updateAnimations() {
        for (var h = 0; h < Life.HEIGHT; h++) {
            for (var w = 0; w < Life.WIDTH; w++) {
                if (Life.grid[h][w] === Life.ALIVE) {
                    context.fillStyle = "#262626";

                } else {
                    context.fillStyle = "#cccccc";
                    //context.clearRect();
                }
                context.fillRect(
                    w * Life.CELL_SIZE +1,
                    h * Life.CELL_SIZE +1,
                    Life.CELL_SIZE -1,
                    Life.CELL_SIZE -1);
                }
            }
            counterSpan.innerHTML = Life.counter;
        };
        function drawGrid(context,cellSize){


            for (var x = 0; x <= Life.X; x += cellSize) {
                context.moveTo(0.5 + x, 0);
                context.lineTo(0.5 + x, Life.Y);
                console.log(cellSize);

            }
            for (var y = 0; y <= Life.Y; y += cellSize) {
                context.moveTo(0, 0.5 + y);
                context.lineTo(Life.X, 0.5 + y);
            }
            context.strokeStyle = "#f6f6f6";
            context.stroke();
        };
        if (gridCanvas.getContext) {
            var context = gridCanvas.getContext('2d');
            var offset = Life.CELL_SIZE;
            drawGrid(context,Life.CELL_SIZE);

            function canvasClickHandler(event) {
                var cell = getCursorPosition(event);
                if(Life.grid[cell.row][cell.column] == Life.ALIVE){
                    var state = Life.DEAD;
                }else{
                    var state = Life.ALIVE;
                }
                Life.grid[cell.row][cell.column] = state;
                updateAnimations();
            };

            function getCursorPosition(event) {
                var x;
                var y;
                if (event.pageX || event.pageY) {
                    x = event.pageX;
                    y = event.pageY;
                } else {
                    x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                    y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
                }

                x -= gridCanvas.offsetLeft;
                y -= gridCanvas.offsetTop;

                var cell = new Cell(Math.floor(y / Life.CELL_SIZE), Math.floor(x / Life.CELL_SIZE));
                return cell;
            };

            gridCanvas.addEventListener("click", canvasClickHandler, false);
        } else {
            alert("Canvas is unsupported in your browser.");
        }
    }
);
