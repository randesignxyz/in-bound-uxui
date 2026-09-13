import { request } from "@umijs/max";
import { ExportType } from "../API";


export async function exportReport(params: {name: string, id: number, type: ExportType}) {
    return request(`/api/report/${[params.name]}/id/${params.id}/type/${params.type}/export`, {
      responseType: 'blob'
    })
  }