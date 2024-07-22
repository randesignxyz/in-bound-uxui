import moment from "moment";
import { LookUpDataDTO } from "../lookupData/data";
import { SortOrder } from "antd/lib/table/interface";

interface TankDTO {
    id: number;
    tankName: string;
    fuelType?: LookUpDataDTO;
    tankCapacity: number;
    beginningInventory?: number;
    tankUsages?: number;
    currentInventory: number;
    status: string;
    location: LookUpDataDTO;
    description: string;
}

interface TankCreate {
    tankName: string;
    fuelType?: number;
    tankCapacity?: number;
    beginningInventory?: number;
    tankUsages?: number;
    currentInventory: number;
    status: string;
    location: string;
    description: string;
}

interface TankStatus {
    status: string;
    id: number;
}

interface TankRefillDTO {
    id: number,
    tankId: number,
    currentBalance: number,
    unitPrice: number,
    totalAmount: number,
    quantity: number,
    status: string,
    actualBalance: number;
    dateRefile: moment.Moment,
    createdBy: string,
    createdDate: moment.Moment,
}

interface TankRefillSearchparam {
    searchValue?: string;
    id?: number;
}

interface TankRefillCreate {
    id: number,
    tankId: number,
    currentBalance?: number,
    unitPrice?: number,
    totalAmount?: number,
    quantity: number,
    uom: string;
    status?: string,
    dateRefill: moment.Moment,
    actualBalance?: number;
}

interface TankMonthlyEndingCreate {
    id?: number,
    tankId?: number,
    currentBalance: number,
    actualBalance: number,
    adjustment?: number,
    status?: string,
    remark?: string,
    endingDate?: moment.Moment,
}

interface TankMonthlyEndingDTO {
    id?: number,
    tankId?: number,
    currentBalance: number,
    actualBalance: number,
    adjustment?: number,
    status?: string,
    remark?: string,
    endingDate?: moment.Moment,
    createdBy?: string;
    createdDate?: moment.Moment;
    monthlyTransaction: TankTransactionDTO[];
}


interface MonthlyEndingTankDTO {
    id: number
    tankId: number,
    currentBalance: number,
    actualBalance: number,
    status?: string,
    remark?: string,
    closingDate: moment.Moment;
    createdBy?: string,
    createdDate?: moment.Moment,
}

// =============== FUEL TRANSACTION ================
interface TankTransactionDTO {
    id: number,
    tankId: number,
    quantity: number,
    dateRefill: moment.Moment,
    source: string,
    unitPrice?: number,
    totalPrice?: number,
    transactionName?: string,
    status?: string,
    remark?: string,
    monthlyEnding?: string,
    endingDate?: moment.Moment,
    transactionType?: string,
    createdBy?: string,
    createdDate?: moment.Moment,
    lastModifiedBy?: string,
    lastModifiedDate?: moment.Moment,
    beforeBalance?: number;
    afterBalance?: number;
    beginningBalance: number;
}
interface FuelTransactionSearch {
    searcheValue?: string;
    tankId?: number;
    status?: string;
    date?: moment.Moment;
    sort?: Record<string, SortOrder>
    endingDate?: moment.Moment
}

interface TankTransactionCreate {
    id?: number,
    tankId: number,
    quantity: number,
    dateRefill: moment.Moment,
    source: string,
    unitPrice?: number,
    totalPrice?: number,
    status?: string,
    remark?: string,
    transactionType: string,
    transactionName?: string,
    beginningBalance?: number,
    currentBalance?: number
}
// ================== END ===================