var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ServiceConfig } from "./ServiceConfig";
const API_URL = ServiceConfig.API_URL;
export class UserService {
    static fetchUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(API_URL + "/users");
                if (!response.ok) {
                    throw new Error("Network response was not ok " + response.statusText);
                }
                const data = yield response.json();
                return data;
            }
            catch (error) {
                console.error("Error fetching users:", error);
                return []; // Return an empty array on error
            }
        });
    }
    static deleteUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield fetch(API_URL + `/delete-user/${userId}`, {
                method: "DELETE"
            })
                .then(response => {
                if (!response.ok)
                    throw new Error("Failed to delete user");
                alert("User deleted successfully!");
            })
                .catch(error => {
                console.error("Error deleting user:", error);
                alert("Failed to delete user.");
            });
        });
    }
}
