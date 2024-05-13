import { LookupDataItem } from "@/services/data";
import { LoadingBay, LoadingDock } from "@/services/delivery/data";

export type QueueLayoutItemList = {
    id: number;
    layoutName: string;
    rows: number;
    columns: number;
    displayBoxWidth: number;
    displayBoxHeight: number;
    warehouses?: LookupDataItem[];
    loadingBays?: LoadingBay[]
    loadingDocks?: LoadingDock[]
    description?: string;
    defaultForUser?: string;
    isDefault: boolean;
}

export type QueueLayoutConfig = {
    id?: number;
    layoutName: string;
    rows: number;
    columns: number;
    displayBoxWidth: number;
    displayBoxHeight: number;
    loadingBays?: LoadingBay[]
    warehouses?: LookupDataItem[];
    loadingDocks?: LoadingDock[]
    description?: string;
}

export type QueueLayoutSaveParams = {
    id?: number;
    layoutName: string;
    rows: number;
    columns: number;
    displayBoxWidth: number;
    displayBoxHeight: number;
    warehouseIds?: number[];
    loadingBayIds?: number[]
    loadingDockIds?: number[]
    description?: string;
    defaultForUser?: string;
}