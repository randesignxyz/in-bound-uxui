import { LookupDataItem } from "@/services/data";
import { BaseActionType, StateType, baseReducer } from "@/services/model";
import { MpuStockControlDetail, MpuStockControlItemLess, MpuStockDetailItemLess, RsmRequestMpuDetail, SalesTeamWorkLess, StockDetailLess, StockStoreDetail, TeamWorkLess } from "@/services/sale/data";

export interface InitData {
    teamWorks?: TeamWorkLess[];
    salespersonList?: SalesTeamWorkLess[];
    types?: LookupDataItem[];
    typeProductItems?: { type: number; value: LookupDataItem[] }[];
}

export type ModalName = 'nothing' | 'advanceSearch';

export interface State extends StateType<ModalName> {
    data?: {
        // mpuRequest: MpuRequest[];
        initData?: InitData;
        detail?: MpuStockControlDetail;
        teamWorks?: TeamWorkLess[];
        members?: SalesTeamWorkLess[];
        detailStockStore?: StockStoreDetail;
        listLastStockControl?: StockDetailLess[];
        productItems?: LookupDataItem[];
        listMpuStockControl?: MpuStockControlItemLess;
        detailMpuStockControl?: RsmRequestMpuDetail;
        listMpuStockDetailItems?: MpuStockControlItemLess[]
    };
}

export type Action = 
    | BaseActionType<ModalName>
    | { type: 'initialData'; payload?: InitData }
    | { type: 'detail'; payload?:  MpuStockControlDetail }
    | { type: 'fetchLastStockControl'; payload?: StockDetailLess[] }
    | { type: 'detailStockStore'; payload?: StockStoreDetail }
    | { type: 'clearMember' }
    | { type: 'loadItems'; payload?: LookupDataItem[] }
    | { type: 'listDetailStockControl'; payload?: MpuStockDetailItemLess }
    | { type: 'detailMpuStockControl'; payload?: RsmRequestMpuDetail }
    | { type: 'listMpuStockDetailItem'; payload?: MpuStockControlItemLess[] };

export const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case 'listMpuStockDetailItem':
            return {
                ...state,
                data: {
                    ...state.data,
                    listMpuStockDetailItems: action.payload
                }
            }
        case 'listDetailStockControl':
            return {
                ...state,
                data: {
                    ...state.data,
                    initData: {
                        ...state.data,
                        ...action.payload
                    }
            }
        }
        case 'initialData':
            return {
                ...state,
                data: {
                    ...state.data,
                    initData: {
                        ...state.data?.initData,
                        ...action.payload
                    }
                }
            }
        case 'clearMember':
            return {
                ...state,
                data: {
                    ...state.data,
                    members: []
                }
            }
        case 'fetchLastStockControl':
            return {
                ...state,
                data: {
                    ...state.data,
                    listLastStockControl: action.payload
                }
            }
        case 'detailStockStore':
            return {
                ...state,
                data: {
                    ...state.data,
                    detailStockStore: action.payload,
                }
            }
        case 'detail':
            return {
                ...state,
                data: {
                    ...state.data,
                    detail: action.payload,
                },
            };
        case 'loadItems':
            return {
                ...state,
                data: {
                    ...state.data,
                    productItems: action.payload
                }
            }
        default:
            return baseReducer(state, action);
    }
}