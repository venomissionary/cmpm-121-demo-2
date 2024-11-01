import "./style.css";

const APP_NAME = "Interactive Whiteboard";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;

let checkDrawing: boolean = false;
let lines: (markerCommand |stickerpreview)[] = [];
let redo: (markerCommand |stickerpreview)[] = [];
let clearedMarks: (markerCommand | stickerpreview)[] = [];
let CurrentLinestrength: number = 3;
let tool: toolPreview | null = null;
let selectedSticker: string | null = null;


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
    private Linestrength: number;

    constructor(start: { x: number; y: number }, Linestrength: number) {
        this.point.push(start);
        this.Linestrength = Linestrength;
    }

    drag(Pointping: { x: number; y: number }) {
        this.point.push(Pointping);
    }

    display(ctx: CanvasRenderingContext2D) {
        if (this.point.length === 0) return;
        ctx.strokeStyle = "black";
        ctx.lineWidth = this.Linestrength;
        ctx.beginPath();

        ctx.moveTo(this.point[0].x, this.point[0].y);
        for (let i = 1; i < this.point.length; i++) {
            ctx.lineTo(this.point[i].x, this.point[i].y);
        }

        ctx.stroke();

    }
}

//previews and creates the stickers on the canvas
class stickerpreview {
    private x: number;
    private y: number;
    private sticker: string;

    constructor(x: number, y: number, sticker: string) {
        this.x = x;
        this.y = y;
        this.sticker = sticker;
    }

    display(ctx: CanvasRenderingContext2D) {
        ctx.font = "40px serif";
        ctx.fillText(this.sticker, this.x, this.y);
    }
}

//previews what tool you are using on the whiteboard
class toolPreview {
    private x: number;
    private y: number;
    private Linestrength: number;

    constructor(x: number, y: number, Linestrength: number) {
        this.x = x;
        this.y = y;
        this.Linestrength = Linestrength;
    }

    positionUpdate(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.clearRect(0,0, canvas.width, canvas.height);
        blankSlate();

        if (selectedSticker) {
            ctx.font = "40px serif";
            ctx.fillText(selectedSticker, this.x, this.y);
        } else {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.Linestrength / 2, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(0,0,0,0,5)";
            ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.Linestrength / 2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,0,0, 0.5)";
        ctx.fill();
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
    const board = canvas.getBoundingClientRect();
    const x = event.clientX - board.left;
    const y = event.clientY - board.top;
    if (selectedSticker) {
        const sticker = new stickerpreview(x, y, selectedSticker);
        lines.push(sticker);
        selectedSticker = null;
    } else {
         checkDrawing = true;
         const lineRefresh = new markerCommand({ x, y }, CurrentLinestrength);
          lines.push(lineRefresh);
          [redo = []];
        }
        tool = null;
});

canvas.addEventListener("mouseup", () => {
    checkDrawing = false;
    tool = null;
    canvas.dispatchEvent(new Event("drawing-changed"));
});

//tracks each points from drawn lines through mouse movement 
canvas.addEventListener("mousemove", (event) => {
    const board = canvas.getBoundingClientRect();
    const x = event.clientX - board.left;
    const y = event.clientY - board.top;

    if (checkDrawing && ctx) {
        const saveLine = lines[lines.length - 1];
        if (saveLine instanceof markerCommand) {
            saveLine.drag({ x, y });
        }
        canvas.dispatchEvent(new Event("drawing-changed"));
    } else if (!checkDrawing) {
        if (!tool) {
            tool = new toolPreview(x, y, CurrentLinestrength);
        } else {
            tool.positionUpdate(x, y);
        }
        if (ctx && toolPreview) {
            tool.draw(ctx);
        }
    }
});

//buttons for sticker selection
const stickerLabels: HTMLButtonElement[] = [];
const stickers = ["👽", "🌟", "🎶"];
stickers.forEach(sticker => {
    const stickerButton = document.createElement("button");
    stickerButton.textContent = sticker;
    stickerButton.addEventListener("click", () => {
        selectedSticker = sticker;
        selectionTool(stickerButton);
    });
    stickerLabels.push(stickerButton);
    app.appendChild(stickerButton);
});

//button for choosing a thinner line
const thinButton = document.createElement("button");
thinButton.textContent = "Thin";
thinButton.style.marginLeft = "-50%";
thinButton.addEventListener("click", () => {
    CurrentLinestrength = 3;
    selectionTool(thinButton);
});

//button for choosing a thicker line
const thickButton = document.createElement("button");
thickButton.textContent = "Thick";
thickButton.addEventListener("click", () => {
    CurrentLinestrength = 7;
    selectionTool(thickButton);
});

//identifies which tools the user is using. 
function selectionTool(selectedButton: HTMLButtonElement) {
    [thinButton, thickButton].forEach(button => button.classList.remove("selectedTool"));
    selectedButton.classList.add("selectedTool");
}

//click button to refresh the canvas
const clearButton = document.createElement("button");
clearButton.textContent = "clear";
clearButton.style.marginLeft = "-50%";
clearButton.addEventListener("click", () => {
    clearedMarks = [...lines]
    lines = [];
    [redo = []];
    blankSlate();
});

//click button to undo a line and sticker
const undoButton = document.createElement("button");
undoButton.textContent = "Undo";
undoButton.style.marginLeft = "1%";
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
redoButton.style.marginLeft = "0%";
redoButton.addEventListener("click", () => {
    if (redo.length > 0) {
        const prev = redo.pop();
        if (prev) lines.push(prev);
        canvas.dispatchEvent(new Event("drawing-changed"));
    } else if (clearedMarks.length > 0) {
        lines = [...clearedMarks];
        clearedMarks = [];
        canvas.dispatchEvent(new Event("drawing-changed"));
    }
});

app.appendChild(thinButton);
app.appendChild(thickButton);
app.appendChild(clearButton);
app.appendChild(undoButton);
app.appendChild(redoButton);
app.appendChild(title);
app.appendChild(canvas);
