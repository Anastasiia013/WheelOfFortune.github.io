const circle = document.querySelector('.wheelMain'); // the wheel
const checkboxNames = document.querySelectorAll('.listNames input[type="checkbox"]'); // each checkbox
let circleSector = []; // empty array
const sectorLabels = document.querySelector('.sectorLabels'); // empty div for labels
const chosenStudent = document.querySelector('.studentsName'); // result display on screen
let checkedStudents = JSON.parse(localStorage.getItem('checkedStudents')) || []; // array of students in localStorage

const searchBtn = document.querySelector('.searchButton');
const searchIcon = document.querySelector('.searchIcon'); // icon inside the button
const searchBarInput = document.getElementById('searchBar');
const labels = document.querySelectorAll('.listNames label');
const namesBox = document.querySelector('.listNames');
const searchBox = document.querySelector('.searchBox');

// load saved data from localStorage after the page loads
document.addEventListener('DOMContentLoaded', () => {
    checkedStudents.forEach((student) => {
        const checkbox = Array.from(checkboxNames).find((cb) => cb.value === student.name);

        if (checkbox) {
            checkbox.checked = student.checked; // set checkbox state
            if (student.checked) {
                circleSector.push({ name: student.name, color: student.color });
            }
        }
    });
    updateWheel();
});

// function to save students to localStorage
function saveStudentsToLocalStorage() {
    localStorage.setItem('checkedStudents', JSON.stringify(checkedStudents));
}

// function to clear all students from localStorage
function deleteAllStudentsFromLocalStorage() {
    checkedStudents = [];
    saveStudentsToLocalStorage();
}

// loop through five colors
const colors = ["#FFC107", "#03A9F4", "#8BC34A", "#FF5722", "#8243D6"];
let currentColorIndex = 0;

function getColor() {
    // get next color from array
    const color = colors[currentColorIndex];
    currentColorIndex = (currentColorIndex + 1) % colors.length;
    return color;
}

// add event listeners to checkboxes
checkboxNames.forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
        const name = checkbox.value;

        if (checkbox.checked) {
            const color = getColor();
            checkedStudents.push({
                name,
                checked: true,
                color
            });

            // add to sectors array for display on wheel
            circleSector.push({ name, color });
        } else {
            // otherwise, remove student from checkedStudents
            const index = checkedStudents.findIndex((student) => student.name === name);
            if (index !== -1) {
                checkedStudents.splice(index, 1);
            }

            // remove name from sectors array
            circleSector = circleSector.filter((sector) => sector.name !== name);
        }
        saveStudentsToLocalStorage();
        updateWheel();
    });
});

// update names in wheel sectors
function updateWheel() {
    sectorLabels.innerHTML = '';

    if (circleSector.length === 0) {
        // if array is empty, make wheel white
        circle.style.background = 'white';
        return;
    }

    // set each sector size
    let angle = 0;
    const sectorSize = 360 / circleSector.length;
    const gradientParts = circleSector.map((sector) => {
        const startAngle = angle;
        const endAngle = angle + sectorSize;
        angle += sectorSize;

        return `${sector.color} ${startAngle}deg ${endAngle}deg`;
    });

    // update wheel background
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

        // add names to calculated sectors
        const label = document.createElement('div');
        label.textContent = sector.name;
        label.style.transform = `rotate(${getRotationAngle()}deg) translate(-172px)`;
        sectorLabels.appendChild(label);
    });
};

// reset button
const resetAll = document.querySelector('.resetAllBtn').addEventListener('click', function () {
    // clear result field and localStorage
    chosenStudent.textContent = "";
    deleteAllStudentsFromLocalStorage();

    // clear wheel sectors and checkboxes
    checkboxNames.forEach((checkbox) => {
        checkbox.checked = false;
        circleSector = [];
    });
    updateWheel();
});

// "select all" button
const checkAll = document.querySelector('.checkAllBtn').addEventListener('click', function () {
    // clear result field and localStorage
    chosenStudent.textContent = "";
    circleSector = [];
    deleteAllStudentsFromLocalStorage();

    // add all names to wheel sectors and localStorage
    checkboxNames.forEach((checkbox) => {
        const name = checkbox.value;
        checkbox.checked = true;
        circleSector.push({ name, color: getColor() });
        checkedStudents.push({ name, checked: true, color: getColor() })
        saveStudentsToLocalStorage()
    });
    updateWheel();
});

// spin the wheel
function spinWheel() {
    chosenStudent.textContent = "";
    const randomAngle = Math.random() * 360; // random stop angle
    const fullRotations = 1800; // 5 full rotations in 4 seconds
    const finalAngle = fullRotations + randomAngle;

    // animation
    circle.style.transition = 'transform 4s cubic-bezier(0.1, 0.9, 0.2, 1)';
    circle.style.transform = `rotate(${finalAngle}deg)`;

    setTimeout(() => {
        const normalizedAngle = finalAngle % 360;
        circle.style.transition = 'none';
        circle.style.transform = `rotate(${normalizedAngle}deg)`;

        const sectorSize = 360 / circleSector.length;
        const selectedIndex = Math.floor((360 - normalizedAngle) / sectorSize) % circleSector.length;

        const selectedSector = circleSector[selectedIndex];
        chosenStudent.textContent = selectedSector ? selectedSector.name : ''; // show winner's name

    }, 4000);
}

// spin button
const btn = document.querySelector('.submitWheel').addEventListener('click', function () {
    spinWheel()
});

// spin wheel on click
circle.addEventListener('click', () => {
    spinWheel();
});

// name search function
function searchForNames() {
    searchBarInput.addEventListener('input', () => {
        const query = searchBarInput.value.toLowerCase();

        // filter name list
        labels.forEach((label) => {
            const name = label.textContent.toLowerCase();
            if (name.includes(query)) {
                label.style.display = ''; // show matching names
            } else {
                label.style.display = 'none'; // hide non-matching names
            }
        });
    });
}
searchForNames();

let isActive = false; // input state flag

searchBox.addEventListener('click', () => {
    if (!isActive) {
        searchBarInput.disabled = false;
        searchBarInput.focus();
        searchIcon.innerHTML = `
        <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
        `;
        isActive = true;
    }
});

searchBtn.addEventListener('click', () => {
    if (isActive) {
        searchBarInput.value = ''; // clear search field
        searchBarInput.blur(); // remove focus
        searchIcon.innerHTML = `
        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
        `;
        isActive = false;

        // show all labels again
        labels.forEach((label) => {
            label.style.display = '';
        });
    }
});

document.addEventListener('click', (event) => {
    if (!searchBtn.contains(event.target) && !searchBarInput.contains(event.target) && !searchBox.contains(event.target) && !namesBox.contains(event.target) && isActive) {
        searchBarInput.blur(); // remove focus
        searchIcon.innerHTML = `
        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
        `;
        isActive = false;
    }
});

// open burger menu on small screens
document.querySelector('.burger').addEventListener('click', function () {
    document.querySelector('.burgerBox').classList.toggle('active');
    document.querySelector('.menu').classList.toggle('active');
});