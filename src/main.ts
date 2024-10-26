import "./style.css";

const APP_NAME = "Steven's game";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;
app.innerHTML = APP_NAME;

const canvas = document.createElement("canvas");
canvas.height = 256; 
canvas.width = 256;

const ctx = canvas.getContext("2d");

if (ctx) {
    ctx.fillStyle = "blue";
    ctx.fillRect(0, 0, 256, 256); 
} 

app.appendChild(canvas);


