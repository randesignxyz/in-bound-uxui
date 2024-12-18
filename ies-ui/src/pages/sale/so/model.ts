import { CrmServiceAPI, InitVisitScheduleParamsType } from '@/services/crm/services';
import { commmonActions } from '@/services/model';
import {
  CloseIndirectSoParams,
  CustomerSaleInfo,
  InitSoParamsType,
  OfferParams,
  PackageOffer,
  So,
  SoDeliveryMethod,
} from '@/services/sale/data';
import { SaleServiceAPI } from '@/services/sale/services';
import { message } from 'antd';
import { SortOrder } from 'antd/lib/table/interface';
import { groupBy, map, sortBy, sumBy, uniqueId } from 'lodash';
import { useReducer } from 'react';
import { DeliveryEntry, DeliveryItemEntry, SoItemEntry, State, reducer } from './reducer';

export const Model = () => {
  const initState: State = {
    loading: false,
  };

  const [state, dispatch] = useReducer(reducer, initState);

  /***************Services************* */
  const actions = commmonActions(dispatch, state);
  const requestActions = actions.requestActions();
  const saleServices = SaleServiceAPI(requestActions);
  const crmServices = CrmServiceAPI(requestActions);

  const initilizeData = async () => {
    const initParams: InitSoParamsType[] = [
      {
        actionName: 'look-up-data',
        responseKey: 'lookDataList',
        payload: {
          list: ['SALE_ORDER_STATUS', 'SALE_RECORD_SOURCE'],
        },
      },
    ];

    try {
      const params: InitVisitScheduleParamsType[] = [
        { actionName: 'listCustomer', responseKey: 'customers', payload: {} },
        { actionName: 'sale', responseKey: 'salespersons', payload: {} },
      ];

      loadSoSummary();

      const rs = await crmServices.initVisitScheduleData(params);
      const result = await saleServices.initSoData(initParams);

      dispatch({ type: 'initialData', payload: { ...rs, ...result } });
    } catch (error) {
      return;
    }
  };

  /*******************Actions /Methods********************* */

  const initData = async (id?: number) => {
    // let custId = 0

    if (id) {
      const order = await saleServices.findSo({ id: id });
      dispatch({ type: 'setSoDetail', payload: order });
      dispatch({ type: 'resetSoItem' });
      // custId = order.associatedTo.customer.id
    }

    const salePersonRs = await crmServices.initCustomerData([
      {
        actionName: 'sale',
        responseKey: 'salePersonList',
        payload: {},
      },
    ]);

    const initParams: InitSoParamsType[] = [
      // {
      //     actionName: 'list-payment-term',
      //     responseKey: 'paymentTermList',
      //     payload: {}
      // },
      {
        actionName: 'list-shipping-method',
        responseKey: 'deliveryMethodList',
        payload: {},
      },
      {
        actionName: 'look-up-data',
        responseKey: 'lookDataList',
        payload: {
          list: ['SALE_ORDER_STATUS', 'SALE_TYPE'],
        },
      },
      {
        actionName: 'list-product-item-by-type',
        responseKey: 'itemList',
        payload: {
          id: 1,
        },
      },

      {
        actionName: 'list-budget',
        responseKey: 'listBudget',
        payload: {},
      },
    ];

    try {
      const rs = await saleServices.initSoData({
        ...initParams,
      });

      dispatch({
        type: 'initialData',
        payload: { ...rs, ...salePersonRs },
      });
    } catch (error) {
      message.error('Failed to load data.');
    }
  };

  const loadListItem = async (
    criteria?: { advanceSearch?: any; searchValue?: string },
    pagination?: {
      pageSize?: number;
      current?: number;
    },
    sort?: Record<string, SortOrder>,
  ) => {
    loadSoSummary();
    return await saleServices.listSo(
      { ...criteria, sort: sort },
      { pageSize: pagination?.pageSize || 20, page: (pagination?.current || 1) - 1 },
    );
  };

  const loadSoSummary = () => {
    saleServices.fetchSoSummary().then((data) => {
      dispatch({ type: 'setSoSummary', payload: data });
    });
  };

  const doClearSoItem = () => {
    // if (state.data?.so?.items) {
    // }
    dispatch({ type: 'clearSoItem' });
  };

  const doSaveSo = async (data: So) => {
    return await saleServices.saveSodata(data);
  };

  const doFetchSo = async (id: number) => {
    const rs = await saleServices.findSo({ id: id });
    const itemList =
      rs.items?.map((it, index) => ({
        ...it,
        seq: index * 1000,
        key: uniqueId('so-item'),
      })) || [];

    const itemList1 = itemList.map((it, index) => {
      const parent = itemList.find((p) => p.id === it.parentId);
      return {
        ...it,
        parentKey: parent?.key,
        seq: (parent?.id || it.seq) + index,
      };
    });

    const payload = {
      ...rs,
      items: sortBy(itemList1, (it) => it.seq),
    };

    dispatch({ type: 'setSoDetail', payload: payload });
  };

  const doResetSoItem = () => {
    dispatch({ type: 'resetSoItem' });
  };

  const doLoadingDependencyByCustomer = async (id: number) => {
    const listAddress = await crmServices.listAddressByCustomer({ id: id });
    const salesperson = await fetchSalePersonByCustomer(id);

    dispatch({
      type: 'initialData',
      payload: {
        addressList: listAddress,
      },
    });

    const customerSaleInfo = await fetchCustomerSaleInfo(id);
    dispatch({
      type: 'setCustomerSaleInfo',
      payload: { ...customerSaleInfo, salesperson: salesperson } as CustomerSaleInfo,
    });
  };

  const fetchCustomerSaleInfo = async (customerId: number) => {
    try {
      return await saleServices.findCustomerSaleInfoByCustomerId({ id: customerId });
    } catch (error) {
      return undefined;
    }
  };

  const fetchSalePersonByCustomer = async (customerId: number) => {
    try {
      return await crmServices.salespersonByCustomer({ id: customerId });
      //saleServices.findCustomerSaleInfoByCustomerId({ id: customerId })
    } catch (error) {
      return undefined;
    }
  };

  const findProductItem = async (id: number, customerId: number, auto?: boolean) => {
    try {
      const rs = await saleServices.findProductItem({ id: id, customerId: customerId, auto: auto });
      dispatch({ type: 'setProductItem', payload: rs });
      actions.showModalAction('item-entry');
    } catch (error) {
      message.error('Failed to fetch data.');
    }
  };

  const fetchOfferCodes = async (id: number) => {
    const offerCodes = await saleServices.listOfferCodes({ id: id });
    dispatch({ type: 'fetchOfferCodes', payload: offerCodes });
  };

  const getOffer = async (data: OfferParams) => {
    try {
      const rs = await saleServices.getPackageOffer(data);
      dispatch({ type: 'setPackageOffer', payload: rs });
    } catch (error) {
      message.error('Failed to load offer.');
    }
  };

  const saveSoItems = (data: SoItemEntry[]) => {
    if (data.length > 0) {
      const main = data.find((it) => !it.parentKey);
      const soItems = (
        state.data?.soItems?.filter(
          (it) => !(it.key === main?.key || it.parentKey === main?.key),
        ) || []
      )
        .concat(data)
        .sort((a, b) => (a.seq || 0) - (b.seq || 0));

      const list = applySeq(soItems).sort((a, b) => (a.seq || 0) - (b.seq || 0));
      dispatch({ type: 'saveAllSoItem', payload: list });
      // dispatch({ type: 'setDeliveryList', payload: calculateDeliverySoItem(list) })
    }
  };

  const saveSoItem = (data: SoItemEntry) => {
    const soItems = (state.data?.soItems?.filter((it) => it.key !== data.key) || [])
      .concat(data)
      .sort((a, b) => (a.seq || 0) - (b.seq || 0));

    const list = applySeq(soItems).sort((a, b) => (a.seq || 0) - (b.seq || 0));
    dispatch({ type: 'saveAllSoItem', payload: list });
    // dispatch({ type: 'setDeliveryList', payload: calculateDeliverySoItem(list) })
  };

  const removeSoItem = (data: SoItemEntry) => {
    const soItems =
      state.data?.soItems?.filter((it) => it.key !== data?.key && it.parentKey !== data.key) || [];
    const list = applySeq(soItems).sort((a, b) => (a.seq || 0) - (b.seq || 0));
    dispatch({ type: 'saveAllSoItem', payload: list });
    // dispatch({ type: 'setDeliveryList', payload: calculateDeliverySoItem(list) })
  };

  const applySeq = (soItems: SoItemEntry[]) => {
    const indexed = soItems
      .filter((it) => !it.parentKey)
      .map((it, index) => ({ key: it.key, seq: (index + 1) * 1000 }));
    return soItems.map((it, index) => {
      const seqItem = indexed.find((it1) => it1.key === it.key || it1.key === it.parentKey);
      return {
        ...it,
        seq: !it.parentKey ? seqItem?.seq : (seqItem?.seq || 0) + index,
      };
    });
  };

  const calculateDeliverySoItem = (
    soItems: SoItemEntry[],
    deliveryList?: DeliveryEntry[],
    actionType?: string | undefined,
  ) => {
    if (soItems.length === 0) {
      dispatch({ type: 'setDeliveryList', payload: [] });
      return [];
    }

    //Sum Qty based on so items
    const sumBySoItems = map(
      groupBy(
        soItems.map((it) => toDeliveryItemEntry(it)),
        (it) => `${it.itemId}-${it.type}`,
      ),
      (value, key) => ({ key: key, item: value.reduce((p, c) => ({ ...p, qty: p.qty + c.qty })) }),
    );

    const newdeliveryList = deliveryList || state.data?.deliveryList;
    const deliveryItemList = newdeliveryList
      ?.filter((it) => !it.default)
      .flatMap((it) => it.itemList);
    const sumBySDeliveryItems = map(
      groupBy(deliveryItemList, (it) => `${it.itemId}-${it.type}`),
      (value, key) => ({ key: key, item: value.reduce((p, c) => ({ ...p, qty: p.qty + c.qty })) }),
    );

    const unAssignedItems = map(
      groupBy(
        sumBySoItems.concat(
          sumBySDeliveryItems.map((it) => ({
            ...it,
            item: { ...it.item, key: uniqueId('delete-devlivery'), qty: it.item.qty * -1 },
          })),
        ),
        (it) => it.key,
      ),
      (value) =>
        value.reduce((p, c) => ({ ...p, item: { ...p.item, qty: p.item.qty + c.item.qty } })),
    )
      .sort((a, b) => b.item.qty - a.item.qty)
      .map((it) => it.item);

    const defaultItem = {
      ...newdeliveryList?.find((it) => it.default),
      default: true,
      itemList: unAssignedItems,
    } as DeliveryEntry;

    const list = (sumBy(defaultItem.itemList, (it) => it.qty) !== 0 ? [defaultItem] : []).concat(
      newdeliveryList?.filter((it) => !it.default) || [],
    );

    return list;
  };

  const toDeliveryItemEntry = (it: SoItemEntry): DeliveryItemEntry => ({
    itemId: it.itemId,
    itemCode: it.itemCode,
    key: it.key,
    itemDesc: it.description,
    uomId: it.uomId,
    uomName: it.uom,
    type: it.type || 'STD',
    qty: it.qty,
  });

  //   const setAttachments = (data: { id: number; imageId: string }[]) => {
  //     const array = data.map((it) => ({ ...it, status: 'sync' }));
  //     dispatch({ type: 'setAttachments', payload: array });
  //   };

  const loadAttachments = async (id: number) => {
    const attachments = await saleServices.listAttachments({ id: id });
    dispatch({
      type: 'setAttachments',
      payload: attachments.map((it) => ({ ...it, status: 'sync' })),
    });
  };

  const saveAttachment = (data: { id: number; imageId: string; status: string }) => {
    const array = state.data?.attachments || [];
    array?.push(data);
    dispatch({ type: 'setAttachments', payload: array });
  };

  const deleteAttachment = (imageId: string) => {
    const array = state.data?.attachments?.map((it) => {
      if (it.imageId === imageId) {
        it.status = 'deleted';
      }
      return it;
    });
    dispatch({ type: 'setAttachments', payload: array || [] });
  };

  const saveShipping = (data: DeliveryEntry, delivery: SoDeliveryMethod | undefined) => {
    const list = data.key
      ? state.data?.deliveryList?.map((it) => (it.key === data.key ? data : it))
      : state.data?.deliveryList?.concat({
          ...data,
          key: uniqueId('delivery'),
          itemList: data.itemList.map((it) => ({ ...it, key: uniqueId('delivery') })),
        });
    const soItems = getSoItems(state.data?.transportation || [], delivery);
    dispatch({
      type: 'setDeliveryList',
      payload: calculateDeliverySoItem(
        soItems || [],
        sortBy(list, (it) => it.deliveryDate),
      ),
    });
  };

  const deleteShipping = (key: string, delivery: SoDeliveryMethod | undefined) => {
    const list = state.data?.deliveryList?.filter((it) => it.key !== key);
    const soItems = getSoItems(state.data?.transportation || [], delivery);
    dispatch({
      type: 'setDeliveryList',
      payload: calculateDeliverySoItem(soItems, list, 'delete'),
    });
  };

  const loadSoItems = () => {
    const items: SoItemEntry[] =
      state.data?.soDetail?.items?.map((it) => {
        return { ...it, key: uniqueId('so-item') };
      }) || [];

    const itemList = applySeq(
      items.map((it) => ({
        ...it,
        parentKey: items.find((parent) => parent.id === it.parentId)?.key,
      })),
    );
    dispatch({ type: 'saveAllSoItem', payload: itemList });

    const shippingList: DeliveryEntry[] =
      state.data?.soDetail?.deliveries?.map((it) => ({
        ...it,
        key: uniqueId('delivery'),
        shippingAddressCode: state.data?.initData?.addressList?.find(
          (i) => i.id === it.shippingAddressId,
        )?.address,
        itemList: it.itemList.map((i) => ({ ...i, uomName: i.associatedTo?.uom.name })),
      })) || [];

    const deliveryList = calculateDeliverySoItem(
      itemList.map((it) => ({
        ...it,
        deliveryDate: state.data?.soDetail?.deliveryDate,
        deliveryMethodId: state.data?.soDetail?.associatedTo.deliveryMethod.id,
        shippingAddressId: state.data?.soDetail?.associatedTo.shippingAddress.id,
      })),
      shippingList,
    );

    dispatch({ type: 'setDeliveryList', payload: deliveryList });
  };

  const postSo = async (
    soId: number,
    offerCodes?: { soItemId: number; offerCode?: string }[],
    remarks?: string,
  ) => {
    return await saleServices.postSoToSAP({ soId: soId, remarks: remarks, offerCodes: offerCodes });
  };

  const cancelSo = async (soId: number, remarks: string) => {
    return await saleServices.cancelSo({ soId, remarks });
  };

  const closeSo = async (soId: number, data: CloseIndirectSoParams) => {
    await saleServices.closeSo(soId, data);
  };

  const listTransportationOffer = async (delivery: SoDeliveryMethod | undefined) => {
    try {
      const rs = await saleServices.listTransportationOffer({
        customerId: state.data?.customerSaleInfo?.id || 0,
        items: state.data?.soItems?.filter((it) => it.type === 'STD') || [],
      });
      dispatch({ type: 'setTransportations', payload: rs });
      const list = getSoItems(rs, delivery);
      dispatch({ type: 'setDeliveryList', payload: calculateDeliverySoItem(list) });
    } catch (error) {
      message.error('Failed to load offer.');
    }
  };

  const getSoItems = (rs: PackageOffer[], delivery: SoDeliveryMethod | undefined) => {
    const elements = state.data?.soItems;
    const lastElement = elements?.filter((it) => it.type === 'STD').pop();
    return (
      (delivery && delivery?.id === 5
        ? state.data?.soItems?.concat(
            rs.flatMap((it, index) => {
              return it.offerList.map((ti) => {
                return {
                  id: 0,
                  seq: (lastElement?.seq || 0) + (index + 1) * 1000,
                  key: uniqueId('traItem'),
                  itemId: ti.itemItem.id,
                  itemCode: ti.itemItem.code || '',
                  description: ti.itemItem.description || '',
                  uomId: 1,
                  uom: 'EACH',
                  qty: ti.qty,
                  price: ti.price,
                  amount: 0,
                  discountAmount: 0,
                  totalAmount: 0,
                  type: ti.offerType,
                  categoryId: 0,
                };
              });
            }) || [],
          )
        : state.data?.soItems) || []
    );
  };

  return {
    state: state,
    actions: {
      initilizeData,
      initData,
      findProductItem,
      fetchSo: doFetchSo,
      fetchOfferCodes,
      saveSo: doSaveSo,
      saveSoItem,
      saveSoItems,
      removeSoItem,
      //   setAttachments,
      loadAttachments,
      saveAttachment,
      deleteAttachment,
      saveShipping,
      deleteShipping,
      loadSoItems,
      clearSoItem: doClearSoItem,
      resetSoItem: doResetSoItem,
      loadDependencyCustomer: doLoadingDependencyByCustomer,
      getOffer,
      postSo,
      cancelSo,
      closeSo,
      listTransportationOffer,
      getSoItems,
      loadListItem,
    },
    isLoading: actions.isLoading,
    modals: {
      isVisible: actions.isVisible,
      showModal: actions.showModalAction,
      hideModal: actions.hideModalAction,
    },
  };
};
