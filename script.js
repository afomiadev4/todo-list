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



function loadTasks(){
    fetch('http://localhost:3000/todos')
    .then(response => response.json())
    .then(data => {
        allTasks = data;
        renderTasks(allTasks);
    });
}


function renderTasks(tasks){
    tasklist.innerHTML = '';

        for(const item of tasks){
            const task = document.createElement('div');
            task.classList.add('task');
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

            checkbox.addEventListener('change', (e) =>{

                e.stopPropagation();

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

            task.addEventListener('click', (e) => {
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;

                showTaskDetails(item);
            });

            tasklist.appendChild(task);
            task.appendChild(checkbox);
            task.appendChild(text);

           

            

            

        

            task.appendChild(titleInput);
            task.appendChild(descInput);
            task.appendChild(dueDateInput);
            task.appendChild(categoryInput);
            
           
            

            
            
            
           
        }
}

function showTaskDetails(item) {

  detTitle.textContent = item.title;
  detDescription.textContent = item.description || 'No description';
  detDue.textContent = item.dueDate || 'N/A';
  detCategory.textContent = item.category || 'General';

  const existingBtns = taskDetails.querySelectorAll('.details-btn');
  existingBtns.forEach(btn => btn.remove());

  const editbtn = document.createElement('button');
  editbtn.textContent = 'Edit';
  editbtn.classList.add('details-btn');

      editbtn.addEventListener('click', (e) =>{

                e.stopPropagation();

                //task.querySelectorAll('.titleInput, .descInput, .dueDateInput, .categoryInput, .savebtn').forEach(el => el.remove());

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
                savebtn.classList.add('details-btn');

                detTitle.replaceWith(titleInput);
                detDescription.replaceWith(descInput);
                detDue.replaceWith(dueDateInput);
                detCategory.replaceWith(categoryInput);

                task.appendChild(savebtn);


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

                .then(() =>{
                    detTitle.textContent = titleInput.value;
                    detDescription.textContent = descInput.value;
                    detDue.textContent = dueDateInput.value;
                    detCategory.textContent = categoryInput.value;

                    titleInput.replaceWith(detTitle);
                    descInput.replaceWith(detDescription);
                    dueDateInput.replaceWith(detDue);
                    categoryInput.replaceWith(detCategory);
                    savebtn.remove();
                    loadTasks();
                });
            });
        });

        const deletebtn = document.createElement('button');
            deletebtn.textContent = '❌ Delete';
            deletebtn.classList.add('details-btn');
            deletebtn.addEventListener('click', (e) =>{
                e.stopPropagation();

                fetch(`http://localhost:3000/todos/${item.id}`,{
                    method: 'DELETE',
                })
                .then(( => {
                    taskDetails.classList.remove('active');
                    loadTasks();
                }));
            });

      task.appendChild(editbtn);
      task.appendChild(deletebtn);
      
  taskDetails.classList.add('active');
}




if(searchInput){
searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();

    const filtered = allTasks.filter(task =>
        task.title.toLowerCase().includes(query)
    );

    renderTasks(filtered);
});
}

addbtn.addEventListener('click', () => {
    const newtasktitle = input.value;

    if (newtasktitle.trim() === '')
        return;

    const newtask = {
        title: newtasktitle,
        description: '',
        completed: false,
        category: 'General',
        dueDate: ''
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

 loadTasks();