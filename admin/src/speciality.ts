import { Module } from "./interfaces/Module";
import { Speciality } from "./interfaces/Speciality";
import { Student } from "./interfaces/Student";
import { Teacher } from "./interfaces/Teacher";
import { ModuleService } from "./services/ModuleService";
import { SpecialityService } from "./services/SpecialityService";
import { UserService } from "./services/UserService";


let speciality: Speciality;
let specialityId: string;
let allStudents: Student[];
let allModules: Module[];

export function viewSpeciality(specialityIdPassed: string) {
    specialityId = specialityIdPassed;
    setupUI();
    fetchModules();
    fetchStudentsOfSpeciality();

}

function setupUI() {
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

    // Modules
    let moduleContainer = document.getElementById("module-container");
    if (!moduleContainer) {
        console.error("Error: module-container element not found.");
        return;
    }

    if (!document.getElementById("reload-modules-button")) {
        let reloadModulesButton = document.createElement("button");
        reloadModulesButton.id = "reload-modules-button";
        reloadModulesButton.textContent = "re-load modules";
        reloadModulesButton.addEventListener("click", () => fetchModules());
        moduleContainer.appendChild(reloadModulesButton);
    }

    if (!document.getElementById("create-module-button")) {
        let createModuleButton = document.createElement("button");
        createModuleButton.id = "create-module-button";
        createModuleButton.textContent = "create module";
        createModuleButton.addEventListener("click", () => openCreateModuleModal());
        moduleContainer.appendChild(createModuleButton);
    }

    // Ensure table container exists (prevents duplicate containers)
    if (!document.getElementById("module-table-container")) {
        let tableContainer = document.createElement("div");
        tableContainer.id = "module-table-container";
        moduleContainer.appendChild(tableContainer);
    }



    // Students
    let studentContainer = document.getElementById("student-container");
    if (!studentContainer) {
        console.error("Error: student-container element not found.");
        return;
    }

    if (!document.getElementById("reload-students-button")) {
        let reloadStudentsButton = document.createElement("button");
        reloadStudentsButton.id = "reload-students-button";
        reloadStudentsButton.textContent = "re-load students";
        reloadStudentsButton.addEventListener("click", () => fetchStudentsOfSpeciality());
        studentContainer.appendChild(reloadStudentsButton);
    }

    if (!document.getElementById("add-student-button")) {
        let addStudentButton = document.createElement("button");
        addStudentButton.id = "add-student-button";
        addStudentButton.textContent = "add student";
        addStudentButton.addEventListener("click", () => openAddStudentModal());
        studentContainer.appendChild(addStudentButton);
    }

    // Ensure table container exists (prevents duplicate containers)
    if (!document.getElementById("student-table-container")) {
        let tableContainer = document.createElement("div");
        tableContainer.id = "student-table-container";
        studentContainer.appendChild(tableContainer);
    }


}

function fetchModules() {
    SpecialityService.fetchModulesOfSpeciality(specialityId)
        .then((modules: Module[]) => {
            displayModules(modules);
        })
}

function fetchStudentsOfSpeciality() {
    SpecialityService.fetchStudentsOfSpeciality(specialityId)
        .then((students: Student[]) => {
            displayStudents(students);
        })
}

function editModules() {

}

function editStudents() {

}

