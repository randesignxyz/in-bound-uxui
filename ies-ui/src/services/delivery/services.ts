import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { Moment } from "moment";
import { Paging } from "../API";
import { RequestActions, singleRequest } from "../apiGateway";
import {
    Company,
    CompanyListItem,
    Driver,
    DriverListItem,
    QRCode, QRCodeListItem,
    Queue,
    QueueListItem, SaveCompany, SaveDriver, SaveQueue,
    SaveTruck,
    TransportSource, 
    TransportSourceListItem, 
    Truck, TruckListItem, 
    QueueDisplayData, DeliveryListItem, 
    LoadingItem, Loaded, CheckoutListItem, 
    AssigningDocsResponse, DeliveryInfo, 
    AssignDocParam, CashCollectionListItem, 
    SettlementParams,
    LoadedInfo,
    LoadingSummaryStatus,
    DeliverySummaryStatus,
    SettlementSummaryStatus,
    SettlementDetail,
    QueueSummaryStatus,
    ReviewerListItem,
    ReviewListItem,
    ReviewItem
} from "./data";
import { DeliveryParams } from "./delivery-params";
import { LoadingParams } from "./loading-params";
import { ReqQueuetParams } from "./queue-params";
import { 
    DeliveryAdvanceSearchParams, 
    DeliveryCashCollectionParams, 
    ReviewerParams, 
    ReviewParams, 
    SaveLoadedParam 
} from "./req-params";
import { ReqSurveyParams } from "./survey-params";


