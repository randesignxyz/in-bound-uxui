
import { FieldInfo } from "@/services/shared/data"
import moment from "moment"

type DeliveryDetail = {
    company: string
    docEntry: number
    docNo: string
    docDate: string
    canceled: string
    transportation: string
    outSource: string
    driver: string
    truckNo: string
    shippingToCode: string
    shippingToName: string
    indirectName: string
    province: string
    district: string
    commune?: string
}

export type ImportedPriceRate = {
    id: number;
    province: string;
    district: string;
    supplierName: string;
    vt250ml: number;
    vt250ml_40: number;
    vt350ml: number;
    vt500ml: number;
    vt1ml5_12: number;
    vt1ml5_6: number;
    mc24: number;
    action: string;
    effectiveDate?: moment.Moment;
    expiryDate?: moment.Moment;
    fieldInfoList: FieldInfo[];
}