function displayModules(modules: Module[]) {

    let createModuleButton = document.createElement("button");
    createModuleButton.textContent = "create Module";
    createModuleButton.addEventListener("click", () => openCreateModuleModal());

    let tableContainer = document.getElementById("module-table-container");
    if (!tableContainer) {
        console.error("Error: module-table-container not found.");
        return;
    }

    tableContainer.innerHTML = ""; // Clear previous table content

    let table = document.createElement("table");
    table.border = "1";
    table.id = "modulesTable"
    table.style.width = "80%";
    table.style.margin = "20px auto";

    // Create table header
    let thead = document.createElement("thead");
    thead.innerHTML = `
            <tr>
                <th>Module ID</th>
                <th>Name</th>
                <th>Teachers</th>
                <th>Options</th>
            </tr>
        `;
    table.appendChild(thead);

    // Create table body
    let tbody = document.createElement("tbody");
    modules.forEach(module => {
        let row = document.createElement("tr");
        row.innerHTML = `
                <td>${module.moduleId}</td>
                <td>${module.moduleName}</td>
                <td>
                ${module.teachers && module.teachers.length > 0
                ? module.teachers.map((teacher: Teacher) => `${teacher.firstName} ${teacher.lastName}`).join(", ")
                : "-"}
                </td>
            `;
        // Create dropdown container
        let containerDiv = document.createElement("div");
        containerDiv.style.position = "relative";

        // Create dropdown toggle button
        let toggleButton = document.createElement("button");
        toggleButton.textContent = "⋮";
        toggleButton.addEventListener("click", () => toggleDropdown(module.moduleId));

        // Create dropdown menu
        let dropdownMenu = document.createElement("div");
        dropdownMenu.id = `dropdown-${module.moduleId}`;
        dropdownMenu.classList.add("dropdown-menu");
        dropdownMenu.style.display = "none";
        dropdownMenu.style.position = "absolute";
        dropdownMenu.style.right = "0";
        dropdownMenu.style.background = "white";
        dropdownMenu.style.border = "1px solid black";
        dropdownMenu.style.boxShadow = "1px 1px 2px rgba(0,0,0,0.2)";
        dropdownMenu.style.zIndex = "1000";

        // Create Edit button dynamically
        let assignTeacherButton = document.createElement("button");
        assignTeacherButton.textContent = "assign teacher";
        assignTeacherButton.addEventListener("click", () => openAssignTeacherModal(module.moduleId, false));

        // Create Edit button dynamically
        let removeTeacherButton = document.createElement("button");
        removeTeacherButton.textContent = "remove teacher";
        removeTeacherButton.addEventListener("click", () => openAssignTeacherModal(module.moduleId, true));

        // Create Edit button dynamically
        let moveModuleButton = document.createElement("button");
        moveModuleButton.textContent = "move";
        moveModuleButton.addEventListener("click", () => openMoveModuleModal(module.moduleId));

        // Create Delete button dynamically
        let deleteButton = document.createElement("button");
        deleteButton.textContent = "delete";
        deleteButton.addEventListener("click", () => deleteModule(module.moduleId));

        // Append buttons to dropdown
        dropdownMenu.appendChild(assignTeacherButton);
        dropdownMenu.appendChild(removeTeacherButton);
        dropdownMenu.appendChild(moveModuleButton);
        dropdownMenu.appendChild(deleteButton);

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

    $("#modulesTable").DataTable();
}

function displayStudents(students: Student[]) {

    let tableContainer = document.getElementById("student-table-container");
    if (!tableContainer) {
        console.error("Error: student-table-container not found.");
        return;
    }

    tableContainer.innerHTML = ""; // Clear previous table content

    let table = document.createElement("table");
    table.border = "1";
    table.id = "studentsTable"
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
                <th>Options</th>
            </tr>
        `;
    table.appendChild(thead);

    // Create table body
    let tbody = document.createElement("tbody");
    students.forEach(student => {
        let row = document.createElement("tr");
        row.innerHTML = `
                <td>${student.userId}</td>
                <td>${student.firstName}</td>
                <td>${student.lastName}</td>
                <td>${student.email}</td>
            `;

        // Create dropdown container
        let containerDiv = document.createElement("div");
        containerDiv.style.position = "relative";

        // Create Delete button dynamically
        let deleteButton = document.createElement("button");
        deleteButton.textContent = "remove";
        deleteButton.addEventListener("click", () => removeUser(student.userId));

        // Assemble dropdown
        containerDiv.appendChild(deleteButton);

        // Append dropdown container to new options cell
        let optionsCell = document.createElement("td");
        optionsCell.appendChild(containerDiv);
        row.appendChild(optionsCell);
        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    tableContainer.appendChild(table); // Append updated table to the container

    $("#studentsTable").DataTable();
}

function toggleDropdown(itemId: string) {
    let dropdown = document.getElementById(`dropdown-${itemId}`) as HTMLElement;
    if (!dropdown) return;

    // Hide all other dropdowns first
    document.querySelectorAll(".dropdown-menu").forEach(menu => {
        if (menu !== dropdown) (menu as HTMLElement).style.display = "none";
    });

    // Toggle the current dropdown
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
}

function removeUser(userId: string) {
    SpecialityService.decoupleStudent({userId, specialityId});
    setTimeout(() => {
        fetchStudentsOfSpeciality();
    }, 200);
}

function moveModule(moduleId: string, newSpecialityId: string) {
    ModuleService.reassignModule({ moduleId, newSpecialityId })
    setTimeout(() => {
        fetchModules();
    }, 100);
}

function openMoveModuleModal(moduleId: string) {

    let modal = document.getElementById("modal-container");
    if (!modal) {
        console.error("Modal container not found");
        return;
    }

    // Modal header
    let modalHeader = document.createElement("h2");
    modalHeader.innerText = "Move Module";

    // Close button
    let closeButton = document.createElement("button");
    closeButton.innerText = "Close";
    closeButton.style.float = "right";
    closeButton.style.marginBottom = "10px";
    closeButton.onclick = () => closeModal();

    // Create table
    let table = document.createElement("table");
    table.border = "1";
    table.id = "moveModuleTable";
    table.style.width = "100%";
    table.style.marginTop = "10px";

    // Create table header
    let thead = document.createElement("thead");
    thead.innerHTML = `
        <tr>
            <th>Speciality Name</th>
        </tr>
    `;
    table.appendChild(thead);

    // Create table body
    let tbody = document.createElement("tbody");

    // Fetch teachers and populate table
    SpecialityService.fetchSpecialities().then((specialities: Speciality[]) => {
        specialities.forEach(newSpeciality => {
            let row = document.createElement("tr");
            row.onclick = () => {
                moveModule(moduleId, newSpeciality.id)
                closeModal();
            };

            row.innerHTML = `
                <td>${newSpeciality.specialityName}</td>
            `;
            tbody.appendChild(row);
        });
    });

    table.appendChild(tbody);
    setTimeout(() => {
        $("#moveModuleTable").DataTable();
    }, 100);

    modal.appendChild(closeButton);
    modal.appendChild(modalHeader);
    modal.appendChild(table);
    modal.style.display = "block";
}

function deleteModule(moduleId: string): any {
    if (!confirm("Are you sure you want to delete this module?")) return;
    ModuleService.deleteModule(moduleId);
    setTimeout(() => {
        fetchModules();
    }, 200);
}


function openCreateModuleModal(): any {
    let modalContainer = document.getElementById("modal-container");
    if (!modalContainer) return;

    modalContainer.innerHTML = `
        <h2>Create New Module</h2>

        <label>Name:</label>
        <input type="text" id="module-name" onkeydown="if(event.key === 'Enter'){ createModule(); }" /><br><br>

        <button onclick="createModule()">Create</button>
        <button onclick="closeModal()">Cancel</button>
    `;

    modalContainer.style.display = "block";
}

function openAssignTeacherModal(moduleId: string, remove: boolean) {

    let modal = document.getElementById("modal-container");
    if (!modal) {
        console.error("Modal container not found");
        return;
    }

    // Modal header
    let modalHeader = document.createElement("h2");
    modalHeader.innerText = remove ? "Remove teacher from Module" : "Assign teacher to Module";

    // Close button
    let closeButton = document.createElement("button");
    closeButton.innerText = "Close";
    closeButton.style.float = "right";
    closeButton.style.marginBottom = "10px";
    closeButton.onclick = () => closeModal();

    // Create table
    let table = document.createElement("table");
    table.border = "1";
    table.id = "assignModuleTeachersTable";
    table.style.width = "100%";
    table.style.marginTop = "10px";

    // Create table header
    let thead = document.createElement("thead");
    thead.innerHTML = `
        <tr>
            <th>User ID</th>
            <th>First Name</th>
            <th>Last Name</th>
        </tr>
    `;
    table.appendChild(thead);

    // Create table body
    let tbody = document.createElement("tbody");

    // Fetch teachers and populate table
    let gotTeachers: Promise<Teacher[]> = remove ? ModuleService.fetchTeachersOfModule(moduleId) : UserService.fetchTeachers();
    gotTeachers.then((teachers: Teacher[]) => {
        teachers.forEach(teacher => {
            let row = document.createElement("tr");

            // if(teacher && Array.isArray(student.specialities)){
            //     student.specialities.forEach((spec: Speciality) => {
            //         if (spec.id == specialityId)
            //             alreadyAdded = true;
            //     })
            // }
            // Make each row clickable
            row.onclick = () => {
                remove ? removeTeacher(moduleId, teacher.userId) : assignTeacher(moduleId, teacher.userId);
                closeModal();
            };

            row.innerHTML = `
                <td>${teacher.userId}</td>
                <td>${teacher.firstName}</td>
                <td>${teacher.lastName}</td>
            `;
            tbody.appendChild(row);
        });
    });

    table.appendChild(tbody);
    setTimeout(() => {
        $("#assignModuleTeachersTable").DataTable();
    }, 100);

    modal.appendChild(closeButton);
    modal.appendChild(modalHeader);
    modal.appendChild(table);
    modal.style.display = "block";
}


function createModule() {
    let moduleName = (document.getElementById("module-name") as HTMLInputElement).value.trim();

    if (!moduleName) {
        alert("Please fill in all fields.");
        return;
    }

    ModuleService.createModule({ moduleName, specialityId })
        .then(response => fetchModules())
        .then(response => closeModal());


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

function openAddStudentModal() {

    let modal = document.getElementById("modal-container");
    if (!modal) {
        console.error("Modal container not found");
        return;
    }

    // Modal header
    let modalHeader = document.createElement("h2");
    modalHeader.innerText = "Add Student";

    // Close button
    let closeButton = document.createElement("button");
    closeButton.innerText = "Close";
    closeButton.style.float = "right";
    closeButton.style.marginBottom = "10px";
    closeButton.onclick = () => closeModal();

    // Create table
    let table = document.createElement("table");
    table.border = "1";
    table.id = "addStudentTable";
    table.style.width = "100%";
    table.style.marginTop = "10px";

    // Create table header
    let thead = document.createElement("thead");
    thead.innerHTML = `
        <tr>
            <th>User ID</th>
            <th>First Name</th>
            <th>Last Name</th>
        </tr>
    `;
    table.appendChild(thead);

    // Create table body
    let tbody = document.createElement("tbody");

    // Fetch teachers and populate table
    UserService.fetchStudents().then((students: Student[]) => {
        students.forEach(student => {
            let alreadyAdded: Boolean = false;
            
            if(student.specialities && Array.isArray(student.specialities)){
                student.specialities.forEach((spec: Speciality) => {
                    if (spec.id == specialityId)
                        alreadyAdded = true;
                })
            }
                
            if (!alreadyAdded) {
                let row = document.createElement("tr");
                row.onclick = () => {
                    addStudent(student.userId);
                    closeModal();
                };

                row.innerHTML = `
                <td>${student.userId}</td>
                <td>${student.firstName}</td>
                <td>${student.lastName}</td>
                `;
                tbody.appendChild(row);
            }
        });
    });

    table.appendChild(tbody);
    setTimeout(() => {
        $("#addStudentTable").DataTable();
    }, 100);

    modal.appendChild(closeButton);
    modal.appendChild(modalHeader);
    modal.appendChild(table);
    modal.style.display = "block";
}

function addStudent(userId: string){
    SpecialityService.addStudentToSpeciality({userId, specialityId});
    setTimeout(() => {
        fetchStudentsOfSpeciality();
    }, 100);
    
}
(window as any).viewSpeciality = viewSpeciality;
(window as any).fetchModules = fetchModules;
(window as any).fetchStudentsOfSpeciality = fetchStudentsOfSpeciality;
(window as any).createModule = createModule;
(window as any).closeModal = closeModal;

function assignTeacher(moduleId: string, userId: string) {
    ModuleService.assignTeacherModule({ moduleId, userId });
    setTimeout(() => {
        fetchModules();
        closeModal();
    }, 100);
}

function removeTeacher(moduleId: string, userId: string) {
    ModuleService.decoupleTeacherModule({ moduleId, userId });
    setTimeout(() => {
        fetchModules();
        closeModal();
    }, 100);
}

