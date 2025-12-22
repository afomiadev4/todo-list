const tasklist = document.getElementById('tasklist');
const input = document.getElementById('tasktitle');
const addbtn = document.getElementById('addbtn');

function renderTasks(){
    tasklist.innerHTML = '';

    fetch('http://localhost:3000/todos')
    .then(response => response.json())
    .then(data => {
        for(const item of data){
            const task = document.createElement('div');
            task.style.display = 'flex';
            task.style.alignItems = 'center';
            task.style.gap = '10px';

            /*task.textContent = item.title + " " + item.completed;
            tasklist.appendChild(task);*/

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
                    },
                    body: JSON.stringify({
                        completed: checkbox.checked
                    })
                })
                .then(() => renderTasks());
            });

            const deletebtn = document.createElement('button');
            deletebtn.textContent = '❌';

            deletebtn.addEventListener('click', () =>{
                fetch(`http://localhost:3000/todos/${item.id}`,{
                    method: 'DELETE',
                })
                .then(() => renderTasks());
            });

            const editbtn = document.createElement('button');
            editbtn.textContent = '✏️';

            editbtn.addEventListener('click', () =>{
                const titleInput = document.createElement('input');
                titleInput.value = item.title;
                titleInput.placeholder = 'Title';

                const descInput = document.createElement('input');
                descInput.value = item.description;
                descInput.placeholder = 'Add a descrption ...';

                const dueDateInput = document.createElement('input');
                dueDateInput.type = 'date';
                dueDateInput.value = item.dueDate;
                dueDateInput.placeholder = 'Due Date';

                const categoryInput = document.createElement('input');
                categoryInput.value = item.category;
                categoryInput.placeholder = 'Choose a catgeory';


                const savebtn = document.createElement('button');
                savebtn.textContent = '💾';


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
                .then(() => renderTasks());
            })

            task.appendChild(titleInput);
            task.appendChild(descInput);
            task.appendChild(dueDateInput);
            task.appendChild(savebtn);
            });

            
            task.appendChild(checkbox);
            task.appendChild(text);
            task.appendChild(deletebtn);
            task.appendChild(editbtn);
            tasklist.appendChild(task);
        }
    });
}

renderTasks();


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
    console.log('Task Added:', data);
    renderTasks();
 })
 .catch(error => console.error('Error adding task:' , error))
 });