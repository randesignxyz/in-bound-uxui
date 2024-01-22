import { IncentiveSettlement } from '@/pages/crm/gratis/types';
import { AccessoriesDTO } from '@/pages/fleet/accessory/data';
import { AccidentDTO } from '@/pages/fleet/accident/data';
import { DriverDTO } from '@/pages/fleet/driver/data';
import { FuelDTO } from '@/pages/fleet/fuel/data';
import { InspectionDTO } from '@/pages/fleet/inspection/data';
import { MaintenneceDTO } from '@/pages/fleet/maintenance/data';
import { ServiceReminderDTO } from '@/pages/fleet/servicereminder/data';
import { ServiceTasksDTO } from '@/pages/fleet/serviceTask/data';
import { MeterHistoryDTO, VehicleListItem } from '@/pages/fleet/vehicle/data';
import { StaffRequisitionRequest } from '@/pages/hrm/data';
import type { CategoryDto } from '@/pages/sale/retailer/category/data';
import { CustomerDto } from '@/pages/sale/retailer/customer/data';
import { GroupCustomer } from '@/pages/sale/retailer/groupCustomer/data';
import type { IngredientDto } from '@/pages/sale/retailer/ingredient/data';
import { PurchaseOrderDto } from '@/pages/sale/retailer/orders/data';
import { ItemsPricing } from '@/pages/sale/retailer/pricing/data';
import type { ProductDto } from '@/pages/sale/retailer/product/data';
import { RegistrationForm } from '@/pages/sale/retailer/registration/data';
import type { ContractLess } from '@/services/crm/contract';
import type {
  CustomerItemLess,
  NotificationLess,
  VisitPlanListItem,
  VisitScheduleItem,
} from '@/services/crm/data';
import { IncidentLess } from '@/services/ict/data';
import { RequisitionLess } from '@/services/pro/data';
import {
  LeadDetail,
  PackagesLess,
  ProductItem,
  SaleInvoiceLess,
  SettlementLess,
  SoDeliveryDetail,
  SoItemLess,
  StockControlLess,
  StockStoreLess,
  TeamWorkLess,
} from '@/services/sale/data';
import { useState } from 'react';
import { Paging } from '../services/API';

import { TankTransactionDTO } from '@/pages/fleet/fuelStock/data';
import { AppraisalEmp } from '@/pages/hrm/appraisal-submit/data.types';
import { CategoryDTO } from '@/pages/dms/setting/components/category/data';
import { DocumentationDTO } from '@/pages/dms/documentation/data';

