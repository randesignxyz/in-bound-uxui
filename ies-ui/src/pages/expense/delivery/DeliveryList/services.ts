import { SearchDNCriteria, searchDeliveryCost } from "@/models/delivery";
import { fetchDataPagingService, fetchDataItemService } from "@/services/apiGateway";
import { DeliveryCost, DeliveryInvoiceItem, DeliveryNoteFinder, DeliverySettlementActivity,domain} from "@/services/del-expense/data";
import moment from "moment";


export const DlvExpenseServices = {
    listAllDNsBYEquaulOrLessThanSettledOn: (payload: searchDeliveryCost, page: number, pageSize: number) => fetchDataPagingService<DeliveryCost, searchDeliveryCost>({
        actionName: 'query-delivery-cost-all-by-equal-less-than-settled-on',
        endpoint: 'DLV_EXPENSE',
        payload: payload,
        pagination: {
            page: page,
            pageSize: pageSize
        }
        
    }),
    listDNChecking: (payload: {deliveryId: number}) => fetchDataPagingService<DeliveryCost,  {deliveryId: number}>({
        actionName: 'query-dn-checking',
        endpoint: 'DLV_EXPENSE',
        payload: payload
    }),
    listFinderDNs: (payload: SearchDNCriteria, page: number, pageSize: number) => fetchDataPagingService<DeliveryNoteFinder, SearchDNCriteria>({
        actionName: 'query-dn-finder',
        endpoint: 'DLV_EXPENSE',
        payload: payload,
        pagination: {
            page: page,
            pageSize: pageSize
        }
        
    }),
    listInvItemBySettledId: (payload: {deliveryId: number}) => fetchDataPagingService<DeliveryInvoiceItem,  {deliveryId: number}>({
        actionName: 'query-inv-item-by-settled-id',
        endpoint: 'DLV_EXPENSE',
        payload: payload
    }),
    listSettlementActivities: (payload: {deliverySettlementId: number}, page: number, pageSize: number) => fetchDataPagingService<domain.delivery.Activity,  {deliverySettlementId: number}>({
        actionName: 'query-delivery_settlement_activity',
        endpoint: 'DLV_EXPENSE',
        payload: payload,
        pagination: {
            page: page,
            pageSize: pageSize
        }
    }),
    findDeliveryNoteDocNumInSAP:(payload: {docNo: string}) => fetchDataItemService<{docNum:string, docDate?: moment.Moment;}, { docNo: string; }>({
        actionName: 'fetch-delivery-note-doc-num',
        endpoint: 'SAP_SOURCE',
        payload: payload
    })

}