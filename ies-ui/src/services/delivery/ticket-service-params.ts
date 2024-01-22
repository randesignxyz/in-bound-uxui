import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { ServiceApiType } from '../apiGateway';
import { QueueTicketAdvanceSearchParams } from './req-params';

export type IssueManualTicket =
  | {
      type: 'Delivery';
      qrCodeId:number;
      driverId: number;
      truckId: number;
      remarks: string;
    }
  | {
      type: 'Pickup';
      qrCodeId:number;
      licensePlate: string;
      driverName?: string;
      phoneNumber?: string;
      remarks: string;
    };

export const TicketServiceParams = {
  issueManualDiliveryTicket: (data: {
    driverId: number;
    truckId: number;
    remarks: string;
  }): ServiceApiType<{ driverId: number; truckId: number; remarks: string }> => ({
    type: 'EXEC',
    endpoint: 'DELIVERY',
    actionName: 'issue-delivery-ticket-manually',
    payload: { ...data },
  }),

  issueManualPickupTicket: (data: {
    licensePlate: string;
    driverName?: string;
    phoneNumber?: string;
    remarks: string;
  }): ServiceApiType<{
    licensePlate: string;
    driverName?: string;
    phoneNumber?: string;
    remarks: string;
  }> => ({
    type: 'EXEC',
    endpoint: 'DELIVERY',
    actionName: 'issue-pickup-ticket-manually',
    payload: { ...data },
  }),

  fetchQueueTicketDetail: (id: number): ServiceApiType<{ id: number }> => ({
    type: 'FETCH_QUERY',
    endpoint: 'DELIVERY',
    actionName: 'fetch-queue-ticket-detail',
    payload: { id },
  }),

  setQeueTicketPriority: (
    id: number,
    priority: number,
    remarks: string
  ): ServiceApiType<{
    id: number;
    priority: number;
    remarks: string;
  }> => ({
    type: 'EXEC',
    endpoint: 'DELIVERY',
    actionName: 'set-queue-priority',
    payload: { id, priority, remarks },
  }),

  listQueueTicket: (
    params: TableViewSearchParams<QueueTicketAdvanceSearchParams>,
  ): ServiceApiType<{ searchValue?: string }> => ({
    type: 'PAGING_QUERY',
    endpoint: 'DELIVERY',
    actionName: 'list-queue-ticket',
    payload: { ...params.criteria },
    pagination: {
      pageSize: params.pagination?.pageSize,
      page: params.pagination?.current,
    },
  }),

  saveQueueTicket: (
    id: number,
    name: string,
    qrCode: string,
    description?: string,
  ): ServiceApiType<{
    id: number;
    name: string;
    qrCode: string;
    description?: string;
  }> => ({
    type: 'EXEC',
    endpoint: 'DELIVERY',
    actionName: 'save-queue',
    payload: {
      id: id,
      name: name,
      qrCode: qrCode,
      description: description,
    },
  }),

  fetchQueueTicket: (id: number): ServiceApiType<{ id: number }> => ({
    type: 'FETCH_QUERY',
    endpoint: 'DELIVERY',
    actionName: 'fetch-queue-ticket',
    payload: { id: id },
  }),

  cancelQueueTicket: (
    id: number,
    remarks: string,
  ): ServiceApiType<{
    id: number;
    remarks: string;
  }> => ({
    type: 'EXEC',
    endpoint: 'DELIVERY',
    actionName: 'cancel-queue-ticket',
    payload: { id, remarks },
  }),
};
