import { Module } from "../interfaces/Module";
import { Speciality } from "../interfaces/Speciality";
import { Student } from "../interfaces/Student";
import { ServiceConfig } from "./ServiceConfig";
const API_URL = ServiceConfig.API_URL;

export class SpecialityService {
    static async fetchSpecialitiesOfStudent(userId: string): Promise<Speciality[]> {
        try {
            const response = await fetch(API_URL + `/students/${userId}/specialities`);
            if (!response.ok) {
                throw new Error("Network response was not ok " + response.statusText);
            }
            const data: Speciality[] = await response.json();
            return data;
        } catch (error) {
            console.error("Error fetching specialities:", error);
            return [];
        }
    }
    static async decoupleStudent(combo: {userId: string, specialityId: string}) {
        await fetch(ServiceConfig.API_URL + `/specialities/decouple`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(combo)
        })
            .then(response => {
                if (!response.ok) {throw new Error("Failed to decouple student");}
                alert("student decoupled successfully!");
            })
            .catch(error => {
                console.error("Error decoupling student:", error);
                alert("Error decoupling student. Please try again.");
            });
    }

    static async addStudentToSpeciality(combo: {userId: string, specialityId: string}) {
        await fetch(ServiceConfig.API_URL + `/specialities/assign`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(combo)
        })
            .then(response => {
                if (!response.ok) {throw new Error("Failed to assign student");}
                alert("student assigned successfully!");
            })
            .catch(error => {
                console.error("Error assigning student:", error);
                alert("Error assigning student. Please try again.");
            });
    }

    static async deleteSpeciality(specialityId: string) {
        await fetch(ServiceConfig.API_URL + `/delete-speciality/${specialityId}`, {
            method: "DELETE",
        })
            .then(response => {
                if (!response.ok) { throw new Error("Failed to delete speciality"); }
                alert("Speciality deleted successfully!");
            })
            .catch(error => {
                console.error("Error deleting speciality:", error);
                alert("Error deleting speciality. Please try again.");
            });
    }

    static async createSpeciality(specialityName: string) {
        await fetch(ServiceConfig.API_URL + "/create-speciality", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ specialityName })
        })
            .then(response => {
                console.log(JSON.stringify(specialityName));
                if (!response.ok) {
                    throw new Error("Failed to create speciality");
                }
                alert("Speciality created successfully!");
            })
            .catch(error => {
                console.error("Error creating speciality:", error);
                alert("Error creating speciality. Please try again.");
            });
    }

    static async fetchModulesOfSpeciality(specialityId: string): Promise<Module[]> {
        try {
            const response = await fetch(API_URL + `/specialities/${specialityId}/modules`);
            if (!response.ok) {
                throw new Error("Network response was not ok " + response.statusText);
            }
            const data: Module[] = await response.json();
            return data;
        } catch (error) {
            console.error("Error fetching modules:", error);
            return [];
        }
    }

    static async fetchSpecialities(): Promise<Speciality[]> {
        try {
            const response = await fetch(API_URL + "/specialities");
            if (!response.ok) {
                throw new Error("Network response was not ok " + response.statusText);
            }
            const data: Speciality[] = await response.json();
            return data;
        } catch (error) {
            console.error("Error fetching specialities:", error);
            return [];
        }
    }

    static async fetchStudentsOfSpeciality(specialityId: string): Promise<Student[]> {
        try {
            const response = await fetch(API_URL + `/specialities/${specialityId}/students`);
            if (!response.ok) {
                throw new Error("Network response was not ok " + response.statusText);
            }
            const data: Student[] = await response.json();
            return data;
        } catch (error) {
            console.error("Error fetching modules:", error);
            return [];
        }
    }


}