import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { DataSetupDTO, DataSetupItemSearchParam, DataSetupSearchParam, MasterData, MasterDataItem } from "./data.d";
import { execDataService, execDataService0, fetchDataListService, fetchDataPagingService, queryDataPagingService } from "@/services/apiGateway";



// --- Service to simulate Backend ---

export const DataSetupService = {
    pageDataSetup: (param?: TableViewSearchParams<any>) => fetchDataPagingService<DataSetupDTO>({
        actionName: "data-setups",
        endpoint: "HR",
        payload: param?.criteria,
    }),
    listDataSetup: (param?: TableViewSearchParams<DataSetupSearchParam>) => fetchDataListService<DataSetupDTO>({
        actionName: "data-setup-list",
        endpoint: "HR",
        payload: param?.criteria,
    }),
    saveDataSetup: (param: any) => execDataService0({
        actionName: "data-setup",
        endpoint: "HR",
        payload: param,
    }),
    deleteDataSetup: (id: number) => execDataService0({
        actionName: "data-setup-delete",
        endpoint: "HR",
        payload: { id }
    }),
    pageDataSetupItems: (param: TableViewSearchParams<DataSetupItemSearchParam>) => queryDataPagingService({
        actionName: "data-setup-items",
        endpoint: "HR",
        payload: param.criteria,
        pagination: param.pagination
    }),
    saveDataSetupItem: (param: any) => execDataService0({
        actionName: "data-setup-item",
        endpoint: "HR",
        payload: param
    }),
    deleteDataSetupItem: (id: number) => execDataService0({
        actionName: "data-setup-item-delete",
        endpoint: "HR",
        payload: { id }
    }),
}



