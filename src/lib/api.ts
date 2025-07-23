
import type { Problem, Product, ProductionLine, Shift, User } from './data';
import { logger } from './logger';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080').replace(/\/$/, "");

export const URLS = {
  Auth: `${API_BASE_URL}/auth`,
  ProductionLines: {
    collection: `${API_BASE_URL}/production_lines`,
    item: (lineCode: string) => `${API_BASE_URL}/production_lines/${lineCode}`,
  },
  Products: {
    collection: `${API_BASE_URL}/products`,
    item: (id: number) => `${API_BASE_URL}/products/${id}`,
  },
  Problems: {
    collection: `${API_BASE_URL}/problems`,
    item: (id: number) => `${API_BASE_URL}/problems/${id}`,
  },
  Users: {
    collection: `${API_BASE_URL}/users`,
    item: (personalNumber: string) => `${API_BASE_URL}/users/${personalNumber}`,
  },
  Shifts: {
    collection: `${API_BASE_URL}/shifts`,
    item: (id: string) => `${API_BASE_URL}/shifts/${id}`,
  }
};

interface HydraCollection<T> {
  'hydra:member': T[];
  'hydra:totalItems': number;
}

async function dataProvider<T>(url: string, options: RequestInit = {}): Promise<T> {
  try {
    logger.log(`Fetching URL: ${url}`);
    logger.log(`API call: ${options.method || 'GET'} ${url}`, options.body ? { body: options.body } : {});
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    const headers: HeadersInit = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers,
        cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`API call to ${url} failed with status ${response.status}: ${errorText}`);
      throw new Error(`API call failed: ${response.status} ${errorText}`);
    }
    
    if (response.status === 204) { // No Content
        logger.log(`API response from ${url}: 204 No Content`);
        return null as T;
    }

    const jsonResponse = await response.json();
    logger.log(`API response from ${url}:`, jsonResponse);
    return jsonResponse;

  } catch (error) {
    logger.error(`Failed to fetch from ${url}`, error);
    return Promise.reject(error);
  }
}

// Production Line Endpoints
export async function getProductionLines(): Promise<ProductionLine[]> {
    try {
        const data = await dataProvider<HydraCollection<ProductionLine>>(URLS.ProductionLines.collection);
        return data ? data['hydra:member'] : [];
    } catch (error) {
        return [];
    }
}

export async function createProductionLine(lineData: Partial<ProductionLine>): Promise<ProductionLine> {
    return dataProvider<ProductionLine>(URLS.ProductionLines.collection, {
        method: 'POST',
        body: JSON.stringify(lineData),
    });
}

export async function getProductionLine(lineCode: string): Promise<ProductionLine> {
    return dataProvider<ProductionLine>(URLS.ProductionLines.item(lineCode));
}

export async function updateProductionLine(lineCode: string, updateData: Partial<ProductionLine>): Promise<ProductionLine> {
    return dataProvider<ProductionLine>(URLS.ProductionLines.item(lineCode), {
        method: 'PATCH',
        body: JSON.stringify(updateData),
    });
}

export async function deleteProductionLine(lineCode: string): Promise<void> {
    await dataProvider<void>(URLS.ProductionLines.item(lineCode), {
        method: 'DELETE',
    });
}


// Product Endpoints
export async function getProducts(): Promise<Product[]> {
    try {
        const data = await dataProvider<HydraCollection<Product>>(URLS.Products.collection);
        return data ? data['hydra:member'] : [];
    } catch (error) {
        return [];
    }
}

export async function createProduct(productData: Partial<Product>): Promise<Product> {
    return dataProvider<Product>(URLS.Products.collection, {
        method: 'POST',
        body: JSON.stringify(productData),
    });
}

export async function getProduct(id: number): Promise<Product> {
    return dataProvider<Product>(URLS.Products.item(id));
}

export async function updateProduct(id: number, updateData: Partial<Product>): Promise<Product> {
    return dataProvider<Product>(URLS.Products.item(id), {
        method: 'PATCH',
        body: JSON.stringify(updateData),
    });
}

export async function deleteProduct(id: number): Promise<void> {
    await dataProvider<void>(URLS.Products.item(id), {
        method: 'DELETE',
    });
}


// Problem Endpoints
export async function getProblems(): Promise<Problem[]> {
    try {
        const data = await dataProvider<HydraCollection<Problem>>(URLS.Problems.collection);
        return data ? data['hydra:member'] : [];
    } catch (error) {
        return [];
    }
}

export async function createProblem(problemData: Partial<Problem>): Promise<Problem> {
    return dataProvider<Problem>(URLS.Problems.collection, {
        method: 'POST',
        body: JSON.stringify(problemData),
    });
}

export async function getProblem(id: number): Promise<Problem> {
    return dataProvider<Problem>(URLS.Problems.item(id));
}

export async function updateProblem(id: number, updateData: Partial<Problem>): Promise<Problem> {
    return dataProvider<Problem>(URLS.Problems.item(id), {
        method: 'PATCH',
        body: JSON.stringify(updateData),
    });
}

export async function deleteProblem(id: number): Promise<void> {
    await dataProvider<void>(URLS.Problems.item(id), {
        method: 'DELETE',
    });
}

// User Endpoints
export async function getUsers(): Promise<User[]> {
    try {
        const data = await dataProvider<HydraCollection<User>>(URLS.Users.collection);
        return data ? data['hydra:member'] : [];
    } catch (error) {
        return [];
    }
}

export async function createUser(userData: Partial<User>): Promise<User> {
    return dataProvider<User>(URLS.Users.collection, {
        method: 'POST',
        body: JSON.stringify(userData),
    });
}

export async function getUser(personalNumber: string): Promise<User> {
    return dataProvider<User>(URLS.Users.item(personalNumber));
}

export async function updateUser(personalNumber: string, updateData: Partial<User>): Promise<User> {
    return dataProvider<User>(URLS.Users.item(personalNumber), {
        method: 'PATCH',
        body: JSON.stringify(updateData),
    });
}

export async function deleteUser(personalNumber: string): Promise<void> {
    await dataProvider<void>(URLS.Users.item(personalNumber), {
        method: 'DELETE',
    });
}


// Shift Endpoints
export async function getShifts(): Promise<Shift[]> {
    try {
        const data = await dataProvider<HydraCollection<Shift>>(URLS.Shifts.collection);
        return data ? data['hydra:member'] : [];
    } catch (error) {
        return [];
    }
}

export async function createShift(shiftData: { productionLine: string; problem: string | null }): Promise<Shift> {
    return dataProvider<Shift>(URLS.Shifts.collection, {
        method: 'POST',
        body: JSON.stringify(shiftData),
    });
}

export async function getShift(id: string): Promise<Shift | null> {
    try {
        return await dataProvider<Shift>(URLS.Shifts.item(id));
    } catch (error) {
        return null;
    }
}

export async function updateShift(id: string, updateData: Partial<Shift>): Promise<Shift> {
    return dataProvider<Shift>(URLS.Shifts.item(id), {
        method: 'PATCH',
        body: JSON.stringify(updateData),
    });
}

export async function deleteShift(id: string): Promise<void> {
    await dataProvider<void>(URLS.Shifts.item(id), {
        method: 'DELETE',
    });
}
