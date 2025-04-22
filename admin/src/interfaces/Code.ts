import { Teacher } from "./Teacher";

export interface Code {
    codeId: string;
    qrCode: string;
    readableCode: string;
    beaconId: string;
    teacher: Teacher;
}