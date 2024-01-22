import { execDataService0, fetchDataItemService, fetchDataListService } from "@/services/apiGateway";
import { Driver } from "@/services/delivery/data";

export const TicketServices = {
    listDriver: (keywords?: string) => fetchDataListService<Driver, { keywords?: string }>({
        actionName: 'search-active-drivers',
        endpoint: 'DELIVERY',
        payload: { keywords }
    }),

    findDriverById: (driverId: number) => fetchDataItemService<Driver, { id: number }>({
        actionName: 'get-driver-by-id',
        endpoint: 'DELIVERY',
        payload: { id: driverId }
    }),

    issueManualDiliveryTicket: (data: {
        qrCodeId: number;
        driverId: number;
        truckId: number;
        remarks?: string;
    }) => execDataService0<{ qrCodeId: number; driverId: number; truckId: number; remarks?: string }>({
        endpoint: 'DELIVERY',
        actionName: 'issue-delivery-ticket-manually',
        payload: data,
    }),


    issueManualPickupTicket: (data: {
        qrCodeId: number;
        licensePlate: string;
        driverName?: string;
        phoneNumber?: string;
        remarks?: string;
    }) => execDataService0<{
        qrCodeId: number;
        licensePlate: string;
        driverName?: string;
        phoneNumber?: string;
        remarks?: string;
    }>({
        endpoint: 'DELIVERY',
        actionName: 'issue-pickup-ticket-manually',
        payload: { ...data },
    }),
}