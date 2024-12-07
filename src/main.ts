import "./style.css";
const APP_NAME = "Interactive Whiteboard";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;

let checkDrawing: boolean = false;
let lines: (markerCommand | stickerpreview)[] = [];
let redo: (markerCommand | stickerpreview)[] = [];
let clearedMarks: (markerCommand | stickerpreview)[] = [];
let CurrentLinestrength: number = 3;
let tool: toolPreview | null = null;
let selectedSticker: string | null = null;
let thick: number = 7;
let size: number = 40;
let rotation: number = 0;

const stickers: string[] = ["👽", "🌟", "🎶"];

const title = document.createElement("h1");
title.textContent = APP_NAME;
title.style.textAlign = "center";
title.style.marginRight = "385px";

const canvas = document.createElement("canvas");
canvas.height = 1024;
canvas.width = 1024;

const ctx = canvas.getContext("2d");

if (ctx) {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.width);
}

//sticker containers
const Stickercontainer = document.createElement("div");
Stickercontainer.style.display = "flex";
Stickercontainer.style.justifyContent = "left";
Stickercontainer.style.gap = "15px";
Stickercontainer.style.marginLeft = "65px";

const Exportbutton = document.createElement("button");
Exportbutton.textContent = "Export image";
Exportbutton.style.display = "flex";
Exportbutton.style.justifyContent = "center";
Exportbutton.style.marginBottom = "-30px";
Exportbutton.style.marginLeft = "15px";
Exportbutton.addEventListener("click", imageExport);

//sticker buttons
const Customstickerbutton = document.createElement("button");
Customstickerbutton.textContent = "Custom sticker";
Customstickerbutton.style.marginLeft = "-50px";
Customstickerbutton.style.marginBottom = "10px"; 

Customstickerbutton.style.padding = "15px";
Customstickerbutton.addEventListener("click", Customsticker);
Stickercontainer.appendChild(Customstickerbutton);

//generates sticker buttons
function NewStickerbuttons() {
    stickerLabels.forEach((button) => button.remove());

    stickers.forEach((sticker) => {
        const stickerButton = document.createElement("button");
        stickerButton.textContent = sticker;
        stickerButton.addEventListener("click", () => {
            selectedSticker = sticker;
        });

        stickerLabels.push(stickerButton);
        Stickercontainer.appendChild(stickerButton);
    });
}

//adds to create new custom stickers by player
function Customsticker() {
    const text = prompt("Enter a custom emoji for your sticker:");
    if (text && text.trim()) {
        stickers.push(text.trim());
        NewStickerbuttons();
    } else {
        alert("No characters allowed! try again");
    }
}
//creates an export of the current canvas is downloaded as an image.
function imageExport() {
    const resolution = document.createElement("canvas");
    resolution.width = canvas.width;
    resolution.height = canvas.height;
    const resNew = resolution.getContext("2d")!;

    resNew.scale(
        resolution.width / canvas.width,
        resolution.height / canvas.height
    );
    resNew.fillStyle = "#FFFFFF";
    resNew.fillRect(0, 0, resolution.width, resolution.height);
    lines.forEach((command) => command.display(resNew));

    const anchor = document.createElement("a");
    anchor.href = resolution.toDataURL("image/png");
    anchor.download = "sketchpad.png";
    anchor.click();
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
    private size: number;
    private rotation: number;

    constructor(x: number, y: number, sticker: string, size: number, rotation: number) {
        this.x = x;
        this.y = y;
        this.sticker = sticker;
        this.size = size;
        this.rotation = rotation;
    }

    display(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.x, this.y); 
        ctx.rotate((this.rotation * Math.PI) / 180); 
        ctx.font = `${this.size}px serif`;
        ctx.fillText(this.sticker, 0, 0); 
        ctx.restore();
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
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        blankSlate();

        if (selectedSticker) {
            ctx.save();
            ctx.translate(this.x, this.y); 
            ctx.rotate((rotation * Math.PI) / 180); 
            ctx.font = `${size}px serif`;
            ctx.fillText(selectedSticker, 0, 0); 
            ctx.restore();
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

        lines.forEach((lines) => lines.display(ctx));
    }
}

canvas.addEventListener("drawing-changed", blankSlate);

//Control drawing with the mouse with applied thickness, eomoji size and rotation
canvas.addEventListener("mousedown", (event) => {
    const board = canvas.getBoundingClientRect();
    const x = event.clientX - board.left;
    const y = event.clientY - board.top;

    if (selectedSticker) {
        const sticker = new stickerpreview(x, y, selectedSticker, size, rotation);
        lines.push(sticker);
        selectedSticker = null;
    } else {
        checkDrawing = true;
        const lineRefresh = new markerCommand({ x, y }, thick);
        lines.push(lineRefresh);
        [(redo = [])];
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

//function to help organize and place sliders for adjusting values for pen thickness, emoji size and rotation
function sliderAdjustment(labels: string, val: number, min: number, max: number, step: number, willupdate: (val: number) => void): HTMLDivElement {
    
    const sliderContainer = document.createElement("div");
    sliderContainer.style.display = "flex";
    sliderContainer.style.flexDirection = "column";
    sliderContainer.style.alignItems = "center";
    sliderContainer.style.marginTop = "30px"; 
    sliderContainer.style.marginBottom = "-30px"; 

    const label = document.createElement("span")
    label.textContent = `${labels}: ${val}`;

    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = min.toString();
    slider.max = max.toString();
    slider.step = step.toString();
    slider.value = val.toString();
    slider.style.marginLeft = "10px";
    slider.addEventListener("input", () => {

        const newval = parseInt(slider.value, 10);
        label.textContent = `${labels}: ${newval}`;
        willupdate(newval);
    });

    sliderContainer.appendChild(label);
    sliderContainer.appendChild(slider);

    return sliderContainer;
}

const stickerLabels: HTMLButtonElement[] = [];

//invdividual value sliders for tools that changes based on the users choice
const thickLine = sliderAdjustment("Pen Thickness", thick, 1, 20, 1, (value) => { thick = value; });
const emojiSize = sliderAdjustment("Emoji Size", size, 10, 100, 5, (value) => { size = value; });
const stickerRotation = sliderAdjustment("Sticker Rotation", rotation, -180, 180, 1, (value) => {rotation = value;});

//click button to refresh the canvas
const clearButton = document.createElement("button");
clearButton.textContent = "clear";
clearButton.style.marginLeft = "-70%";
clearButton.addEventListener("click", () => {
    clearedMarks = [...lines];
    lines = [];
    [(redo = [])];
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
redoButton.style.marginLeft = "1%";
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

NewStickerbuttons();
app.appendChild(Stickercontainer);
app.appendChild(Exportbutton);
app.appendChild(thickLine);
app.appendChild(emojiSize);
app.appendChild(stickerRotation);
app.appendChild(clearButton);
app.appendChild(undoButton);
app.appendChild(redoButton);
app.appendChild(title);
app.appendChild(canvas);
