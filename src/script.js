document.addEventListener("DOMContentLoaded", function() {
  const canvas = document.getElementById("drawingCanvas");
  const ctx = canvas.getContext("2d");
  let isDrawing = false;
  let startX, startY, endX, endY;
  let shapeType = "";
  let currentColor = "#000"; // Default color is black
  let unit = "pixels"; // Default unit is pixels
  let shapes = []; // Array to store drawn shapes
  let selectedShape = null;
  let dragStartX, dragStartY;

  canvas.width = window.innerWidth - 20;
  canvas.height = window.innerHeight - 100;

  // Draw graph
  drawGraph();

  // Event listeners for drawing shapes
  document.getElementById("lineBtn").addEventListener("click", () => {
    shapeType = "line";
  });

  document.getElementById("rectBtn").addEventListener("click", () => {
    shapeType = "rect";
  });

  document.getElementById("triBtn").addEventListener("click", () => {
    shapeType = "tri";
  });

  // Add event listeners for other shape buttons

  canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    startX = e.offsetX;
    startY = e.offsetY;
    dragStartX = startX;
    dragStartY = startY;

    if (shapeType === "") {
      // Check if any shape is clicked
      selectedShape = getSelectedShape(startX, startY);
    }
  });

  canvas.addEventListener("mousemove", (e) => {
    if (isDrawing) {
      endX = e.offsetX;
      endY = e.offsetY;
      drawShape(startX, startY, endX, endY, currentColor);
    } else if (selectedShape) {
      const dx = e.offsetX - dragStartX;
      const dy = e.offsetY - dragStartY;
      selectedShape.x1 += dx;
      selectedShape.x2 += dx;
      selectedShape.y1 += dy;
      selectedShape.y2 += dy;
      dragStartX = e.offsetX;
      dragStartY = e.offsetY;
      redraw();
    }
  });

  canvas.addEventListener("mouseup", () => {
    if (isDrawing) {
      isDrawing = false;
      storeShape(startX, startY, endX, endY, currentColor);
    }
  });

  // Clear canvas button
  document.getElementById("clearBtn").addEventListener("click", () => {
    shapes = []; // Clear shapes array
    redraw();
  });

  // Color buttons
  document.querySelectorAll(".colorBtn").forEach(button => {
    button.addEventListener("click", () => {
      currentColor = button.style.backgroundColor;
    });
  });

  // Save canvas button
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "s") {
      e.preventDefault();
      downloadCanvas();
    } else if (e.ctrlKey && e.key === "z") {
      undo();
    } else if (e.ctrlKey && e.key === "a") {
      e.preventDefault();
      selectAll();
    } else if (e.ctrlKey && e.key === "c") {
      copy();
    } else if (e.ctrlKey && e.key === "v") {
      paste();
    } else if (e.ctrlKey && e.key === "x") {
      cut();
    }
  });

  // Drawing function
  function drawShape(x1, y1, x2, y2, color) {
    redraw(); // Clear canvas and redraw all stored shapes

    switch (shapeType) {
      case "line":
        drawLine(x1, y1, x2, y2, color);
        break;
      case "rect":
        drawRect(x1, y1, x2, y2, color);
        break;
      case "tri":
        drawTri(x1, y1, x2, y2, color);
        break;
      // Add cases for other shapes
      default:
        break;
    }
  }

  function drawLine(x1, y1, x2, y2, color) {
    ctx.strokeStyle = color; // Set drawing color
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  function drawRect(x1, y1, x2, y2, color) {
    ctx.strokeStyle = color; // Set drawing color
    ctx.beginPath();
    ctx.rect(x1, y1, x2 - x1, y2 - y1);
    ctx.stroke();
  }

  function drawTri(x1, y1, x2, y2, color) {
    ctx.strokeStyle = color; // Set drawing color
    ctx.beginPath();
    ctx.moveTo(x1, y1); // Starting point
    ctx.lineTo((x1 + x2) / 2, y2); // Top point
    ctx.lineTo(x2, y1); // Right point
    ctx.closePath(); // Connects last point to first
    ctx.stroke();
  }

  // Store the drawn shape
  function storeShape(x1, y1, x2, y2, color) {
    shapes.push({ type: shapeType, x1, y1, x2, y2, color });
  }

  // Redraw all stored shapes
  function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGraph(); // Redraw graph

    shapes.forEach(shape => {
      switch (shape.type) {
        case "line":
          drawLine(shape.x1, shape.y1, shape.x2, shape.y2, shape.color);
          break;
        case "rect":
          drawRect(shape.x1, shape.y1, shape.x2, shape.y2, shape.color);
          break;
        case "tri":
          drawTri(shape.x1, shape.y1, shape.x2, shape.y2, shape.color);
          break;
        // Add cases for other shapes
        default:
          break;
      }
    });
  }

  // Function to draw graph lines
  function drawGraph() {
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 0.5;

    // Draw horizontal lines
    for (let y = 10; y < canvas.height; y += 10) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw vertical lines
    for (let x = 10; x < canvas.width; x += 10) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
  }

  // Function to download canvas content as an image
  function downloadCanvas() {
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "canvas_image.png";
    link.click();
  }

  // Undo function
  function undo() {
    if (shapes.length > 0) {
      shapes.pop(); // Remove the last shape
      redraw(); // Redraw canvas without the last shape
    }
  }

  // Select all shapes except buttons and other ignored elements
  function selectAll() {
    shapes.forEach(shape => {
      if (!["button", "ignore"].some(className => shape.element.classList.contains(className))) {
        shape.selected = true;
      }
    });
    redraw();
  }

  // Copy selected shapes
  function copy() {
    const copiedShapes = shapes.filter(shape => shape.selected);
    localStorage.setItem("copiedShapes", JSON.stringify(copiedShapes));
  }

  // Paste copied shapes
  function paste() {
    const copiedShapes = JSON.parse(localStorage.getItem("copiedShapes"));
    copiedShapes.forEach(shape => {
      shape.selected = false; // Deselect copied shapes
      shapes.push(shape); // Add copied shapes to the canvas
    });
    redraw(); // Redraw canvas with pasted shapes
  }

  // Cut selected shapes
  function cut() {
    const selectedShapes = shapes.filter(shape => shape.selected);
    localStorage.setItem("cutShapes", JSON.stringify(selectedShapes));

    // Remove selected shapes from the canvas
    shapes = shapes.filter(shape => !shape.selected);
    redraw(); // Redraw canvas without the cut shapes
  }

  // Function to get the selected shape
  function getSelectedShape(x, y) {
    for (let i = shapes.length - 1; i >= 0; i--) {
      const shape = shapes[i];
      if (x >= shape.x1 && x <= shape.x2 && y >= shape.y1 && y <= shape.y2) {
        return shape;
      }
    }
    return null;
  }
});
