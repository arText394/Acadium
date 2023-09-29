let timerId;
let timeLeft;
let popupPort = null;

chrome.runtime.onConnect.addListener(function(port) {
    if (port.name === "popup") {
        popupPort = port;
        port.onDisconnect.addListener(function() {
            popupPort = null;
        });
    }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.cmd === 'start') {
        clearInterval(timerId);
        const timerDuration = request.duration * 60;
        // Save the timer duration to chrome.storage.local
        chrome.storage.local.set({timerDuration: request.duration});
        if (!timeLeft) {
            timeLeft = timerDuration;
        }

        // Check if the popup is being opened
        chrome.storage.local.get(['popupOpened'], function(result) {
            if (result.popupOpened) {
                // If the popup is being opened, don't start the timer
                chrome.storage.local.remove('popupOpened', function() {
                    console.log('Popup opened flag removed');
                });
            } else {
                // If the popup is not being opened, start the timer
                timerId = setInterval(function() {
                    timeLeft--;
                    if (timeLeft <= 0) {
                        clearInterval(timerId);
                        // Send a message to play the alarm sound
                        chrome.runtime.sendMessage({cmd: 'playAlarm'});
                        timeLeft = 0;
                        // Show the browser notification
                        chrome.notifications.create({
                            type: 'basic',
                            iconUrl: 'images/logo48.png', // Replace with the path to your icon
                            title: 'Pomodoro Timer',
                            message: 'Time is up!',
                            silent: false // Setting this to false will play the system's default notification sound
                        });
                    }
                    if (popupPort) {
                        // Popup is open, send message to popup
                        chrome.runtime.sendMessage({cmd: 'tick', timeLeft: timeLeft});
                    }
                }, 1000);
            }
        });
    } else if (request.cmd === 'pause') {
        clearInterval(timerId);
    } else if (request.cmd === 'cancel') {
        clearInterval(timerId);
        timeLeft = null;
    } else if (request.cmd === 'getTimeLeft') {
        sendResponse({timeLeft: timeLeft});
    }
});
