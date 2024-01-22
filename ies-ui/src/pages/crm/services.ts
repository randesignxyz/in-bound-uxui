import { fetchDataListService } from "@/services/apiGateway";
import { LookupData, LookupDataType } from "@/services/data";

export const CrmServices = {
    listLookupData: (types: LookupDataType[]) => fetchDataListService<LookupData, {list: string[]}>({
        actionName: 'lookupDataList',
        endpoint: 'CRM',
        payload: {list: types}
    }),
}
