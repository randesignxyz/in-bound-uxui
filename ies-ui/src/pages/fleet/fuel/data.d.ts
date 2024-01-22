import { Driver } from '@/services/delivery/data';
import moment from 'moment';
import { TankDTO } from '../fuelStock/data';
import { LookUpDataDTO } from '../lookupData/data';
import { NormFuelConsumptionDTO } from '../specification/data.d';
import { Vehicle } from '../vehicle/data';

export interface FuelDTO {
  id: number;
  plateNumber: string;
  vehicleId: Vehicle;
  quantity: number;
  pumpBy: string;
  driverId: Driver;
  refilledDate: moment.Moment;
  kilometer: number;
  plateNumber?: string;
  driverName?: string;
  gasStation?: TankDTO;
  gasType?: LookUpDataDTO;
  createdBy?: string;
  lastModifiedBy?: string;
  createdDate?: moment.Moment;
  lastModifiedDate?: moment.Moment;
  receiptNumber: number;
  attacheFile: AttachmentFile[];
  status: string;
  location?: LookUpDataDTO;
  numberKilometer: number;
  previousRate: NormFuelConsumptionDTO;
}

export interface FuelCreate {
  id?: number;
  vehicleId: string;
  quantity: number;
  pumpAttendBy: string;
  driverName: string;
  dateRefilled: moment.Moment;
  odometer: number;
  placeRefilled?: string;
  receptNumber: number;
  fileId: string[];
  gasType?: number;
  status?: string;
  location?: number;
  numberKilometer: number;
  gasStation: number;
}

export interface TruckSummary {
  vehicle: string;
  quantity: number;
  year: Int;
  plateNumber?: string;
  make: string;
  weight: string;
  vehicleYear: Int;
  month: Int16Array;
}

export interface FuelAvanceSearchParam {
  searchValue?: string;
  status?: string;
  vehicleId?: string;
  driver?:number;
  fuelType?:numner;
}

export interface DieselMonthlyReportParams {
  vehicle?: string;
  driver?: string;
  fuelType?: number;
  tank?: number;
  date?: moment.Moment;
  dateRank?: moment.Moment;
  reportType: string;
}
