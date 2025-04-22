let allCodes = []; // Store fetched users for filtering
import $ from "jquery";
import "datatables.net";
import { CodeService } from "./services/CodeService";
import { ServiceConfig } from "./services/ServiceConfig";
fetchCodes();
function fetchCodes() {
    setupUI();
    CodeService.fetchCodes().then((codes) => {
        displayCodes(codes);
    });
}
// Function to set up UI (adds search bar only once)
function setupUI() {
    let codeContainer = document.getElementById("code-container");
    if (!codeContainer) {
        console.error("Error: code-container element not found.");
        return;
    }
    // Ensure the search bar is only created once
    if (!document.getElementById("search-input")) {
        let searchInput = document.createElement("input");
        searchInput.type = "text";
        searchInput.id = "search-input";
        searchInput.placeholder = "Search by Beacon ID/Teacher...";
        searchInput.onkeyup = filterCodes;
        searchInput.style.marginBottom = "10px";
        codeContainer.appendChild(searchInput);
    }
    // Ensure the "Create Code" button is only created once
    if (!document.getElementById("create-code-btn")) {
        let createCodeBtn = document.createElement("button");
        createCodeBtn.id = "create-code-btn";
        createCodeBtn.innerText = "Create Code";
        createCodeBtn.onclick = openCreateCodeModal; // Attach event handler
        createCodeBtn.style.marginLeft = "10px";
        codeContainer.appendChild(createCodeBtn);
    }
    // Ensure table container exists (prevents duplicate containers)
    if (!document.getElementById("table-container")) {
        let tableContainer = document.createElement("div");
        tableContainer.id = "table-container";
        codeContainer.appendChild(tableContainer);
    }
    // Ensure modal container exists
    if (!document.getElementById("modal-container")) {
        let modalContainer = document.createElement("div");
        modalContainer.id = "modal-container";
        modalContainer.style.display = "none"; // Initially hidden
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
// Function to filter users by name dynamically
function filterCodes() {
    let searchInput = document.getElementById("search-input");
    let searchValue = searchInput.value.toLowerCase().trim(); // Trim to remove extra spaces
    let filteredCodes = allCodes.filter(code => code.teacher.firstName.toLowerCase().includes(searchValue) ||
        code.teacher.lastName.toLowerCase().includes(searchValue) ||
        code.teacher.userId.toLowerCase().includes(searchValue) ||
        code.beaconId.toLowerCase().includes(searchValue));
    displayCodes(filteredCodes); // Update the table dynamically
}
// Function to display users dynamically
function displayCodes(codes) {
    let tableContainer = document.getElementById("table-container");
    if (!tableContainer) {
        console.error("Error: table-container not found.");
        return;
    }
    tableContainer.innerHTML = ""; // Clear previous table content
    let table = document.createElement("table");
    table.border = "1";
    table.id = "codesTable";
    table.style.width = "80%";
    table.style.margin = "20px auto";
    // Create table header
    let thead = document.createElement("thead");
    thead.innerHTML = `
        <tr>
            <th>Beacon ID</th>
            <th>User ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Options</th>
        </tr>
    `;
    table.appendChild(thead);
    // Create table body
    let tbody = document.createElement("tbody");
    codes.forEach(code => {
        let row = document.createElement("tr");
        row.innerHTML = `
            <td>${code.beaconId}</td>
            <td>${code.teacher == null ? "-" : code.teacher.userId}</td>
            <td>${code.teacher == null ? "-" : code.teacher.firstName}</td>
            <td>${code.teacher == null ? "-" : code.teacher.lastName}</td>
            <td>
                <div style="position: relative;">
                    <button onclick="toggleDropdown('${code.beaconId}')">⋮</button>
                    <div id="dropdown-${code.beaconId}" class="dropdown-menu" style="display: none; position: absolute; 
                    right: 0; background: white; border: 1px solid black; box-shadow: 1px 1px 2px rgba(0,0,0,0.2); z-index: 1000;">
                        <button onclick="assignCode('${code.codeId}')">Assign</button>
                        <button onclick="deleteCode('${code.codeId}')">Delete</button>
                    </div>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
    table.appendChild(tbody);
    tableContainer.appendChild(table); // Append updated table to the container
    setTimeout(() => {
        $("#codesTable").DataTable();
    }, 200);
}
function openCreateCodeModal() {
    let modalContainer = document.getElementById("modal-container");
    if (!modalContainer)
        return;
    modalContainer.innerHTML = `
        <h2>Create New Code</h2>
        <label>Beacon ID:</label>
        <input type="text" id="beacon-id" /><br><br>

        <button onclick="createCode()">Create</button>
        <button onclick="closeCreateCodeModal()">Cancel</button>
    `;
    modalContainer.style.display = "block"; // Show modal
}
function createCode() {
    let beaconId = document.getElementById("beacon-id").value;
    console.log(!beaconId);
    if (!beaconId)
        console.log("inside");
    beaconId = "1111111";
    let apiEndpoint = "/create-code";
    fetch(ServiceConfig.API_URL + apiEndpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: beaconId
    })
        .then(response => {
        if (!response.ok) {
            throw new Error("Failed to create code");
        }
        return response.json();
    })
        .then(data => {
        alert("Code created successfully!");
        closeCreateCodeModal(); // Close modal after successful creation
        fetchCodes(); // Refresh user list
    })
        .catch(error => {
        console.error("Error creating Code:", error);
        alert("Error creating code. Please try again.");
    });
}
function closeCreateCodeModal() {
    let modalContainer = document.getElementById("modal-container");
    if (modalContainer) {
        modalContainer.style.display = "none"; // Hide modal
    }
}
function toggleDropdown(beaconId) {
    let dropdown = document.getElementById(`dropdown-${beaconId}`);
    if (!dropdown)
        return;
    // Hide all other dropdowns first
    document.querySelectorAll(".dropdown-menu").forEach(menu => {
        if (menu !== dropdown)
            menu.style.display = "none";
    });
    // Toggle the current dropdown
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
}
// Close dropdown if clicked outside
document.addEventListener("click", function (event) {
    if (!event.target.closest(".dropdown-menu") && !event.target.closest("button")) {
        document.querySelectorAll(".dropdown-menu").forEach(menu => {
            menu.style.display = "none";
        });
    }
});
function deleteCode(codeId) {
    if (!confirm("Are you sure you want to delete this code?"))
        return;
    CodeService.deleteCode(codeId);
    fetchCodes();
}
function assignCode(codeId) {
}
window.fetchCodes = fetchCodes;
window.filterCodes = filterCodes;
window.setupUI = setupUI;
window.displayCodes = displayCodes;
window.openCreateCodeModal = openCreateCodeModal;
window.createCode = createCode;
window.closeCreateCodeModal = closeCreateCodeModal;
window.deleteCode = deleteCode;
window.toggleDropdown = toggleDropdown;