export const DeliveryServiceAPI = (requestActions: RequestActions) => {

    return {

        // listLoading: (params: TableViewSearchParams<LoadingAdvanceSearchParams>) => singleRequest<LoadingListItem>(LoadingParams.listLoading(params))(requestActions) as Promise<Paging<LoadingListItem>>,
        loadingSummaryStatus: () => singleRequest(LoadingParams.summary())(requestActions) as Promise<LoadingSummaryStatus>,
        fetchLoadedInfo: (id: number) => singleRequest(LoadingParams.fetchLoadingInfo(id))(requestActions) as Promise<LoadedInfo>,

        deliverySummaryStatus: () => singleRequest(DeliveryParams.summary())(requestActions) as Promise<DeliverySummaryStatus>,
        listDelivery: (params: TableViewSearchParams<DeliveryAdvanceSearchParams>) => singleRequest<DeliveryListItem>(DeliveryParams.listDelivery(params))(requestActions) as Promise<Paging<DeliveryListItem>>,
        
        settlementSummaryStatus: () => singleRequest(DeliveryParams.summarySettlement())(requestActions) as Promise<SettlementSummaryStatus>,
        listCashCollection: (params: TableViewSearchParams<DeliveryCashCollectionParams>) => singleRequest<CashCollectionListItem>(DeliveryParams.listCashCollection(params))(requestActions) as Promise<Paging<CashCollectionListItem>>,
       
        fetchDeliveryInfo: (id: number) => singleRequest<DeliveryInfo>(DeliveryParams.fetchDeliveryInfo(id))(requestActions) as Promise<DeliveryInfo>,
        assignDocs: (params: AssignDocParam) => singleRequest(DeliveryParams.assignDocs(params))(requestActions),

        listCheckout: (deliveryId: number) => singleRequest<CheckoutListItem>(DeliveryParams.listCheckout(deliveryId))(requestActions) as Promise<CheckoutListItem[]>,
        saveSettlement: (data: SettlementParams) =>  singleRequest(DeliveryParams.saveSettlement(data))(requestActions),
        fetchSettlementDetail: (id: number) => singleRequest(DeliveryParams.SettlementDetail(id))(requestActions) as Promise<SettlementDetail>,

        // listQueueTicket: (params: TableViewSearchParams<QueueTicketAdvanceSearchParams>, ) => singleRequest<QueueTicketListItem>(ReqQueuetParams.listQueueTicket(params))(requestActions) as Promise<Paging<QueueTicketListItem>>,

        // saveQueueTicket: (id: number, name: string, qrCode: string, description?: string) => singleRequest(ReqQueuetParams.saveQueueTicket(id, name, qrCode, description))(requestActions),
        // fetchQueueTicketDetail: (id: number) => singleRequest(ReqQueuetParams.fetchQueueTicketDetail(id))(requestActions) as Promise<QueueTicketDetail>,
        queueSummaryStatus: () => singleRequest(ReqQueuetParams.summaryQueue())(requestActions) as Promise<QueueSummaryStatus>,

        fetchQueueTicket: (id: number) => singleRequest<Queue>(ReqQueuetParams.fetchQueue(id))(requestActions),

        // cancelQueueTicket: (id: number, remarks: string) => singleRequest(ReqQueuetParams.cancelQueueTicket(id, remarks))(requestActions),
        assignedLoadingDock: (id: number, loadingDockId: number, remarks?: String) => singleRequest(ReqQueuetParams.assignedLoadingDock(id, loadingDockId, remarks))(requestActions),
        // setQeueTicketPriority: (id: number, priority: number) => singleRequest(ReqQueuetParams.setQeueTicketPriority(id, priority))(requestActions),
        assignedPickingSlip: (id: number, shift: string,isModified?: boolean, remarks?: string) => singleRequest(ReqQueuetParams.assignedPickingSlip(id, shift, isModified, remarks))(requestActions),
        finishLoading: (id: number) => singleRequest(ReqQueuetParams.loadingCompleted(id))(requestActions),
        assigneDeliveryDoc: (id: number, deliveryNoteIds: number[], invoiceIds: number[]) => singleRequest(ReqQueuetParams.assigneDeliveryDoc(id, deliveryNoteIds, invoiceIds))(requestActions),
        fetchQueueDisplayData: () => singleRequest(ReqQueuetParams.fetchQueueDisplayData())(requestActions) as Promise<QueueDisplayData>,

        listQRcode: (params: TableViewSearchParams<any>) => singleRequest<QRCodeListItem>(ReqQueuetParams.listQRCode(params))(requestActions) as Promise<Paging<QRCodeListItem>>,
        listAllQRCode: () => singleRequest(ReqQueuetParams.listAllQRCode())(requestActions) as Promise<QRCodeListItem[]>,
        saveQRCode: (id: number, name: string, code: string, description?: string) => singleRequest(ReqQueuetParams.saveQRCode(id, name, code, description))(requestActions),
        fetchQRCode: (id: number) => singleRequest(ReqQueuetParams.fetchQRCode(id))(requestActions) as Promise<QRCode>,

        // listLoadingDock: (params: TableViewSearchParams<any>) => singleRequest<LoadingDockListItem>(ReqQueuetParams.listLoadingDock(params))(requestActions) as Promise<Paging<LoadingDockListItem>>,
        // saveLoadingDock: (data: LoadingDock) => singleRequest(ReqQueuetParams.saveLoadingDock(data))(requestActions),
        // fetchLoadingDock: (id: number) => singleRequest(ReqQueuetParams.fetchLoadingDock(id))(requestActions) as Promise<LoadingDock>,


        // listLoadingBay: (params: TableViewSearchParams<any>) => singleRequest<LoadingBayListItem>(ReqQueuetParams.listLoadingBay(params))(requestActions) as Promise<Paging<LoadingBayListItem>>,
        // saveLoadingBay: (data: LoadingBay) => singleRequest(ReqQueuetParams.saveLoadingBay(data))(requestActions),
        // fetchLoadingBay: (id: number) => singleRequest(ReqQueuetParams.fetchLoadingBay(id))(requestActions) as Promise<LoadingBay>,

        listQueue: (params: TableViewSearchParams<any>) => singleRequest<QueueListItem>(ReqQueuetParams.listQueue(params))(requestActions) as Promise<Paging<QueueListItem>>,
        saveQueue: (params: SaveQueue) => singleRequest(ReqQueuetParams.saveQueue(params))(requestActions),
        fetchQueue: (id: number) => singleRequest(ReqQueuetParams.fetchQueue(id))(requestActions) as Promise<Queue>,

        listTranSource: (params: TableViewSearchParams<any>) => singleRequest<TransportSourceListItem>(DeliveryParams.listTranSource(params))(requestActions) as Promise<Paging<TransportSourceListItem>>,
        saveTranSource: (id: number, name: string,deliveryTracking?: boolean, description?: string) => singleRequest(DeliveryParams.saveTranSource(id, name,deliveryTracking, description))(requestActions),
        fetchTranSource: (id: number) => singleRequest(DeliveryParams.fetchTranSource(id))(requestActions) as Promise<TransportSource>,

        listTruck: (params: TableViewSearchParams<any>) => singleRequest<TruckListItem>(DeliveryParams.listTruck(params))(requestActions) as Promise<Paging<TruckListItem>>,
        saveTruck: (data: SaveTruck) => singleRequest(DeliveryParams.saveTruck(data))(requestActions),
        fetchTruck: (id: number) => singleRequest(DeliveryParams.fetchTruck(id))(requestActions) as Promise<Truck>,

        listCompany: (params: TableViewSearchParams<any>) => singleRequest<CompanyListItem>(DeliveryParams.listCompany(params))(requestActions) as Promise<Paging<CompanyListItem>>,
        saveCompany: (data: SaveCompany) => singleRequest(DeliveryParams.saveCompany(data))(requestActions),
        fetchCompany: (id: number) => singleRequest(DeliveryParams.fetchCompany(id))(requestActions) as Promise<Company>,

        listDriver: (params: TableViewSearchParams<any>) => singleRequest<DriverListItem>(DeliveryParams.listDriver(params))(requestActions) as Promise<Paging<DriverListItem>>,
        listAllDrivers: () =>  singleRequest<DriverListItem>(DeliveryParams.listAllDriver())(requestActions) as  Promise<Driver[]>,
        saveDriver: (data: SaveDriver) => singleRequest(DeliveryParams.saveDriver(data))(requestActions),
        fetchDriver: (id: number) => singleRequest(DeliveryParams.fetchDriver(id))(requestActions) as Promise<Driver>,

        listPickingSlip: (id: number) => singleRequest<LoadingItem>(LoadingParams.fetchLoadingItem(id))(requestActions) as Promise<LoadingItem>,

        fetchLoadedItem: (id: number) => singleRequest<Loaded>(LoadingParams.fetchLoadedItem(id))(requestActions) as Promise<Loaded>,

        saveLoaded: (data: SaveLoadedParam) => singleRequest(LoadingParams.saveLoaded(data))(requestActions),

        fetchLoadedDetail: (
            id: number, 
            driverId?: number, 
            licensePlate?: string, 
            deliveryDate?: Moment, 
            shift?: string,
            remarks?: string
        ) => singleRequest(LoadingParams.fetchLoadedDetail(id, driverId, licensePlate, deliveryDate, shift, remarks ))(requestActions)as Promise<AssigningDocsResponse>,

        listReviewer: (params: TableViewSearchParams<ReviewerParams>) => singleRequest(ReqSurveyParams.listReviewer(params))(requestActions) as Promise<Paging<ReviewerListItem>>,

        listReview: (params: TableViewSearchParams<ReviewParams>) => singleRequest(ReqSurveyParams.listReview(params))(requestActions) as Promise<Paging<ReviewListItem>>,
        
        listReviewByReviewerId: (id: number, pagination?: {
            pageSize?: number;
            current?: number;
          }) => singleRequest(ReqSurveyParams.listReviewByReviwerId(id, pagination))(requestActions) as Promise<Paging<ReviewListItem>>,


        listReviewItem: (id: number) => singleRequest(ReqSurveyParams.listReviewItem(id))(requestActions) as Promise<ReviewItem[]>,

        assignCustomerToReviewer: (id: number,customerCode: string) => singleRequest(ReqSurveyParams.assignCustomerToReviewer(id, customerCode))(requestActions),
    }
}