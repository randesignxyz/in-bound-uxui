import { RequestActions, ServiceApiType, singleRequest } from "@/services/apiGateway";
import { HACCPMonitoring, HACCPMonitoringActivities } from "./data";

const DailyHACCPMonitoringAction = {
    get_haccp_by_date: (assign_date:string): ServiceApiType<{assign_date:string}> => ({
        actionName: 'get-haccp-by-date',
        endpoint: 'PROD',
        type: 'LIST_QUERY',
        payload: {assign_date}
    }),
    assign_haccp:(data: HACCPMonitoring): ServiceApiType<HACCPMonitoring>=>({
        actionName:'assign-haccp',
        endpoint: "PROD",
        type: "EXEC",
        payload: data
    }),
    get_haccp_by_date_and_line:(assign_date:string,line:string,haccp_id:string): ServiceApiType<{assign_date:string,line:string,haccp_id:string}>=>({
        actionName:'get-haccp-by-date-and-line',
        endpoint: 'PROD',
        type: 'LIST_QUERY',
        payload: {assign_date,line,haccp_id}
    }),
    assign_self_haccp:(id:number,line:string,haccp_id:string,activities:[]): ServiceApiType<{id:number,line:string,haccp_id:string,activities:[]}>=>({
        actionName:'assign-self-haccp',
        endpoint: 'PROD',
        type: 'EXEC',
        payload: {id,line,haccp_id,activities}
    }),
    get_haccp_activities:(haccp_id: string): ServiceApiType<{haccp_id: string}>=>({
        actionName:'get-haccp-activities',
        endpoint: 'PROD',
        type: 'LIST_QUERY',
        payload: {haccp_id}
    })
}

export const DailyHACCPMonitoringServiceAPI = (requestAction: RequestActions) => {
    return {
        getHaccpByDate: (assign_date:string) => singleRequest<HACCPMonitoring>(DailyHACCPMonitoringAction.get_haccp_by_date(assign_date))(
            requestAction
        ),
        assign_haccp:(data:HACCPMonitoring)=> singleRequest<{data: string; message: string}>(DailyHACCPMonitoringAction.assign_haccp(data))(
            requestAction
        ),
        get_haccp_by_date_and_line:(assign_date:string,line:string,haccp_id:string)=> singleRequest<HACCPMonitoring>(DailyHACCPMonitoringAction.get_haccp_by_date_and_line(assign_date,line,haccp_id))(
            requestAction
        ),
        assign_self_haccp:(id:number,line:string,haccp_id:string,activities:[])=> singleRequest<{data: string; message: string}>(DailyHACCPMonitoringAction.assign_self_haccp(id,line,haccp_id,activities))(
            requestAction
        ),
        get_haccp_activities:(haccp_id:string)=> singleRequest<HACCPMonitoringActivities>(DailyHACCPMonitoringAction.get_haccp_activities(haccp_id))(
            requestAction
        )
    }
}