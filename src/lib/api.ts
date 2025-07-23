import type { Problem, Product, ProductionLine, Shift, User } from './data';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080';

const PRODUCTION_LINES_ENDPOINT = '/production_lines';
const PRODUCTS_ENDPOINT = '/products';
const PROBLEMS_ENDPOINT = '/problems';
const USERS_ENDPOINT = '/users';
const SHIFTS_ENDPOINT = '/shifts';


interface HydraCollection<T> {
  'hydra:member': T[];
  'hydra:totalItems': number;
}

async function fetchFromApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Accept': 'application/ld+json',
            'Content-Type': 'application/ld+json',
            ...options.headers,
        },
        cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API call to ${endpoint} failed with status ${response.status}: ${errorText}`);
      throw new Error(`API call failed: ${response.status} ${errorText}`);
    }
    
    if (response.status === 204) { // No Content
        return null as T;
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch from ${endpoint}`, error);
    throw error;
  }
}

// Production Line Endpoints
export async function getProductionLines(): Promise<ProductionLine[]> {
    const data = await fetchFromApi<HydraCollection<ProductionLine>>(PRODUCTION_LINES_ENDPOINT);
    return data ? data['hydra:member'] : [];
}

export async function createProductionLine(lineData: Partial<ProductionLine>): Promise<ProductionLine> {
    return fetchFromApi<ProductionLine>(PRODUCTION_LINES_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify(lineData),
    });
}

export async function getProductionLine(lineCode: string): Promise<ProductionLine> {
    return fetchFromApi<ProductionLine>(`${PRODUCTION_LINES_ENDPOINT}/${lineCode}`);
}

export async function updateProductionLine(lineCode: string, updateData: Partial<ProductionLine>): Promise<ProductionLine> {
    return fetchFromApi<ProductionLine>(`${PRODUCTION_LINES_ENDPOINT}/${lineCode}`, {
        method: 'PATCH',
        body: JSON.stringify(updateData),
    });
}

export async function deleteProductionLine(lineCode: string): Promise<void> {
    await fetchFromApi<void>(`${PRODUCTION_LINES_ENDPOINT}/${lineCode}`, {
        method: 'DELETE',
    });
}


// Product Endpoints
export async function getProducts(): Promise<Product[]> {
    const data = await fetchFromApi<HydraCollection<Product>>(PRODUCTS_ENDPOINT);
    return data ? data['hydra:member'] : [];
}

export async function createProduct(productData: Partial<Product>): Promise<Product> {
    return fetchFromApi<Product>(PRODUCTS_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify(productData),
    });
}

export async function getProduct(id: number): Promise<Product> {
    return fetchFromApi<Product>(`${PRODUCTS_ENDPOINT}/${id}`);
}

export async function updateProduct(id: number, updateData: Partial<Product>): Promise<Product> {
    return fetchFromApi<Product>(`${PRODUCTS_ENDPOINT}/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updateData),
    });
}

export async function deleteProduct(id: number): Promise<void> {
    await fetchFromApi<void>(`${PRODUCTS_ENDPOINT}/${id}`, {
        method: 'DELETE',
    });
}


// Problem Endpoints
export async function getProblems(): Promise<Problem[]> {
    const data = await fetchFromApi<HydraCollection<Problem>>(PROBLEMS_ENDPOINT);
    return data ? data['hydra:member'] : [];
}

export async function createProblem(problemData: Partial<Problem>): Promise<Problem> {
    return fetchFromApi<Problem>(PROBLEMS_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify(problemData),
    });
}

export async function getProblem(id: number): Promise<Problem> {
    return fetchFromApi<Problem>(`${PROBLEMS_ENDPOINT}/${id}`);
}

export async function updateProblem(id: number, updateData: Partial<Problem>): Promise<Problem> {
    return fetchFromApi<Problem>(`${PROBLEMS_ENDPOINT}/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updateData),
    });
}

export async function deleteProblem(id: number): Promise<void> {
    await fetchFromApi<void>(`${PROBLEMS_ENDPOINT}/${id}`, {
        method: 'DELETE',
    });
}

// User Endpoints
export async function getUsers(): Promise<User[]> {
    const data = await fetchFromApi<HydraCollection<User>>(USERS_ENDPOINT);
    return data ? data['hydra:member'] : [];
}

export async function createUser(userData: Partial<User>): Promise<User> {
    return fetchFromApi<User>(USERS_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify(userData),
    });
}

export async function getUser(personalNumber: string): Promise<User> {
    return fetchFromApi<User>(`${USERS_ENDPOINT}/${personalNumber}`);
}

export async function updateUser(personalNumber: string, updateData: Partial<User>): Promise<User> {
    return fetchFromApi<User>(`${USERS_ENDPOINT}/${personalNumber}`, {
        method: 'PATCH',
        body: JSON.stringify(updateData),
    });
}

export async function deleteUser(personalNumber: string): Promise<void> {
    await fetchFromApi<void>(`${USERS_ENDPOINT}/${personalNumber}`, {
        method: 'DELETE',
    });
}


// Shift Endpoints
export async function getShifts(): Promise<Shift[]> {
    const data = await fetchFromApi<HydraCollection<Shift>>(SHIFTS_ENDPOINT);
    return data ? data['hydra:member'] : [];
}

export async function createShift(shiftData: { productionLine: string; problem: string | null }): Promise<Shift> {
    return fetchFromApi<Shift>(SHIFTS_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify(shiftData),
    });
}

export async function getShift(id: string): Promise<Shift> {
    return fetchFromApi<Shift>(`${SHIFTS_ENDPOINT}/${id}`);
}

export async function updateShift(id: string, updateData: Partial<Shift>): Promise<Shift> {
    return fetchFromApi<Shift>(`${SHIFTS_ENDPOINT}/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updateData),
    });
}

export async function deleteShift(id: string): Promise<void> {
    await fetchFromApi<void>(`${SHIFTS_ENDPOINT}/${id}`, {
        method: 'DELETE',
    });
}
