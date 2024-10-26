import "./style.css";

const APP_NAME = "Steven's game";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;

let checkDrawing: boolean = false;

const title = document.createElement("h1");
title.textContent = APP_NAME;
title.style.textAlign = "center";
title.style.marginTop = "20px";  

const canvas = document.createElement("canvas");
canvas.height = 256; 
canvas.width = 256;

const ctx = canvas.getContext("2d");

if (ctx) {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, 256, 256); 
} 

//clears drawings on canvas
function blankSlate() {
    if (ctx) {
        ctx.clearRect(0,0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.fillRect(0,0, canvas.width, canvas.height);
    }
}

//Control drawing with the mouse
canvas.addEventListener("mousedown", () => (checkDrawing = true));
canvas.addEventListener("mouseup", () => (checkDrawing = false));
canvas.addEventListener("mousemove", (event) => {
    if (checkDrawing && ctx) {
        const board = canvas.getBoundingClientRect();
        const x = event.clientX - board.left;
        const y = event.clientY - board.top;
        
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);  
        ctx.fill();
    }

});

//click button to refresh the canvas
const clearButton = document.createElement("button");
  clearButton.id = "myButton"; 
  clearButton.textContent = "clear"; 
  clearButton.style.marginLeft = "50px";
  
  clearButton.addEventListener("click", () => {
   blankSlate();
});

app.appendChild(title);
app.appendChild(canvas);
app.append(clearButton);
