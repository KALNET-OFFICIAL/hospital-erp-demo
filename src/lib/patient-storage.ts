import type { Patient } from "@/types";
import { patients as mockPatients } from "@/lib/mock-data";

const PATIENTS_STORAGE_KEY = "hos_patients";

export function getPatientsFromStorage(): Patient[] {
  const stored = localStorage.getItem(PATIENTS_STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored) as Patient[];
  }
  return mockPatients;
}

export function savePatientsToStorage(patientList: Patient[]): void {
  localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(patientList));
}

