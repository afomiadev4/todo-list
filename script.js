let allTasks = [];
const tasklist = document.getElementById('tasklist');
const taskDetails = document.getElementById('taskDetails');
const detTitle = document.querySelector('.title');
const detDescription = document.querySelector('.description');
const detDue = document.querySelector('.due-date');
const detCategory = document.querySelector('.category');
const input = document.getElementById('tasktitle');
const addbtn = document.getElementById('addbtn');
const searchInput = document.getElementById('searchInput');
const editBtn = taskDetails.querySelector('#editTaskBtn');
const deleteBtn = taskDetails.querySelector('#deleteTaskBtn');
const completeCheckbox = taskDetails.querySelector('#completeTaskCheckbox');

// Load all tasks from the server
function loadTasks() {
    fetch('http://localhost:3000/todos')
        .then(res => res.json())
        .then(data => {
            allTasks = data;
            renderTasks(allTasks);
        });
}

// Render the task list
function renderTasks(tasks) {
    tasklist.innerHTML = '';
    tasks.forEach(item => {
        const task = document.createElement('div');
        task.classList.add('task');
        task.style.display = 'flex';
        task.style.alignItems = 'center';
        task.style.gap = '10px';
        task.style.padding = '8px';
        task.style.cursor = 'pointer';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = item.completed;

        const text = document.createElement('span');
        text.textContent = item.title;
        if (item.completed) {
            text.style.textDecoration = 'line-through';
            text.style.opacity = '0.5';
        }

        // Task checkbox change
        checkbox.addEventListener('change', e => {
            e.stopPropagation();
            fetch(`http://localhost:3000/todos/${item.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed: checkbox.checked })
            }).then(loadTasks);
        });

        // Click task to show details
        task.addEventListener('click', e => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;
            showTaskDetails(item);
        });

        task.appendChild(checkbox);
        task.appendChild(text);
        tasklist.appendChild(task);
    });
}

// Show task details in drawer
function showTaskDetails(item) {
    detTitle.textContent = item.title;
    detDescription.textContent = item.description || 'No description';
    detDue.textContent = item.dueDate || 'N/A';
    detCategory.textContent = item.category || 'General';

    // Set completed checkbox
    completeCheckbox.checked = item.completed;
    completeCheckbox.onchange = () => {
        fetch(`http://localhost:3000/todos/${item.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed: completeCheckbox.checked })
        }).then(loadTasks);
    };

    // Edit button
    editBtn.onclick = () => {
        const titleInput = document.createElement('input');
        titleInput.value = item.title;
        titleInput.placeholder = 'Title';

        const descInput = document.createElement('input');
        descInput.value = item.description;
        descInput.placeholder = 'Description';

        const dueInput = document.createElement('input');
        dueInput.type = 'date';
        dueInput.value = item.dueDate;

        const categoryInput = document.createElement('input');
        categoryInput.value = item.category;
        categoryInput.placeholder = 'Category';

        const saveBtn = document.createElement('button');
        saveBtn.textContent = '💾 Save';

        // Replace text with inputs
        detTitle.replaceWith(titleInput);
        detDescription.replaceWith(descInput);
        detDue.replaceWith(dueInput);
        detCategory.replaceWith(categoryInput);
        taskDetails.appendChild(saveBtn);

        saveBtn.addEventListener('click', () => {
            fetch(`http://localhost:3000/todos/${item.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: titleInput.value,
                    description: descInput.value,
                    dueDate: dueInput.value,
                    category: categoryInput.value
                })
            }).then(() => {
                detTitle.textContent = titleInput.value;
                detDescription.textContent = descInput.value;
                detDue.textContent = dueInput.value;
                detCategory.textContent = categoryInput.value;

                titleInput.replaceWith(detTitle);
                descInput.replaceWith(detDescription);
                dueInput.replaceWith(detDue);
                categoryInput.replaceWith(detCategory);
                saveBtn.remove();
                loadTasks();
            });
        });
    };

    // Delete button
    deleteBtn.onclick = () => {
        fetch(`http://localhost:3000/todos/${item.id}`, { method: 'DELETE' })
            .then(() => {
                taskDetails.classList.remove('active');
                loadTasks();
            });
    };

    taskDetails.classList.add('active');
}

// Search
if (searchInput) {
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        const filtered = allTasks.filter(task =>
            task.title.toLowerCase().includes(query)
        );
        renderTasks(filtered);
    });
}

// Add task
addbtn.addEventListener('click', () => {
    const newtasktitle = input.value.trim();
    if (!newtasktitle) return;

    const newtask = { title: newtasktitle, description: '', completed: false, category: 'General', dueDate: '' };

    fetch('http://localhost:3000/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newtask)
    }).then(() => {
        input.value = '';
        loadTasks();
    }).catch(err => console.error('Error adding task:', err));
});
input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        addbtn.click();
    }
});


// Initial load
loadTasks();
