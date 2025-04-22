import { Teacher } from "./Teacher";

export interface Module{
    moduleId: string;
    moduleName: string;
    teachers: Teacher[];
}