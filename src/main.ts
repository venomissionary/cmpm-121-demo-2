import "./style.css";

const APP_NAME = "Interactive Whiteboard";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;

let checkDrawing: boolean = false;
let lines: markerCommand[] = [];
let redo: markerCommand[] = [];


const title = document.createElement("h1");
title.textContent = APP_NAME;
title.style.textAlign = "center";
title.style.marginRight = "385px";

const canvas = document.createElement("canvas");
canvas.height = 500;
canvas.width = 1000;

const ctx = canvas.getContext("2d");

if (ctx) {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.width);
}

//new drawing command class for line
class markerCommand {
    private point: { x: number; y: number }[] = [];

    constructor(start: { x: number; y: number }) {
        this.point.push(start);
    }

    drag(point_2: { x: number; y: number }) {
        this.point.push(point_2);
    }

    display(ctx: CanvasRenderingContext2D) {
        if (this.point.length === 0) return;
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.beginPath();

        ctx.moveTo(this.point[0].x, this.point[0].y);
        for (let i = 1; i < this.point.length; i++) {
            ctx.lineTo(this.point[i].x, this.point[i].y);
        }

        ctx.stroke();

    }
}

//clears the canvas and saves drawn lines
function blankSlate() {
    if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        lines.forEach(lines => lines.display(ctx));
    }
}


canvas.addEventListener("drawing-changed", blankSlate);

//Control drawing with the mouse
canvas.addEventListener("mousedown", (event) => {
    checkDrawing = true;
    const board = canvas.getBoundingClientRect();
    const x = event.clientX - board.left;
    const y = event.clientY - board.top;
    const lineRefresh = new markerCommand({ x, y });
    lines.push(lineRefresh);
    [redo = []];
});

canvas.addEventListener("mouseup", () => (checkDrawing = false));

//tracks each points from drawn lines through mouse movement
canvas.addEventListener("mousemove", (event) => {
    if (checkDrawing && ctx) {
        const board = canvas.getBoundingClientRect();
        const x = event.clientX - board.left;
        const y = event.clientY - board.top;

        const saveLine = lines[lines.length - 1];
        saveLine.drag({ x, y });
        canvas.dispatchEvent(new Event("drawing-changed"));
    }

});

//click button to refresh the canvas
const clearButton = document.createElement("button");
clearButton.textContent = "clear";
clearButton.style.marginLeft = "-60%";
clearButton.addEventListener("click", () => {
    lines = [];
    [redo = []];
    blankSlate();
});

//click button to undo a line
const undoButton = document.createElement("button");
undoButton.textContent = "Undo";
undoButton.style.marginLeft = "10%";
undoButton.addEventListener("click", () => {
    if (lines.length > 0) {
        const traces = lines.pop();
        if (traces) redo.push(traces);
        canvas.dispatchEvent(new Event("drawing-changed"));
    }
});

//click button to redo last line
const redoButton = document.createElement("button");
redoButton.textContent = "Redo";
redoButton.style.marginLeft = "2%";
redoButton.addEventListener("click", () => {
    if (redo.length > 0) {
        const prev = redo.pop();
        if (prev) lines.push(prev);
        canvas.dispatchEvent(new Event("drawing-changed"));
    }
});

app.appendChild(clearButton);
app.appendChild(undoButton);
app.appendChild(redoButton);
app.appendChild(title);
app.appendChild(canvas);
