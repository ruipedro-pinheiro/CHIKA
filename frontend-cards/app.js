/**
 * 📋 CHIKA CARDS - Kanban Workflow
 * Gestion des tâches IA avec drag & drop
 */

// === CONFIG ===
const API_BASE = 'http://localhost:8000';

// === STATE ===
let tasks = JSON.parse(localStorage.getItem('chika_tasks')) || [];
let selectedAI = null;
let draggedTask = null;

// === DOM ELEMENTS ===
const modal = document.getElementById('task-modal');
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const loadingEl = document.getElementById('loading');
const toastEl = document.getElementById('toast');

const columns = {
    todo: document.getElementById('todo-cards'),
    inprogress: document.getElementById('inprogress-cards'),
    review: document.getElementById('review-cards'),
    done: document.getElementById('done-cards')
};

// === INIT ===
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    renderAllTasks();
    updateCounts();
});

// === EVENT LISTENERS ===
function setupEventListeners() {
    // New task button
    document.getElementById('new-task').addEventListener('click', openModal);

    // Clear all button
    document.getElementById('clear-all').addEventListener('click', () => {
        if (confirm('Voulez-vous vraiment effacer toutes les tâches?')) {
            tasks = [];
            saveTasks();
            renderAllTasks();
            updateCounts();
            showToast('Toutes les tâches ont été supprimées', 'success');
        }
    });

    // AI chips selection
    document.querySelectorAll('.ai-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.ai-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            selectedAI = chip.dataset.ai;
        });
    });

    // Task form submit
    taskForm.addEventListener('submit', handleTaskSubmit);

    // Column drag & drop
    Object.values(columns).forEach(column => {
        column.addEventListener('dragover', handleDragOver);
        column.addEventListener('drop', handleDrop);
        column.addEventListener('dragleave', handleDragLeave);
    });
}

// === MODAL ===
function openModal() {
    modal.classList.remove('hidden');
    taskInput.value = '';
    selectedAI = null;
    document.querySelectorAll('.ai-chip').forEach(c => c.classList.remove('active'));
    taskInput.focus();
}

function closeModal() {
    modal.classList.add('hidden');
}

// Close modal on backdrop click
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Close modal on ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        closeModal();
    }
});

// === TASK SUBMIT ===
async function handleTaskSubmit(e) {
    e.preventDefault();

    const content = taskInput.value.trim();
    if (!content) return;
    if (!selectedAI) {
        showToast('Veuillez sélectionner une IA', 'warning');
        return;
    }

    const task = {
        id: Date.now().toString(),
        content,
        ai: selectedAI,
        status: 'todo',
        createdAt: new Date().toISOString(),
        response: null
    };

    tasks.push(task);
    saveTasks();
    renderTask(task);
    updateCounts();
    closeModal();
    showToast(`Tâche créée et assignée à ${selectedAI.toUpperCase()}`, 'success');

    // Auto-execute for demo (optional)
    // executeTask(task.id);
}

// === RENDER ===
function renderAllTasks() {
    // Clear all columns
    Object.values(columns).forEach(col => col.innerHTML = '');

    // Render tasks
    tasks.forEach(task => renderTask(task));
}

function renderTask(task) {
    const taskEl = createTaskElement(task);
    columns[task.status].appendChild(taskEl);
}

