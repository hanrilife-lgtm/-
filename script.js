// ============================================================
//  ВЕСЬ JavaScript С ПОДРОБНЫМИ КОММЕНТАРИЯМИ
// ============================================================

document.addEventListener('DOMContentLoaded', function() {

    const taskList = document.getElementById('taskList');
    const addBtn = document.querySelector('.btn');
    const percentDisplay = document.getElementById('percentDisplay');
    const fractionDisplay = document.getElementById('fractionDisplay');
    const progressFill = document.getElementById('progressFill');

    const STORAGE_KEY = 'moveit_tasks';
    let tasks = [];

    // ----- Загрузка / сохранение -----
    function loadTasks() {
        const stored = localStorage.getItem(STORAGE_KEY);
        tasks = stored ? JSON.parse(stored) : [];
    }

    function saveTasks() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }

    // ----- Прогресс -----
    function updateProgress() {
        const total = tasks.length;
        const done = tasks.filter(t => t.done).length;
        let percent = 0;
        if (total > 0) percent = Math.round((done / total) * 100);
        percentDisplay.textContent = percent + '%';
        fractionDisplay.textContent = done + ' из ' + total;
        progressFill.style.width = percent + '%';
    }

    // ----- Рендеринг -----
    function render() {
        taskList.innerHTML = '';

        if (tasks.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'card-right';
            emptyMsg.style.justifyContent = 'center';
            emptyMsg.style.color = '#6B6B6B';
            emptyMsg.style.fontSize = '18px';
            emptyMsg.textContent = 'Пока нет задач. Добавь первую!';
            taskList.appendChild(emptyMsg);
            updateProgress();
            return;
        }

        tasks.forEach(function(task) {
            const card = document.createElement('div');
            card.className = 'card-right';
            if (task.done) card.classList.add('done');

            const zag = document.createElement('div');
            zag.className = 'zag';

            // Левая часть — название (двойной клик → редактирование)
            const left = document.createElement('div');
            left.className = 'zag-one';
            const h2 = document.createElement('h2');
            h2.textContent = task.title;
            // Добавляем обработчик двойного клика на название
            h2.addEventListener('dblclick', function(e) {
                e.stopPropagation(); // чтобы не сработал клик по карточке
                editTask(task.id);
            });
            left.appendChild(h2);

            // Правая часть — действие и статус
            const right = document.createElement('div');
            right.className = 'zag-too';
            const actionH2 = document.createElement('h2');
            actionH2.textContent = 'Действие';
            const p = document.createElement('p');
            p.textContent = task.done ? 'да' : 'нет';
            right.appendChild(actionH2);
            right.appendChild(p);

            // Кнопка удаления (крестик)
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = '×';
            deleteBtn.title = 'Удалить задачу';
            deleteBtn.addEventListener('click', function(e) {
                e.stopPropagation(); // не переключать статус
                deleteTask(task.id);
            });

            // Сборка карточки
            zag.appendChild(left);
            zag.appendChild(right);
            card.appendChild(zag);
            card.appendChild(deleteBtn);
            card.dataset.id = task.id;

            taskList.appendChild(card);
        });

        updateProgress();
    }

    // ----- Добавление задачи -----
    function addTask() {
        const title = prompt('Что сегодня сделаем?');
        if (title === null || title.trim() === '') return;
        const newTask = {
            id: Date.now(),
            title: title.trim(),
            done: false
        };
        tasks.push(newTask);
        saveTasks();
        render();
    }

    // ----- Переключение статуса -----
    function toggleTask(taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            task.done = !task.done;
            saveTasks();
            render();
        }
    }

    // ----- Редактирование названия (НОВОЕ) -----
    function editTask(taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;
        const newTitle = prompt('Изменить название:', task.title);
        if (newTitle === null) return; // отмена
        const trimmed = newTitle.trim();
        if (trimmed === '') {
            alert('Название не может быть пустым!');
            return;
        }
        task.title = trimmed;
        saveTasks();
        render();
    }

    // ----- Удаление задачи (НОВОЕ) -----
    function deleteTask(taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;
        if (confirm(`Удалить задачу "${task.title}"?`)) {
            tasks = tasks.filter(t => t.id !== taskId);
            saveTasks();
            render();
        }
    }

    // ----- Обработчики событий -----
    addBtn.addEventListener('click', addTask);

    // Клик по карточке → переключение статуса (делегирование)
    taskList.addEventListener('click', function(event) {
        const card = event.target.closest('.card-right');
        if (!card) return;
        // Игнорируем клики по кнопке удаления и по названию (двойной клик обработан отдельно)
        if (event.target.closest('.delete-btn')) return;
        if (event.target.closest('.zag-one h2')) return; // клик на названии не переключает
        const id = Number(card.dataset.id);
        if (!isNaN(id)) toggleTask(id);
    });

    // ----- Инициализация -----
    loadTasks();
    render();
});