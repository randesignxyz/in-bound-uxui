import { RequestActions, ServiceApiType, singleRequest } from "@/services/apiGateway";
import { AssignDailyWaterTreatment, DailyWaterTreatmentActivities, DailyWaterTreatmentItem, DailyWaterTreatmentMachine } from "./data";

const DailyWaterTreatmentMachineAction = {
    get_machine: (): ServiceApiType<{}> => ({
        actionName: 'get_machine',
        endpoint: 'PROD',
        type: 'LIST_QUERY',
        payload: {},
    }),
    assign_to: (data: AssignDailyWaterTreatment): ServiceApiType<AssignDailyWaterTreatment> => ({
        actionName: 'assign_to_user',
        endpoint: "PROD",
        type: "EXEC",
        payload: data
    }),
    get_treatment_by_date_assign: (assign_date: string, shift: string): ServiceApiType<{ assign_date: string, shift: string }> => ({
        actionName: 'get_treatment_by_date_assign',
        endpoint: 'PROD',
        type: 'LIST_QUERY',
        payload: { assign_date, shift },
    }),
    get_treatment_by_date: (assign_date: string, shift: string): ServiceApiType<{ assign_date: string, shift: string }> => ({
        actionName: 'get_treatment_by_date',
        endpoint: 'PROD',
        type: 'LIST_QUERY',
        payload: { assign_date, shift },
    }),
    post_daily_water_treatment: (data: DailyWaterTreatmentItem): ServiceApiType<DailyWaterTreatmentItem> => ({
        actionName: 'post_daily_water_treatment',
        endpoint: 'PROD',
        type: 'EXEC',
        payload: data
    }),
    paging_shift_activities: (treatment_id: string): ServiceApiType<{ treatment_id: string }> => ({
        type: 'PAGING_QUERY',
        endpoint: "PROD",
        actionName: "fetch-paging-shift-activities",
        payload: { treatment_id },
    }),
    get_treatment_daily: (assign_date: string): ServiceApiType<{ assign_date: string }> => ({
        actionName: 'get-treatment-daily',
        endpoint: 'PROD',
        type: 'LIST_QUERY',
        payload: { assign_date },
    }),
    assign_self: (id: number,action: string,treatment_id: string): ServiceApiType<{id: number,action: string,treatment_id: string}> => ({
        actionName:"assign-self",
        endpoint:"PROD",
        type:'EXEC',
        payload:{id,action,treatment_id}
    }),
    unassign:(treatment_id:string):ServiceApiType<{treatment_id:string}>=>({
        actionName:"unassign",
        endpoint:"PROD",
        type:'EXEC',
        payload:{treatment_id}
    })
}

export const DailyWaterTreatmentMachineServiceAPI = (requestAction: RequestActions) => {
    return {
        get_machine: () => singleRequest<DailyWaterTreatmentMachine>(DailyWaterTreatmentMachineAction.get_machine())(
            requestAction
        ),
        assign_to: (data: AssignDailyWaterTreatment) =>
            singleRequest<{ data: string; message: string }>(DailyWaterTreatmentMachineAction.assign_to(data))(
                requestAction
            ),
        get_treatment_by_date_assign: (assign_date: string, shift: string) =>
            singleRequest<AssignDailyWaterTreatment>(DailyWaterTreatmentMachineAction.get_treatment_by_date_assign(assign_date, shift))(
                requestAction
            ),
        get_treatment_by_date: (assign_date: string, shift: string) =>
            singleRequest<AssignDailyWaterTreatment>(DailyWaterTreatmentMachineAction.get_treatment_by_date(assign_date, shift))(
                requestAction
            ),
        post_daily_water_treatment: (data: DailyWaterTreatmentItem) =>
            singleRequest<{ data: string; message: string }>(DailyWaterTreatmentMachineAction.post_daily_water_treatment(data))(
                requestAction
            ),
        paging_shift_activities: (treatment_id: string) =>
            singleRequest<DailyWaterTreatmentActivities>(DailyWaterTreatmentMachineAction.paging_shift_activities(treatment_id))(
                requestAction
            ),
        getTreatmentDaily: (assign_date: string) =>
            singleRequest<AssignDailyWaterTreatment>(DailyWaterTreatmentMachineAction.get_treatment_daily(assign_date))(
                requestAction
            ),
        assign_self:(id: number,action: string,treatment_id: string)=>
            singleRequest<AssignDailyWaterTreatment>(DailyWaterTreatmentMachineAction.assign_self(id,action,treatment_id))(
                requestAction
            ),
        unassign:(treatment_id:string)=>
            singleRequest<DailyWaterTreatmentItem>(DailyWaterTreatmentMachineAction.unassign(treatment_id))(
                requestAction
            )
    }
}