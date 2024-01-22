

import { PageResult, Paging } from "@/components/core/comp";
import { request } from "@umijs/max";
import { SAP_API } from "../ApiUrl";


export async function querySap<T>(params: {type: string, payload: any, paging? : Paging, sorter?: any}) {
    const paging = { page: params.paging?.page || 0, pageSize : params.paging?.pageSize || 20  }
    return request<PageResult<T>>(`${SAP_API}/query/type/${params.type}/list?page=${paging.page}&pageSize=${paging.pageSize}`, {
        method: 'POST',
        data: params.payload 
    })
}

export async function fetchSap<T>(params: {type: string, payload: any}) {
    return request<T>(`${SAP_API}/query/type/${params.type}/fetch`, {
        method: 'POST',
        data: params.payload 
    })
}