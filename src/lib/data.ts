export type ProductionLineStatus = "Running" | "Idle" | "Stopped";

export interface ProductionLine {
  id: string;
  name: string;
  status: ProductionLineStatus;
  oee: number;
  currentProduct: string;
  shiftProgress: number;
  alerts: number;
  currentShiftId: string;
}

export interface Shift {
    id: string;
    name: string;
    line: string;
    lineId: string;
    date: string;
    supervisor: string;
    status: 'In Progress' | 'Completed';
    workCard: {
        id: string;
        productName: string;
        productCode: string;
        target: number;
        produced: number;
    }
}

export type ProblemPriority = "High" | "Medium" | "Low";
export type ProblemStatus = "Open" | "In Progress" | "Resolved";

export interface Problem {
    id: string;
    date: string;
    line: string;
    machine: string;
    description: string;
    priority: ProblemPriority;
    status: ProblemStatus;
    shiftId: string;
}

export interface User {
    id: string;
    name: string;
    role: "Supervisor" | "Operator";
}

export interface Product {
  id: string;
  title: string;
  code: string;
  productionLine: string;
}


export const productionLines: ProductionLine[] = [
  {
    id: "line-1",
    name: "Assembly Line 1",
    status: "Running",
    oee: 85.2,
    currentProduct: "Widget Pro",
    shiftProgress: 65,
    alerts: 2,
    currentShiftId: "shift-a1"
  },
  {
    id: "line-2",
    name: "Assembly Line 2",
    status: "Idle",
    oee: 92.5,
    currentProduct: "Gadget Plus",
    shiftProgress: 0,
    alerts: 0,
    currentShiftId: "shift-b1"
  },
  {
    id: "line-3",
    name: "Packaging Line A",
    status: "Stopped",
    oee: 45.0,
    currentProduct: "Thingamajig",
    shiftProgress: 20,
    alerts: 5,
    currentShiftId: "shift-c1"
  },
  {
    id: "line-4",
    name: "Finishing Line X",
    status: "Running",
    oee: 89.7,
    currentProduct: "Doohickey Max",
    shiftProgress: 90,
    alerts: 1,
    currentShiftId: "shift-d1"
  },
];

export const shifts: Shift[] = [
    {
        id: 'shift-a1',
        name: 'Morning Shift A1',
        line: 'Assembly Line 1',
        lineId: 'line-1',
        date: '2024-07-22',
        supervisor: 'Jane Doe',
        status: 'In Progress',
        workCard: {
            id: 'wc-001',
            productName: 'Widget Pro',
            productCode: 'WPRO-001',
            target: 5000,
            produced: 3250,
        }
    },
    {
        id: 'shift-b1',
        name: 'Morning Shift B1',
        line: 'Assembly Line 2',
        lineId: 'line-2',
        date: '2024-07-22',
        supervisor: 'John Smith',
        status: 'Completed',
        workCard: {
            id: 'wc-002',
            productName: 'Gadget Plus',
            productCode: 'GPLUS-002',
            target: 8000,
            produced: 8102,
        }
    },
    {
        id: 'shift-c1',
        name: 'Morning Shift C1',
        line: 'Packaging Line A',
        lineId: 'line-3',
        date: '2024-07-22',
        supervisor: 'Emily White',
        status: 'In Progress',
        workCard: {
            id: 'wc-003',
            productName: 'Thingamajig',
            productCode: 'THING-003',
            target: 10000,
            produced: 2000,
        }
    },
    {
        id: 'shift-d1',
        name: 'Morning Shift D1',
        line: 'Finishing Line X',
        lineId: 'line-4',
        date: '2024-07-22',
        supervisor: 'Michael Brown',
        status: 'In Progress',
        workCard: {
            id: 'wc-004',
            productName: 'Doohickey Max',
            productCode: 'DOOMAX-004',
            target: 2500,
            produced: 2250,
        }
    }
]

export const problems: Problem[] = [
    {
        id: 'p-001',
        date: '2024-07-22',
        line: 'Assembly Line 1',
        machine: 'Robot Arm 3',
        description: 'Gripper failure, unable to pick up parts.',
        priority: 'High',
        status: 'In Progress',
        shiftId: 'shift-a1',
    },
    {
        id: 'p-002',
        date: '2024-07-22',
        line: 'Assembly Line 1',
        machine: 'Conveyor Belt',
        description: 'Motor overheating, speed reduced by 50%.',
        priority: 'Medium',
        status: 'Open',
        shiftId: 'shift-a1',
    },
    {
        id: 'p-003',
        date: '2024-07-21',
        line: 'Packaging Line A',
        machine: 'Box Sealer',
        description: 'Adhesive not dispensing correctly.',
        priority: 'High',
        status: 'Resolved',
        shiftId: 'shift-c1'
    },
    {
        id: 'p-004',
        date: '2024-07-21',
        line: 'Finishing Line X',
        machine: 'Polishing Unit',
        description: 'Incorrect pressure sensor reading.',
        priority: 'Low',
        status: 'Resolved',
        shiftId: 'shift-d1'
    }
]

export const users: User[] = [
    { id: 'u-1', name: 'Jane Doe', role: 'Supervisor' },
    { id: 'u-2', name: 'John Smith', role: 'Supervisor' },
    { id: 'u-3', name: 'Emily White', role: 'Supervisor' },
    { id: 'u-4', name: 'Michael Brown', role: 'Supervisor' },
    { id: 'u-5', name: 'Chris Green', role: 'Operator' },
]

export const products: Product[] = [
    { id: 'prod-001', title: 'Widget Pro', code: 'WPRO-001', productionLine: 'Assembly Line 1' },
    { id: 'prod-002', title: 'Gadget Plus', code: 'GPLUS-002', productionLine: 'Assembly Line 2' },
    { id: 'prod-003', title: 'Thingamajig', code: 'THING-003', productionLine: 'Packaging Line A' },
    { id: 'prod-004', title: 'Doohickey Max', code: 'DOOMAX-004', productionLine: 'Finishing Line X' },
    { id: 'prod-005', title: 'SuperSprocket', code: 'SPROCK-99', productionLine: 'Assembly Line 1' },
];
