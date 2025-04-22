import { User } from "./interfaces/User";
import { UserService } from "./services/UserService";
import $ from "jquery";
import "datatables.net";
import { ModuleService } from "./services/ModuleService";
import { ModuleLazy } from "./interfaces/ModuleLazy";
import { Speciality } from "./interfaces/Speciality";
import { SpecialityService } from "./services/SpecialityService";

let allUsers: User[] = []; // Store fetched users for filtering

fetchUsers();

function fetchUsers() {
    setupUI();
    UserService.fetchUsers().then((users: User[]) => {
        displayUsers(users);
    })
}

// Function to set up UI (adds search bar only once)
function setupUI() {
    let userContainer = document.getElementById("user-container");
    if (!userContainer) {
        console.error("Error: user-container element not found.");
        return;
    }

    // Ensure the "Create User" button is only created once
    if (!document.getElementById("create-user-btn")) {
        let createUserBtn = document.createElement("button");
        createUserBtn.id = "create-user-btn";
        createUserBtn.innerText = "Create User";
        createUserBtn.onclick = openCreateUserModal; // Attach event handler
        createUserBtn.style.marginLeft = "10px";
        userContainer.appendChild(createUserBtn);
    }

    // Ensure table container exists (prevents duplicate containers)
    if (!document.getElementById("table-container")) {
        let tableContainer = document.createElement("div");
        tableContainer.id = "table-container";
        userContainer.appendChild(tableContainer);
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

function displayUsers(users: User[]) {
    let tableContainer = document.getElementById("table-container");
    if (!tableContainer) {
        console.error("Error: table-container not found.");
        return;
    }

    tableContainer.innerHTML = ""; // Clear previous table content

    let table = document.createElement("table");
    table.border = "1";
    table.id = "usersTable";
    table.style.width = "80%";
    table.style.margin = "20px auto";

    // Create table header
    let thead = document.createElement("thead");
    thead.innerHTML = `
        <tr>
            <th>User ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Options</th>
        </tr>
    `;
    table.appendChild(thead);

    // Create table body
    let tbody = document.createElement("tbody");
    users.forEach((user: User) => {
        let row = document.createElement("tr");
        row.innerHTML = `
            <td>${user.userId}</td>
            <td>${user.firstName}</td>
            <td>${user.lastName}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
        `;

        // Create dropdown container
        let containerDiv = document.createElement("div");
        containerDiv.style.position = "relative";

        // Create dropdown toggle button
        let toggleButton = document.createElement("button");
        toggleButton.textContent = "⋮";
        toggleButton.addEventListener("click", () => toggleDropdown(user.userId));

        // Create dropdown menu
        let dropdownMenu = document.createElement("div");
        dropdownMenu.id = `dropdown-${user.userId}`;
        dropdownMenu.classList.add("dropdown-menu");
        dropdownMenu.style.display = "none";
        dropdownMenu.style.position = "absolute";
        dropdownMenu.style.right = "0";
        dropdownMenu.style.background = "white";
        dropdownMenu.style.border = "1px solid black";
        dropdownMenu.style.boxShadow = "1px 1px 2px rgba(0,0,0,0.2)";
        dropdownMenu.style.zIndex = "1000";

        // Create Edit button dynamically
        let editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () => openEditUserModal(user));

        // Create Delete button dynamically
        let deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => deleteUser(user.userId));

        // Append buttons to dropdown
        dropdownMenu.appendChild(editButton);
        dropdownMenu.appendChild(deleteButton);

        // Create Delete button dynamically
        let editSpecialitiesOrModules = document.createElement("button");
        if (user.role.toLowerCase() === "student") {
            editSpecialitiesOrModules.textContent = "Edit specialities";
            editSpecialitiesOrModules.addEventListener("click", () => openEditSpecialitiesModal(user.userId));
            dropdownMenu.appendChild(editSpecialitiesOrModules);
        } else if (user.role.toLowerCase() === "teacher") {
            editSpecialitiesOrModules.textContent = "Edit Modules";
            editSpecialitiesOrModules.addEventListener("click", () => openEditModulesModal(user.userId));
            dropdownMenu.appendChild(editSpecialitiesOrModules);
        }

        // Assemble dropdown
        containerDiv.appendChild(toggleButton);
        containerDiv.appendChild(dropdownMenu);

        // Append dropdown container to new options cell
        let optionsCell = document.createElement("td");
        optionsCell.appendChild(containerDiv);
        row.appendChild(optionsCell);

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    tableContainer.appendChild(table); // Append updated table to the container

    setTimeout(() => {
        $("#usersTable").DataTable();
    }, 100);
}



// Function to filter users by name dynamically
function filterUsers() {
    let searchInput = document.getElementById("search-input") as HTMLInputElement;
    let searchValue = searchInput.value.toLowerCase().trim(); // Trim to remove extra spaces

    let filteredUsers = allUsers.filter(user =>
        user.firstName.toLowerCase().includes(searchValue) ||
        user.lastName.toLowerCase().includes(searchValue)
    );

    displayUsers(filteredUsers); // Update the table dynamically
}

function openCreateUserModal() {
    let modalContainer = document.getElementById("modal-container");
    if (!modalContainer) return;

    modalContainer.innerHTML = `
        <h2>Create New User</h2>
        <label>User ID:</label>
        <input type="text" id="user-id" /><br><br>

        <label>First Name:</label>
        <input type="text" id="first-name" /><br><br>

        <label>Last Name:</label>
        <input type="text" id="last-name" /><br><br>

        <label>Email:</label>
        <input type="email" id="email" /><br><br>

        <label>Role:</label>
        <select id="role">
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
        </select><br><br>

        <button onclick="createUser()">Create</button>
        <button onclick="closeCreateUserModal()">Cancel</button>
    `;

    modalContainer.style.display = "block"; // Show modal
}

function openEditUserModal(user: User) {
    let modalContainer = document.getElementById("modal-container");
    if (!modalContainer) return;

    modalContainer.innerHTML = `
        <h2>Edit User</h2>

        <label>First Name:</label>
        <input type="text" id="first-name" placeholder="${user.firstName}"/><br><br>

        <label>Last Name:</label>
        <input type="text" id="last-name" placeholder="${user.lastName}" /><br><br>

        <label>Email:</label>
        <input type="email" id="email" placeholder="${user.email}"/><br><br>

        <button onclick="editUser('${user.userId}')">Update</button>
        <button onclick="closeCreateUserModal()">Cancel</button>
    `;

    modalContainer.style.display = "block"; // Show modal
}

function createUser() {
    let userId = (document.getElementById("user-id") as HTMLInputElement).value.trim();
    let firstName = (document.getElementById("first-name") as HTMLInputElement).value.trim();
    let lastName = (document.getElementById("last-name") as HTMLInputElement).value.trim();
    let email = (document.getElementById("email") as HTMLInputElement).value.trim();
    let role = (document.getElementById("role") as HTMLSelectElement).value;

    if (!firstName || !lastName || !email) {
        alert("Please fill in all fields.");
        return;
    }

    let userData = {
        userId: userId,
        firstName: firstName,
        lastName: lastName,
        email: email
    };

    UserService.createUser(userData, role);
    closeModal(); // Close modal after successful creation
    fetchUsers(); // Refresh user list
}

function editUser(userId: string) {
    let firstName = (document.getElementById("first-name") as HTMLInputElement).value.trim();
    let lastName = (document.getElementById("last-name") as HTMLInputElement).value.trim();
    let email = (document.getElementById("email") as HTMLInputElement).value.trim();

    //TODO validate entries: no space at end, @ in email etc.
    if (!firstName && !lastName && !email) {
        alert("No changes where made.");
        return;
    }

    let userData = {
        userId: userId,
        firstName: firstName,
        lastName: lastName,
        email: email
    };

    UserService.editUser(userData);
    closeModal(); 
    setTimeout(() => {
        fetchUsers();
    }, 200);
}

function closeModal() {
    let modalContainer = document.getElementById("modal-container");
    if (modalContainer) {
        modalContainer.style.display = "none";
        while (modalContainer.firstChild) {
            if (modalContainer.lastChild)
                modalContainer.removeChild(modalContainer.lastChild);
        }
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

function deleteUser(userId: string) {
    if (!confirm("Are you sure you want to delete this user?")) return;
    UserService.deleteUser(userId);
    setTimeout(() => {
        fetchUsers();
    }, 200);

}

function openEditModulesModal(userId: string) {

    let modal = document.getElementById("modal-container");
    if (!modal) {
        console.error("Modal container not found");
        return;
    }

    // Modal header
    let modalHeader = document.createElement("h2");
    modalHeader.innerText = "Edit Modules";

    // Close button
    let closeButton = document.createElement("button");
    closeButton.innerText = "Close";
    closeButton.style.float = "right";
    closeButton.style.marginBottom = "10px";
    closeButton.onclick = () => closeModal();

    

    // Create table
    let table = document.createElement("table");
    table.border = "1";
    table.id = "editModulesTable";
    table.style.width = "100%";
    table.style.marginTop = "10px";

    // Create table header
    let thead = document.createElement("thead");
    thead.innerHTML = `
        <tr>
            <th>Module ID</th>
            <th>Name</th>
            <th>Speciality</th>
            <th>Options</th>
        </tr>
    `;
    table.appendChild(thead);

    // Create table body
    let tbody = document.createElement("tbody");

    let modulesOfTeacher: ModuleLazy[] = []
    // Fetch teachers and populate table
    ModuleService.fetchModulesOfTeacher(userId).then((modules: ModuleLazy[]) => {
        modulesOfTeacher=modules;
        modules.forEach(module => {
            let row = document.createElement("tr");
            
            row.innerHTML = `
                <td>${module.moduleId}</td>
                <td>${module.moduleName}</td>
                <td>${module.speciality.specialityName}</td>
                <td>
                <button onclick="removeModule('${module.moduleId}', '${userId}')">Remove</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    });
    table.appendChild(tbody);
    setTimeout(() => {
        $("#editModulesTable").DataTable();
    }, 100);

    // add module button
    let addModuleButton = document.createElement("button");
    addModuleButton.innerText = "Add Module";
    addModuleButton.style.float = "right";
    addModuleButton.style.marginBottom = "10px";
    addModuleButton.onclick = () => openAddModuleToTeacherModal(modulesOfTeacher, userId);

    modal.appendChild(closeButton);
    modal.appendChild(modalHeader);
    modal.appendChild(addModuleButton);
    modal.appendChild(table);
    modal.style.display = "block";
}

function removeModule(moduleId: string, userId: string){
    ModuleService.decoupleTeacherModule({moduleId, userId});
    closeModal();
    setTimeout(() => {
        openEditModulesModal(userId);
    }, 100);
}
(window as any).fetchUsers = fetchUsers;
(window as any).filterUsers = filterUsers;
(window as any).setupUI = setupUI;
(window as any).displayUsers = displayUsers;
(window as any).openCreateUserModal = openCreateUserModal;
(window as any).createUser = createUser;
(window as any).closeCreateUserModal = closeModal;
(window as any).deleteUser = deleteUser;
(window as any).toggleDropdown = toggleDropdown;
(window as any).openEditUserModal = openEditUserModal;
(window as any).editUser = editUser;
(window as any).removeModule = removeModule;
(window as any).removeSpeciality = removeSpeciality;

function openAddModuleToTeacherModal(modulesOfTeacher: ModuleLazy[], userId: string) {

    let modal = document.getElementById("modal-container");
    if (!modal) {
        console.error("Modal container not found");
        return;
    }

    closeModal();
    
    // Modal header
    let modalHeader = document.createElement("h2");
    modalHeader.innerText = "Add Module";

    // Close button
    let closeButton = document.createElement("button");
    closeButton.innerText = "Close";
    closeButton.style.float = "right";
    closeButton.style.marginBottom = "10px";
    closeButton.onclick = () => closeModal();

    // Create table
    let table = document.createElement("table");
    table.border = "1";
    table.id = "addModuleTable";
    table.style.width = "100%";
    table.style.marginTop = "10px";

    // Create table header
    let thead = document.createElement("thead");
    thead.innerHTML = `
        <tr>
            <th>Module ID</th>
            <th>Name</th>
            <th>Speciality</th>
        </tr>
    `;
    table.appendChild(thead);

    // Create table body
    let tbody = document.createElement("tbody");

    // Fetch teachers and populate table
    ModuleService.fetchModules().then((modules: ModuleLazy[]) => {
        modules.forEach(module => {
            let alreadyAdded: Boolean = false;
            
            modulesOfTeacher.forEach(mod => {
                if(mod.moduleId === module.moduleId)
                    alreadyAdded = true;
            });
                
            if (!alreadyAdded) {
                let row = document.createElement("tr");
                row.onclick = () => {
                    addModule(module.moduleId, userId);
                    closeModal();
                };

                row.innerHTML = `
                <td>${module.moduleId}</td>
                <td>${module.moduleName}</td>
                <td>${module.speciality.specialityName}</td>
                `;
                tbody.appendChild(row);
            }
        });
    });

    table.appendChild(tbody);
    setTimeout(() => {
        $("#addModuleTable").DataTable();
    }, 100);

    modal.appendChild(closeButton);
    modal.appendChild(modalHeader);
    modal.appendChild(table);
    modal.style.display = "block";
}
function addModule(moduleId: string, userId:string){
    ModuleService.assignTeacherModule({moduleId, userId});
    setTimeout(() => {
        closeModal();
        openEditModulesModal(userId);
    }, 200);
}

function openEditSpecialitiesModal(userId: string) {

    let modal = document.getElementById("modal-container");
    if (!modal) {
        console.error("Modal container not found");
        return;
    }

    let modalHeader = document.createElement("h2");
    modalHeader.innerText = "Edit Specialities";

    // Close button
    let closeButton = document.createElement("button");
    closeButton.innerText = "Close";
    closeButton.style.float = "right";
    closeButton.style.marginBottom = "10px";
    closeButton.onclick = () => closeModal();

    

    // Create table
    let table = document.createElement("table");
    table.border = "1";
    table.id = "editSpecialitiesTable";
    table.style.width = "100%";
    table.style.marginTop = "10px";

    // Create table header
    let thead = document.createElement("thead");
    thead.innerHTML = `
        <tr>
            <th>Speciality ID</th>
            <th>Name</th>
            <th>Options</th>
        </tr>
    `;
    table.appendChild(thead);

    // Create table body
    let tbody = document.createElement("tbody");

    let specialitesOfStudent: Speciality[] = []
    // Fetch teachers and populate table
    SpecialityService.fetchSpecialitiesOfStudent(userId).then((specialities: Speciality[]) => {
        specialitesOfStudent=specialities;
        specialities.forEach(speciality => {
            let row = document.createElement("tr");
            
            row.innerHTML = `
                <td>${speciality.id}</td>
                <td>${speciality.specialityName}</td>
                <td>
                <button onclick="removeSpeciality('${speciality.id}', '${userId}')">Remove</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    });
    table.appendChild(tbody);
    setTimeout(() => {
        $("#editSpecialitiesTable").DataTable();
    }, 100);

    // add module button
    let addSpecialityButton = document.createElement("button");
    addSpecialityButton.innerText = "Add Speciality";
    addSpecialityButton.style.float = "right";
    addSpecialityButton.style.marginBottom = "10px";
    addSpecialityButton.onclick = () => openAddSpecialityToStudentModal(specialitesOfStudent, userId);

    modal.appendChild(closeButton);
    modal.appendChild(modalHeader);
    modal.appendChild(addSpecialityButton);
    modal.appendChild(table);
    modal.style.display = "block";
}

function removeSpeciality(specialityId: string, userId: string){
    SpecialityService.decoupleStudent({userId, specialityId});
    setTimeout(() => {
        closeModal();
        openEditSpecialitiesModal(userId);
    }, 300);
}

function openAddSpecialityToStudentModal(specialitesOfStudent: Speciality[], userId: string) {

    let modal = document.getElementById("modal-container");
    if (!modal) {
        console.error("Modal container not found");
        return;
    }

    closeModal();
    
    // Modal header
    let modalHeader = document.createElement("h2");
    modalHeader.innerText = "Add Speciality";

    // Close button
    let closeButton = document.createElement("button");
    closeButton.innerText = "Close";
    closeButton.style.float = "right";
    closeButton.style.marginBottom = "10px";
    closeButton.onclick = () => closeModal();

    // Create table
    let table = document.createElement("table");
    table.border = "1";
    table.id = "addSpecialityTable";
    table.style.width = "100%";
    table.style.marginTop = "10px";

    // Create table header
    let thead = document.createElement("thead");
    thead.innerHTML = `
        <tr>
            <th>Speciality ID</th>
            <th>Name</th>
        </tr>
    `;
    table.appendChild(thead);

    let tbody = document.createElement("tbody");

    // Fetch teachers and populate table
    SpecialityService.fetchSpecialities().then((specialities: Speciality[]) => {
        specialities.forEach(speciality => {
            let alreadyAdded: Boolean = false;
            
            specialitesOfStudent.forEach(spec => {
                if(spec.id === speciality.id)
                    alreadyAdded = true;
            });
                
            if (!alreadyAdded) {
                let row = document.createElement("tr");
                row.onclick = () => {
                    addSpeciality(speciality.id, userId);
                    closeModal();
                };

                row.innerHTML = `
                <td>${speciality.id}</td>
                <td>${speciality.specialityName}</td>
                `;
                tbody.appendChild(row);
            }
        });
    });

    table.appendChild(tbody);
    setTimeout(() => {
        $("#addSpecialityTable").DataTable();
    }, 100);

    modal.appendChild(closeButton);
    modal.appendChild(modalHeader);
    modal.appendChild(table);
    modal.style.display = "block";
}

function addSpeciality(specialityId: string, userId: string){
    SpecialityService.addStudentToSpeciality({userId, specialityId});
    setTimeout(() => {
        closeModal();
        openEditSpecialitiesModal(userId);
    }, 300);
}