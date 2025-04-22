import { Code } from "./interfaces/Code";

let allCodes: Code[] = []; 
import $ from "jquery";
import "datatables.net";
import { CodeService } from "./services/CodeService";
import { ServiceConfig } from "./services/ServiceConfig";
import { Teacher } from "./interfaces/Teacher";
import { UserService } from "./services/UserService";
import { User } from "./interfaces/User";

fetchCodes();

function fetchCodes(){
    setupUI();
    CodeService.fetchCodes().then((codes: Code[]) => {
                    displayCodes(codes);
                })
}

function setupUI() {
    let codeContainer = document.getElementById("code-container");
    if (!codeContainer) {
        console.error("Error: code-container element not found.");
        return;
    }

    if (!document.getElementById("create-code-btn")) {
        let createCodeBtn = document.createElement("button");
        createCodeBtn.id = "create-code-btn";
        createCodeBtn.innerText = "Create Code";
        createCodeBtn.onclick = openCreateCodeModal; 
        createCodeBtn.style.marginLeft = "10px";
        codeContainer.appendChild(createCodeBtn);
    }

    if (!document.getElementById("table-container")) {
        let tableContainer = document.createElement("div");
        tableContainer.id = "table-container";
        codeContainer.appendChild(tableContainer);
    }

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

function filterCodes() {
    let searchInput = document.getElementById("search-input") as HTMLInputElement;
    let searchValue = searchInput.value.toLowerCase().trim(); 

    let filteredCodes = allCodes.filter(code =>
        code.teacher.firstName.toLowerCase().includes(searchValue) || 
        code.teacher.lastName.toLowerCase().includes(searchValue) ||
        code.teacher.userId.toLowerCase().includes(searchValue) ||
        code.beaconId.toLowerCase().includes(searchValue)
    );

    displayCodes(filteredCodes); 
}

function displayCodes(codes: Code[]) {
    let tableContainer = document.getElementById("table-container");
    if (!tableContainer) {
        console.error("Error: table-container not found.");
        return;
    }

    tableContainer.innerHTML = ""; 
    let table = document.createElement("table");
    table.border = "1";
    table.id = "codesTable"
    table.style.width = "80%";
    table.style.margin = "20px auto";

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
                        <button onclick="openAssignModal('${code.codeId}')">Assign</button>
                        <button onclick="decouple('${code.teacher == null ? "-" : code.teacher.userId}')">Decouple</button>
                        <button onclick="deleteCode('${code.codeId}')">Delete</button>
                    </div>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    tableContainer.appendChild(table); 

    setTimeout(() => {
        $("#codesTable").DataTable();
    }, 100);
    
}

function openCreateCodeModal() {
    let modalContainer = document.getElementById("modal-container");
    if (!modalContainer) return;

    modalContainer.innerHTML = `
        <h2>Create New Code</h2>
        <label>Beacon ID:</label>
        <input type="text" id="beacon-id" /><br><br>

        <button onclick="createCode()">Create</button>
        <button onclick="closeCreateCodeModal()">Cancel</button>
    `;

    modalContainer.style.display = "block";
}

function createCode() {
    let beaconId = (document.getElementById("beacon-id") as HTMLInputElement).value;

    if (!beaconId){
        alert("Please fill in a Beacon Id.");
        return;
    }

    let apiEndpoint = "/create-code";

    fetch(ServiceConfig.API_URL+apiEndpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: beaconId
        
    })
    .then(response => {
        console.log(beaconId, "was sent")
        console.log(response)
        if (response.status == 400)
            throw new Error("Beacon ID already exists")
        if (!response.ok) {
            throw new Error("Failed to create code");
        }
        return response.json();
    })
    .then(data => {
        alert("Code created successfully!");
        closeCreateCodeModal(); 
        fetchCodes();
    })
    .catch(error => {
        console.error("Error creating Code:", error);
        alert("Error creating Code:"+ error);
    });
}

function closeCreateCodeModal() {
    let modalContainer = document.getElementById("modal-container");
    if (modalContainer) {
        modalContainer.style.display = "none";
    }
}

