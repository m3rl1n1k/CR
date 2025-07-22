export type ProductionLineStatus = "Running" | "Idle" | "Stopped";

export interface ProductionLine {
  id: string; // The original spec has lineCode as string, but components use id. Will map lineCode to id.
  name: string; // from lineName
  status: ProductionLineStatus; // This is not in the API, will need to be derived or mocked for now.
  oee: number; // This is not in the API, will need to be derived or mocked.
  currentProduct: string; // This is not in the API.
  shiftProgress: number; // This is not in the API.
  alerts: number; // This is not in the API.
  currentShiftId: string; // This is not in the API.
  lineCode?: string;
  lineName?: string;
  problems?: Problem[];
}

export interface Shift {
    id: string;
    name: string; // not in API
    line: string; // from productionLine
    lineId: string; // from productionLine
    date: string; // not in API
    supervisor: string; // not in API
    status: 'In Progress' | 'Completed'; // not in API
    workCard: {
        id: string;
        productName: string;
        productCode: string;
        target: number;
        produced: number;
    }; // not in API
    productionLine?: string;
    problem?: string;
}

export type ProblemPriority = "High" | "Medium" | "Low";
export type ProblemStatus = "Open" | "In Progress" | "Resolved";

export interface Problem {
    id: number;
    date: string; // from createdAt
    line: string; // from productionLine IRI
    machine: string; // not in API, will use a placeholder.
    description: string; // from comment
    priority: ProblemPriority; // not in API
    status: ProblemStatus; // from status string in API
    shiftId: string; // not in API
    productionLine: string; // IRI
    createdAt: string;
    downTime?: string | null;
    endedAt?: string;
    comment?: string;
}

export interface User {
    id: string;
    personalNumber?: string;
    name: string;
    role: "Supervisor" | "Operator"; // from roles array
    email?: string;
    roles?: string[];
}

export interface Product {
  id: number;
  title: string;
  code: string;
  productionLine?: string;
}
