import { RequestActions, ServiceApiType, exec, singleRequest } from '@/services/apiGateway';
import { CustomerDto } from '../customer/data';
import { ItemsPricing } from '../pricing/data';
import { CustomerPricingCreate } from './data';

const CustomerPricingActions = {
  save: (data: CustomerPricingCreate): ServiceApiType<CustomerPricingCreate> => ({
    type: 'EXEC',
    endpoint: 'RETAILER',
    actionName: 'save-pricing-by-customer',
    payload: data,
  }),
  listCustomers: (
    searchValue?: string,
  ): //   params: any,
  ServiceApiType<{ searchValue?: string }> => ({
    type: 'LIST_QUERY',
    endpoint: 'RETAILER',
    actionName: 'list-customer-by-emp',
    payload: { searchValue: searchValue },
  }),
  listPricingByCustomer: (customerId: string): ServiceApiType<{ id: string }> => ({
    type: 'LIST_QUERY',
    endpoint: 'RETAILER',
    actionName: 'list-pricing-by-customer',
    payload: { id: customerId },
  }),
};

export const CustomerPricingServiceAPI = (requestActions: RequestActions) => {
  return {
    savePricing: (data: CustomerPricingCreate) =>
      exec<{ id: string; message: string }>(CustomerPricingActions.save(data))(requestActions),
    listCustomer: (searchValue?: string) =>
      singleRequest<CustomerDto[]>(CustomerPricingActions.listCustomers(searchValue))(
        requestActions,
      ) as Promise<CustomerDto[]>,
    listPricingByCustomer: (customerId: string) =>
      singleRequest<ItemsPricing[]>(CustomerPricingActions.listPricingByCustomer(customerId))(
        requestActions,
      ) as Promise<ItemsPricing[]>,
  };
};
