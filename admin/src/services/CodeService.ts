import { Code } from "../interfaces/Code";
import { ServiceConfig } from "./ServiceConfig";

const API_URL = ServiceConfig.API_URL;

export class CodeService {

    static async decouple(userId: string) {
        await fetch(API_URL + `/decouple-code/${userId}`, {
            method: "POST"
        })
        .then(response => {
            if (!response.ok) throw new Error("Failed to decouple Code");
            alert("Code decoupling successfully!");
        })
        .catch(error => {
            console.error("Error decoupling code:", error);
            alert("Failed to decouple code.");
        });
    }

    static async fetchCodes(): Promise<Code[]> {
            try {
                const response = await fetch(API_URL + "/codes");
                if (!response.ok) {
                    throw new Error("Network response was not ok " + response.statusText);
                }
                const data: Code[] = await response.json();
                return data;
            } catch (error) {
                console.error("Error fetching users:", error);
                return []; 
            }
        }

    static async deleteCode(codeId:string) {
        await fetch(API_URL + `/delete-code/${codeId}`, {
            method: "DELETE"
        })
        .then(response => {
            if (!response.ok) throw new Error("Failed to delete Code");
            alert("Code deleted successfully!");
        })
        .catch(error => {
            console.error("Error deleting code:", error);
            alert("Failed to delete code.");
        });
    }

    static async assignCode(codeId:string, userId: string) {
        await fetch(API_URL + `/codes/assign`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ codeId, userId }) 
        })
        .then(response => {
            if (!response.ok) throw new Error("Failed to assign Code");
            alert("Code assigned successfully!");
        })
        .catch(error => {
            console.error("Error assigning code:", error);
            alert("Failed to assign code.");
        });
    }
}
