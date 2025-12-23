let allTasks = [];
function getCategories() {
    const cats = allTasks
        .map(task => task.category)
        .filter(Boolean);

    return [...new Set(cats)];
}


let activeTaskId = null;
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


document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
  }
});


// Load all tasks from the server
function loadTasks() {
    fetch('http://localhost:3000/todos')
        .then(res => res.json())
        .then(data => {
            allTasks = data;
            renderTasks(allTasks);
        });
}
function isMobile() {
    return window.innerWidth < 768
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
            if (e.target.tagName === 'INPUT') return;
            document.querySelectorAll('.task').forEach(t => t.classList.remove('selected'));
            task.classList.add('selected');

            if (activeTaskId === item.id) {
                taskDetails.classList.remove('active');
                document.classList.remove('panel-remove')
                activeTaskId = null;
                return;
            }
            activeTaskId = item.id;
            showTaskDetails(item);
        });

        task.appendChild(checkbox);
        task.appendChild(text);
        tasklist.appendChild(task);
    });
}

// Show task details in drawer
function showTaskDetails(item) {
    taskDetails.classList.toggle('completed', item.completed);
    detTitle.textContent = item.title;
    detDescription.textContent = 
        item.description && item.description.trim() !== ''
        ?item.description
        :'None';
    detDue.textContent = item.dueDate || 'Add a due date';
    detCategory.textContent = item.category || 'None';

    // Set completed checkbox
    completeCheckbox.checked = item.completed;
    completeCheckbox.onchange = () => {
        fetch(`http://localhost:3000/todos/${item.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed: completeCheckbox.checked })
        }).then(() => {
            taskDetails.classList.toggle('completed', completeCheckbox.checked);
            loadTasks();
        });
    };

    // Edit button
    editBtn.onclick = () => {
        
        if (taskDetails.classList.contains('editing')) return;
        taskDetails.classList.add('editing');

        editBtn.style.display = 'none';
        deleteBtn.style.display = 'none';

        const titleInput = document.createElement('input');
        titleInput.value = item.title;
        titleInput.placeholder = 'Title';

        const descInput = document.createElement('input');
        descInput.value = item.description;
        descInput.placeholder = 'Add a description...';

        const dueInput = document.createElement('input');
        dueInput.type = 'date';
        dueInput.value = item.dueDate;

        const categoryWrapper = document.createElement('div');
        categoryWrapper.style.display = 'flex';
        categoryWrapper.style.flexDirection = 'column';
        categoryWrapper.style.gap = '6px';
        // Category dropdown
        const categorySelect = document.createElement('select');

        getCategories().forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            if (cat === item.category) option.selected = true;
            categorySelect.appendChild(option);
        });

        // Add "new category" option
        const addNewOption = document.createElement('option');
        addNewOption.value = '__new__';
        addNewOption.textContent = '➕ Add new category';
        categorySelect.appendChild(addNewOption);

        // New category input (hidden by default)
        const newCategoryInput = document.createElement('input');
        newCategoryInput.placeholder = 'New category';
        newCategoryInput.style.display = 'none';

        categorySelect.addEventListener('change', () => {
            newCategoryInput.style.display =
                categorySelect.value === '__new__' ? 'block' : 'none';
        });

        categoryWrapper.appendChild(categorySelect);
        categoryWrapper.appendChild(newCategoryInput);

        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Save';
        saveBtn.classList.add('save-btn');

        // Save on Enter (but allow Shift+Enter for description)
        taskDetails.addEventListener('keydown', function onEnterSave(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                saveBtn.click();
                taskDetails.removeEventListener('keydown', onEnterSave);
            }
        });

        // Replace text with inputs
        detTitle.replaceWith(titleInput);
        detDescription.replaceWith(descInput);
        detDue.replaceWith(dueInput);
        detCategory.replaceWith(categoryWrapper);
        taskDetails.appendChild(saveBtn);

        saveBtn.addEventListener('click', () => {
            const finalCategory =
            categorySelect.value === '__new__'
                ? newCategoryInput.value.trim() || 'General'
                : categorySelect.value;

            fetch(`http://localhost:3000/todos/${item.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: titleInput.value,
                    description: descInput.value,
                    dueDate: dueInput.value,
                    category: finalCategory
                })
            }).then(() => {
                detTitle.textContent = titleInput.value;
                detDescription.textContent = descInput.value;
                detDue.textContent = dueInput.value;
                detCategory.textContent = finalCategory;

                titleInput.replaceWith(detTitle);
                descInput.replaceWith(detDescription);
                dueInput.replaceWith(detDue);
                categoryWrapper.replaceWith(detCategory);
                saveBtn.remove();

                editBtn.style.display = 'inline-flex';
                deleteBtn.style.display = 'inline-flex';

                taskDetails.classList.remove('editing');
                loadTasks();
            });
        });
    };

    // Delete button
    deleteBtn.onclick = () => {
        fetch(`http://localhost:3000/todos/${item.id}`, { method: 'DELETE' })
            .then(() => {
                taskDetails.classList.remove('active', 'inline');
                document.body.classList.remove('panel-open');
                activeTaskId = null;
                loadTasks();
            });
    };

    if (isMobile()) {
        const taskEl = document.querySelector('.task.selected');
        if (taskEl) {
            taskEl.after(taskDetails);
            taskDetails.classList.add('inline', 'active');
            document.body.classList.remove('panel-open')
        }
    } else {
        document.body.appendChild(taskDetails);
        taskDetails.classList.remove('inline');
        taskDetails.classList.add('active');

        document.body.classList.add('panel-open');
    }
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


const darkModeBtn = document.getElementById('darkMode');

darkModeBtn.addEventListener('click', () =>{
    document.body.classList.toggle('dark');

    if(document.body.classList.contains('dark')){
        localStorage.setItem('theme', 'dark');
        darkModeBtn.textContent = '☀️';
    }
    else{
        localStorage.setItem('theme', 'light');
        darkModeBtn.textContent = '🌙';
    }
});


// Initial load
loadTasks();
