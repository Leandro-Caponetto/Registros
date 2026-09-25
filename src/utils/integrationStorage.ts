import { MiddlewareIntegration, MiddlewareFormData } from '../types/integration';
import { INITIAL_MIDDLEWARE_INTEGRATIONS } from '../data/mockIntegrations';

const STORAGE_KEY = 'prodtracker_middleware_integrations';

export function getIntegrations(): MiddlewareIntegration[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // First time initialization with mock data
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MIDDLEWARE_INTEGRATIONS));
      return INITIAL_MIDDLEWARE_INTEGRATIONS;
    }
    const parsed: MiddlewareIntegration[] = JSON.parse(raw);
    // Backward compatibility: backfill desarrolladorACargo for initial demo items if missing
    let hasEnriched = false;
    const enriched = parsed.map((item) => {
      if (!item.desarrolladorACargo) {
        const initialMatch = INITIAL_MIDDLEWARE_INTEGRATIONS.find((i) => i.id === item.id);
        if (initialMatch?.desarrolladorACargo) {
          hasEnriched = true;
          return { ...item, desarrolladorACargo: initialMatch.desarrolladorACargo };
        }
      }
      return item;
    });
    if (hasEnriched) {
      saveIntegrations(enriched);
    }
    return enriched;
  } catch (error) {
    console.error('Failed to load integrations from localStorage:', error);
    return INITIAL_MIDDLEWARE_INTEGRATIONS;
  }
}

export function saveIntegrations(integrations: MiddlewareIntegration[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(integrations));
  } catch (error) {
    console.error('Failed to save integrations to localStorage:', error);
  }
}

export function createIntegration(formData: MiddlewareFormData): MiddlewareIntegration {
  const current = getIntegrations();
  const now = new Date().toISOString();
  
  const newIntegration: MiddlewareIntegration = {
    ...formData,
    id: `int-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: now,
    updatedAt: now,
  };

  const updatedList = [newIntegration, ...current];
  saveIntegrations(updatedList);
  return newIntegration;
}

export function updateIntegration(
  id: string,
  data: Partial<MiddlewareFormData>
): MiddlewareIntegration | null {
  const current = getIntegrations();
  const index = current.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const updated: MiddlewareIntegration = {
    ...current[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  current[index] = updated;
  saveIntegrations(current);
  return updated;
}

export function deleteIntegration(id: string): boolean {
  const current = getIntegrations();
  const filtered = current.filter((item) => item.id !== id);
  if (filtered.length === current.length) return false;

  saveIntegrations(filtered);
  return true;
}

export function restoreIntegration(integration: MiddlewareIntegration): void {
  const current = getIntegrations();
  if (!current.some((item) => item.id === integration.id)) {
    saveIntegrations([integration, ...current]);
  }
}

export function resetToDemoIntegrations(): MiddlewareIntegration[] {
  saveIntegrations(INITIAL_MIDDLEWARE_INTEGRATIONS);
  return INITIAL_MIDDLEWARE_INTEGRATIONS;
}

export function clearAllIntegrations(): void {
  saveIntegrations([]);
}
