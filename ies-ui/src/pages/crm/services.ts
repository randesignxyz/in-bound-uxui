import { fetchDataListService } from "@/services/apiGateway";
import { LookupData, LookupDataType } from "@/services/data";

export const CrmServices = {
    listLookupData: (types: LookupDataType[]) => fetchDataListService<LookupData, {list: string[]}>({
        actionName: 'lookupDataList',
        endpoint: 'CRM',
        payload: {list: types}
    }),
    listLocations: (param:{types?: string}) => fetchDataListService<Location, {type?:string}>({
        actionName: 'locations',
        endpoint: 'CRM',
        payload:{...param}
    }),
}
