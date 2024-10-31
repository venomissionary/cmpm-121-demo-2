import "./style.css";

const APP_NAME = "Interactive Whiteboard";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;

let checkDrawing: boolean = false;
let lines: { x: number; y: number }[][] = [];
let redo: { x: number; y: number }[][] = [];


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

//clears the canvas and saves drawn lines
function blankSlate() {
    if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (const line of lines) {
            for (let i = 0; i < line.length; i++) {
                const endPoint = line[i];
                if (i === 0) {
                    ctx.moveTo(endPoint.x, endPoint.y);
                } else {
                    ctx.lineTo(endPoint.x, endPoint.y);
                }
            }
        }
        ctx?.stroke()
    }
}

canvas.addEventListener("drawing-changed", blankSlate);

//Control drawing with the mouse
canvas.addEventListener("mousedown", () => {
    checkDrawing = true;
    lines.push([]);
    [redo = []];
});

canvas.addEventListener("mouseup", () => (checkDrawing = false));

//tracks each points from drawn lines through mouse movement
canvas.addEventListener("mousemove", (event) => {
    if (checkDrawing && ctx) {
        const board = canvas.getBoundingClientRect();
        const x = event.clientX - board.left;
        const y = event.clientY - board.top;

        lines[lines.length - 1].push({ x, y });
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
undoButton.style.marginLeft =  "10%";
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
