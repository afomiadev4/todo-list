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
            task.style.alignContent = 'center';
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
            task.appendChild(checkbox);
            task.appendChild(text);
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