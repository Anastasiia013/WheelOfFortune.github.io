const listNamesContainer = document.querySelector('.listNames');
const totalStudentsSpan = document.getElementById('totalStudents');
const generateTeamsBtn = document.querySelector('.submitWheel');
const teamsResult = document.getElementById('teamsResult');
const resetAllBtn = document.querySelector('.resetAllBtn');
const checkAllBtn = document.querySelector('.checkAllBtn');

// Create checkboxes with update listener
studentsList.forEach((student) => {
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = student;

    checkbox.addEventListener('change', () => {
        updateTotalSelected();
        saveCheckedStudents();
    });

    label.appendChild(checkbox);
    label.append(` ${student}`);
    listNamesContainer.appendChild(label);
});

// Update the number of selected students
function updateTotalSelected() {
    const selected = document.querySelectorAll('.listNames input[type="checkbox"]:checked');
    totalStudentsSpan.textContent = selected.length;
}

// "Reset All" button handler
resetAllBtn.addEventListener('click', () => {
    const checkboxes = document.querySelectorAll('.listNames input[type="checkbox"]');
    checkboxes.forEach((checkbox) => {
        checkbox.checked = false;
    });
    teamsResult.innerHTML = "";
    updateTotalSelected();
    localStorage.removeItem('checkedStudents');
});

// "Select All" button handler
checkAllBtn.addEventListener('click', () => {
    const checkboxes = document.querySelectorAll('.listNames input[type="checkbox"]');
    const selectedNames = [];

    checkboxes.forEach((checkbox) => {
        checkbox.checked = true;
        selectedNames.push(checkbox.value);
    });

    localStorage.setItem('checkedStudents', JSON.stringify(selectedNames));
    updateTotalSelected();
});

// Shuffle array helper
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Generate teams from selected students
function generateTeams() {
    const selected = [...document.querySelectorAll('.listNames input[type="checkbox"]:checked')].map(cb => cb.value);

    if (selected.length === 0) {
        alert("Please select at least one student.");
        return;
    }

    shuffleArray(selected); // shuffle before team assignment

    const teamCount = Math.floor(Math.sqrt(selected.length)); // roughly optimal number of teams
    const teams = Array.from({ length: teamCount }, () => []);

    selected.forEach((student, index) => {
        teams[index % teamCount].push(student);
    });

    // Display teams
    teamsResult.innerHTML = '';
    teams.forEach((team, i) => {
        const teamDiv = document.createElement('div');
        teamDiv.classList.add('team');
        teamDiv.innerHTML = `<strong>Team ${i + 1}:</strong> ${team.join(', ')}`;
        teamsResult.appendChild(teamDiv);
    });
}

// Save selected students to localStorage
function saveCheckedStudents() {
    const checked = [...document.querySelectorAll('.listNames input[type="checkbox"]:checked')].map(cb => cb.value);
    localStorage.setItem('checkedStudents', JSON.stringify(checked));
}

// Restore selected students from localStorage
function restoreCheckedStudents() {
    const saved = JSON.parse(localStorage.getItem('checkedStudents') || '[]');
    const checkboxes = document.querySelectorAll('.listNames input[type="checkbox"]');

    checkboxes.forEach((checkbox) => {
        checkbox.checked = saved.includes(checkbox.value);
    });

    updateTotalSelected();
}

// Restore state on page load
window.addEventListener('DOMContentLoaded', () => {
    restoreCheckedStudents();
});

// Generate teams button click
generateTeamsBtn.addEventListener('click', generateTeams);