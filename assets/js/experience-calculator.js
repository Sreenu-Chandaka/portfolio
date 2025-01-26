// experience-calculator.js

function calculateDuration(startDate, endDate) {
    const start = new Date(startDate);
    const end = endDate === 'present' ? new Date() : new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);

    if (years > 0 && months > 0) {
        return `${years} year${years > 1 ? 's' : ''}, ${months} month${months > 1 ? 's' : ''}`;
    } else if (years > 0) {
        return `${years} year${years > 1 ? 's' : ''}`;
    } else {
        return `${months} month${months > 1 ? 's' : ''}`;
    }
}

function updateDurations() {
    const experiences = [{
            id: 'tokma-duration',
            start: '2024-08-01',
            end: 'present'
        },
        {
            id: 'inflancer-duration',
            start: '2022-10-01',
            end: '2024-08-01'
        },
        {
            id: 'yaj-duration',
            start: '2022-05-01',
            end: '2022-09-01'
        }
    ];

    experiences.forEach(exp => {
        const element = document.getElementById(exp.id);
        if (element) {
            const duration = calculateDuration(exp.start, exp.end);
            const formattedStart = new Date(exp.start).toLocaleString('default', {
                month: 'short',
                year: 'numeric'
            });
            const formattedEnd = exp.end === 'present' ? 'Present' : new Date(exp.end).toLocaleString('default', {
                month: 'short',
                year: 'numeric'
            });
            element.textContent = `${formattedStart} — ${formattedEnd} • ${duration}`;
        }
    });
}

// Update durations immediately and then every second
updateDurations();
setInterval(updateDurations, 1000);