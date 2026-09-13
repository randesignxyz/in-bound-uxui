

import { LookupData, PageResult, Paging } from "@/components/core/comp";
import { request } from "@umijs/max";
import { Endpoint, ServiceType } from "../API";
import { getServiceUrl, SAP_API, WORKFLOW_API } from "../ApiUrl";



export async function fetchDataById<R>(params: {
    service: ServiceType,
    id: number | string
}) {

    console.log(params)
    const srvUrl = getServiceUrl(params.service.name)


    return request<R>(`${srvUrl}/fetch/type/${params.service.action}/id/${params.id}`)
}
export async function fetchData<T, R>(params: {
    service: ServiceType,
    data: T
}) {
    const srvUrl = getServiceUrl(params.service.name)
    return request<R>(`${srvUrl}/fetch/type/${params.service.action}`, {
        method: 'POST',
        data: params.data
    })
}


export async function queryData<T, R>(params: { service: ServiceType, searchCriteria?: T, paging?: Paging }) {

    const paging = { page: params.paging?.page || 0, pageSize: params.paging?.pageSize || 20 }

    const url = `${getServiceUrl(params.service.name)}/query/type/${params.service.action}/list?page=${paging.page}&pageSize=${paging.pageSize}`
    return request<PageResult<R>>(url, {
        method: 'POST',
        data: params.searchCriteria
    })
}


export async function lookup(params: { type: string, value: string }) {
    return request<LookupData>(`${WORKFLOW_API}/lookup/type/${params.type}/value/${params.type}/limit/${20}`)
}

export async function getLookupData(params: {
    service: ServiceType;
    searchValue: string;
    limit?: number;
}) {
    const srvUrl = getServiceUrl(params.service.name)
    return request<LookupData>(`${srvUrl}/lookup/type/${params.service.action}/value/${params.searchValue || ' '}/limit/${params.limit || 20}`)
}

export async function getAllLookupData(params: {
    service: ServiceType
}) {
    console.log(params.service.name)
    return request<LookupData>(`${getServiceUrl(params.service.name)}/lookup/type/${params.service.action}/all`)
}

export async function getMultiLookupData<T>(params: {
    serviceName: Endpoint,
    types: string[]
}) {
    return request<T>(`${getServiceUrl(params.serviceName)}/lookup/types/${params.types.join('__')}`)
}

export async function getSapInitLookupData<T>(params: { types: string }) {
    return request<T>(`${SAP_API}/lookup/types/${params.types}`)
}

export async function getInitLookupData<T>(params: { types: string }) {
    return request<T>(`${WORKFLOW_API}/lookup/types/${params.types}`)
}

export async function simpleSearch<T>(params: { type: string, searchValue: string, paging?: Paging }) {
    const paging = { page: params.paging?.page || 0, pageSize: params.paging?.pageSize || 20 }
    return request<T[]>(`${WORKFLOW_API}/query/type/${params.type}/list?page=${paging.page}&pageSize=${paging.pageSize}`, {
        method: 'POST',
        data: {
            searchValue: params.searchValue
        }
    })
}