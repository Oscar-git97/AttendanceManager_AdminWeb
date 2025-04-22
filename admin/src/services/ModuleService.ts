import { ModuleLazy } from "../interfaces/ModuleLazy";
import { Teacher } from "../interfaces/Teacher";
import { ServiceConfig } from "./ServiceConfig";
const API_URL = ServiceConfig.API_URL;

export class ModuleService {
    static async fetchModules(): Promise<ModuleLazy[]>{
        try {
            const response = await fetch(API_URL + `/modules`);
            if (!response.ok) {
                throw new Error("Network response was not ok " + response.statusText);
            }
            const data: ModuleLazy[] = await response.json();
            return data;
        } catch (error) {
            console.error("Error fetching modules:", error);
            return [];
        }
    }
    static async reassignModule(combo :{ moduleId: string; newSpecialityId: string; }) {
        await fetch(ServiceConfig.API_URL + `/modules/reassign`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(combo)
        })
            .then(response => {
                if (!response.ok) {throw new Error("Failed to assign module");}
                alert("module assigned successfully!");
            })
            .catch(error => {
                console.error("Error assigning module:", error);
                alert("Error assigning module. Please try again.");
            });
    }

    static async decoupleTeacherModule(combo: { moduleId: string; userId: string; }) {
        console.log(combo);
        await fetch(ServiceConfig.API_URL + `/modules/remove-teacher`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(combo)
        })
            .then(response => {
                if (!response.ok) {throw new Error("Failed to remove teacher");}
                alert("teacher removed successfully!");
            })
            .catch(error => {
                console.error("Error removing teacher:", error);
                alert("Error removing teacher. Please try again.");
            });
    }

    static async deleteModule(moduleId: string) {
        await fetch(ServiceConfig.API_URL + `/delete-module/${moduleId}`, {
            method: "DELETE",
        })
            .then(response => {
                if (!response.ok) {throw new Error("Failed to delete module");}
                alert("Module deleted successfully!");
            })
            .catch(error => {
                console.error("Error deleting module:", error);
                alert("Error deleting module. Please try again.");
            });
    }

    static async createModule(module: { moduleName: string; specialityId: string; }) {
        await fetch(ServiceConfig.API_URL+ "/create-module", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(module)
        })
        .then(response => {
            console.log(response.type, "and", response.status)
            if (response.status == 500){
                throw new Error("Module already exists in this speciality");
            }
                
            else if (!response.ok) 
                throw new Error("Failed to create module");
            return response.json();
        })
        .then(data => {
            alert("module created successfully!");
        })
        .catch(error => {
            console.error("Error creating module:", error);
            alert(`Error creating module: ${error}`);
        });
    }

    static async fetchModulesOfTeacher(userId: string): Promise<ModuleLazy[]> {
        try {
            const response = await fetch(API_URL + `/teachers/${userId}/modules`);
            if (!response.ok) {
                throw new Error("Network response was not ok " + response.statusText);
            }
            const data: ModuleLazy[] = await response.json();
            return data;
        } catch (error) {
            console.error("Error fetching modules:", error);
            return [];
        }
    }

    static async assignTeacherModule(combo :{ moduleId: string; userId: string; }) {
        await fetch(ServiceConfig.API_URL + `/modules/assign`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(combo)
        })
            .then(response => {
                if (!response.ok) {throw new Error("Failed to assign teacher");}
                alert("teacher assigned successfully!");
            })
            .catch(error => {
                console.error("Error assigning teacher:", error);
                alert("Error assigning teacher. Please try again.");
            });
    }

    static async fetchTeachersOfModule(moduleId: string): Promise<Teacher[]> {
        try {
            const response = await fetch(API_URL + `/modules/${moduleId}/teachers`);
            if (!response.ok) {
                throw new Error("Network response was not ok " + response.statusText);
            }
            const data: Teacher[] = await response.json();
            return data;
        } catch (error) {
            console.error("Error fetching teachers of module:", error);
            return [];
        }
    }

}