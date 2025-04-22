import { Student } from "../interfaces/Student";
import { Teacher } from "../interfaces/Teacher";
import { User } from "../interfaces/User";
import { ServiceConfig } from "./ServiceConfig";

const API_URL = ServiceConfig.API_URL;

export class UserService {

    static async editUser(userData: { userId: string; firstName: string; lastName: string; email: string; }) {
        await fetch(ServiceConfig.API_URL+`/edit-user`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to edit user");
            }
            console.log(response);
            return response.json();
        })
        .then(data => {
            alert("User edited successfully!");
        })
        .catch(error => {
            console.error("Error editing user:", error);
            alert("Error editing user. Please try again.");
        });
    }

    static async createUser(userData: { userId: string; firstName: string; lastName: string; email: string; }, role: string) {
        let apiEndpoint = role === "student" ? "/create-student" : "/create-teacher";
        await fetch(ServiceConfig.API_URL+apiEndpoint, {
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
        })
        .catch(error => {
            console.error("Error creating user:", error);
            alert("Error creating user. Please try again.");
        });
    }

    static async fetchTeachers(): Promise<Teacher[]> {
        try {
            const response = await fetch(API_URL + "/teachers");
            if (!response.ok) {
                throw new Error("Network response was not ok " + response.statusText);
            }
            const data: Teacher[] = await response.json();
            return data;
        } catch (error) {
            console.error("Error fetching users:", error);
            return []; 
        }
    }

    static async fetchStudents(): Promise<Student[]> {
        try {
            const response = await fetch(API_URL + "/students/admin");
            if (!response.ok) {
                throw new Error("Network response was not ok " + response.statusText);
            }
            const data: Student[] = await response.json();
            console.log(data[0]);
            return data;
        } catch (error) {
            console.error("Error fetching users:", error);
            return []; 
        }
    }

    static async fetchUsers(): Promise<User[]> {
        try {
            const response = await fetch(API_URL + "/users");
            if (!response.ok) {
                throw new Error("Network response was not ok " + response.statusText);
            }
            const data: User[] = await response.json();
            return data;
        } catch (error) {
            console.error("Error fetching users:", error);
            return []; 
        }
    }

    static async deleteUser(userId:string) {
        await fetch(API_URL + `/delete-user/${userId}`, {
            method: "DELETE"
        })
        .then(response => {
            if (!response.ok) throw new Error("Failed to delete user");
            alert("User deleted successfully!");
        })
        .catch(error => {
            console.error("Error deleting user:", error);
            alert("Failed to delete user.");
        });
    }
}