type DataList =
  | {
    type: 'sales-product-item';
    criteria?: any;
    data: Paging<ProductItem>;
  }
  | {
    type: 'list-notification';
    criteria?: any;
    data: Paging<NotificationLess>;
  }
  | {
    type: 'visit-schedule';
    criteria?: any;
    data: Paging<VisitScheduleItem>;
  }
  | {
    type: 'visit-plan';
    criteria?: any;
    data: Paging<VisitPlanListItem>;
  }
  | {
    type: 'customer';
    criteria?: any;
    data: Paging<CustomerItemLess>;
  }
  | {
    type: 'contract';
    criteria?: any;
    data: Paging<ContractLess>;
  }
  | {
    type: 'sale-order';
    criteria?: any;
    data: Paging<SoItemLess>;
  }
  | {
    type: 'sale-order-delivery';
    criteria?: any;
    data: Paging<SoDeliveryDetail>;
  }
  | {
    type: 'registration-form';
    criteria?: any;
    data: Paging<RegistrationForm>;
  }
  | {
    type: 'trade-offer';
    criteria?: any;
    data: Paging<PackagesLess>;
  }
  | {
    type: 'stock';
    criteria?: any;
    data: Paging<StockControlLess>;
  }
  | {
    type: 'sale-invoice';
    criteria?: any;
    data: Paging<SaleInvoiceLess>;
  }
  | {
    type: 'team-work';
    criteria?: any;
    data?: Paging<TeamWorkLess>;
  }
  | {
    type: 'stockStore';
    criteria?: any;
    data?: Paging<StockStoreLess>;
  }
  | {
    type: 'settlement';
    criteria?: any;
    data?: Paging<SettlementLess>;
  }
  | {
    type: 'ticket-incident';
    criteria?: any;
    data?: Paging<IncidentLess>;
  }
  | {
    type: 'pro-pr';
    criteria?: any;
    data?: Paging<RequisitionLess>;
  }
  | {
    type: 'lead-ld';
    criteria?: any;
    data?: Paging<LeadDetail>;
  }
  | {
    type: 'retailer-product';
    criteria?: any;
    data?: Paging<ProductDto>;
  }
  | {
    type: 'retailer-category';
    criteria?: any;
    data?: Paging<CategoryDto>;
  }
  | {
    type: 'retailer-ingredient';
    criteria?: any;
    data?: Paging<IngredientDto>;
  }
  | {
    type: 'retailer-pricing';
    criteria?: any;
    data?: Paging<ItemsPricing>;
  }
  | {
    type: 'retailer-group-customer';
    criteria?: any;
    data?: Paging<GroupCustomer>;
  }
  | {
    type: 'retailer-customer';
    criteria?: any;
    data?: Paging<CustomerDto>;
  }
  | {
    type: 'retailer-order';
    criteria?: any;
    data?: Paging<PurchaseOrderDto>;
  }
  | {
    type: 'fleet-vehicle';
    criteria?: any;
    data?: Paging<VehicleListItem>;
  }
  | {
    type: 'staff-requisition';
    criteria?: any;
    data?: Paging<StaffRequisitionRequest>;
  }
  | {
    type: 'fleet-vehicle';
    criteria?: any;
    data?: Paging<VehicleListItem>;
  }
  | {
    type: 'fleet-inspection';
    criteria?: any;
    data?: Paging<InspectionDTO>;
  }
  | {
    type: 'fleet-maintenance';
    criteria?: any;
    data?: Paging<MaintenneceDTO>;
  }
  | {
    type: 'fleet-fuel';
    criteria?: any;
    data?: Paging<FuelDTO>;
  }
  | {
    type: 'fleet-driver';
    criteria?: any;
    data?: Paging<DriverDTO>;
  }
  | {
    type: 'fleet-accident';
    criteria?: any;
    data?: Paging<AccidentDTO>;
  }
  | {
    type: 'fleet-accessories';
    criteria?: any;
    data?: Paging<AccessoriesDTO>;
  }
  | {
    type: 'fleet-service-task';
    criteria?: any;
    data?: Paging<ServiceTasksDTO>;
  }
  | {
    type: 'fleet-meter-history';
    criteria?: any;
    data?: Paging<MeterHistoryDTO>;
  }
  | {
    type: 'fleet-service-task';
    criteria?: any;
    data?: Paging<ServiceTasksDTO>;
  }
  | {
    type: 'fleet-fuel-transaction';
    criteria?: any;
    data?: Paging<TankTransactionDTO>;
  }
  | {
    type: 'fleet-vendor';
    criteria?: any;
    data?: Paging<VendorDTO>;
  }
  | {
    type: 'fleet-maintenance-plan';
    criteria?: any;
    data?: Paging<ServiceReminderDTO>;
  }
  | {
    type: 'dms-category';
    criteria?: any;
    data?: Paging<CategoryDTO>;
  }
  | {
    type: 'dms-document';
    criteria?: any;
    data?: Paging<DocumentationDTO>;
  }
  | {
    type: 'dms-department';
    criteria?: any;
    data?: Paging<DepartmentDTO>;
  }
  | {
    type: 'incentive-settlement';
    criteria?: any;
    data: Paging<IncentiveSettlement>;
  }
  | {
    type: 'appraisal-submit';
    criteria?: any;
    data: Paging<AppraisalEmp>;
  };

type MomainType =
  | 'sales-product-item'
  | 'visit-schedule'
  | 'visit-plan'
  | 'customer'
  | 'contract'
  | 'sale-order'
  | 'sale-order-delivery'
  | 'trade-offer'
  | 'list-notification'
  | 'stock'
  | 'sale-invoice'
  | 'team-work'
  | 'stockStore'
  | 'ticket-incident'
  | 'pro-pr'
  | 'lead-ld'
  | 'retailer-product'
  | 'retailer-category'
  | 'retailer-pricing'
  | 'retailer-ingredient'
  | 'retailer-pricing'
  | 'retailer-order'
  | 'retailer-customer'
  | 'fleet-vehicle'
  | 'registration-form'
  | 'staff-requisition'
  | 'fleet-vehicle'
  | 'fleet-inspection'
  | 'fleet-maintenance'
  | 'fleet-accident'
  | 'fleet-accessories'
  | 'fleet-driver'
  | 'fleet-fuel'
  | 'fleet-meter-history'
  | 'fleet-service-task'
  | 'fleet-maintenance-plan'
  | 'incentive-settlement'
  | 'fleet-vendor'
  | 'fleet-fuel-transaction'
  | 'appraisal-submit'
  | 'dms-category'
  | 'dms-department'
  | 'dms-document';

export default () => {
  const [cacheData, seCacheData] = useState<DataList>();

  const cacheDataList = (data: DataList) => {
    seCacheData(data);
    return data.data;
  };

  const fetchDataList = (type: MomainType) => {
    if (type !== cacheData?.type) {
      seCacheData(undefined);
      return Promise.resolve(undefined);
    }
    return Promise.resolve({ dataList: cacheData?.data, creteria: cacheData.criteria });
  };

  return {
    cacheDataList: cacheDataList,
    fetchDataList: fetchDataList,
  };
};
