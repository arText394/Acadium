let taskList = [];
let schedule = [];
let timerInterval;
let timerDuration = 0;
let backgroundPort = chrome.runtime.connect({name: "popup"});

const difficultyBtns = document.querySelectorAll('.difficulty');
difficultyBtns.forEach(btn => btn.addEventListener('click', function() {
    difficultyBtns.forEach(btn => btn.classList.remove('selected'));
    for (let i = 0; i <= this.dataset.value - 1; i++) {
        difficultyBtns[i].classList.add('selected');
    }
}));

const timeBtns = document.querySelectorAll('.time');
timeBtns.forEach(btn => btn.addEventListener('click', function() {
    timeBtns.forEach(btn => btn.classList.remove('selected'));
    this.classList.add('selected');
}));

function renderTaskList() {
    let taskListHtml = '';
    taskList.forEach(task => {
      taskListHtml += `
        <div class="task-item">
          <button class="remove-task-btn" data-name="${task.name}">x</button>
          ${task.name}
        </div>
      `;
    });
    document.querySelector('#taskList').innerHTML = taskListHtml;
  
    const removeButtons = document.querySelectorAll('.remove-task-btn');
    removeButtons.forEach(button => button.addEventListener('click', function() {
      const taskName = this.dataset.name;
      const index = taskList.findIndex(task => task.name === taskName);
      if (index > -1) {
        taskList.splice(index, 1);
        chrome.storage.local.set({tasks: taskList}, function() {
          console.log('Task removed from storage');
          renderTaskList(); // Update the task list after removing a task
        });
      }
    }));
  }
  //////////////////////////////////////
function renderSchedule(schedule) {
    let scheduleHtml = '<table><tr><th>Time</th><th>Task Name</th></tr>';
    schedule.forEach((item, index) => {
        scheduleHtml += '<tr><td>' + item.duration + ' min</td><td>' + item.task + '</td></tr>';
        if (item.task !== 'Break' && item.time === item.time - 30 && index !== schedule.length - 1) {
            scheduleHtml += '<tr><td>5 min</td><td>Break</td></tr>';
        }
    });
    scheduleHtml += '</table>';

    document.querySelector('#scheduleList').innerHTML = scheduleHtml;
}

