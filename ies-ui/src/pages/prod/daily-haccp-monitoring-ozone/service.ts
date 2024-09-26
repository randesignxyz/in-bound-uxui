import { RequestActions, ServiceApiType, singleRequest } from "@/services/apiGateway";
import { HACCPMonitoringOzoneSystem, HACCPMonitoringOzoneControl, HACCPMonitoringOzone } from "./data";
import { HACCPMonitoringActivities } from "../daily-haccp-monitoring/data";
// import { DailyPreWaterTreatment, DailyPreWaterTreatmentControl, DailyPreWaterTreatmentList, DailyPreWaterTreatmentPlant } from "./data";

const HACCPMonitoringOzoneAction = {
    get_ozone_system: (): ServiceApiType<{}> => ({
        actionName: 'get-ozone-system',
        endpoint: 'PROD',
        type: 'LIST_QUERY',
        payload: {}
    }),
    get_ozone_control: (ozone_id: number): ServiceApiType<{ ozone_id: number }> => ({
        actionName: 'get-ozone-control',
        endpoint: 'PROD',
        type: 'LIST_QUERY',
        payload: { ozone_id }
    }),
    get_ozone_daily: (assign_date: string, haccp_ozone_type: string): ServiceApiType<{ assign_date: string, haccp_ozone_type: string }> => ({
        actionName: 'get-ozone-daily',
        endpoint: 'PROD',
        type: 'LIST_QUERY',
        payload: { assign_date, haccp_ozone_type },
    }),
    get_ozone_date_time: (haccp_ozone_id: string, haccp_ozone_type: string, time: string): ServiceApiType<{ haccp_ozone_id: string, haccp_ozone_type: string, time: string }> => ({
        actionName: 'get-ozone-date-time',
        endpoint: 'PROD',
        type: 'LIST_QUERY',
        payload: { haccp_ozone_id, haccp_ozone_type, time },
    }),
    assign_ozone_to_user: (data: HACCPMonitoringOzone): ServiceApiType<HACCPMonitoringOzone> => ({
        actionName: 'assign-ozone-to-user',
        endpoint: "PROD",
        type: "EXEC",
        payload: data
    }),
    get_ozone_activities: (haccp_ozone_id: string): ServiceApiType<{ haccp_ozone_id: string}> => ({
        actionName: 'get-ozone-activities',
        endpoint: 'PROD',
        type: 'LIST_QUERY',
        payload: { haccp_ozone_id },
    }),
    unassign_ozone: (haccp_ozone_id: string): ServiceApiType<{haccp_ozone_id: string}> => ({
        actionName:"unassign-ozone",
        endpoint:"PROD",
        type:'EXEC',
        payload:{haccp_ozone_id}
    })
}

export const HACCPMonitoringOzoneServiceAPI = (requestAction: RequestActions) => {
    return {
        getOzoneSystem: () => singleRequest<HACCPMonitoringOzoneSystem>(HACCPMonitoringOzoneAction.get_ozone_system())(
            requestAction
        ),
        getOzoneControl: (ozone_id: number) => singleRequest<HACCPMonitoringOzoneControl>(HACCPMonitoringOzoneAction.get_ozone_control(ozone_id))(
            requestAction
        ),
        getOzoneDaily: (assign_date: string, haccp_ozone_type: string) =>
            singleRequest<HACCPMonitoringOzone>(HACCPMonitoringOzoneAction.get_ozone_daily(assign_date, haccp_ozone_type))(
                requestAction
            ),
        getOzoneByDateTime: (haccp_ozone_id: string, haccp_ozone_type: string, time: string) =>
            singleRequest<HACCPMonitoringOzone>(HACCPMonitoringOzoneAction.get_ozone_date_time(haccp_ozone_id, haccp_ozone_type, time))(
                requestAction
            ),
        assign_ozone_to_user: (data: HACCPMonitoringOzone) =>
            singleRequest<{ data: string; message: string }>(HACCPMonitoringOzoneAction.assign_ozone_to_user(data))(
                requestAction
            ),
        getOzoneActivities: (haccp_ozone_id: string) =>
            singleRequest<HACCPMonitoringActivities>(HACCPMonitoringOzoneAction.get_ozone_activities(haccp_ozone_id))(
                requestAction
            ),
        unassignOzone:(haccp_ozone_id: string)=>
                singleRequest<HACCPMonitoringOzone>(HACCPMonitoringOzoneAction.unassign_ozone(haccp_ozone_id))(
                    requestAction
                )
    }
}