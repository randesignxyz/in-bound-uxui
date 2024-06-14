import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { Paging } from "@/services/API";
import { RequestActions, ServiceApiType, singleRequest } from "@/services/apiGateway";
import { InspectionAdvanceParams, InspectionDTO, InspectionLookup, InspectionCreate, InspectionDeleteOrVoidParam } from "./data"

const InspectionAction = {

    save: (data: InspectionCreate): ServiceApiType<InspectionCreate> => ({
        actionName: "save-inspection",
        endpoint: "FLEET",
        type: "EXEC",
        payload: data
    }),

    page: (
        params: TableViewSearchParams<InspectionAdvanceParams>
    ): ServiceApiType<{ searchValue?: string }> =>
    ({
        type: "PAGING_QUERY",
        actionName: "page-inspection",
        endpoint: "FLEET",
        payload: { ...params.criteria },
        pagination: {
            pageSize: params.pagination?.pageSize,
            page: params.pagination?.current,
        },
    }),

    detail: (id: string): ServiceApiType<{ id: string }> => ({
        actionName: "detail-inspection",
        endpoint: "FLEET",
        type: "FETCH_QUERY",
        payload: { id }
    }),
    delete: (data: InspectionDeleteOrVoidParam): ServiceApiType<InspectionDeleteOrVoidParam> => ({
        actionName: "delete-inspection",
        endpoint: "FLEET",
        type: "EXEC",
        payload: data
    }),
    void: (data: InspectionDeleteOrVoidParam): ServiceApiType<InspectionDeleteOrVoidParam> => ({
        actionName: "void-inspection",
        endpoint: "FLEET",
        type: "EXEC",
        payload: data
    }),

    inpectionLookupList: (type: string): ServiceApiType<{ type?: string }> => ({
        type: "LIST_QUERY",
        endpoint: "FLEET",
        actionName: "inspection-look-up-data-list",
        payload: { type }
    }),
}

export const InspectionServiceAPI = (requestActions: RequestActions) => {
    return {
        save: (data: InspectionCreate) => singleRequest<{ data: string, message: string }>(InspectionAction.save(data))(requestActions),
        delete: (data: InspectionDeleteOrVoidParam) => singleRequest<{ data: string, message: string }>(InspectionAction.delete(data))(requestActions),
        void: (data: InspectionDeleteOrVoidParam) => singleRequest<{ data: string, message: string }>(InspectionAction.void(data))(requestActions),
        page: (params: TableViewSearchParams<InspectionAdvanceParams>) =>singleRequest<InspectionDTO>(InspectionAction.page(params))(requestActions) as Promise<Paging<InspectionDTO>>,
        detail: (id: string) => singleRequest<InspectionDTO>(InspectionAction.detail(id))(requestActions) as Promise<InspectionDTO>,
        inspectionLookupList: (codeType: string) =>singleRequest<InspectionLookup>(InspectionAction.inpectionLookupList(codeType))(requestActions) as Promise<InspectionLookup[]>
    }
};
