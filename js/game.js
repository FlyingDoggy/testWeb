document.addEventListener("DOMContentLoaded", function() {
    // From JavaScript: The good parts - Chapter 6. Arrays, Section 6.7. Dimensions
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
    var width = gridCanvas.width;
    var height = gridCanvas.height;

    var Life = {};

    Life.CELL_SIZE = 14;
    Life.X = (gridCanvas.width-gridCanvas.width%Life.CELL_SIZE)*2;
    Life.Y = (gridCanvas.height-gridCanvas.height%Life.CELL_SIZE)*2;
    Life.WIDTH = Life.X / Life.CELL_SIZE;
    Life.HEIGHT = Life.Y / Life.CELL_SIZE;
    Life.DEAD = 0;
    Life.ALIVE = 1;
    Life.DELAY = 500;
    Life.STOPPED = 0;
    Life.RUNNING = 1;

    Life.minimum = 2;
    Life.maximum = 3;
    Life.spawn = 3;

    Life.state = Life.STOPPED;
    Life.interval = null;

    Life.grid = Array.matrix(Life.HEIGHT, Life.WIDTH, 0);

    Life.counter = 0;

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
        Life.copyGrid(nextGenerationGrid, Life.grid);
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

    Life.copyGrid = function(source, destination) {
        for (var h = 0; h < Life.HEIGHT; h++) {
            destination[h] = source[h].slice(0);
        }
    };

    function Cell(row, column) {
        this.row = row;
        this.column = column;
    };

    // start button execution
    controlLinkStart.onclick = function() {
        if(Life.state == Life.STOPPED){
            Life.interval = setInterval(function() {
                update();
            }, Life.DELAY);
            Life.state = Life.RUNNING;
        }
    };

    // stop button execution
    controlLinkStop.onclick = function() {
        if(Life.state == Life.RUNNING){
            clearInterval(Life.interval);
            Life.state = Life.STOPPED;
        }
    };

    // clean button execution
    clearLink.onclick = function() {
        Life.grid = Array.matrix(Life.HEIGHT, Life.WIDTH, 0);
        Life.counter = 0;
        clearInterval(Life.interval);
        Life.state = Life.STOPPED;
        update();
    };

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
        if(Life.CELL_SIZE<=22){
            Life.CELL_SIZE+=4;
            Life.X = gridCanvas.width-gridCanvas.width%Life.CELL_SIZE;
            Life.Y = gridCanvas.height-gridCanvas.height%Life.CELL_SIZE;
            Life.WIDTH = Life.X / Life.CELL_SIZE;
            Life.HEIGHT = Life.Y / Life.CELL_SIZE;
            var context = gridCanvas.getContext('2d');
            context.clearRect(0, 0, width, height);
            drawGrid(context);
            updateAnimations();
        }
    };
    zoomOutLink.onclick = function(){
        if(Life.CELL_SIZE>=14){
            Life.CELL_SIZE-=4;
            Life.X = gridCanvas.width-gridCanvas.width%Life.CELL_SIZE;
            Life.Y = gridCanvas.height-gridCanvas.height%Life.CELL_SIZE;
            Life.WIDTH = Life.X / Life.CELL_SIZE;
            Life.HEIGHT = Life.Y / Life.CELL_SIZE;
            var context = gridCanvas.getContext('2d');
            context.clearRect(0, 0, width, height);
            drawGrid(context);
            updateAnimations();
        }
    };

    function update() {
        Life.updateState();
        updateAnimations();
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
        function drawGrid(context){


            for (var x = 0; x <= Life.X; x += Life.CELL_SIZE) {
                context.moveTo(0.5 + x, 0);
                context.lineTo(0.5 + x, Life.Y);
                console.log(Life.CELL_SIZE);

            }
            for (var y = 0; y <= Life.Y; y += Life.CELL_SIZE) {
                context.moveTo(0, 0.5 + y);
                context.lineTo(Life.X, 0.5 + y);
            }
            context.strokeStyle = "#fff";
            context.stroke();
        };
        if (gridCanvas.getContext) {
            var context = gridCanvas.getContext('2d');
            var offset = Life.CELL_SIZE;
            drawGrid(context);

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
