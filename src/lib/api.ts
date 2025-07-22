import type { Problem, Product, ProductionLine, Shift, User } from './data';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080';

interface HydraCollection<T> {
  'hydra:member': T[];
  'hydra:totalItems': number;
  // Add other hydra fields if needed
}

async function fetchFromApi<T>(endpoint: string): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Accept': 'application/ld+json',
      },
    });

    if (!response.ok) {
      throw new Error(`API call failed with status ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Failed to fetch from ${endpoint}`, error);
    throw error;
  }
}

export async function getProductionLines(): Promise<ProductionLine[]> {
    const data = await fetchFromApi<HydraCollection<ProductionLine>>('/production_lines');
    return data['hydra:member'];
}

export async function getProducts(): Promise<Product[]> {
    const data = await fetchFromApi<HydraCollection<Product>>('/products');
    return data['hydra:member'];
}

export async function getProblems(): Promise<Problem[]> {
    const data = await fetchFromApi<HydraCollection<Problem>>('/problems');
    return data['hydra:member'];
}

export async function getUsers(): Promise<User[]> {
    const data = await fetchFromApi<HydraCollection<User>>('/users');
    return data['hydra:member'];
}

export async function getShift(id: string): Promise<Shift> {
    const data = await fetchFromApi<Shift>(`/shifts/${id}`);
    return data;
}

// Add other API functions (POST, PATCH, DELETE) as needed