function formatTime(seconds) {
    if (seconds === undefined || seconds === null) {
        return '00:00';
    }
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function updateTimerDisplay() {
    document.querySelector('#timerOutput').innerText = formatTime(timeLeft);
}

// List of positive messages
const positiveMessages = [
    "You can do it!",
    "Keep going!",
    "Stay motivated.",
    "Believe in yourself",
    "Progress, not perfection",
    "Don't stop now!",
    "Push through obstacles",
    "Small steps matter",
    "You're doing great!",
    "Creativity sparks success",
    "Keep challenging yourself",
    "It's okay to struggle",
    "Practice makes perfect",
    "Don't fear mistakes",
    "Embrace the process",
    "Seek help when needed",
    "You're learning lots!",
    "Patience breeds progress",
    "Celebrate small victories",
    "Own your education",
    "Persistence pays off",
    "Stay curious, keep learning",
    "Your effort counts",
    "Set your own pace",
    "Knowledge is power",
    "Be your best",
    "You're getting there",
    "Stay determined",
    "Trust in your abilities",
    "Learning is growing",
    "Challenge equals change",
    "Stay focused",
    "Don't rush, understand",
    "You're capable, truly",
    "You'll conquer this",
    "Make your dreams happen",
    "Be brave, ask questions",
    "Every problem has solutions",
    "Show the world",
    "Confidence is key",
    "Seize the day",
    "Be patient, you'll succeed",
    "Stay open-minded",
    "The sky's the limit",
    "You're building your future",
    "Every assignment matters",
    "Be fearless in learning",
    "Keep the faith",
    "Hard work brings success",
    "Passion drives achievement",
    "You'll solve it!",
    "Embrace challenges",
    "Never give up",
    "All efforts are worthwhile",
    "You're always improving",
    "You're making progress",
    "Every detail counts",
    "Strive for excellence",
    "Master the hard stuff",
    "Take charge of learning",
    "Learn, grow, repeat",
    "Dare to be different",
    "Perseverance is key",
    "You're doing your best",
    "You're smarter every day",
    "Believe in your potential",
    "Stay committed",
    "You've got this!",
    "Trust the process",
    "Learning never ends",
    "Dare to fail",
    "Embrace your journey",
    "Remember your goals",
    "Knowledge is a treasure",
    "Respect the struggle",
    "Be proud of yourself",
    "Your time is now",
    "Progress, not perfection",
    "Rise to challenges",
    "Every question is smart",
    "Keep exploring",
    "Never stop believing",
    "Continue to shine",
    "Growth comes with practice",
    "You're a knowledge seeker",
    "Be a lifelong learner",
    "Learn from everything",
    "Make learning fun",
    "Be consistent, see improvement",
    "Every day is progress",
    "Take one step today",
    "Reach for the stars",
    "Love your learning journey",
    "Build bridges, not walls",
    "Transform dreams into reality",
    "Accept growth, deny limitations",
    "Education shapes your destiny",
    "Success is a process",
    "Keep the learning flame alive",
    "Embrace new ideas"
    
]
//////////////////////////////////////////////////////////////////////////////////////////
document.addEventListener('DOMContentLoaded', function () {
    // Load timerDuration from local storage
    chrome.storage.local.get(['tasks', 'schedule', 'timerDuration'], function (result) {
        if (result.tasks) {
            taskList = result.tasks;
            renderTaskList();
        }
        if (result.schedule) {
            schedule = result.schedule;
            renderSchedule(schedule);
        }
        // Load timer duration from storage and start the timer if it was running
        if (result.timerDuration) {
            timerDuration = result.timerDuration;
            updateTimerDisplay();
            if (timerDuration > 0) {
                chrome.runtime.sendMessage({cmd: 'start', duration: timerDuration});
            }
        }

        // Display a random positive message
        const randomIndex = Math.floor(Math.random() * positiveMessages.length);
        const positiveMessage = positiveMessages[randomIndex];
        document.getElementById('positiveMessage').innerText = positiveMessage;
    });

    document.querySelector('#addTaskBtn').addEventListener('click', function() {
        const taskNameInput = document.querySelector('#taskName');
        const difficultyBtns = document.querySelectorAll('.difficulty');
        const timeBtns = document.querySelectorAll('.time');

        const taskName = taskNameInput.value;
        const difficulty = document.querySelectorAll('.difficulty.selected').length;
        const time = parseInt(document.querySelector('.time.selected').dataset.value);

        if (!taskName || !difficulty || !time) return;

        taskList.push({
            name: taskName,
            difficulty,
            time
        });

        chrome.storage.local.set({tasks: taskList}, function() {
            console.log('Task added to storage');
        });

        renderTaskList();

        taskNameInput.value = '';
        difficultyBtns.forEach(btn => btn.classList.remove('selected'));
        timeBtns.forEach(btn => btn.classList.remove('selected'));
    });
/////////////////////////////////////////////////////////////////
    document.querySelector('#generateScheduleBtn').addEventListener('click', function() {
        const sortedTasks = [...taskList].sort((a, b) => b.difficulty - a.difficulty);
        let schedule = [];
        let remainingTime = 25;
        let currentTime = 0;
        let currentTaskTime = 0;
        let currentTaskName = '';

        sortedTasks.forEach(task => {
            let taskTime = task.time;
            while (taskTime > 0) {
                if (remainingTime <= taskTime) {
                    if (currentTaskName === task.name) {
                        schedule.push({
                            time: currentTime,
                            task: currentTaskName,
                            duration: currentTaskTime
                        });
                        currentTaskTime = 0;
                    }
                    schedule.push({
                        time: currentTime,
                        task: task.name,
                        duration: remainingTime
                    });
                    taskTime -= remainingTime;
                    currentTime += remainingTime;
                    remainingTime = 25;
                    if (taskTime > 0) {
                        schedule.push({
                            time: currentTime,
                            task: 'Break',
                            duration: 5
                        });
                        currentTime += 5;
                    }
                } else {
                    if (currentTaskName !== task.name) {
                        schedule.push({
                            time: currentTime,
                            task: task.name,
                            duration: taskTime
                        });
                        currentTaskTime = taskTime;
                        currentTaskName = task.name;
                    } else {
                        currentTaskTime += taskTime;
                    }
                    remainingTime -= taskTime;
                    taskTime = 0;
                }
            }
        });

        chrome.storage.local.set({ schedule: schedule }, function() {
            console.log('Schedule saved to storage');
            renderSchedule(schedule); // Call the function to render the schedule
        });
    });

    document.querySelector('#clearBtn').addEventListener('click', function() {
        chrome.storage.local.clear(function() {
            console.log('Data cleared from storage');
        });
        taskList = [];
        document.querySelector('#taskList').innerHTML = '';
        document.querySelector('#scheduleList').innerHTML = '';
    });
});



// Acadium Plus Color Picker Functionality
document.querySelector('#bgColor').addEventListener('input', function() {
    const bgColor = this.value;
    chrome.storage.local.set({bgColor: bgColor}, function() {
        console.log('Background color saved');
    });
    document.body.style.backgroundColor = bgColor;
});

document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.local.get(['bgColor', 'timerDuration'], function(result) {
        if (result.bgColor) {
            document.body.style.backgroundColor = result.bgColor;
            document.querySelector('#bgColor').value = result.bgColor;
        }
        if (result.timerDuration) {
            document.querySelector('#timerDuration').value = result.timerDuration;
        }
    });
    
    // Set a flag in chrome.storage.local to indicate that the popup is being opened
    chrome.storage.local.set({popupOpened: true}, function() {
        console.log('Popup opened');
    });
});

