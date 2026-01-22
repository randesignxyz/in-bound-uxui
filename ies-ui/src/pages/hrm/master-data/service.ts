import { MasterData, MasterDataItem } from "./data.d";

const API_URL = '/api/master-data/db';

// --- Service to simulate Backend ---

export const MasterDataService = {

    // --- Types ---
    getTypes: async (): Promise<MasterData[]> => {
        const response = await fetch(API_URL);
        const data = await response.json();
        return data.types || [];
    },

    saveTypes: async (types: MasterData[]): Promise<void> => {
        // We need to fetch current items to preserve them
        const response = await fetch(API_URL);
        const currentDb = await response.json();

        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                types: types,
                items: currentDb.items // Preserve items
            })
        });
    },

    // --- Items ---
    getItems: async (typeId: number): Promise<MasterDataItem[]> => {
        const response = await fetch(API_URL);
        const data = await response.json();
        const allItems: MasterDataItem[] = data.items || [];

        // Return only items for this type
        return allItems.filter(item => item.mdTypeId === typeId);
    },
    getItemsByCode: async (code: string | string[]): Promise<(MasterDataItem & { typeCode?: string, typeName?: string })[]> => {
        const response = await fetch(API_URL);
        const data = await response.json();
        const types: MasterData[] = data.types || [];

        const codes = Array.isArray(code) ? code : [code];
        const matchingTypes = types.filter(t => codes.includes(t.code));

        if (matchingTypes.length === 0) return [];

        const typeMap = new Map(matchingTypes.map(t => [t.id, t]));
        const allItems: MasterDataItem[] = data.items || [];

        return allItems
            .filter(item => typeMap.has(item.mdTypeId))
            .map(item => {
                const typeInfo = typeMap.get(item.mdTypeId);
                return {
                    ...item,
                    typeCode: typeInfo?.code,
                    typeName: typeInfo?.name
                };
            });
    },

    saveAllItems: async (items: MasterDataItem[], typeId: number): Promise<void> => {
        const response = await fetch(API_URL);
        const currentDb = await response.json();

        const allItems: MasterDataItem[] = currentDb.items || [];

        // Remove all items of this type from the Main Store (cleanup old)
        const otherItems = allItems.filter(item => item.mdTypeId !== typeId);

        // Add the new/updated items for this type
        const newStore = [...otherItems, ...items];

        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                types: currentDb.types, // Preserve types
                items: newStore
            })
        });
    }
};
