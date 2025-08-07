// Background service worker for message handling

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'colorPicked') {
        // Forward the color to the popup
        chrome.runtime.sendMessage(message);
    }
});