import moment, { Moment } from "moment";


export interface SolutionIssueData {
    currentAction: string | null;
    close: () => void;
    rollback: any;
    submitRollback: (values: any) => void;
    wrongPricing: any;
    changeDistributor: any;
    poItemForm: any;
    mmeForm: any;
}

// chnange purchase order item
export interface change_po_item {
    po_code: string;
    old_item_code: string;
    new_item_code: string;
    price: number;
}

export interface change_distributor {
    purchase_order_code: string;
    customer_code: string;
}

export interface wrong_pricing {
    stock_control_id: number;
    invoice_no: string;
}

export interface create_new_mme {
    sale_person_code: string;
    type: string;
}

// export interface rollback_po {
//     purchase_order_code: string;
// }

interface SupporterParam {
    poId: number,
    date?: Moment.moment,
    item?: ItemParam[] ,
    actionType: string,
    remark?: string
}


interface ItemParam {
    itemsId: number,
    qty: number,
    price: number,
    status: string
}