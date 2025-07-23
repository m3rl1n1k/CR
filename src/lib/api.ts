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

async function fetchFromApi<T>(endpoint: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Accept': 'application/ld+json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`API call to ${endpoint} failed with status ${response.status}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch from ${endpoint}`, error);
    return null;
  }
}

export async function getProductionLines(): Promise<ProductionLine[]> {
    const data = await fetchFromApi<HydraCollection<ProductionLine>>(PRODUCTION_LINES_ENDPOINT);
    return data ? data['hydra:member'] : [];
}

export async function getProducts(): Promise<Product[]> {
    const data = await fetchFromApi<HydraCollection<Product>>(PRODUCTS_ENDPOINT);
    return data ? data['hydra:member'] : [];
}

export async function getProblems(): Promise<Problem[]> {
    const data = await fetchFromApi<HydraCollection<Problem>>(PROBLEMS_ENDPOINT);
    return data ? data['hydra:member'] : [];
}

export async function getUsers(): Promise<User[]> {
    const data = await fetchFromApi<HydraCollection<User>>(USERS_ENDPOINT);
    return data ? data['hydra:member'] : [];
}

export async function getShift(id: string): Promise<Shift | null> {
    const data = await fetchFromApi<Shift>(`${SHIFTS_ENDPOINT}/${id}`);
    return data;
}

export async function createShift(shiftData: { productionLine: string; problem: string | null }): Promise<Shift | null> {
    try {
        const response = await fetch(`${API_BASE_URL}${SHIFTS_ENDPOINT}`, {
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

        return await response.json();
    } catch (error) {
        console.error('Error creating shift:', error);
        return null;
    }
}
