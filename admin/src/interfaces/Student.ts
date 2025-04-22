import { Speciality } from "./Speciality";

export interface Student {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    specialities: Speciality[];
}