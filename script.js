document.addEventListener('DOMContentLoaded', function() {

    // ----- Хранилище -----
    const STORAGE_FOLDERS = 'moveit_folders';
    const STORAGE_TASKS = 'moveit_tasks';
    const STORAGE_NOTES = 'moveit_notes';
    const STORAGE_THEME = 'moveit_theme';

    // ----- Состояние -----
    let folders = [];
    let tasks = [];
    let notes = [];

    let currentView = 'day';
    let currentDate = new Date();
    let searchQuery = '';
    let sortBy = 'date';

    // ----- DOM элементы -----
    const viewContainer = document.getElementById('viewContainer');
    const currentDateDisplay = document.getElementById('currentDateDisplay');
    const prevDateBtn = document.getElementById('prevDate');
    const nextDateBtn = document.getElementById('nextDate');
    const todayBtn = document.getElementById('todayBtn');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const foldersBtn = document.getElementById('foldersBtn');
    const notesBtn = document.getElementById('notesBtn');
    const doneBtn = document.getElementById('doneBtn');
    const folderInfo = document.getElementById('folderInfo');
    const globalSearch = document.getElementById('globalSearch');
    const sortSelect = document.getElementById('sortSelect');
    const themeToggle = document.getElementById('themeToggle');

    // Статистика
    const todayDoneSpan = document.getElementById('todayDone');
    const weekPercentSpan = document.getElementById('weekPercentDisplay');
    const ringFill = document.getElementById('ringFill');
    const totalTasksStat = document.getElementById('totalTasksStat');
    const trendIndicator = document.getElementById('trendIndicator');
    const todayChart = document.getElementById('todayChart');
    const streakDisplay = document.getElementById('streakDisplay');

    const viewBtns = document.querySelectorAll('.view-btn');

    // Модалки
    const taskModal = document.getElementById('taskModal');
    const taskInput = document.getElementById('taskInput');
    const taskFolderSelect = document.getElementById('taskFolderSelect');
    const taskPrioritySelect = document.getElementById('taskPrioritySelect');
    const taskDateInput = document.getElementById('taskDateInput');
    const taskModalCancel = document.getElementById('taskModalCancel');
    const taskModalSave = document.getElementById('taskModalSave');

    const moveModal = document.getElementById('moveModal');
    const moveTaskTitle = document.getElementById('moveTaskTitle');
    const moveDateInput = document.getElementById('moveDateInput');
    const moveModalCancel = document.getElementById('moveModalCancel');
    const moveModalSave = document.getElementById('moveModalSave');
    let moveTaskId = null;

    const folderModal = document.getElementById('folderModal');
    const folderList = document.getElementById('folderList');
    const folderInput = document.getElementById('folderInput');
    const addFolderBtn2 = document.getElementById('addFolderBtn2');
    const folderModalClose = document.getElementById('folderModalClose');

    const notesModal = document.getElementById('notesModal');
    const notesList = document.getElementById('notesList');
    const noteInput = document.getElementById('noteInput');
    const notesModalCancel = document.getElementById('notesModalCancel');
    const notesModalSave = document.getElementById('notesModalSave');

    const doneModal = document.getElementById('doneModal');
    const doneList = document.getElementById('doneList');
    const doneModalClose = document.getElementById('doneModalClose');

    const exportBtn = document.getElementById('exportBtn');
    const importFile = document.getElementById('importFile');

    // ----- Работа с темой -----
    function loadTheme() {
        const saved = localStorage.getItem(STORAGE_THEME) || 'dark';
        document.documentElement.setAttribute('data-theme', saved);
        themeToggle.textContent = saved === 'dark' ? '🌓' : '☀️';
    }
    function toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem(STORAGE_THEME, next);
        themeToggle.textContent = next === 'dark' ? '🌓' : '☀️';
    }
    themeToggle.addEventListener('click', toggleTheme);
    loadTheme();

    // ----- Звуки (используем Web Audio) -----
    function playClick() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 800;
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.1);
        } catch(e) {}
    }
    function playComplete() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 1200;
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
            osc.start(ctx.currentTime);
            setTimeout(() => {
                const osc2 = ctx.createOscillator();
                const gain2 = ctx.createGain();
                osc2.connect(gain2);
                gain2.connect(ctx.destination);
                osc2.frequency.value = 1500;
                gain2.gain.setValueAtTime(0.08, ctx.currentTime);
                gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
                osc2.start(ctx.currentTime);
                osc2.stop(ctx.currentTime + 0.2);
            }, 150);
            osc.stop(ctx.currentTime + 0.3);
        } catch(e) {}
    }

    // ----- Конфетти (простая анимация) -----
    function fireConfetti() {
        const colors = ['#FF6B6B', '#FECA57', '#4ECDC4', '#45B7D1', '#FF9FF3', '#FFC048'];
        for (let i = 0; i < 60; i++) {
            const el = document.createElement('div');
            const size = 6 + Math.random() * 8;
            const x = window.innerWidth / 2 + (Math.random() - 0.5) * 200;
            const y = window.innerHeight / 2 - 50;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const rot = Math.random() * 360;
            const dur = 1 + Math.random() * 1.5;
            const dx = (Math.random() - 0.5) * 400;
            const dy = -100 - Math.random() * 400;
            Object.assign(el.style, {
                position: 'fixed',
                left: x + 'px',
                top: y + 'px',
                width: size + 'px',
                height: size + 'px',
                background: color,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                pointerEvents: 'none',
                zIndex: 9999,
                transform: `rotate(${rot}deg)`,
                transition: `all ${dur}s cubic-bezier(0.34, 1.2, 0.64, 1)`,
                opacity: 1,
            });
            document.body.appendChild(el);
            requestAnimationFrame(() => {
                el.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot+360}deg) scale(0.1)`;
                el.style.opacity = '0';
            });
            setTimeout(() => el.remove(), dur * 1000 + 100);
        }
    }

    // ----- Функции работы с хранилищем -----
    function loadData() {
        const storedFolders = localStorage.getItem(STORAGE_FOLDERS);
        folders = storedFolders ? JSON.parse(storedFolders) : [];
        if (folders.length === 0) {
            folders.push({ id: Date.now(), name: 'Основная' });
            saveFolders();
        }

        const storedTasks = localStorage.getItem(STORAGE_TASKS);
        tasks = storedTasks ? JSON.parse(storedTasks) : [];

        const storedNotes = localStorage.getItem(STORAGE_NOTES);
        notes = storedNotes ? JSON.parse(storedNotes) : [];
    }

    function saveFolders() {
        localStorage.setItem(STORAGE_FOLDERS, JSON.stringify(folders));
    }
    function saveTasks() {
        localStorage.setItem(STORAGE_TASKS, JSON.stringify(tasks));
    }
    function saveNotes() {
        localStorage.setItem(STORAGE_NOTES, JSON.stringify(notes));
    }

    // ----- Вспомогательные функции -----
    function formatDate(date) {
        return date.toISOString().slice(0, 10);
    }
    function parseDate(str) {
        const parts = str.split('-').map(Number);
        return new Date(parts[0], parts[1]-1, parts[2]);
    }
    function getTodayStr() {
        return formatDate(new Date());
    }
    function isToday(dateStr) {
        return dateStr === getTodayStr();
    }
    function getWeekDays(baseDate) {
        const start = new Date(baseDate);
        const day = start.getDay() || 7;
        start.setDate(start.getDate() - day + 1);
        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            days.push(d);
        }
        return days;
    }
    function getTasksForDate(dateStr) {
        return tasks.filter(t => t.date === dateStr);
    }
    function getTasksForDateRange(startDate, endDate) {
        const result = {};
        const current = new Date(startDate);
        while (current <= endDate) {
            const key = formatDate(current);
            result[key] = tasks.filter(t => t.date === key);
            current.setDate(current.getDate() + 1);
        }
        return result;
    }
    function getFolderName(folderId) {
        const f = folders.find(f => f.id === folderId);
        return f ? f.name : 'Без папки';
    }
    function getPriorityLabel(p) {
        const map = { high: 'Высокий', medium: 'Средний', low: 'Низкий' };
        return map[p] || 'Средний';
    }

    // ----- Сортировка и фильтрация -----
    function getFilteredAndSortedTasks(dateStr) {
        let result = getTasksForDate(dateStr);
        // Поиск
        if (searchQuery.trim()) {
            const q = searchQuery.trim().toLowerCase();
            result = result.filter(t => t.title.toLowerCase().includes(q));
        }
        // Сортировка
        if (sortBy === 'priority') {
            const order = { high: 0, medium: 1, low: 2 };
            result.sort((a,b) => (order[a.priority] || 1) - (order[b.priority] || 1));
        } else if (sortBy === 'status') {
            result.sort((a,b) => a.done - b.done);
        } else { // date
            result.sort((a,b) => a.id - b.id);
        }
        return result;
    }

    // ----- Подсчёт стрика -----
    function calculateStreak() {
        if (tasks.length === 0) return 0;
        const today = getTodayStr();
        let streak = 0;
        let current = new Date();
        // Идём назад, пока есть выполненные задачи за каждый день
        while (true) {
            const dayStr = formatDate(current);
            const dayTasks = tasks.filter(t => t.date === dayStr && t.done);
            if (dayTasks.length > 0) {
                streak++;
                current.setDate(current.getDate() - 1);
            } else {
                // Если сегодня ещё не было задач, но вчера были, то стрик считается с сегодня?
                // По логике: если сегодня нет выполненных, стрик прерывается,
                // но если сегодня ещё не закончился и мы проверяем, то нужно учитывать только вчерашний день.
                // Упростим: стрик — это непрерывная цепочка дней, где есть хотя бы одна выполненная задача.
                // Если сегодня нет, а вчера есть, то стрик = 0? Нет, это неправильно.
                // Правильнее: начинаем с сегодня, если сегодня нет, то стрик = 0.
                // Но если сегодня ещё не делали, а вчера делали, то стрик должен быть за вчера.
                // Проверим: если today нет, то проверяем вчера.
                if (dayStr === today) {
                    // Сегодня нет — пробуем вчера
                    current.setDate(current.getDate() - 1);
                    continue;
                } else {
                    break;
                }
            }
        }
        return streak;
    }

    // ----- Обновление статистики -----
    function updateStats() {
        const todayStr = getTodayStr();
        const todayTasks = getTasksForDate(todayStr);
        const doneToday = todayTasks.filter(t => t.done).length;
        todayDoneSpan.textContent = doneToday;

        const totalToday = todayTasks.length;
        const percentToday = totalToday === 0 ? 0 : Math.round((doneToday / totalToday) * 100);
        let chartBar = todayChart.querySelector('.bar');
        if (!chartBar) {
            chartBar = document.createElement('div');
            chartBar.className = 'bar';
            todayChart.appendChild(chartBar);
        }
        chartBar.style.width = percentToday + '%';

        // Неделя
        const weekDays = getWeekDays(new Date());
        let totalWeek = 0, doneWeek = 0;
        weekDays.forEach(d => {
            const dayStr = formatDate(d);
            const dayTasks = getTasksForDate(dayStr);
            totalWeek += dayTasks.length;
            doneWeek += dayTasks.filter(t => t.done).length;
        });
        const weekPercent = totalWeek === 0 ? 0 : Math.round((doneWeek / totalWeek) * 100);
        weekPercentSpan.textContent = weekPercent + '%';
        const circumference = 314;
        const offset = circumference - (weekPercent / 100) * circumference;
        ringFill.style.strokeDashoffset = offset;

        totalTasksStat.textContent = tasks.length;

        // Тренд
        const prevWeek = tasks.filter(t => t.done && t.completedDate).length;
        if (doneWeek > prevWeek) trendIndicator.textContent = '📈';
        else if (doneWeek < prevWeek) trendIndicator.textContent = '📉';
        else trendIndicator.textContent = '➖';

        // Стрик
        const streak = calculateStreak();
        streakDisplay.textContent = streak + '🔥';
    }

    // ----- Рендеринг -----
    function render() {
        const date = currentDate;
        const view = currentView;

        if (view === 'day') {
            currentDateDisplay.textContent = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
        } else if (view === 'week') {
            const start = getWeekDays(date)[0];
            const end = getWeekDays(date)[6];
            currentDateDisplay.textContent = `${start.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}`;
        } else if (view === 'month') {
            currentDateDisplay.textContent = date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
        }

        if (view === 'day') renderDay(date);
        else if (view === 'week') renderWeek(date);
        else if (view === 'month') renderMonth(date);

        folderInfo.textContent = `Папок: ${folders.length}, задач: ${tasks.length}`;
        updateStats();
    }

    // ----- Рендер дня -----
    function renderDay(date) {
        const dateStr = formatDate(date);
        let dayTasks = getFilteredAndSortedTasks(dateStr);

        let html = `<div class="day-view"><div class="day-header">${date.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}</div>`;

        if (dayTasks.length === 0) {
            html += `<p style="color:var(--text-muted);padding:16px 0;">Нет задач на этот день</p>`;
        } else {
            // Группировка по папкам
            const groups = {};
            dayTasks.forEach(t => {
                const folderName = getFolderName(t.folderId);
                if (!groups[folderName]) groups[folderName] = [];
                groups[folderName].push(t);
            });
            for (const [folder, tasksList] of Object.entries(groups)) {
                html += `<div class="task-group"><div class="group-title">${folder}</div>`;
                tasksList.forEach(t => {
                    html += renderTaskItem(t);
                });
                html += `</div>`;
            }
        }
        html += `</div>`;
        viewContainer.innerHTML = html;
        attachTaskEvents();
    }

    function renderTaskItem(task) {
        const doneClass = task.done ? 'done' : '';
        const priorityClass = 'priority-' + (task.priority || 'medium');
        return `<div class="task-item ${doneClass}" data-id="${task.id}">
            <span class="task-check"></span>
            <span class="task-title">${escapeHtml(task.title)}</span>
            <span class="task-priority ${priorityClass}">${getPriorityLabel(task.priority)}</span>
            <span class="task-folder">${getFolderName(task.folderId)}</span>
            <span class="task-move" title="Перенести">📅</span>
        </div>`;
    }

    function attachTaskEvents() {
        viewContainer.querySelectorAll('.task-item').forEach(el => {
            // Одиночный клик — переключение статуса
            el.addEventListener('click', function(e) {
                if (e.target.closest('.task-move')) return;
                if (e.target.closest('.task-inline-edit')) return;
                const id = Number(this.dataset.id);
                toggleTask(id);
            });
            // Двойной клик — инлайн-редактирование
            el.addEventListener('dblclick', function(e) {
                if (e.target.closest('.task-move')) return;
                const id = Number(this.dataset.id);
                startInlineEdit(id);
            });
            // Кнопка переноса
            const moveBtn = el.querySelector('.task-move');
            if (moveBtn) {
                moveBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const id = Number(this.closest('.task-item').dataset.id);
                    openMoveModal(id);
                });
            }
        });
    }

    // ----- Инлайн-редактирование -----
    function startInlineEdit(taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;
        const item = document.querySelector(`.task-item[data-id="${taskId}"]`);
        if (!item) return;
        const titleSpan = item.querySelector('.task-title');
        const currentText = task.title;
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'task-inline-edit';
        input.value = currentText;
        titleSpan.replaceWith(input);
        input.focus();
        input.select();

        const save = () => {
            const newText = input.value.trim();
            if (newText) {
                task.title = newText;
                saveTasks();
                render();
                playClick();
            } else {
                render(); // отмена
            }
        };
        input.addEventListener('blur', save);
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                input.blur();
            } else if (e.key === 'Escape') {
                render();
            }
        });
    }

    // ----- Неделя (с фильтром и поиском) -----
    function renderWeek(date) {
        const weekDays = getWeekDays(date);
        const startStr = formatDate(weekDays[0]);
        const endStr = formatDate(weekDays[6]);
        let rangeTasks = {};
        const current = new Date(startStr);
        while (current <= parseDate(endStr)) {
            const key = formatDate(current);
            rangeTasks[key] = getFilteredAndSortedTasks(key);
            current.setDate(current.getDate() + 1);
        }

        let html = `<div class="week-view"><div class="week-grid">`;
        weekDays.forEach(d => {
            const dayStr = formatDate(d);
            const dayTasks = rangeTasks[dayStr] || [];
            const isToday = isToday(dayStr);
            html += `<div class="week-day" style="${isToday ? 'background:rgba(255,107,107,0.08);border-color:#FF6B6B;' : ''}">
                <div class="day-label">${d.toLocaleDateString('ru-RU', { weekday: 'short' })}</div>
                <div class="day-num">${d.getDate()}</div>
                <div class="day-tasks">
                    ${dayTasks.slice(0, 5).map(t => 
                        `<div class="day-task ${t.done ? 'done' : ''}" data-id="${t.id}">${escapeHtml(t.title)}</div>`
                    ).join('')}
                    ${dayTasks.length > 5 ? `<div style="font-size:10px;color:var(--text-muted);">+${dayTasks.length-5} ещё</div>` : ''}
                </div>
            </div>`;
        });
        html += `</div></div>`;
        viewContainer.innerHTML = html;

        viewContainer.querySelectorAll('.day-task').forEach(el => {
            el.addEventListener('click', function(e) {
                const id = Number(this.dataset.id);
                toggleTask(id);
                render();
            });
        });
    }

    // ----- Месяц (с фильтром) -----
    function renderMonth(date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const daysInMonth = new Date(year, month+1, 0).getDate();
        const startDayOfWeek = firstDayOfMonth.getDay() || 7;

        let html = `<div class="month-view"><div class="month-grid">`;
        for (let i = 1; i < startDayOfWeek; i++) {
            html += `<div class="month-cell other-month"></div>`;
        }
        const todayStr = getTodayStr();
        for (let d = 1; d <= daysInMonth; d++) {
            const dayDate = new Date(year, month, d);
            const dayStr = formatDate(dayDate);
            const dayTasks = getFilteredAndSortedTasks(dayStr);
            const isToday = (dayStr === todayStr);
            const hasTasks = dayTasks.length > 0;

            html += `<div class="month-cell ${isToday ? 'today' : ''}" data-date="${dayStr}">
                ${d}
                ${hasTasks ? `<div class="day-dot"></div>` : ''}
                <div style="font-size:8px;color:var(--text-muted);">${dayTasks.length}</div>
            </div>`;
        }
        html += `</div></div>`;
        viewContainer.innerHTML = html;

        viewContainer.querySelectorAll('.month-cell').forEach(el => {
            if (el.dataset.date) {
                el.addEventListener('click', function() {
                    const dateStr = this.dataset.date;
                    const parts = dateStr.split('-').map(Number);
                    currentDate = new Date(parts[0], parts[1]-1, parts[2]);
                    currentView = 'day';
                    viewBtns.forEach(b => b.classList.remove('active'));
                    document.querySelector('.view-btn[data-view="day"]').classList.add('active');
                    render();
                });
            }
        });
    }

    // ----- Функции задач -----
    function toggleTask(id) {
        const task = tasks.find(t => t.id === id);
        if (!task) return;
        task.done = !task.done;
        if (task.done) {
            task.completedDate = getTodayStr();
            playComplete();
            fireConfetti();
        } else {
            task.completedDate = null;
            playClick();
        }
        saveTasks();
        render();
    }

    function addTask(title, folderId, dateStr, priority) {
        const newTask = {
            id: Date.now(),
            title: title.trim(),
            done: false,
            folderId: folderId || folders[0]?.id || null,
            date: dateStr || getTodayStr(),
            priority: priority || 'medium',
            completedDate: null
        };
        tasks.push(newTask);
        saveTasks();
        render();
        playClick();
    }

    function moveTask(id, newDateStr) {
        const task = tasks.find(t => t.id === id);
        if (!task) return;
        task.date = newDateStr;
        saveTasks();
        render();
    }

    function deleteTask(id) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        render();
    }

    // ----- Модалки -----
    function openTaskModal() {
        taskFolderSelect.innerHTML = '';
        folders.forEach(f => {
            const opt = document.createElement('option');
            opt.value = f.id;
            opt.textContent = f.name;
            taskFolderSelect.appendChild(opt);
        });
        taskInput.value = '';
        taskDateInput.value = getTodayStr();
        taskPrioritySelect.value = 'medium';
        taskModal.classList.add('active');
        taskInput.focus();
    }
    function closeTaskModal() { taskModal.classList.remove('active'); }
    function saveTaskFromModal() {
        const title = taskInput.value.trim();
        if (!title) return;
        const folderId = Number(taskFolderSelect.value);
        const date = taskDateInput.value || getTodayStr();
        const priority = taskPrioritySelect.value;
        addTask(title, folderId, date, priority);
        closeTaskModal();
    }

    function openMoveModal(taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;
        moveTaskId = taskId;
        moveTaskTitle.textContent = `Задача: "${task.title}"`;
        moveDateInput.value = task.date;
        moveModal.classList.add('active');
    }
    function closeMoveModal() { moveModal.classList.remove('active'); moveTaskId = null; }
    function saveMove() {
        if (moveTaskId === null) return;
        const newDate = moveDateInput.value;
        if (!newDate) return;
        moveTask(moveTaskId, newDate);
        closeMoveModal();
    }

    // ----- Папки -----
    function openFolderModal() { folderModal.classList.add('active'); renderFolderList(); }
    function closeFolderModal() { folderModal.classList.remove('active'); }
    function renderFolderList() {
        folderList.innerHTML = '';
        folders.forEach(f => {
            const row = document.createElement('div');
            row.className = 'folder-row';
            row.innerHTML = `
                <span class="folder-name">${escapeHtml(f.name)}</span>
                <button class="folder-del" data-id="${f.id}">✕</button>
            `;
            folderList.appendChild(row);
        });
        folderList.querySelectorAll('.folder-del').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = Number(this.dataset.id);
                if (confirm('Удалить папку? Задачи останутся без папки.')) {
                    folders = folders.filter(f => f.id !== id);
                    saveFolders();
                    renderFolderList();
                    render();
                }
            });
        });
    }
    function addFolder() {
        const name = folderInput.value.trim();
        if (!name) return;
        if (folders.some(f => f.name.toLowerCase() === name.toLowerCase())) {
            alert('Такая папка уже есть');
            return;
        }
        folders.push({ id: Date.now(), name });
        saveFolders();
        folderInput.value = '';
        renderFolderList();
        render();
    }

    // ----- Заметки (с редактированием) -----
    function openNotesModal() { notesModal.classList.add('active'); renderNotes(); noteInput.value = ''; noteInput.focus(); }
    function closeNotesModal() { notesModal.classList.remove('active'); }
    function deleteNote(id) {
        const note = notes.find(n => n.id === id);
        if (!note) return;
        if (confirm(`Удалить заметку "${note.text}"?`)) {
            notes = notes.filter(n => n.id !== id);
            saveNotes();
            renderNotes();
        }
    }
    function editNote(id) {
        const note = notes.find(n => n.id === id);
        if (!note) return;
        const newText = prompt('Редактировать заметку:', note.text);
        if (newText === null) return;
        const trimmed = newText.trim();
        if (!trimmed) return;
        note.text = trimmed;
        saveNotes();
        renderNotes();
    }
    function renderNotes() {
        notesList.innerHTML = '';
        if (notes.length === 0) {
            notesList.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:12px;">Нет заметок</div>';
            return;
        }
        const sorted = [...notes].reverse();
        sorted.forEach(n => {
            const div = document.createElement('div');
            div.className = 'note-item';
            div.innerHTML = `
                <div>
                    <span>${escapeHtml(n.text)}</span>
                    <span class="note-time">${n.date} ${n.time}</span>
                </div>
                <div>
                    <button class="note-edit" data-id="${n.id}">✎</button>
                    <button class="note-delete" data-id="${n.id}">✕</button>
                </div>
            `;
            notesList.appendChild(div);
        });
        notesList.querySelectorAll('.note-delete').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const id = Number(this.dataset.id);
                deleteNote(id);
            });
        });
        notesList.querySelectorAll('.note-edit').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const id = Number(this.dataset.id);
                editNote(id);
            });
        });
    }
    function saveNote() {
        const text = noteInput.value.trim();
        if (!text) return;
        const now = new Date();
        const date = now.toLocaleDateString('ru-RU');
        const time = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        notes.push({ id: Date.now(), text, date, time });
        saveNotes();
        renderNotes();
        noteInput.value = '';
        noteInput.focus();
    }

    // ----- Завершённые -----
    function openDoneModal() { doneModal.classList.add('active'); renderDoneList(); }
    function closeDoneModal() { doneModal.classList.remove('active'); }
    function renderDoneList() {
        const doneTasks = tasks.filter(t => t.done && t.completedDate);
        doneList.innerHTML = '';
        if (doneTasks.length === 0) {
            doneList.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:16px;">Нет завершённых задач</div>';
            return;
        }
        const sorted = doneTasks.sort((a,b) => (a.completedDate < b.completedDate ? 1 : -1));
        sorted.forEach(t => {
            const div = document.createElement('div');
            div.className = 'done-item';
            div.innerHTML = `
                <span class="done-title">${escapeHtml(t.title)}</span>
                <span class="done-date">${t.completedDate}</span>
            `;
            doneList.appendChild(div);
        });
    }

    // ----- Экспорт/импорт -----
    function exportData() {
        const data = { folders, tasks, notes };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `moveit_backup_${getTodayStr()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
    function importData(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                if (data.folders) folders = data.folders;
                if (data.tasks) tasks = data.tasks;
                if (data.notes) notes = data.notes;
                saveFolders();
                saveTasks();
                saveNotes();
                render();
                alert('Импорт выполнен успешно!');
            } catch(err) {
                alert('Ошибка при импорте: неверный формат файла.');
            }
        };
        reader.readAsText(file);
    }

    // ----- Навигация -----
    function changeDate(delta) {
        if (currentView === 'day') {
            currentDate.setDate(currentDate.getDate() + delta);
        } else if (currentView === 'week') {
            currentDate.setDate(currentDate.getDate() + delta * 7);
        } else if (currentView === 'month') {
            currentDate.setMonth(currentDate.getMonth() + delta);
        }
        render();
    }
    function goToday() {
        currentDate = new Date();
        render();
    }

    // ----- Обработчики -----
    viewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            viewBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentView = this.dataset.view;
            render();
        });
    });

    prevDateBtn.addEventListener('click', () => changeDate(-1));
    nextDateBtn.addEventListener('click', () => changeDate(1));
    todayBtn.addEventListener('click', goToday);

    addTaskBtn.addEventListener('click', openTaskModal);
    taskModalCancel.addEventListener('click', closeTaskModal);
    taskModalSave.addEventListener('click', saveTaskFromModal);
    taskInput.addEventListener('keydown', e => { if (e.key === 'Enter') saveTaskFromModal(); });
    taskModal.addEventListener('click', e => { if (e.target === taskModal) closeTaskModal(); });

    moveModalCancel.addEventListener('click', closeMoveModal);
    moveModalSave.addEventListener('click', saveMove);
    moveModal.addEventListener('click', e => { if (e.target === moveModal) closeMoveModal(); });

    foldersBtn.addEventListener('click', openFolderModal);
    folderModalClose.addEventListener('click', closeFolderModal);
    addFolderBtn2.addEventListener('click', addFolder);
    folderInput.addEventListener('keydown', e => { if (e.key === 'Enter') addFolder(); });
    folderModal.addEventListener('click', e => { if (e.target === folderModal) closeFolderModal(); });

    notesBtn.addEventListener('click', openNotesModal);
    notesModalCancel.addEventListener('click', closeNotesModal);
    notesModalSave.addEventListener('click', saveNote);
    noteInput.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveNote(); } });
    notesModal.addEventListener('click', e => { if (e.target === notesModal) closeNotesModal(); });

    doneBtn.addEventListener('click', openDoneModal);
    doneModalClose.addEventListener('click', closeDoneModal);
    doneModal.addEventListener('click', e => { if (e.target === doneModal) closeDoneModal(); });

    // Поиск и сортировка
    globalSearch.addEventListener('input', function() {
        searchQuery = this.value;
        render();
    });
    sortSelect.addEventListener('change', function() {
        sortBy = this.value;
        render();
    });

    // Экспорт/импорт
    exportBtn.addEventListener('click', exportData);
    importFile.addEventListener('change', function(e) {
        if (this.files.length > 0) {
            importData(this.files[0]);
            this.value = '';
        }
    });

    // Утилита
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ----- Инициализация -----
    loadData();
    render();
});
