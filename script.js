document.addEventListener('DOMContentLoaded', () => {
    const todoValue = document.getElementById("todo-text");
    const todoDate = document.getElementById("todo-date");
    const listItem = document.getElementById("list-item");
    const addUpdateClick = document.getElementById("AddUpdateClick");
    const calendarIcon = document.querySelector(".calendar-icon");
    const completionMessage = document.getElementById("completion-message");
    const completedSound = document.getElementById('completed-sound'); 
    const toggleCompletedButton = document.getElementById('toggle-completed');


    loadTasks();

    addUpdateClick.addEventListener('click', createToDoData);
    calendarIcon.addEventListener('click', toggleCalendar);
    toggleCompletedButton.addEventListener('click', toggleCompletedTasks);

    function toggleCalendar() {
        todoDate.style.display = todoDate.style.display === "none" ? "block" : "none";
        if (todoDate.style.display === "block") {
            todoDate.focus();
        }
    }

    function createToDoData() {
        if (todoValue.value === "") {
            alert("Please enter your to-do text");
            todoValue.focus();
            return;
        }

        const selectedDate = todoDate.value || "No date";
        const priority = "Priority 1";  
        const taskId = Date.now(); 
        const task = {
            id: taskId,
            text: todoValue.value,
            date: selectedDate,
            priority: priority,
            completed: false
        };

        saveTask(task);
        renderTask(task);
        todoValue.value = "";
        todoDate.value = "";
    }

    function saveTask(task) {
        let tasks = getTasks();
        tasks.push(task);
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function getTasks() {
        return JSON.parse(localStorage.getItem('tasks')) || [];
    }

    function renderTask(task) {
        let li = document.createElement("li");
        li.dataset.id = task.id;
        li.classList.add(task.completed ? 'completed-task' : 'pending-task');
        li.style.display = task.completed ? 'none' : 'flex';

        li.innerHTML = `
            <div class="todo-content ${task.completed ? 'completed' : ''}">
                <p>Task: ${task.text}</p>
                <p>Priority: ${task.priority}</p>
                <p>Date: ${task.date}</p>
            </div>
            <div class="todo-actions">
                <input type="radio" id="task-complete-${task.id}" name="task-complete-${task.id}" class="task-complete" ${task.completed ? 'checked' : ''}>
                <label for="task-complete-${task.id}">✔</label>
                <img class="edit" src="images/edit.png" alt="Edit">
                <img class="delete" src="images/bin.png" alt="Delete">
            </div>
        `;

        listItem.appendChild(li);

        const taskComplete = li.querySelector('.task-complete');
        taskComplete.addEventListener('change', () => {
            task.completed = taskComplete.checked;
            updateTask(task);
            li.style.display = task.completed ? 'none' : 'flex'; 
            if (task.completed) {
                li.querySelector('.todo-content').classList.add('completed');
                playCompletedSound();
                showCompletionMessage();
                confettiCelebration();
            } else {
                li.querySelector('.todo-content').classList.remove('completed');
            }
        });

        const editButton = li.querySelector('.edit');
        editButton.addEventListener('click', () => {
            editTask(li, task);
        });

        const deleteButton = li.querySelector('.delete');
        deleteButton.addEventListener('click', () => {
            deleteTask(li, task.id);
        });
    }

    function updateTask(updatedTask) {
        let tasks = getTasks();
        tasks = tasks.map(task => task.id === updatedTask.id ? updatedTask : task);
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function deleteTask(li, taskId) {
        li.remove();
        let tasks = getTasks();
        tasks = tasks.filter(task => task.id !== taskId);
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasks() {
        const tasks = getTasks();
        tasks.forEach(task => {
            renderTask(task);
        });
    }

    function showCompletionMessage() {
        completionMessage.style.display = 'block';
        setTimeout(() => {
            completionMessage.style.display = 'none';
        }, 3000);
    }

    function playCompletedSound() {
        completedSound.currentTime = 0; 
        completedSound.play().catch((error) => {
            console.error('Error playing sound:', error);
        });
    }

    function confettiCelebration() {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }

    function toggleCompletedTasks() {
        const tasks = document.querySelectorAll('.completed-task');
        const buttonText = toggleCompletedButton.textContent === 'Show Completed Tasks' ? 'Hide Completed Tasks' : 'Show Completed Tasks';
        toggleCompletedButton.textContent = buttonText;
        tasks.forEach(task => {
            task.style.display = task.style.display === 'none' ? 'flex' : 'none';
        });
    }

    function editTask(li, task) {
        const contentDiv = li.querySelector('.todo-content');
        const actionsDiv = li.querySelector('.todo-actions');

        const taskText = task.text;
        const taskPriority = task.priority;
        const taskDate = task.date;

        actionsDiv.style.display = 'none';

        contentDiv.innerHTML = `
            <div class="edit-row">
                <input type="text" value="${taskText}" class="edit-input">
                <div class="edit-priority-container">
                    <div class="custom-select">
                        <div class="custom-select-trigger">${taskPriority}</div>
                        <div class="custom-select-options">
                            <div>Priority 1</div>
                            <div>Priority 2</div>
                            <div>Priority 3</div>
                        </div>
                    </div>
                </div>
                <input type="date" class="edit-date" value="${taskDate}">
            </div>
            <button class="save-button">Save</button>
            <button class="cancel-button">Cancel</button>
        `;

        const saveButton = contentDiv.querySelector('.save-button');
        saveButton.addEventListener('click', () => {
            task.text = contentDiv.querySelector('input[type="text"]').value;
            task.priority = contentDiv.querySelector('.custom-select-trigger').textContent;
            task.date = contentDiv.querySelector('.edit-date').value;
            updateTask(task);
            renderTaskUpdate(li, task);
        });

        const cancelButton = contentDiv.querySelector('.cancel-button');
        cancelButton.addEventListener('click', () => {
            renderTaskUpdate(li, task);
        });

        const selectTrigger = contentDiv.querySelector('.custom-select-trigger');
        const selectOptions = contentDiv.querySelector('.custom-select-options');

        selectTrigger.addEventListener('click', () => {
            selectOptions.style.display = selectOptions.style.display === 'none' || selectOptions.style.display === '' ? 'block' : 'none';
        });

        selectOptions.addEventListener('click', (event) => {
            if (event.target.tagName === 'DIV') {
                selectTrigger.textContent = event.target.textContent;
                const selectedOption = selectOptions.querySelector('.selected');
                if (selectedOption) {
                    selectedOption.classList.remove('selected');
                }
                event.target.classList.add('selected');
                selectOptions.style.display = 'none';
            }
        });

        document.addEventListener('click', (event) => {
            if (!contentDiv.contains(event.target)) {
                selectOptions.style.display = 'none';
            }
        });
    }

    function renderTaskUpdate(li, task) {
        const contentDiv = li.querySelector('.todo-content');
        const actionsDiv = li.querySelector('.todo-actions');

        contentDiv.innerHTML = `
            <p>Task: ${task.text}</p>
            <p>Priority: ${task.priority}</p>
            <p>Date: ${task.date}</p>
        `;

        actionsDiv.style.display = 'flex';
    }
});
