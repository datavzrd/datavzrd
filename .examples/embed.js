let filePath = data[0]["path"]
const img = document.createElement('img');
img.src = filePath; // Set the source to the PNG file path
img.alt = 'PNG Image'; // Optional alt text for accessibility

// Optionally, set width or height
img.width = 300; // Change as needed
img.height = 300; // Change as needed

// Insert the image into the canvas div
const canvasDiv = document.getElementById('canvas');
canvasDiv.appendChild(img);