document.querySelector('#colorWheelImage').addEventListener('click', function() {
    document.querySelector('#bgColor').click();
});


document.querySelector('#resetColor').addEventListener('click', function() {
    const defaultColor = 'lightblue'; // Replace with your default color
    chrome.storage.local.set({bgColor: defaultColor}, function() {
        console.log('Background color reset');
    });
    document.body.style.backgroundColor = defaultColor;
    document.querySelector('#bgColor').value = defaultColor;
});

// Acadium Plus Pomodoro Timer

let timeLeft = 0;
let alarmSound = new Audio(chrome.runtime.getURL("acadiumalarm.mp3"));

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.cmd === 'tick') {
        timeLeft = request.timeLeft;
        document.querySelector('#timerOutput').innerText = formatTime(timeLeft);
        if (timeLeft <= 0) {
            document.querySelector('#timerOutput').classList.add('blink');
        }
    } else if (request.cmd === 'playAlarm') {
        alarmSound.play();
    }
});

document.querySelector('#startPauseResumeBtn').addEventListener('click', function() {
    if (this.innerText === 'Start' || this.innerText === 'Resume') {
        const timerDuration = document.querySelector('#timerDuration').value;
        chrome.runtime.sendMessage({cmd: 'start', duration: timerDuration});
        this.innerText = 'Pause';
        chrome.storage.local.set({buttonState: 'Pause'});
    } else if (this.innerText === 'Pause') {
        chrome.runtime.sendMessage({cmd: 'pause'});
        this.innerText = 'Resume';
        chrome.storage.local.set({buttonState: 'Resume'});
    }
});

chrome.storage.local.get(['buttonState'], function(result) {
    if (result.buttonState) {
        document.querySelector('#startPauseResumeBtn').innerText = result.buttonState;
    } 
});

chrome.runtime.sendMessage({cmd: 'getTimeLeft'}, function(response) {
    if (chrome.runtime.lastError) {
        // An error occurred
        console.log(chrome.runtime.lastError.message);
    } else {
        // No error occurred, the popup is open and received the message
        if (response.timeLeft) {
            timeLeft = response.timeLeft;
            document.querySelector('#timerOutput').innerText = formatTime(timeLeft);
        } else {
            document.querySelector('#timerOutput').innerText = '00:00';
        }
    }
});


document.querySelector('#cancelBtn').addEventListener('click', function() {
    chrome.runtime.sendMessage({cmd: 'cancel'});
    document.querySelector('#startPauseResumeBtn').innerText = 'Start';
    document.querySelector('#timerOutput').innerText = '';
    document.querySelector('#timerDuration').value = '25'; // Reset the dropdown selection
    timeLeft = 0; // Reset the timer state
});

chrome.runtime.sendMessage({cmd: 'getTimeLeft'}, function(response) {
    timeLeft = response.timeLeft;
    document.querySelector('#timerOutput').innerText = formatTime(timeLeft);
});
