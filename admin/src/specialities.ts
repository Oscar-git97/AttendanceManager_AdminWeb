import { Speciality } from "./interfaces/Speciality";
import { SpecialityService } from "./services/SpecialityService";
import $ from "jquery";
import "datatables.net";

let allSpecialities: Speciality[] = [];

fetchSpecialities();

function fetchSpecialities() {
    setupUI();
    SpecialityService.fetchSpecialities().then((specialities: Speciality[]) => {
        displaySpecialities(specialities);
    })
}

// set up UI 
function setupUI() {
    let specialityContainer = document.getElementById("speciality-container");
    if (!specialityContainer) {
        console.error("Error: speciality-container element not found.");
        return;
    }

    if (!document.getElementById("create-speciality-btn")) {
        let createSpecialityBtn = document.createElement("button");
        createSpecialityBtn.id = "create-speciality-btn";
        createSpecialityBtn.innerText = "Create speciality";
        createSpecialityBtn.onclick = openCreateSpecialityModal; // Attach event handler
        createSpecialityBtn.style.marginLeft = "10px";
        specialityContainer.appendChild(createSpecialityBtn);
    }

    // table container exists ?!?!
    if (!document.getElementById("table-container")) {
        let tableContainer = document.createElement("div");
        tableContainer.id = "table-container";
        specialityContainer.appendChild(tableContainer);
    }

    // modal container exists?!?!
    if (!document.getElementById("modal-container")) {
        let modalContainer = document.createElement("div");
        modalContainer.id = "modal-container";
        modalContainer.style.display = "none"; 
        modalContainer.style.position = "fixed";
        modalContainer.style.top = "50%";
        modalContainer.style.left = "50%";
        modalContainer.style.transform = "translate(-50%, -50%)";
        modalContainer.style.backgroundColor = "white";
        modalContainer.style.padding = "20px";
        modalContainer.style.border = "1px solid black";
        modalContainer.style.boxShadow = "0px 4px 6px rgba(0,0,0,0.1)";
        document.body.appendChild(modalContainer);
    }
}

