import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { TermAdvanceSearchParams } from "./model";
import { execDataService, fetchDataItemService, fetchDataListService, fetchDataPagingService } from "@/services/apiGateway";
import { GratisSettledConfigData, RemoveGratisSettledConfigData, SaveGratisSettledConfigData, SaveTermData, Term } from "./types";


export const TermServices = {
    list: (params: TableViewSearchParams<TermAdvanceSearchParams>) => fetchDataPagingService<Term, any>({
        actionName: 'list-terms-paging',
        endpoint: 'CRM',
        payload: {
            ...params.criteria
         },
        pagination: {
            page: params.pagination?.current,
            pageSize: params.pagination?.pageSize
        }
    }),
    detail: (id: number) => fetchDataItemService<Term, {id: number}> ({
        actionName: 'find-term',
        endpoint: 'CRM',
        payload: {id},
    }),
    listSettledConfig: (id: number) => fetchDataListService<GratisSettledConfigData, {id: number}> ({
        actionName: 'fetch-gratis-settled-config',
        endpoint: 'CRM',
        payload: {id},
    }),
    saveSettledConfig: (data: SaveGratisSettledConfigData) => execDataService<{message: string,id?: number}, SaveGratisSettledConfigData> ({
        actionName: 'save-gratis-settled-config',
        endpoint: 'CRM',
        payload: data,
    }),
    removeSettledConfig: (data: RemoveGratisSettledConfigData) => execDataService<{message: string,id?: number}, RemoveGratisSettledConfigData> ({
        actionName: 'remove-gratis-settled-config',
        endpoint: 'CRM',
        payload: data,
    }),
    getTermCode: () => fetchDataItemService<{data: string}> ({
        actionName: 'get-max-term-code',
        endpoint: 'CRM',
        // payload: {id},
    }),
    saveTerm: (data: SaveTermData) => execDataService<{message: string,id?: number}, SaveTermData> ({
        actionName: 'save-term',
        endpoint: 'CRM',
        payload: data,
    }),


}