function createTaskElement(task) {
    const div = document.createElement('div');
    div.className = 'task-card';
    div.draggable = true;
    div.dataset.taskId = task.id;

    // Drag events
    div.addEventListener('dragstart', handleDragStart);
    div.addEventListener('dragend', handleDragEnd);

    const aiEmoji = {
        'claude': '🤖',
        'gpt': '🧠',
        'gemini': '✨'
    };

    const statusEmoji = {
        'todo': '📝',
        'inprogress': '⚡',
        'review': '👀',
        'done': '✅'
    };

    div.innerHTML = `
        <div class="task-header">
            <span class="task-ai ${task.ai}">${aiEmoji[task.ai]} ${task.ai.toUpperCase()}</span>
            <div class="task-actions">
                ${task.status === 'todo' && !task.response ? `<button class="task-action" onclick="executeTask('${task.id}')" title="Exécuter">▶️</button>` : ''}
                <button class="task-action" onclick="deleteTask('${task.id}')" title="Supprimer">🗑️</button>
            </div>
        </div>
        <div class="task-content">${escapeHtml(task.content)}</div>
        ${task.response ? `<div class="task-response">${escapeHtml(task.response)}</div>` : ''}
        <div class="task-meta">
            <span class="task-time">
                ${statusEmoji[task.status]} ${formatTime(task.createdAt)}
            </span>
        </div>
    `;

    return div;
}

// === DRAG & DROP ===
function handleDragStart(e) {
    draggedTask = e.target;
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.innerHTML);
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    // Remove drag-over class from all columns
    Object.values(columns).forEach(col => col.classList.remove('drag-over'));
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    e.currentTarget.classList.add('drag-over');
    return false;
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }

    const column = e.currentTarget;
    column.classList.remove('drag-over');

    if (draggedTask) {
        const taskId = draggedTask.dataset.taskId;
        const newStatus = column.closest('.kanban-column').dataset.status;

        // Update task status
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            const oldStatus = task.status;
            task.status = newStatus;
            saveTasks();

            // Move DOM element
            column.appendChild(draggedTask);
            updateCounts();

            showToast(`Tâche déplacée vers ${getStatusLabel(newStatus)}`, 'success');

            // Auto-execute if moved to "in progress" and not yet executed
            if (newStatus === 'inprogress' && !task.response) {
                executeTask(taskId);
            }
        }
    }

    return false;
}

// === TASK ACTIONS ===
async function executeTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    showLoading(true);
    showToast(`Exécution de la tâche avec ${task.ai.toUpperCase()}...`, 'info');

    try {
        const response = await fetch(`${API_BASE}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: task.content,
                ai_provider: task.ai,
                room_id: 'kanban-workflow'
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        task.response = data.response;
        task.status = 'review'; // Auto-move to review
        saveTasks();
        renderAllTasks();
        updateCounts();
        showToast('Tâche exécutée avec succès!', 'success');
    } catch (error) {
        console.error('Execution error:', error);
        showToast(`Erreur: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

window.executeTask = executeTask;

function deleteTask(taskId) {
    if (confirm('Supprimer cette tâche?')) {
        tasks = tasks.filter(t => t.id !== taskId);
        saveTasks();
        renderAllTasks();
        updateCounts();
        showToast('Tâche supprimée', 'success');
    }
}

window.deleteTask = deleteTask;

// === COUNTS ===
function updateCounts() {
    const counts = {
        todo: tasks.filter(t => t.status === 'todo').length,
        inprogress: tasks.filter(t => t.status === 'inprogress').length,
        review: tasks.filter(t => t.status === 'review').length,
        done: tasks.filter(t => t.status === 'done').length
    };

    document.querySelectorAll('.kanban-column').forEach(col => {
        const status = col.dataset.status;
        const countEl = col.querySelector('.count');
        countEl.textContent = counts[status];
    });
}

// === STORAGE ===
function saveTasks() {
    localStorage.setItem('chika_tasks', JSON.stringify(tasks));
}

// === UI HELPERS ===
function showLoading(show) {
    loadingEl.classList.toggle('hidden', !show);
}

function showToast(message, type = 'info') {
    toastEl.textContent = message;
    toastEl.className = `toast ${type}`;
    toastEl.classList.remove('hidden');

    setTimeout(() => {
        toastEl.classList.add('hidden');
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatTime(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes}min`;
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${days}j`;
}

function getStatusLabel(status) {
    const labels = {
        'todo': 'À faire',
        'inprogress': 'En cours',
        'review': 'En revue',
        'done': 'Terminé'
    };
    return labels[status] || status;
}
