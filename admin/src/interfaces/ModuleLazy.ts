import { Speciality } from "./Speciality";
import { Teacher } from "./Teacher";

export interface ModuleLazy{
    moduleId: string;
    moduleName: string;
    speciality: Speciality;
}