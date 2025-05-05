const circle = document.querySelector('.wheelMain'); // the wheel
const sectorLabels = document.querySelector('.sectorLabels'); // empty div for labels
const chosenStudent = document.querySelector('.studentsName'); // result display on screen
let circleSector = []; // array of sectors on the wheel
let checkedStudents = JSON.parse(localStorage.getItem('checkedStudents')) || []; // array of students from localStorage

// load saved data from localStorage after the page loads
document.addEventListener('DOMContentLoaded', () => {
    renderStudentCheckboxes(); // render checkboxes

    const checkboxNames = document.querySelectorAll('.listNames input[type="checkbox"]');
    
    // restore checked students from localStorage
    checkboxNames.forEach((checkbox) => {
        const student = checkedStudents.find(s => s.name === checkbox.value);
        if (student) {
            checkbox.checked = student.checked;
            if (student.checked) {
                circleSector.push({ name: student.name, color: student.color });
            }
        }

        checkbox.addEventListener('change', handleCheckboxChange);
    });

    updateWheel();
});

// function to render student checkboxes
function renderStudentCheckboxes() {
    const listNamesContainer = document.querySelector('.listNames');
    listNamesContainer.innerHTML = ''; // clear existing checkboxes

    studentsList.forEach(name => {
        const label = document.createElement('label');
        label.innerHTML = `<input type="checkbox" value="${name}"/> ${name}`;
        listNamesContainer.appendChild(label);
    });
}

// handle checkbox state change
function handleCheckboxChange(event) {
    const checkbox = event.target;
    const name = checkbox.value;

    if (checkbox.checked) {
        const color = getColor();
        checkedStudents.push({ name, checked: true, color });
        circleSector.push({ name, color });
    } else {
        const index = checkedStudents.findIndex(student => student.name === name);
        if (index !== -1) {
            checkedStudents.splice(index, 1);
        }
        circleSector = circleSector.filter(sector => sector.name !== name);
    }

    saveStudentsToLocalStorage();
    updateWheel();
}

// function to save checked students to localStorage
function saveStudentsToLocalStorage() {
    localStorage.setItem('checkedStudents', JSON.stringify(checkedStudents));
}

// function to clear all students from localStorage
function deleteAllStudentsFromLocalStorage() {
    checkedStudents = [];
    saveStudentsToLocalStorage();
}

// colors for wheel sectors
const colors = ["#FFC107", "#03A9F4", "#8BC34A", "#FF5722", "#8243D6"];
let currentColorIndex = 0;

function getColor() {
    const color = colors[currentColorIndex];
    currentColorIndex = (currentColorIndex + 1) % colors.length;
    return color;
}

// update wheel with sectors
function updateWheel() {
    sectorLabels.innerHTML = ''; // clear previous labels

    if (circleSector.length === 0) {
        circle.style.background = 'white'; // if no students, set wheel background to white
        return;
    }

    let angle = 0;
    const sectorSize = 360 / circleSector.length;
    const gradientParts = circleSector.map((sector) => {
        const startAngle = angle;
        const endAngle = angle + sectorSize;
        angle += sectorSize;
        return `${sector.color} ${startAngle}deg ${endAngle}deg`;
    });

    circle.style.background = `conic-gradient(${gradientParts.join(', ')})`;

    let firstAngle = 90;

    // add labels
    circleSector.forEach((sector, index) => {
        const rotationAngle = (sectorSize * index) + (sectorSize / 2);

        function getRotationAngle() {
            const sectorEnd = firstAngle + sectorSize;
            let middle = 0;
            if (circleSector.length % 2 === 0) {
                middle = sectorEnd - (sectorSize / 2);
            } else {
                middle = (firstAngle + sectorEnd) / 2;
            }
            firstAngle = sectorEnd;
            return middle;
        }

        const label = document.createElement('div');
        label.textContent = sector.name;
        label.style.transform = `rotate(${getRotationAngle()}deg) translate(-172px)`;
        sectorLabels.appendChild(label);
    });
}

// reset all selections
const resetAll = document.querySelector('.resetAllBtn').addEventListener('click', () => {
    chosenStudent.textContent = "";
    deleteAllStudentsFromLocalStorage();
    circleSector = [];
    const checkboxNames = document.querySelectorAll('.listNames input[type="checkbox"]');
    checkboxNames.forEach((checkbox) => checkbox.checked = false);
    updateWheel();
});

// "select all" button
const checkAll = document.querySelector('.checkAllBtn').addEventListener('click', () => {
    chosenStudent.textContent = "";
    circleSector = [];
    deleteAllStudentsFromLocalStorage();
    const checkboxNames = document.querySelectorAll('.listNames input[type="checkbox"]');
    checkboxNames.forEach((checkbox) => {
        checkbox.checked = true;
        const name = checkbox.value;
        const color = getColor();
        circleSector.push({ name, color });
        checkedStudents.push({ name, checked: true, color });
    });
    saveStudentsToLocalStorage();
    updateWheel();
});

// spin the wheel
function spinWheel() {
    chosenStudent.textContent = "";
    const randomAngle = Math.random() * 360;
    const fullRotations = 1800; // 5 full rotations in 4 seconds
    const finalAngle = fullRotations + randomAngle;

    circle.style.transition = 'transform 4s cubic-bezier(0.1, 0.9, 0.2, 1)';
    circle.style.transform = `rotate(${finalAngle}deg)`;

    setTimeout(() => {
        const normalizedAngle = finalAngle % 360;
        circle.style.transition = 'none';
        circle.style.transform = `rotate(${normalizedAngle}deg)`;

        const sectorSize = 360 / circleSector.length;
        const selectedIndex = Math.floor((360 - normalizedAngle) / sectorSize) % circleSector.length;

        const selectedSector = circleSector[selectedIndex];
        chosenStudent.textContent = selectedSector ? selectedSector.name : '';
    }, 4000);
}

// spin button
const btn = document.querySelector('.submitWheel').addEventListener('click', spinWheel);

// spin wheel on click
circle.addEventListener('click', spinWheel);

// name search functionality
function searchForNames() {
    const searchBarInput = document.getElementById('searchBar');
    const labels = document.querySelectorAll('.listNames label');

    searchBarInput.addEventListener('input', () => {
        const query = searchBarInput.value.toLowerCase();
        labels.forEach((label) => {
            const name = label.textContent.toLowerCase();
            label.style.display = name.includes(query) ? '' : 'none';
        });
    });
}

searchForNames();

// handle search icon state
let isActive = false;
const searchBox = document.querySelector('.searchBox');
const searchIcon = document.querySelector('.searchIcon');

searchBox.addEventListener('click', () => {
    if (!isActive) {
        searchBarInput.disabled = false;
        searchBarInput.focus();
        searchIcon.innerHTML = `<path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>`;
        isActive = true;
    }
});

const searchBtn = document.querySelector('.searchButton');
searchBtn.addEventListener('click', () => {
    if (isActive) {
        searchBarInput.value = '';
        searchBarInput.blur();
        searchIcon.innerHTML = `<path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />`;
        isActive = false;

        labels.forEach((label) => {
            label.style.display = '';
        });
    }
});

// open burger menu on small screens
document.querySelector('.burger').addEventListener('click', () => {
    document.querySelector('.burgerBox').classList.toggle('active');
    document.querySelector('.menu').classList.toggle('active');
});