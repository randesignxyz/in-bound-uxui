import { FieldInfo } from "@/services/shared/data";

export interface ImportedVisitPlan {
    id: number,
    key: string;
    customerCode: string;
    salespersonName: string;
    addressCode: string;
    weeks?: string;
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
    fieldInfoList: FieldInfo[];
    action?: string;
}