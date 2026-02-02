// Backend Payload Types
export interface DataSetupEntry {
    id?: number; // Int? = 0
    code?: string; // String?
    name: string; // String
    isActive?: boolean; // Boolean?
}

export interface DataSetupItemEntry {
    id?: number; // Int? = 0
    dataSetupId: number; // Int
    code: string; // String
    status?: string; // String? = "Active"
    setDefault?: boolean; // Boolean? = false
    nameEn?: string; // String? = null
    nameKm?: string; // String? = null
    descriptionEn?: string; // String? = null
    descriptionKm?: string; // String? = null
    access?: string[]; // String? = null
    map?: string[]; // String? = null

    // Frontend helpers (optional, might need to map or keep for UI)
    attributes?: Record<string, any>; // Keeping for UI if needed, but won't send if not in payload
    parentId?: number; // Keeping for hierarchy UI, but backend might not save it based on provided class?
    children?: DataSetupItemEntry[]; // For tree UI
    key?: React.Key;
    typeCode?: string; // Legacy helper
}

// Aliases to minimize refactor churn in UI components
export type MasterData = DataSetupEntry;
export type MasterDataItem = DataSetupItemEntry;



/// EMPLOYEE

export interface EmployeeRecord {
    employeeId: string;
    fullName: string;
    company: string;
    locations: string;
    function: string;
    subFunction: string;
    position: string;
    jobLevel: string;
    idAppraiser1: string | null;
    appraiser1: string;
    idAppraiser2: string | null;
    appraiser2: string;
    idAppraiser3: string | null;
    appraiser3: string;
    idAppraiser4: string | null;
    appraiser4: string;
    idAppraiser5: string | null;
    appraiser5: string;
    status: string;
}


interface DataSetupItemSearchParam {
    dataSetupCode: string;
}

interface DataSetupSearchParam {
    code?: string[] | ["OBJECTIVES", "ACTION-PLAN", "KPI"];
}
export interface DataSetupDTO {
    id?: number; // Int? = 0
    code?: string; // String?
    name: string; // String
    isActive?: boolean; // Boolean?,
    items: DataSetupItemEntry[];
}