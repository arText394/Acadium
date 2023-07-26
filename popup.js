let taskList = [];
let schedule = [];

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
    "Embrace new ideas",
    // Add all the other positive messages here...
];

document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.local.get(['tasks', 'schedule'], function(result) {
        if (result.tasks) {
            taskList = result.tasks;
            renderTaskList();
        }
        if (result.schedule) {
            schedule = result.schedule;
            renderSchedule(schedule);
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

function renderTaskList() {
    let taskListHtml = '';
    taskList.forEach(task => {
        taskListHtml += '<input type="checkbox" class="taskCheckbox" data-name="' + task.name + '"> ' + task.name + '<br>';
    });
    document.querySelector('#taskList').innerHTML = taskListHtml;

    const checkboxes = document.querySelectorAll('.taskCheckbox');
    checkboxes.forEach(checkbox => checkbox.addEventListener('change', function() {
        if (this.checked) {
            this.parentNode.style.textDecoration = 'line-through';
            this.parentNode.style.color = 'grey';
            this.parentNode.style.fontStyle = 'italic';
            const index = taskList.findIndex(task => task.name === this.dataset.name);
            if (index > -1) {
                taskList.splice(index, 1);
                chrome.storage.local.set({tasks: taskList}, function() {
                    console.log('Task removed from storage');
                });
            }
        } else {
            this.parentNode.style.textDecoration = 'none';
            this.parentNode.style.color = 'black';
            this.parentNode.style.fontStyle = 'normal';
        }
    }));
}

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