function displaySpecialities(specialities: Speciality[]) {
    let tableContainer = document.getElementById("table-container");
    if (!tableContainer) {
        console.error("Error: table-container not found.");
        return;
    }

    tableContainer.innerHTML = ""; 

    let table = document.createElement("table");
    table.border = "1";
    table.id = "specialitiesTable";
    table.style.width = "80%";
    table.style.margin = "20px auto";

    let thead = document.createElement("thead");
    thead.innerHTML = `
        <tr>
            <th>Speciality ID</th>
            <th>Speciality Name</th>
            <th>Options</th>
        </tr>
    `;
    table.appendChild(thead);

    let tbody = document.createElement("tbody");
    specialities.forEach((speciality: Speciality) => {
        let row = document.createElement("tr");
        row.innerHTML = `
            <td>${speciality.id}</td>
            <td>${speciality.specialityName}</td>
        `;

        let containerDiv = document.createElement("div");
        containerDiv.style.position = "relative";

        // dropdown toggle button
        let toggleButton = document.createElement("button");
        toggleButton.textContent = "⋮";
        toggleButton.addEventListener("click", () => toggleDropdown(speciality.id));

        // create dropdown menu
        let dropdownMenu = document.createElement("div");
        dropdownMenu.id = `dropdown-${speciality.id}`;
        dropdownMenu.classList.add("dropdown-menu");
        dropdownMenu.style.display = "none";
        dropdownMenu.style.position = "absolute";
        dropdownMenu.style.right = "0";
        dropdownMenu.style.background = "white";
        dropdownMenu.style.border = "1px solid black";
        dropdownMenu.style.boxShadow = "1px 1px 2px rgba(0,0,0,0.2)";
        dropdownMenu.style.zIndex = "1000";

        // Edit button
        let editButton = document.createElement("button");
        const specialityMap = { id: speciality.id, specialityName: speciality.specialityName };
        const queryString = new URLSearchParams(specialityMap).toString();
        editButton.textContent = "View";
        editButton.addEventListener("click", () => location.href = `speciality.html?${queryString}`); 

        // Delete button
        let deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => deleteSpeciality(speciality.id)); 

        dropdownMenu.appendChild(editButton);
        dropdownMenu.appendChild(deleteButton);
        containerDiv.appendChild(toggleButton);
        containerDiv.appendChild(dropdownMenu);

        let optionsCell = document.createElement("td");
        optionsCell.appendChild(containerDiv);
        row.appendChild(optionsCell);

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    tableContainer.appendChild(table); 

    setTimeout(() => {
        $("#specialitiesTable").DataTable();
    }, 100);
}

function filterSpecialities() {
    let searchInput = document.getElementById("search-input") as HTMLInputElement;
    let searchValue = searchInput.value.toLowerCase().trim(); 

    let filteredSpecialities = allSpecialities.filter(speciality =>
        speciality.id.toLowerCase().includes(searchValue) ||
        speciality.specialityName.toLowerCase().includes(searchValue)
    );

    displaySpecialities(filteredSpecialities); 
}

function openCreateSpecialityModal() {
    let modalContainer = document.getElementById("modal-container");
    if (!modalContainer) return;

    modalContainer.innerHTML = `
        <h2>Create New Speciality</h2>

        <label>Speciality Name:</label>
        <input type="text" id="speciality-name" /><br><br>

        <button onclick="createSpeciality()">Create</button>
        <button onclick="closeCreateSpecialityModal()">Cancel</button>
    `;

    modalContainer.style.display = "block"; 
}

function openSpeciality(speciality: Speciality){


}

function createSpeciality() {
    let specialityName = (document.getElementById("speciality-name") as HTMLInputElement).value.trim();

    if (!specialityName) {
        alert("Please fill in all fields.");
        return;
    }

    SpecialityService.createSpeciality(specialityName);
    closeCreateUserModal(); 
    setTimeout(() => {
        fetchSpecialities();
    }, 300);
}

function closeCreateUserModal() {
    let modalContainer = document.getElementById("modal-container");
    if (modalContainer) {
        modalContainer.style.display = "none"; // Hide modal
    }
}

function toggleDropdown(userId: string) {
    let dropdown = document.getElementById(`dropdown-${userId}`) as HTMLElement;
    if (!dropdown) return;

    // Hide all other dropdowns first
    document.querySelectorAll(".dropdown-menu").forEach(menu => {
        if (menu !== dropdown) (menu as HTMLElement).style.display = "none";
    });

    // Toggle the current dropdown
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
}

// Close dropdown if clicked outside
document.addEventListener("click", function (event) {
    if (!(event.target as HTMLElement).closest(".dropdown-menu") && !(event.target as HTMLElement).closest("button")) {
        document.querySelectorAll(".dropdown-menu").forEach(menu => {
            (menu as HTMLElement).style.display = "none";
        });
    }
});

function deleteSpeciality(specialityId: string) {
    if (!confirm("Are you sure you want to delete this speciality?")) return;
    SpecialityService.deleteSpeciality(specialityId);
    setTimeout(() => {
        fetchSpecialities();
    }, 200);

}

(window as any).fetchSpecialities = fetchSpecialities;
(window as any).filterSpecialities = filterSpecialities;
(window as any).setupUI = setupUI;
(window as any).displaySpecialities = displaySpecialities;
(window as any).openCreateSpecialityModal = openCreateSpecialityModal;
(window as any).createSpeciality = createSpeciality;
(window as any).closeCreateUserModal = closeCreateUserModal;
(window as any).deleteSpeciality = deleteSpeciality;
(window as any).toggleDropdown = toggleDropdown;
(window as any).editSpeciality = openSpeciality;


