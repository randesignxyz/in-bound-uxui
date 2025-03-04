import { StockControlLess } from "@/services/sale/data";


interface StockControlApprovalParam{
    
}

interface StockControlDTO extends StockControlLess{
    roleApproval?:string[];
}