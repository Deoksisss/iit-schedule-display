const groupSelect = document.getElementById('groupSelect');
const scheduleContainer = document.getElementById('scheduleContainer');
const btnOdd = document.getElementById('btnOdd');
const btnEven = document.getElementById('btnEven');

let currentScheduleData = null;
let currentWeekType = 'odd'; // По умолчанию нечетная

// Карта для перевода дней недели из JSON
const daysMap = {
    "monday": "Понедельник",
    "tuesday": "Вторник",
    "wednesday": "Среда",
    "thursday": "Четверг",
    "friday": "Пятница",
    "saturday": "Суббота"
};

// Обработчики событий
groupSelect.addEventListener('change', (e) => loadSchedule(e.target.value));

btnOdd.addEventListener('click', () => {
    currentWeekType = 'odd';
    updateWeekToggleUI();
    renderSchedule();
});

btnEven.addEventListener('click', () => {
    currentWeekType = 'even';
    updateWeekToggleUI();
    renderSchedule();
});

function updateWeekToggleUI() {
    if (currentWeekType === 'odd') {
        btnOdd.classList.add('active');
        btnEven.classList.remove('active');
    } else {
        btnEven.classList.add('active');
        btnOdd.classList.remove('active');
    }
}

// Асинхронная загрузка JSON
async function loadSchedule(filename) {
    if (!filename) return;
    
    scheduleContainer.innerHTML = '<p class="loading">Загрузка расписания...</p>';
    
    try {
        // Ожидается, что файлы лежат в подпапке schedules
        const response = await fetch(`schedules/${filename}`);
        if (!response.ok) throw new Error('Файл расписания не найден');
        
        currentScheduleData = await response.json();
        renderSchedule();
    } catch (error) {
        scheduleContainer.innerHTML = `<p class="error">Ошибка: ${error.message}</p>`;
        currentScheduleData = null;
    }
}

// Отрисовка расписания на основе загруженных данных
function renderSchedule() {
    if (!currentScheduleData) return;

    scheduleContainer.innerHTML = '';
    const weekData = currentScheduleData.schedule[currentWeekType];
    const hours = currentScheduleData.academicHours;

    let hasClasses = false;

    // Проходимся по всем дням недели
    for (const [dayKey, dayName] of Object.entries(daysMap)) {
        const classes = weekData[dayKey];
        
        // Если в этот день есть пары
        if (classes && classes.length > 0) {
            hasClasses = true;
            
            const dayBlock = document.createElement('div');
            dayBlock.className = 'day-block';
            
            const dayTitle = document.createElement('h2');
            dayTitle.textContent = dayName;
            dayBlock.appendChild(dayTitle);

            // Сортируем пары по времени на всякий случай
            classes.sort((a, b) => a.period - b.period);

            classes.forEach(cls => {
                const classCard = document.createElement('div');
                classCard.className = 'class-card';
                
                // Добавляем время пары для удобства
                const timeStr = hours[cls.period] ? `${hours[cls.period]} (${cls.period} пара)` : `${cls.period} пара`;
                
                // Формируем вывод в нужном формате
                classCard.innerHTML = `
                    <div class="class-time">${timeStr}</div>
                    <div class="class-title">${cls.subjectName}, ${cls.typeName}</div>
                    <div class="class-details">${cls.teacher}, корпус ${cls.location.building}, ауд. ${cls.location.auditorium}</div>
                `;
                dayBlock.appendChild(classCard);
            });

            scheduleContainer.appendChild(dayBlock);
        }
    }

    if (!hasClasses) {
        scheduleContainer.innerHTML = '<p class="empty">На этой неделе нет пар 🎉</p>';
    }
}