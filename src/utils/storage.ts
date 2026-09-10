import { DeploymentRecord, DeploymentFormData, DeploymentKPIs } from '../types/deployment';
import { INITIAL_DEPLOYMENTS } from '../data/mockDeployments';

const STORAGE_KEY = 'prodtracker_deployments_v2';

export function getDeployments(): DeploymentRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Clean, empty initial state by default for direct user input
      saveDeployments([]);
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      saveDeployments([]);
      return [];
    }
    return parsed;
  } catch (err) {
    console.error('Failed to read deployments from localStorage:', err);
    return [];
  }
}

export function saveDeployments(records: DeploymentRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.error('Failed to save deployments to localStorage:', err);
  }
}

export function clearAllDeployments(): void {
  saveDeployments([]);
}


export function createDeployment(data: DeploymentFormData): DeploymentRecord {
  const current = getDeployments();
  const now = new Date().toISOString();
  
  // Create unique ID
  const newRecord: DeploymentRecord = {
    ...data,
    id: `dep-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: now,
    updatedAt: now,
  };

  const updatedList = [newRecord, ...current];
  saveDeployments(updatedList);
  return newRecord;
}

export function updateDeployment(id: string, updates: Partial<DeploymentFormData>): DeploymentRecord | null {
  const current = getDeployments();
  const index = current.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const updatedRecord: DeploymentRecord = {
    ...current[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  current[index] = updatedRecord;
  saveDeployments(current);
  return updatedRecord;
}

export function deleteDeployment(id: string): boolean {
  const current = getDeployments();
  const filtered = current.filter((item) => item.id !== id);
  if (filtered.length === current.length) return false;
  saveDeployments(filtered);
  return true;
}

export function deleteMultipleDeployments(ids: string[]): void {
  const idSet = new Set(ids);
  const current = getDeployments();
  const filtered = current.filter((item) => !idSet.has(item.id));
  saveDeployments(filtered);
}

export function resetToDemoData(): DeploymentRecord[] {
  saveDeployments(INITIAL_DEPLOYMENTS);
  return INITIAL_DEPLOYMENTS;
}

export function calculateKPIs(records: DeploymentRecord[]): DeploymentKPIs {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  let totalThisMonth = 0;
  let recentCount = 0;
  let pendingVerificationCount = 0;
  let hotfixCount = 0;
  let verifiedCount = 0;
  let inMonitoringCount = 0;
  let revertedCount = 0;

  const productMap: Record<string, { count: number; hotfixes: number }> = {};
  const typeMap: Record<string, number> = {};
  const statusMap: Record<string, number> = {};
  const dateMap: Record<string, { releases: number; hotfixes: number; patches: number }> = {};

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  records.forEach((rec) => {
    const d = new Date(rec.fechaImplementacion);
    const isValidDate = !isNaN(d.getTime());

    // Month check
    if (isValidDate && d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
      totalThisMonth++;
    }

    // Recent 7 days check
    if (isValidDate && d >= sevenDaysAgo) {
      recentCount++;
    }

    // Status counts
    if (rec.estado === 'Pendiente') pendingVerificationCount++;
    if (rec.estado === 'Verificado') verifiedCount++;
    if (rec.estado === 'En Monitoreo') inMonitoringCount++;
    if (rec.estado === 'Revertido') revertedCount++;

    // Type counts
    if (rec.tipo === 'Hotfix') hotfixCount++;

    // Product breakdown
    if (!productMap[rec.producto]) {
      productMap[rec.producto] = { count: 0, hotfixes: 0 };
    }
    productMap[rec.producto].count++;
    if (rec.tipo === 'Hotfix') {
      productMap[rec.producto].hotfixes++;
    }

    // Type distribution
    typeMap[rec.tipo] = (typeMap[rec.tipo] || 0) + 1;

    // Status distribution
    statusMap[rec.estado] = (statusMap[rec.estado] || 0) + 1;

    // Daily Trend
    if (isValidDate) {
      const dateKey = rec.fechaImplementacion.slice(0, 10);
      if (!dateMap[dateKey]) {
        dateMap[dateKey] = { releases: 0, hotfixes: 0, patches: 0 };
      }
      if (rec.tipo === 'Release' || rec.tipo === 'Feature') {
        dateMap[dateKey].releases++;
      } else if (rec.tipo === 'Hotfix') {
        dateMap[dateKey].hotfixes++;
      } else {
        dateMap[dateKey].patches++;
      }
    }
  });

  // Calculate success/stability rate (Verified + In Monitoring) / Total non-reverted
  const total = records.length;
  const successRate = total > 0 ? Math.round(((verifiedCount + inMonitoringCount) / total) * 100) : 100;

  const deploymentsByProduct = Object.entries(productMap)
    .map(([name, data]) => ({ name, count: data.count, hotfixes: data.hotfixes }))
    .sort((a, b) => b.count - a.count);

  const deploymentsByType = Object.entries(typeMap).map(([type, count]) => ({
    type,
    count,
  }));

  const deploymentsByStatus = Object.entries(statusMap).map(([status, count]) => ({
    status,
    count,
  }));

  const dailyTrend = Object.entries(dateMap)
    .map(([date, counts]) => ({
      date: date.slice(5), // MM-DD for cleaner chart labels
      ...counts,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-10); // Last 10 distinct dates

  return {
    totalThisMonth: totalThisMonth || records.length,
    totalAllTime: records.length,
    recentCount,
    pendingVerificationCount,
    hotfixCount,
    verifiedCount,
    inMonitoringCount,
    successRate,
    deploymentsByProduct,
    deploymentsByType,
    deploymentsByStatus,
    dailyTrend,
  };
}
