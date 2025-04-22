import { UserService } from "./services/UserService";
import $ from "jquery";
import "datatables.net";
import { ServiceConfig } from "./services/ServiceConfig";
let allUsers = []; // Store fetched users for filtering
fetchUsers();
function fetchUsers() {
    setupUI();
    UserService.fetchUsers().then((users) => {
        displayUsers(users);
    });
}
// Function to set up UI (adds search bar only once)
function setupUI() {
    let userContainer = document.getElementById("user-container");
    if (!userContainer) {
        console.error("Error: user-container element not found.");
        return;
    }
    // Ensure the search bar is only created once
    if (!document.getElementById("search-input")) {
        let searchInput = document.createElement("input");
        searchInput.type = "text";
        searchInput.id = "search-input";
        searchInput.placeholder = "Search by name...";
        searchInput.onkeyup = filterUsers;
        searchInput.style.marginBottom = "10px";
        userContainer.appendChild(searchInput);
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
// Function to display users dynamically
function displayUsers(users) {
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
    users.forEach(user => {
        let row = document.createElement("tr");
        row.innerHTML = `
            <td>${user.userId}</td>
            <td>${user.firstName}</td>
            <td>${user.lastName}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td>
                <div style="position: relative;">
                    <button onclick="toggleDropdown('${user.userId}')">⋮</button>
                    <div id="dropdown-${user.userId}" class="dropdown-menu" style="display: none; position: absolute; 
                    right: 0; background: white; border: 1px solid black; box-shadow: 1px 1px 2px rgba(0,0,0,0.2); z-index: 1000;">
                        <button onclick="editUser('${user.userId}')">Edit</button>
                        <button onclick="deleteUser('${user.userId}')">Delete</button>
                    </div>
                </div>
            </td>
        `;
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
    let searchInput = document.getElementById("search-input");
    let searchValue = searchInput.value.toLowerCase().trim(); // Trim to remove extra spaces
    let filteredUsers = allUsers.filter(user => user.firstName.toLowerCase().includes(searchValue) ||
        user.lastName.toLowerCase().includes(searchValue));
    displayUsers(filteredUsers); // Update the table dynamically
}
function openCreateUserModal() {
    let modalContainer = document.getElementById("modal-container");
    if (!modalContainer)
        return;
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
function createUser() {
    let userId = document.getElementById("user-id").value.trim();
    let firstName = document.getElementById("first-name").value.trim();
    let lastName = document.getElementById("last-name").value.trim();
    let email = document.getElementById("email").value.trim();
    let role = document.getElementById("role").value;
    if (!firstName || !lastName || !email) {
        alert("Please fill in all fields.");
        return;
    }
    let apiEndpoint = role === "student" ? "/create-student" : "/create-teacher";
    let userData = {
        userId: userId,
        firstName: firstName,
        lastName: lastName,
        email: email
    };
    fetch(ServiceConfig.API_URL + apiEndpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
    })
        .then(response => {
        if (!response.ok) {
            throw new Error("Failed to create user");
        }
        return response.json();
    })
        .then(data => {
        alert("User created successfully!");
        closeCreateUserModal(); // Close modal after successful creation
        fetchUsers(); // Refresh user list
    })
        .catch(error => {
        console.error("Error creating user:", error);
        alert("Error creating user. Please try again.");
    });
}
function closeCreateUserModal() {
    let modalContainer = document.getElementById("modal-container");
    if (modalContainer) {
        modalContainer.style.display = "none"; // Hide modal
    }
}
function toggleDropdown(userId) {
    let dropdown = document.getElementById(`dropdown-${userId}`);
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
function deleteUser(userId) {
    if (!confirm("Are you sure you want to delete this user?"))
        return;
    UserService.deleteUser(userId);
    setTimeout(() => {
        fetchUsers();
    }, 200);
}
window.fetchUsers = fetchUsers;
window.filterUsers = filterUsers;
window.setupUI = setupUI;
window.displayUsers = displayUsers;
window.openCreateUserModal = openCreateUserModal;
window.createUser = createUser;
window.closeCreateUserModal = closeCreateUserModal;
window.deleteUser = deleteUser;
window.toggleDropdown = toggleDropdown;