function toggleDropdown(beaconId: string) {
    let dropdown = document.getElementById(`dropdown-${beaconId}`) as HTMLElement;
    if (!dropdown) return;

    document.querySelectorAll(".dropdown-menu").forEach(menu => {
        if (menu !== dropdown) (menu as HTMLElement).style.display = "none";
    });

    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
}

document.addEventListener("click", function (event) {
    if (!(event.target as HTMLElement).closest(".dropdown-menu") && !(event.target as HTMLElement).closest("button")) {
        document.querySelectorAll(".dropdown-menu").forEach(menu => {
            (menu as HTMLElement).style.display = "none";
        });
    }
});

function deleteCode(codeId: string) {
    if (!confirm("Are you sure you want to delete this code?")) return;
    CodeService.deleteCode(codeId);
    fetchCodes();
}

function assignCode(codeId: string, userId: string){
    CodeService.assignCode(codeId, userId);
    closeCreateCodeModal();
    setTimeout(() => {
        fetchCodes();
    }, 200);
}

function decouple(userId: string){
    if (userId == "-") {
        console.log("null null baby");
        return;}
    CodeService.decouple(userId);
    setTimeout(() => {
        fetchCodes();
    }, 200);
}

function openAssignModal(codeId: string) {
    let existingModal = document.getElementById("assign-modal");
    if (existingModal) {
        existingModal.remove();
    }

    let modal = document.createElement("div");
    modal.id = "assign-modal";
    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.width = "100%";
    modal.style.height = "100%";
    modal.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    modal.style.display = "flex";
    modal.style.justifyContent = "center";
    modal.style.alignItems = "center";
    modal.style.zIndex = "1000";

    let modalContent = document.createElement("div");
    modalContent.style.backgroundColor = "white";
    modalContent.style.padding = "20px";
    modalContent.style.borderRadius = "8px";
    modalContent.style.width = "60%";
    modalContent.style.maxHeight = "80vh";
    modalContent.style.overflowY = "auto";

    let modalHeader = document.createElement("h2");
    modalHeader.innerText = "Assign Teacher to Code";
    
    let closeButton = document.createElement("button");
    closeButton.innerText = "Close";
    closeButton.style.float = "right";
    closeButton.style.marginBottom = "10px";
    closeButton.onclick = () => modal.remove();

    let table = document.createElement("table");
    table.border = "1";
    table.id = "assignCodeTeachersTable"
    table.style.width = "100%";
    table.style.marginTop = "10px";

    let thead = document.createElement("thead");
    thead.innerHTML = `
        <tr>
            <th>User ID</th>
            <th>First Name</th>
            <th>Last Name</th>
        </tr>
    `;
    table.appendChild(thead);

    let tbody = document.createElement("tbody");

    UserService.fetchTeachers().then((teachers: Teacher[]) => {
        teachers.forEach(teacher => {
            let row = document.createElement("tr");

            row.onclick = () => {
                assignCode(codeId, teacher.userId);  
                modal.remove(); 
            };

            row.innerHTML = `
                <td>${teacher.userId}</td>
                <td>${teacher.firstName}</td>
                <td>${teacher.lastName}</td>
            `;
            tbody.appendChild(row);
        });

        table.appendChild(tbody);

        $("#assignCodeTeachersTable").DataTable(); 
    });

    modalContent.appendChild(closeButton);
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(table);
    modal.appendChild(modalContent);

    document.body.appendChild(modal);
}


(window as any).fetchCodes = fetchCodes;
(window as any).filterCodes = filterCodes;
(window as any).setupUI = setupUI;
(window as any).displayCodes = displayCodes;
(window as any).openCreateCodeModal = openCreateCodeModal;
(window as any).createCode = createCode;
(window as any).closeCreateCodeModal = closeCreateCodeModal;
(window as any).deleteCode = deleteCode;
(window as any).toggleDropdown = toggleDropdown;
(window as any).openAssignModal = openAssignModal;
(window as any).decouple = decouple;
