const TEST_STRIP_EXPIRATION_KEY = "aquatest_test_strip_expiration";
const SOLUTION_EXPIRATION_KEY = "aquatest_solution_expiration";

export interface TestStripInfo {
  expirationDate: string; // ISO date string
  setDate: string; // ISO date string
}

export interface SolutionInfo {
  expirationDate: string; // ISO date string
  setDate: string; // ISO date string
}

export const setTestStripExpiration = (expirationDate: Date): void => {
  const info: TestStripInfo = {
    expirationDate: expirationDate.toISOString(),
    setDate: new Date().toISOString(),
  };
  localStorage.setItem(TEST_STRIP_EXPIRATION_KEY, JSON.stringify(info));
};

export const setSolutionExpiration = (expirationDate: Date): void => {
  const info: SolutionInfo = {
    expirationDate: expirationDate.toISOString(),
    setDate: new Date().toISOString(),
  };
  localStorage.setItem(SOLUTION_EXPIRATION_KEY, JSON.stringify(info));
};

export const getTestStripInfo = (): TestStripInfo | null => {
  const stored = localStorage.getItem(TEST_STRIP_EXPIRATION_KEY);
  if (!stored) return null;
  
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

export const getSolutionInfo = (): SolutionInfo | null => {
  const stored = localStorage.getItem(SOLUTION_EXPIRATION_KEY);
  if (!stored) return null;
  
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

export const clearTestStripExpiration = (): void => {
  localStorage.removeItem(TEST_STRIP_EXPIRATION_KEY);
};

export const clearSolutionExpiration = (): void => {
  localStorage.removeItem(SOLUTION_EXPIRATION_KEY);
};

export const isTestStripExpired = (): boolean => {
  const info = getTestStripInfo();
  if (!info) return false;
  
  const expirationDate = new Date(info.expirationDate);
  const now = new Date();
  
  return now > expirationDate;
};

export const isSolutionExpired = (): boolean => {
  const info = getSolutionInfo();
  if (!info) return false;
  
  const expirationDate = new Date(info.expirationDate);
  const now = new Date();
  
  return now > expirationDate;
};

export const getDaysUntilExpiration = (): number | null => {
  const info = getTestStripInfo();
  if (!info) return null;
  
  const expirationDate = new Date(info.expirationDate);
  const now = new Date();
  
  const diffTime = expirationDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

export const getSolutionDaysUntilExpiration = (): number | null => {
  const info = getSolutionInfo();
  if (!info) return null;
  
  const expirationDate = new Date(info.expirationDate);
  const now = new Date();
  
  const diffTime = expirationDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

export const isTestStripExpiringSoon = (daysThreshold: number = 7): boolean => {
  const daysUntil = getDaysUntilExpiration();
  if (daysUntil === null) return false;
  
  return daysUntil > 0 && daysUntil <= daysThreshold;
};

export const isSolutionExpiringSoon = (daysThreshold: number = 2): boolean => {
  const daysUntil = getSolutionDaysUntilExpiration();
  if (daysUntil === null) return false;
  
  return daysUntil > 0 && daysUntil <= daysThreshold;
};
