export type SaveTermData = {
    id?: number;
    code?: string;
    description?: string;
    tag?: string[];
  }
  export interface Term{
    id: number,
    description: string,
    code?: string,
    termId?:number,
    isConfigured?:boolean,
    tag?: string[],
    gratisAdmin?: boolean
  }

  export type SaveGratisSettledConfigData = {
    id?: number;
    sku?: string;
    operator?: string;
    target0: number;
    target1: number;
    countValue: number;
    offer: number;
    settledCode: string;
    settledSKU: string;
    excludedSKU: string;
    mergedSKU: string;
    remark?: string;
    termId: number;
  }

  export type GratisSettledConfigData = {
    id?: number;
    sku?: string;
    operator?: string;
    target0: number;
    target1: number;
    countValue: number;
    offer: number;
    settledCode: string;
    settledSKU: string;
    excludedSKU: string;
    mergedSKU: string;
    remark?: string;
  }
  export type RemoveGratisSettledConfigData = {
    id?: number;   
    termId: number;
  }

  export type TermReportParams = {
    tag?: string[]
  }
  
