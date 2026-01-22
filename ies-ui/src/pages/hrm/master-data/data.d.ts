export interface MasterData {
    id: number;
    code: string;              // OUTLET_TYPE
    name: string;
    allowUserCreate: boolean;
    isHierarchical: boolean;
    isActive: boolean;
}

export interface MasterDataItem {
    typeCode: string;
    id: number;
    mdTypeId: number;
    code: string;              // RETAIL
    parentId?: number;
    attributes?: Record<string, any>;
    status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
    nameEn?: string;
    nameKm?: string;
    abbreviationEn?: string;
    abbreviationKm?: string;
    // Helper for recursion
    children?: MasterDataItem[];
}

export const mockMasterDataTypes: MasterData[] = [
    {
        id: 1,
        code: 'RATING_SCALE',
        name: 'Rating Scale',
        allowUserCreate: true,
        isHierarchical: true,
        isActive: true
    },
    {
        id: 2,
        code: 'OUTLET_TYPE',
        name: 'Outlet Type',
        allowUserCreate: true,
        isHierarchical: false,
        isActive: true
    }
];

export const mockMasterDataItems: MasterDataItem[] = [
    {
        id: 11,
        mdTypeId: 1,
        code: 'OUTSTANDING',
        parentId: undefined,
        status: 'ACTIVE',
        nameEn: 'Outstanding',
        nameKm: 'ល្អប្រសើរ',
        abbreviationEn: 'OUT',
        abbreviationKm: 'ល្អ'
    },
    {
        id: 12,
        mdTypeId: 1,
        code: 'EXCEED',
        parentId: undefined,
        status: 'ACTIVE',
        nameEn: 'Exceed Expectations',
        nameKm: 'លើសពីការរំពឹងទុក',
        children: [
            {
                id: 121,
                mdTypeId: 1,
                code: 'HIGH',
                parentId: 12,
                status: 'ACTIVE',
                nameEn: 'High Exceed',
                nameKm: 'ខ្ពស់'
            }
        ]
    }
];