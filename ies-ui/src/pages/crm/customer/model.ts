import { CrmServiceAPI, InitCustomerParamsType, LocationType } from '@/services/crm/services';
import {
  AddresssView,
  BasicData,
  CustomerAdvanceSearchParams,
  PurchaseEstData,
  SaveCustomer,
  VisitPlanDataView,
} from '@/services/crm/data';
import { commmonActions, InitDateType } from '@/services/model';
import { SaleServiceAPI } from '@/services/sale/services';
import { uniq } from 'lodash';
import { useReducer } from 'react';
import { ModalName, reducer, State } from './reducer';
import { SortOrder } from 'antd/lib/table/interface';
import { Moment } from 'moment';

export const model = (id?: number) => {
  const initState: State = {
    id: id,
  };

  const [state, dispatch] = useReducer(reducer, initState);

  /***************Services************* */
  const actions = commmonActions(dispatch, state);
  const crmServices = CrmServiceAPI(actions.requestActions());
  const saleServices = SaleServiceAPI(actions.requestActions());

  /*******************Actions /Methods********************* */

  const showModal = async (modalName: ModalName) => {
    try {
      if (modalName == 'editBasicInfo') {
        const rs = await findRegionsAndSupplySource(
          uniq(state.data?.detail?.addressList.map((it) => it.province?.id || 0) || []),
        );
        rs && actions.showModalAction(modalName);
      } else {
        actions.showModalAction(modalName);
      }
    } catch (error) {}
  };

  const list = async (
    criteria?: { searchValue?: string },
    pagination?: {
      pageSize?: number;
      current?: number;
    },
    sort?: Record<string, SortOrder>,
  ) => {
    return await crmServices.findAllCustomer(
      { ...criteria, sort: sort },
      { page: (pagination?.current || 1) - 1, pageSize: pagination?.pageSize || 20 },
    );
  };

  const initData = async (type: InitDateType) => {
    try {
      const createParams: InitCustomerParamsType[] = [
        { actionName: 'outletTypeList', payload: {} },

        { actionName: 'sale', responseKey: 'seList', payload: {} },
        { actionName: 'locations', responseKey: 'provinceList', payload: { type: 'PROVINCE' } },
        { actionName: 'locations', responseKey: 'regionList', payload: { type: 'DIVISION' } },
        { actionName: 'product', responseKey: 'productList', payload: {} },
        { actionName: 'item', responseKey: 'itemList', payload: {} },
        // {
        //   actionName: 'get-current-salesperson',
        //   responseKey: 'currentSalesperson',
        //   type: 'Single',
        //   payload: {},
        // },
        {
          actionName: 'lookupDataList',
          payload: {
            list: [
              'CONTACT_TYPE',
              'ADDRESS_TYPE',
              'WEEK_OF_MONTH',
              'DAY_OF_WEEK',
              'CUSTOMER_TYPE',
              'CONTACT_CHANNEL_TYPE',
              'CUSTOMER_DIVISION'
            ],
          },
        },
      ];
      const detailParams: InitCustomerParamsType[] = [
        { actionName: 'locations', responseKey: 'provinceList', payload: { type: 'PROVINCE' } },
        { actionName: 'locations', responseKey: 'regionList', payload: { type: 'DIVISION' } },
        { actionName: 'outletTypeList', payload: {} },
        { actionName: 'sale', responseKey: 'seList', payload: {} },
        { actionName: 'item', responseKey: 'itemList', payload: {} },
        {
          actionName: 'lookupDataList',
          payload: {
            list: [
              'CONTACT_TYPE',
              'CUSTOMER_STATUS',
              'ADDRESS_TYPE',
              'CONTACT_CHANNEL_TYPE',
              'CUSTOMER_TYPE',
              'WEEK_OF_MONTH',
              'DAY_OF_WEEK',
              'CUSTOMER_DIVISION'
            ],
          },
        },
      ];

      const params: InitCustomerParamsType[] = type == 'Create' ? createParams : detailParams;
      const rs = await crmServices.initCustomerData(params);
      dispatch({ type: 'initialData', payload: rs });
      return rs;
    } catch (error) {
      return;
    }
  };

  const getSaleInfo = async (id: number, requiredDistributor?: boolean | undefined) => {
    try {
      const customerSaleInfo = await saleServices.findCustomerSaleInfoByCustomerId({
        id: id,
        requiredDistributor: false,
      });
      return customerSaleInfo
    } catch (error) {
      return undefined
    }
  }

  const detail = async (id?: number, notLoadSaleInfo?: boolean) => {
    let rs;
    try {
      if (!id) {
        return Promise.reject('No id found.');
      }
      rs = await crmServices.findDetailCustomer({ id: id });

      const customerSaleInfo = !notLoadSaleInfo? await getSaleInfo(id,false): undefined;

      dispatch({ type: 'setDetail', payload: { ...rs, saleInfo: customerSaleInfo } });
      return rs;
    } catch (error: any) {
      if (error.message && error.message.toLowerCase() == 'customer is not found.') {
        rs && dispatch({ type: 'setDetail', payload: { ...rs, saleInfo: undefined } });
        return ;
      }else {
        return ;
      }
    }
  };

  const gotoStep = (current: number) => {
    dispatch({ type: 'setCustomerStep', payload: current });
  };

  const saveBasicData = async (data: BasicData, submit?: true) => {
    if(!(state.id || data.id) ) {
      throw Error("Customer cannot be identified.")
    }
    const rs = await crmServices.saveCustomerBasic({
      id: state.id || data.id || 0,
      basicInfo: data,
    });
    rs && dispatch({ type: 'saveBasicData', payload: data, submit: true });
  };

  const saveAddressList = (data: AddresssView[]) => {
    dispatch({ type: 'saveAddressList', payload: data });
  };

  const saveAddressData = async (data: AddresssView) => {
    const rs = await crmServices.saveAddress({
      customerId: state.data?.detail?.id,
      address: {
        id: data.id,
        address: data.address,
        typeId: data.type?.id,
        houseNo: data.houseNo,
        houseNoKh: data.houseNoKh,
        streetNo: data.streetNo,
        streetNoKh: data.streetNoKh,
        streetName: data.streetName,
        streetNameKh: data.streetNameKh,
        latitude: data.latitude,
        longitude: data.longitude,
        provinceId: data.province?.id || 0,
        districtId: data.district?.id || 0,
        communeId: data.commune?.id || 0,
        villageId: data.village?.id,
        hotspot: data.hotspot,
        direction: data.direction,
        visitPlanOptionIds: data.visitPlanOptionList,
      },
    });

    dispatch({
      type: 'saveAddressData',
      payload: { ...data, id: rs.id },
      isNew: (data.id || 0) == 0,
    });
  };

  const saveForcasting = async (items?: PurchaseEstData[], submit?: true) => {
    if (submit && items) {
      await crmServices.savePurchaseEst({
        id: state.data?.detail?.id,
        items: items,
      });
      dispatch({ type: 'saveForcasting', payload: items, submit });
    }

    dispatch({ type: 'saveForcasting', payload: items });
  };

  const loadLocations = async (type: LocationType, parentId?: number, loadOnly?: true) => {
    if (type == 'DISTRICT') {
      const rs = await crmServices.findAllLocations({ type: type, parentId: parentId });
      !loadOnly && dispatch({ type: 'setDistrict', payload: rs });
      !loadOnly && dispatch({ type: 'setCommune', payload: undefined });
    } else if (type == 'COMMUNE') {
      const rs = await crmServices.findAllLocations({ type: type, parentId: parentId });
      !loadOnly && dispatch({ type: 'setCommune', payload: rs });
      !loadOnly && dispatch({ type: 'setVillage', payload: undefined });
    } else if (type == 'VILLAGE') {
      const rs = await crmServices.findAllLocations({ type: type, parentId: parentId });
      !loadOnly && dispatch({ type: 'setVillage', payload: rs });
    }
  };

  const clearLocations = (locations: LocationType[]) => {
    locations.forEach((item) => {
      if (item == 'COMMUNE') dispatch({ type: 'setCommune', payload: undefined });
      if (item == 'DISTRICT') dispatch({ type: 'setDistrict', payload: undefined });
      if (item == 'VILLAGE') dispatch({ type: 'setVillage', payload: undefined });
    });
  };

  const create = async (data: SaveCustomer) => {
    try {
      const res = await crmServices.saveCustomer(data);
      return res;
    } catch (error) {
      throw error;
    }
  };

  const doAttachFiles = async (fileIdList: string[], toId: number) => {
    await crmServices.attachFiles({
      fileIdList: fileIdList,
      attachToId: toId,
      attachTo: 'CUSTOMER',
    });
    dispatch({
      type: 'addFiles',
      payload: [...(state.data?.detail?.attachmentFileIds || []), ...fileIdList],
    });
  };

  const listVisitScheduleByCustomer = async (customerId: number, status: string) => {
    const rs = await crmServices.listVisitScheduleByCustomer({ id: customerId, status: status });
    dispatch({ type: 'setVisitSchedule', payload: rs });
  };

  const loadMultiLocations = async (ids: number[]) => {
    const rs = await crmServices.findLocationByParents({ ids: ids });
    dispatch({ type: 'setDistrict', payload: rs.filter((it) => it.type == 'DISTRICT') });
    dispatch({ type: 'setCommune', payload: rs.filter((it) => it.type == 'COMMUNE') });
    dispatch({ type: 'setVillage', payload: rs.filter((it) => it.type == 'VILLAGE') });
  };

  const genVisitSchedule = async (
    month: moment.Moment,
    customerId: number,
    effectiveDate?: moment.Moment,
    overwritePending?: boolean,
    description?: string,
  ) => {
    return await crmServices.createVisitSchedule({
      monthCreated: month,
      description: description,
      customerIdList: [customerId],
      effectiveDate: effectiveDate,
      overwritePending: overwritePending,
    });
  };

  const cancelVisitSchedule = async (scheduleId: number, remarks: string) => {
    await crmServices.cancelVisitSchedule({ id: scheduleId, remarks: remarks });
  };

  const saveSingleVisitPlan = async (data: VisitPlanDataView) => {
    const rs = await crmServices.saveFullVisitPlan({
      id: data.id,
      addressId: data.address.id,
      visitPlan: data.items.map((it) => it.id),
    });
    dispatch({
      type: 'savePlanData',
      payload: { ...data, id: rs.id || data.id },
      addNew: (data.id || 0) == 0,
    });
  };

  // const deleteVisitPlan = async (data: VisitPlanDataView) => {

  //     await removeVisitPlanSrv({ id: data.id })
  //     dispatch({ type: 'removeVisitPlan', payload: data.id })
  // }

  const removeAddress = async (data: AddresssView) => {
    await crmServices.removeAddress({ id: data.id });
    dispatch({ type: 'removeAddress', payload: data });
  };

  const setAdvanceSearchParams = (params: CustomerAdvanceSearchParams) => {
    dispatch({ type: 'setAdvanceSearchParams', payload: params });
  };

  const promoteCustomer = async (customerId: number, newCode: string, remarks: string ) => {

    await crmServices.promoteCustomer({customerId, newCode, remarks})
  }

  const findRegionsAndSupplySource = async (provinceIds: number[]): Promise<{} | undefined> => {
    try {
      const rs = await crmServices.initCustomerData([
        {
          actionName: 'list-region-by-provinces',
          responseKey: 'regionList',
          payload: { ids: provinceIds },
        },
        {
          actionName: 'list-supply-source-by-provinces',
          responseKey: 'supplySources',
          payload: { ids: provinceIds },
        },
      ]);

      dispatch({ type: 'initialData', payload: rs });
      return rs;
    } catch (error) {
      return undefined;
    }
  };

  const exportCustomer = async (
    regionId?: number[],
    provinceId?: number[],
    salespersonId?: number[],
    customerTypeId?: number[],
    outletTypeId?: number[],
    source?: string[],
    status?: string[],
    neverVisit?: boolean,
    neverVisitDate?: Moment,
    hasNoPlan?: boolean,
  ) => {
    await crmServices.exportCustomer({
      fileName: 'export_customer',
      reportName: 'export_customer',
      type: 'EXCEL',
      data: {
        regionId,
        provinceId,
        salespersonId,
        customerTypeId,
        outletTypeId,
        source,
        status,
        neverVisit,
        neverVisitDate,
        hasNoPlan,
      },
    });
  };

  const disableCustomer = async (customerId: number, remarks: string) => {
    await crmServices.inactiveCustomer(customerId, remarks);
  };

  
  const activateCustomer = async (customerId: number, remarks: string) => {
    await crmServices.activateCustomer(customerId, remarks);
  };

  const transfer = async (customerId: number, salespersonId: number, remarks?: string) => {
    await crmServices.transferCustomer(customerId, salespersonId, remarks);
  };

  const listVisitPlanByCustomerId = (param: {id: number}) => crmServices.listVisitPlanByCustomerId(param)

  const listAddresssByCustomerId = (param: {id: number}) => crmServices.listAddressByCustomerId(param)

  const listAddressDetailByCustomerId =  (param: {id: number}) => crmServices.listAddressDetailByCustomerId(param)

  return {
    state: state,
    ops: {
      initData: initData,
      detail: detail,
      list: list,
      add: 'doAddSettlement',
      loadLocations: loadLocations,
      loadMultiLocations: loadMultiLocations,
      create: create,
      genVisitSchedule: genVisitSchedule,
      cancelVisitSchedule: cancelVisitSchedule,
      saveSingleVisitPlan: saveSingleVisitPlan,
      // deleteVisitPlan: deleteVisitPlan,
      promoteCustomer: promoteCustomer,
      saveAddressData: saveAddressData,
      removeAddress: removeAddress,
      exportCustomer,
      disableCustomer,
      activateCustomer,
      transfer,
      listVisitPlanByCustomerId,
      listAddresssByCustomerId,
      listAddressDetailByCustomerId
    },
    actions: {
      gotoStep: gotoStep,
      saveData: saveBasicData,
      saveAddressList: saveAddressList,
      saveForcasting: saveForcasting,
      clearLocations: clearLocations,
      attachFiles: doAttachFiles,
      listVisitScheduleByCustomer: listVisitScheduleByCustomer,
      setAdvanceSearchParams: setAdvanceSearchParams,
      findRegionsAndSupplySource: findRegionsAndSupplySource,
    },

    modals: {
      isVisible: actions.isVisible,
      showModal: showModal,
      hideModal: actions.hideModalAction,
    },
  };
};
