import { request } from "@umijs/max";
import { ServiceType } from "../API";
import { getServiceUrl } from "../ApiUrl";


export async function processData<T, R>(params: { service: ServiceType, payload: T }) {
 
    return request<R>(`${getServiceUrl(params.service.name)}/data-processing/action/${params.service.action}/exec`, {
        method: 'POST',
        data: params.payload
    })
}