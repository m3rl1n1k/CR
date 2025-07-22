import type { Problem, Product, ProductionLine, Shift, User } from './data';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080';

interface HydraCollection<T> {
  'hydra:member': T[];
  'hydra:totalItems': number;
  // Add other hydra fields if needed
}

async function fetchFromApi<T>(endpoint: string, emptyState: T): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Accept': 'application/ld+json',
      },
      cache: 'no-store', // Disable caching for server-side fetches
    });

    if (!response.ok) {
      console.error(`API call to ${endpoint} failed with status ${response.status}`);
      return emptyState;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Failed to fetch from ${endpoint}`, error);
    return emptyState;
  }
}

export async function getProductionLines(): Promise<ProductionLine[]> {
    const data = await fetchFromApi<HydraCollection<ProductionLine>>('/production_lines', { 'hydra:member': [], 'hydra:totalItems': 0 });
    return data['hydra:member'];
}

export async function getProducts(): Promise<Product[]> {
    const data = await fetchFromApi<HydraCollection<Product>>('/products', { 'hydra:member': [], 'hydra:totalItems': 0 });
    return data['hydra:member'];
}

export async function getProblems(): Promise<Problem[]> {
    const data = await fetchFromApi<HydraCollection<Problem>>('/problems', { 'hydra:member': [], 'hydra:totalItems': 0 });
    return data['hydra:member'];
}

export async function getUsers(): Promise<User[]> {
    const data = await fetchFromApi<HydraCollection<User>>('/users', { 'hydra:member': [], 'hydra:totalItems': 0 });
    return data['hydra:member'];
}

export async function getShift(id: string): Promise<Shift | null> {
    const data = await fetchFromApi<Shift | null>(`/shifts/${id}`, null);
    return data;
}

export async function createShift(shiftData: { productionLine: string; problem: string | null }): Promise<Shift | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/shifts`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/ld+json',
            },
            body: JSON.stringify(shiftData),
        });

        if (!response.ok) {
            console.error('Failed to create shift', await response.text());
            return null;
        }

        return response.json();
    } catch (error) {
        console.error('Error creating shift:', error);
        return null;
    }
}
