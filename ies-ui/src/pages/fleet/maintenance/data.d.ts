import moment from 'moment';
import { DriverDTO } from '../driver/data';
import { AttachmentFiles, LookUpDataDTO } from '../lookupData/data';
import { ServiceReminderDTO, ServiceReminderMaintenance } from '../servicereminder/data';
import { MeterHistoryDTO, VehicleListItem } from '../vehicle/data';
import { List } from 'lodash';

export interface MaintenneceDTO {
  id: string;
  vehiclePlate: string;
  vendorName: VendorDTO;
  totalCost: number;
  formDate: moment.Moment;
  toDate: moment.Moment;
  karas: number;
  brokenDate: moment.Moment;
  sparePart: string;
  maintenanceType: string;
  description: string;
  createdBy: string;
  createdDate: moment.Moment;
  item?: MaintenanceItem[];
  itemCount: number;
  vehicle?: VehicleListItem;
  meterHistory?: MeterHistoryDTO;
  attacheFile?: AttachmentFiles[];
  driver: DriverDTO;
  status: string;
  odometer: number;
  history?: MaintenanceHistory[];
}

export interface MaintenneceDetailDTO {
  id: string;
  vehiclePlate: string;
  vendorName: VendorDTO;
  totalCost: number;
  formDate: moment.Moment;
  toDate: moment.Moment;
  karas: number;
  brokenDate: moment.Moment;
  sparePart: string;
  maintenanceType: string;
  description: string;
  createdBy: string;
  createdDate: moment.Moment;
  item?: MaintenanceItem[];
  itemCount: number;
  vehicle?: VehicleListItem;
  meterHistory?: MeterHistoryDTO;
  attacheFile?: AttachmentFiles[];
  driver: DriverDTO;
  status: string;
  odometer: number;
  history?: MaintenanceHistory[];
  referentNumber: string?
}

export interface MaintenanceCreate {
  id?: string;
  vehicleId: string;
  quality: number;
  amount: number;
  odometer: number;
  totalCost: number;
  vendorName: number;
  paymentType: number;
  brokenDate: moment.Moment;
  sparePart: string;
  maintenanceType: string;
  description: string;
  item?: MaintenanceItemCreate[];
  attacheFile: string[];
  driverId: number;
  status?: string;
  referentNumber?: string;
  serviceReminder?: ServiceReminderDTO;
  duration?: moment.Moment[];
}

export interface MaintenanceItemCreate {

  quantity: number;
  cost: number;
  itemName: number;
  sparePart?: number;
  key: string;
  uom?: string;
  warranty?: string[] | any;
  totalCost: number;
  serviceId: number;
}
export interface MaintenanceItem {
  cost: number;
  itemName: ServiceTasks;
  quantity: number;
  id: string;
  sparePart: LookUpDataDTO;
  maintenanceType: LookUpDataDTO;
  key: string;
  uom?: string;
  warrantyStartDate?: string;
  warrantyEndDate?: string;
  totalCost: number;
  serviceId: ServiceTasks;
}

export interface MaintenanceStatus {
  id?: string;
  status: string;
  remark?: string;
  vehicleId?:string;
}

export interface MaintenaceAdvanceSearch {
  searchValue?: string;
  vehicleId?: string;
}

export interface MaintenanceSummary {
  plateNumber: string;
  vehicleYear: number;
  totalCost: number;
  make: string;
  weight: string;
  year: number;
}

// sumary and report

// service tasks
export interface ServiceTasks {
  id: number;
  name: string;
  description: string;
  status: string;
}

// ============== maintenance history ==============
export interface MaintenanceHistory {
  id: number;
  remark: string;
  createdBy: string;
  createdDate: moment.Moment;
  maintenanceId: string;
}
// ============== END ==============
