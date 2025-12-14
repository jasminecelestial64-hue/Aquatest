import { z } from "zod";

// Version for data format - increment when making breaking changes
const BACKUP_VERSION = "1.0.0";

// Schema for validating backup data
const backupSchema = z.object({
    version: z.string(),
    timestamp: z.string(),
    data: z.object({
        testHistory: z.array(z.any()).optional(),
        roboflowConfig: z.object({
            apiKey: z.string(),
            modelEndpoint: z.string(),
        }).optional(),
        testStripInfo: z.object({
            expirationDate: z.string(),
            setDate: z.string(),
        }).optional(),
        authUser: z.object({
            email: z.string(),
        }).optional(),
    }),
});

export type BackupData = z.infer<typeof backupSchema>;

/**
 * Export all application data to a JSON file
 */
export const exportData = (): void => {
    try {
        const data: BackupData = {
            version: BACKUP_VERSION,
            timestamp: new Date().toISOString(),
            data: {
                testHistory: getLocalStorageItem("test_history"),
                roboflowConfig: getLocalStorageItem("roboflow_config"),
                testStripInfo: getLocalStorageItem("test_strip_info"),
                authUser: getLocalStorageItem("auth_user"),
            },
        };

        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `aquatest-backup-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // Save last backup timestamp
        localStorage.setItem("last_backup_date", new Date().toISOString());
    } catch (error) {
        console.error("Export failed:", error);
        throw new Error("Failed to export data");
    }
};

/**
 * Import data from a backup file
 */
export const importData = async (file: File): Promise<void> => {
    try {
        const text = await file.text();
        const parsedData = JSON.parse(text);

        // Validate data structure
        const validationResult = backupSchema.safeParse(parsedData);
        if (!validationResult.success) {
            throw new Error("Invalid backup file format");
        }

        const backup = validationResult.data;

        // Check version compatibility (for now, just accept same version)
        if (backup.version !== BACKUP_VERSION) {
            console.warn(`Backup version ${backup.version} differs from current ${BACKUP_VERSION}`);
        }

        // Restore data to localStorage
        if (backup.data.testHistory) {
            localStorage.setItem("test_history", JSON.stringify(backup.data.testHistory));
        }
        if (backup.data.roboflowConfig) {
            localStorage.setItem("roboflow_config", JSON.stringify(backup.data.roboflowConfig));
        }
        if (backup.data.testStripInfo) {
            localStorage.setItem("test_strip_info", JSON.stringify(backup.data.testStripInfo));
        }
        if (backup.data.authUser) {
            localStorage.setItem("auth_user", JSON.stringify(backup.data.authUser));
        }

        // Save last restore timestamp
        localStorage.setItem("last_restore_date", new Date().toISOString());
    } catch (error) {
        console.error("Import failed:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to import data");
    }
};

/**
 * Get last backup date
 */
export const getLastBackupDate = (): Date | null => {
    const lastBackup = localStorage.getItem("last_backup_date");
    return lastBackup ? new Date(lastBackup) : null;
};

/**
 * Get last restore date
 */
export const getLastRestoreDate = (): Date | null => {
    const lastRestore = localStorage.getItem("last_restore_date");
    return lastRestore ? new Date(lastRestore) : null;
};

/**
 * Helper to safely get items from localStorage
 */
function getLocalStorageItem(key: string): any {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : undefined;
    } catch {
        return undefined;
    }
}
