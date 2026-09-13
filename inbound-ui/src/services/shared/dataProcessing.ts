import { request } from "@umijs/max";
import { SAP_API } from "../ApiUrl";


export async function processSapData<T>(params: {action: string, payload: any}) {
    return request<T>(`${SAP_API}/data-processing/process/${params.action}`, {
        method: 'POST',
        data: params.payload
    })
} 