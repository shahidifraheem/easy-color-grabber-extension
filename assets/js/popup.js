document.getElementById('pickColor').addEventListener('click', async () => {
    try {
        if ('EyeDropper' in window) {
            const eyeDropper = new EyeDropper();
            const result = await eyeDropper.open();
            updateColorDisplay(result.sRGBHex);
        } else {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    files: ['assets/js/content.js']
                });
            });
        }
    } catch (err) {
        console.error("Error picking color:", err);
    }
});

function updateColorDisplay(colorHex) {
    const colorPreview = document.getElementById('colorPreview');
    const hexValue = document.getElementById('hexValue');
    const rgbValue = document.getElementById('rgbValue');
    const hslValue = document.getElementById('hslValue');

    // Update preview and values
    colorPreview.style.backgroundColor = colorHex;
    hexValue.textContent = colorHex;

    const rgb = hexToRgb(colorHex);
    rgbValue.textContent = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    hslValue.textContent = `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;

    // Automatically copy HEX value
    copyWithFeedback(colorHex, hexValue);

    addToHistory(colorHex);
}

// New function to handle copying with visual feedback
function copyWithFeedback(textToCopy, element) {
    const originalText = element.textContent;

    navigator.clipboard.writeText(textToCopy).then(() => {
        // Visual feedback on the HEX value
        element.textContent = 'Copied!';
        element.style.color = '#4CAF50';
        element.style.fontWeight = 'bold';

        // Reset after 1.5 seconds
        setTimeout(() => {
            element.textContent = originalText;
            element.style.color = '';
            element.style.fontWeight = '';
        }, 1500);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
}

function addToHistory(color) {
    const history = JSON.parse(localStorage.getItem('colorHistory') || '[]');
    if (!history.includes(color)) {
        history.unshift(color);
        if (history.length > 10) history.pop();
        localStorage.setItem('colorHistory', JSON.stringify(history));
    }
    renderHistory();
}

function renderHistory() {
    const historyContainer = document.getElementById('colorHistory');
    const history = JSON.parse(localStorage.getItem('colorHistory') || '[]');
    historyContainer.innerHTML = '';

    history.forEach(color => {
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch';
        swatch.style.backgroundColor = color;
        swatch.title = color;
        swatch.addEventListener('click', () => {
            updateColorDisplay(color);
        });
        historyContainer.appendChild(swatch);
    });
}

// Copy functionality
document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const targetId = e.target.getAttribute('data-target');
        const textToCopy = document.getElementById(targetId).textContent;

        navigator.clipboard.writeText(textToCopy).then(() => {
            e.target.textContent = 'Copied!';
            e.target.classList.add('copied');

            setTimeout(() => {
                e.target.textContent = 'Copy';
                e.target.classList.remove('copied');
            }, 1500);
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    });
});

// Initialize
renderHistory();