// This is a fallback color picker implementation
// that will be used if the EyeDropper API is not available

document.addEventListener('click', (e) => {
    if (window.hasColorPickerActive) {
        e.preventDefault();
        e.stopPropagation();

        // Get the color of the clicked element
        const color = getColorAtPosition(e);

        // Send the color back to the popup
        chrome.runtime.sendMessage({ type: 'colorPicked', color });

        // Clean up
        document.body.style.cursor = '';
        window.hasColorPickerActive = false;
        document.removeEventListener('click', arguments.callee);
    }
});

function getColorAtPosition(e) {
    // Create a canvas to sample the color
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const pixelRatio = window.devicePixelRatio || 1;

    canvas.width = 1;
    canvas.height = 1;

    // Adjust coordinates for device pixel ratio
    const x = e.clientX * pixelRatio;
    const y = e.clientY * pixelRatio;

    // Draw the pixel at the clicked position
    ctx.drawImage(
        document,
        x, y, 1, 1,
        0, 0, 1, 1
    );

    // Get the pixel data
    const pixel = ctx.getImageData(0, 0, 1, 1).data;

    // Convert to hex
    return rgbToHex(pixel[0], pixel[1], pixel[2]);
}

function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'activatePicker') {
        window.hasColorPickerActive = true;
        document.body.style.cursor = 'crosshair';
    }
});