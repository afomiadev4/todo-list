let allTasks = [];
const tasklist = document.getElementById('tasklist');
const input = document.getElementById('tasktitle');
const addbtn = document.getElementById('addbtn');

function loadTasks(){
    fetch('http://localhost:3000/todos')
    .then(response => response.json())
    .then(data => {
        allTasks = data;
        renderTasks(allTasks);
    });
}

loadTasks();

function renderTasks(tasks){
    tasklist.innerHTML = '';

    

        for(const item of tasks){
            const task = document.createElement('div');
            task.style.display = 'flex';
            task.style.alignItems = 'center';
            task.style.gap = '10px';


            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = item.completed;

            const text = document.createElement('span');
            text.textContent = item.title;

            if (item.completed){
                text.style.textDecoration = 'line-through';
                text.style.opacity = '0.5';
            }

            checkbox.addEventListener('change', () =>{
                fetch(`http://localhost:3000/todos/${item.id}`,{
                    method:'PATCH',
                    headers: {
                        'Content-Type' : 'application/json'
                    },body: JSON.stringify({
                        completed: checkbox.checked
                    })
                    
                })
                .then(loadTasks);
            });

            const deletebtn = document.createElement('button');
            deletebtn.textContent = '❌';

            deletebtn.addEventListener('click', () =>{
                fetch(`http://localhost:3000/todos/${item.id}`,{
                    method: 'DELETE',
                })
                .then(loadTasks);
            });

            const editbtn = document.createElement('button');
            editbtn.textContent = '✏️';

            editbtn.addEventListener('click', () =>{

                task.querySelectorAll('.titleInput, .descInput, .dueDateInput, .categoryInput, .savebtn').forEach(el => el.remove());

                const titleInput = document.createElement('input');
                titleInput.value = item.title;
                titleInput.placeholder = 'Title';
                titleInput.classList.add('titleInput');

                const descInput = document.createElement('input');
                descInput.value = item.description;
                descInput.placeholder = 'Add a descrption ...';
                descInput.classList.add('descInput');

                const dueDateInput = document.createElement('input');
                dueDateInput.type = 'date';
                dueDateInput.value = item.dueDate;
                dueDateInput.placeholder = 'Due Date';
                dueDateInput.classList.add('dueDateInput');

                const categoryInput = document.createElement('input');
                categoryInput.value = item.category;
                categoryInput.placeholder = 'Choose a catgeory';
                categoryInput.classList.add('categoryInput');

                const savebtn = document.createElement('button');
                savebtn.textContent = '💾';
                savebtn.classList.add('savebtn');


                savebtn.addEventListener('click', () =>{
                fetch(`http://localhost:3000/todos/${item.id}`,{
                    method:'PATCH',
                    headers: {
                        'Content-Type' : 'application/json'
                    },
                    body: JSON.stringify({
                      title: titleInput.value,
                      description: descInput.value,
                      dueDate: dueDateInput.value,
                      category: categoryInput.value
                    })
                })
               .then(loadTasks);
            })

            task.appendChild(titleInput);
            task.appendChild(descInput);
            task.appendChild(dueDateInput);
            task.appendChild(savebtn);
            task.appendChild(categoryInput);
            });

            
            task.appendChild(checkbox);
            task.appendChild(text);
            task.appendChild(deletebtn);
            task.appendChild(editbtn);
            tasklist.appendChild(task);
        }
}

//renderTasks();

const searchInput = document.getElementById('searchInput');

searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();

    const filtered = allTasks.filter(task =>
        task.title.toLowerCase().includes(query)
    );

    renderTasks(filtered);
});

addbtn.addEventListener('click', () => {
    const newtasktitle = input.value;

    if (newtasktitle.trim() === '')
        return;

    const newtask = {
        title: newtasktitle,
        description: '',
        completed: false,
        category: 'General',
        dueDate: 'N/A'
    };

    fetch('http://localhost:3000/todos',{
    method: 'POST',
    headers:{
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(newtask)
 })

 .then(response => response.json())
 .then(data => {
    input.value = '';
    loadTasks();
 })
 .catch(error => console.error('Error adding task:' , error))
 });