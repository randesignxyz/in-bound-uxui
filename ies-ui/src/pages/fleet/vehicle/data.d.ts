import moment from 'moment';
import { DriverDTO, VehicleDriverDTO } from '../driver/data';
import { AttachmentFilesDTO } from '../lookupData/data';
import { NormFuelConsumptionDTO } from '../specification/data.d';
import { LookUpDataDTO } from './lookupData/data';
import { BusnessUnit } from '../data';

export interface VehicleListItem {
  id: string;
  make: LookUpDataDTO;
  model?: string;
  color: LookUpDataDTO;
  vin?: string;
  engine?: string;
  vehicleType: LookUpDataDTO;
  fuelType: LookUpDataDTO;
  status: string;
  plateNumber: string;
  vehicleNote?: string;
  weight: LookUpDataDTO;
  year: string;
  createdBy?: string;
  brandingType?: LookUpDataDTO;
  createdDate?: moment.Moment;
  vehicleCapacity?: VehicleCapacity;
  currentMeter?: MeterHistoryDTO;
  driver?: DriverDTO;
  profilePicture?: AttachmentFilesDTO;
  normFuelConsumption?: NormFuelConsumptionDTO;
  ownership?: LookUpDataDTO;
  vehicleDriver?: VehicleDriverDTO;
  businessUnit?:BusnessUnit;
}

export interface SaveVehicle {
  id?: string;
  vehicleCapacityId?: number;
  makeId: number;
  model?: string;
  colorId: number;
  vin?: string;
  engine?: string;
  vehicleTypeId: number;
  fuelTypeId: number;
  status: string;
  plateNumber: string;
  vehicleNote?: string;
  weightId?: number;
  brandingType?: number;
  year: string;
  truckHead: number;
  boxLength: number;
  boxHigh: number;
  boxWidth: number;
  boxCBM: number;
  totalLength: number;
}

export interface Vehicle {
  id: string;
  make: LookUpDataDTO;
  model?: string;
  color: LookUpDataDTO;
  vin?: string;
  engine?: string;
  vehicleType: LookUpDataDTO;
  weight: LookUpDataDTO;
  fuelType: LookUpDataDTO;
  status: string;
  brandingType: LookUpDataDTO;
  plateNumber: string;
  vehicleNote?: string;
  year: number;
  createdBy?: String;
}

export interface VehicleCapacity {
  id: Int;
  truckHead: number;
  boxLength: number;
  boxHigh: number;
  boxWidth: number;
  boxCBM: number;
  totalLength: number;
}

export interface DriverParam {
  id?: int;
  phone?: string;
}

export interface VehicleAdvanSearch {
  status: 'ALL' | 'active' | 'Inactive' | 'Out Of Service';
  vehicleType?: number;
  brandingType?: number;
  searchValue?: string;
  vehicleId?: string;
}

export interface VehicleSearchParam {
  searchValue?: string;
  advanceSearch?: VehicleAdvanSearch;
}

export interface MeterHistoryDTO {
  id: Int = 0;

  meterValue: Double;
  meterType?: String;

  void?: Boolean;
  source: String;

  vehicleId: String;
  type?:string;
  createdDate: moment.Moment;
  createdBy?: String;
  
  updatedDate: moment.Moment;
  updatedBy?: String;
}

export interface MeterSearchParam {
  searchValue?: string;
  status?:string;
}


interface MeterFetchParam {
  vehicleId: string,
  date?: moment.Moment,
}

interface MeterTypeParam {
  vehicleId: string,
  meterType:string
}