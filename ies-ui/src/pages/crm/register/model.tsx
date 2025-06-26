import { Locations, outletType } from '@/services/crm/data';
import { LookupData } from '@/services/data';
import { BaseActionType, baseReducer, StateType } from "@/services/model"
import { useReducer } from 'react';
import { commmonActions, InitDateType } from '@/services/model';
import { InitCustomerParamsType, LocationType, RegisterCustomerServiceAPI } from './services';

export type ModalName = 'requestContract' | 'editBasicInfo' |
    'editAddress' | 'editVisitPlan' | 'purchaseEst' |
    'createContract' | 'attachments' |
    'visitScheduleGen' | 'scheduleStatus' | 'advanceSearch' |
    'export-customer' | 'transfer-customer' | 'transfer-customers' | 
    'promote-customer' | 'code-tracking'

export interface InitData {
    regionList?: Locations[]
    provinceList?: Locations[];
    outletTypeList?: outletType[];
    lookupDataList?: LookupData[]; 
}
export interface State extends StateType<ModalName> {
    initData?: InitData;
    data?: {
        locations?: {
            districtList?: Locations[];
            communeList?: Locations[];
            villageList?: Locations[];
        }
    }
}
export type Action = BaseActionType<ModalName> |
{ type: 'initialData', payload?: InitData } | 
{ type: 'setDistrict', payload?: Locations[] } |
{ type: 'setCommune', payload?: Locations[] } |
{ type: 'setVillage', payload?: Locations[] } 



export const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case 'initialData':
            return { ...state, initData: { ...state.initData, ...action.payload } }
        case 'setDistrict': {
            return {
                ...state, data: {
                    ...state.data, locations: {
                        ...state.data?.locations, districtList: action.payload
                    }
                }
            }
        }    
        case 'setCommune': {
            return {
                ...state, data: {
                    ...state.data, locations: {
                        ...state.data?.locations, communeList: action.payload
                    }
                }
            }
        }

        case 'setVillage': {
            return {
                ...state, data: {
                    ...state.data, locations: {
                        ...state.data?.locations, villageList: action.payload
                    }
                }
            }
        }    
        default:
            return baseReducer(state, action)    
    }
}

export const model = () => {
    const initState: State = {
        loading: false
    }
    const [state, dispatch] = useReducer(reducer, initState);
      /***************Services************* */
      const actions = commmonActions(dispatch, state);
      const reCustomerServices = RegisterCustomerServiceAPI(actions.requestActions());
    //   const saleServices = SaleServiceAPI(actions.requestActions());
    
      /*******************Actions /Methods********************* */
    const initData = async (type: InitDateType) => {
        try {          
            const createParams: InitCustomerParamsType[] = [
                { actionName: 'outletTypeList', payload: {} },

                // { actionName: 'sale', responseKey: 'seList', payload: {} },
                { actionName: 'locations', responseKey: 'provinceList', payload: { type: 'PROVINCE' } },
                { actionName: 'locations', responseKey: 'regionList', payload: { type: 'DIVISION' } },
                // { actionName: 'product', responseKey: 'productList', payload: {} },
                // { actionName: 'item', responseKey: 'itemList', payload: {} },
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
                        // 'CONTACT_TYPE',
                        // 'ADDRESS_TYPE',
                        // 'WEEK_OF_MONTH',
                        // 'DAY_OF_WEEK',
                        // 'CUSTOMER_TYPE',
                        // 'CONTACT_CHANNEL_TYPE',
                        'SALE_PRICE_LIST',
                        'SALE_PAYMENT_TERM',
                        'CUSTOMER_DIVISION',
                        'SALE_SUB_CHANNEL',
                        'SALE_MAIN_CHANNEL'
                    ],
                    },
                },
            ];
            const rs = await reCustomerServices.initCustomerData(createParams);           
            dispatch({ type: 'initialData', payload: rs });
            return rs;
        } catch (error) {
            return;
        }
    };

    const loadLocations = async (type: LocationType, parentId?: number, loadOnly?: true) => {
        if (type == 'DISTRICT') {
            const rs = await reCustomerServices.findAllLocations({ type: type, parentId: parentId });
            !loadOnly && dispatch({ type: 'setDistrict', payload: rs });
            !loadOnly && dispatch({ type: 'setCommune', payload: undefined });
        } else if (type == 'COMMUNE') {
            const rs = await reCustomerServices.findAllLocations({ type: type, parentId: parentId });
            !loadOnly && dispatch({ type: 'setCommune', payload: rs });
            !loadOnly && dispatch({ type: 'setVillage', payload: undefined });
        } else if (type == 'VILLAGE') {
            const rs = await reCustomerServices.findAllLocations({ type: type, parentId: parentId });
            !loadOnly && dispatch({ type: 'setVillage', payload: rs });
        }
    };

    const loadMultiLocations = async (ids: number[]) => {
    const rs = await reCustomerServices.findLocationByParents({ ids: ids });
    dispatch({ type: 'setDistrict', payload: rs.filter((it) => it.type == 'DISTRICT') });
    dispatch({ type: 'setCommune', payload: rs.filter((it) => it.type == 'COMMUNE') });
    dispatch({ type: 'setVillage', payload: rs.filter((it) => it.type == 'VILLAGE') });
  };
    const clearLocations = (locations: LocationType[]) => {
        locations.forEach((item) => {
            if (item == 'COMMUNE') dispatch({ type: 'setCommune', payload: undefined });
            if (item == 'DISTRICT') dispatch({ type: 'setDistrict', payload: undefined });
            if (item == 'VILLAGE') dispatch({ type: 'setVillage', payload: undefined });
        });
    };

    return {
        state1: state,
        actions1: {
            initData: initData,
            loadLocations: loadLocations,
            loadMultiLocations: loadMultiLocations,
            clearLocations: clearLocations
        },
    }
}