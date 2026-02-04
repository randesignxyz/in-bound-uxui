import { EmployeeRecord } from "./data";
// Import the local file directly
import empData from "./emp.json";

export const EmployeeDataService = {
    getEmployees: async (): Promise<EmployeeRecord[]> => {
        // Return the data directly. No fetch, no 404!
        return Array.isArray(empData) ? empData : (empData as any).employees || [];
    },

    getEmployeeDetail: async (empId: string) => {
        const all = await EmployeeDataService.getEmployees();
        const emp = all.find(e => e.employeeId === empId);
        const manager = all.find(e => e.employeeId === emp?.idAppraiser1);
        return { employee: emp, reportsTo: manager };
    },

    // Analysis:
    // "if employee as level staff can get only staff" -> Staff sees only themselves (or peer staff? assuming Self for security).
    // "if level manager manager ex" -> Manager sees Self + Direct Reports (Subordinates).
    getEmployeesByAccess: async (currentEmpId: string): Promise<EmployeeRecord[]> => {
        const all = await EmployeeDataService.getEmployees();
        const currentUser = all.find(e => e.employeeId === currentEmpId);

        if (!currentUser) return [];

        const level = currentUser.jobLevel || "";

        // CASE 1: STAFF (STF-*)
        // Staff level employees usually can only access their own data.
        if (level.startsWith("STF")) {
            return [currentUser];
        }

        // CASE 2: MANAGER / EXECUTIVE (MID-*, MGT-*, EXE-*)
        // Managers can see themselves AND employees who report to them (Direct Reports).
        // Check if the current user is listed as 'idAppraiser1' for others.
        if (level.startsWith("MID") || level.startsWith("MGT") || level.startsWith("EXE")) {
            const directReports = all.filter(e => e.idAppraiser1 === currentEmpId);
            // Include Self + Direct Reports
            return [currentUser, ...directReports];
        }

        // Default: Return only self if level is unknown
        return [currentUser];
    }
};