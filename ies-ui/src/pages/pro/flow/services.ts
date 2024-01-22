import { fetchDataItemService } from "@/services/apiGateway";
import { simpleRequestActions } from "@/services/model";
import { FlowData, FlowNodeType } from "./data";


export const createFlowService = () => {
    const request = simpleRequestActions();
    return {
        fetch: (type: FlowNodeType, id: number) => fetchDataItemService<FlowData, { type: FlowNodeType; id: number }>({
            actionName: 'fetch-flow-data',
            endpoint: 'PRO',
            payload: {
                type, id
            }
        }).query(request),
        request: request
    }

}