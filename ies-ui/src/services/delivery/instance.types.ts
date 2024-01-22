import { Moment } from 'moment';
import {
  DeliveryDetail,
  DeliveryListItem,
  Driver,
  LoadingDetail,
  LoadingListItem,
  Truck,
} from './data';

export type InstanceAdvanceSearchParams = { activeOnly?: boolean; canPick?: boolean; canAssignDocs?: boolean; } & (
  | {
      activity: 'LOADING';
      status: 'ALL' | 'PENDING' | 'LOADING' | 'LOADED' | 'CANCELED';
    }
  | {
      activity: 'DELIVERY';
      status: 'ALL' | 'PENDING' | 'IN_PROGRESS' | 'DELIVERED' | 'CANCELED';
    }
  | {
      activity: 'SETTLEMENT';
      status: 'All' | 'UN_SETTLED' | 'SETTLED';
    }
  | {
      activity: 'ALL';
      status: 'ALL' | 'PENDING';
    }
);

export type activity = {
  id: number;
  activityType: string;
  action: string;
  actionDate: Moment;
  actionBy: string;
  remarks: string;
};

export type InstanceBasic = {
  id: number;
  driver: Driver;
  truck: Truck;
  loading: LoadingListItem;
  delivery: DeliveryListItem;
  priority: number;
  activity: string;
  ticketNum: number ;
  reset: number;
  status: string;
  isOwner: boolean;
  holdBy: boolean;
  claimedBy?: string;
  changeRequest?: boolean
}

export type InstanceDetail = {
  loadingInfo?: LoadingDetail;
  deliveryInfo?: DeliveryDetail;
  activities: activity[];
} & InstanceBasic ;

export type InstanceListItem = {
  ticketNo: string;
  
  startedDate: Moment;
  endedDate?: Moment;
  
} & InstanceBasic
