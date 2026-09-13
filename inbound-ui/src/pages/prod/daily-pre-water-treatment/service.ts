import { RequestActions, ServiceApiType, singleRequest } from "@/services/apiGateway";
import { DailyPreWaterTreatment, DailyPreWaterTreatmentControl, DailyPreWaterTreatmentList, DailyPreWaterTreatmentPlant } from "./data";

const DailyPreWaterTreatmentAction = {
    get_plant: (): ServiceApiType<{}> => ({
        actionName: 'get_plant',
        endpoint: 'PROD',
        type: 'LIST_QUERY',
        payload: {}
    }),
    get_control: (plant_id: number): ServiceApiType<{ plant_id: number }> => ({
        actionName: 'get_control',
        endpoint: 'PROD',
        type: 'LIST_QUERY',
        payload: { plant_id }
    }),
    get_pre_treatment_by_date: (assign_date: string, pre_treatment_type: string): ServiceApiType<{ assign_date: string, pre_treatment_type: string }> => ({
        actionName: 'get_pre_treatment_by_date',
        endpoint: 'PROD',
        type: 'LIST_QUERY',
        payload: { assign_date, pre_treatment_type },
    }),
    get_pre_treatment_by_date_time: (time: string, pre_treatment_type: string, pre_treatment_id: string): ServiceApiType<{ time: string, pre_treatment_type: string, pre_treatment_id: string }> => ({
        actionName: 'get_pre_treatment_by_date_time',
        endpoint: 'PROD',
        type: 'LIST_QUERY',
        payload: { time, pre_treatment_type, pre_treatment_id },
    }),
    assign_pre_water_treatment: (data: DailyPreWaterTreatment): ServiceApiType<DailyPreWaterTreatment> => ({
        actionName: 'assign_pre_water_treatment',
        endpoint: "PROD",
        type: "EXEC",
        payload: data
    }),
    post_daily_pre_water_treatment: (data: DailyPreWaterTreatmentList): ServiceApiType<DailyPreWaterTreatmentList> => ({
        actionName: 'post_daily_pre_water_treatment',
        endpoint: "PROD",
        type: "EXEC",
        payload: data
    }),
    get_shift_activities: (pre_treatment_id: string, pre_treatment_type: string): ServiceApiType<{ pre_treatment_id: string, pre_treatment_type: string }> => ({
        actionName: 'get-shift-activities',
        endpoint: 'PROD',
        type: 'LIST_QUERY',
        payload: { pre_treatment_id, pre_treatment_type },
    }),
    assign_self_pre: (id: number, action: string, pre_treatment_id: string, pre_treatment_type: string): ServiceApiType<{ id: number, action: string, pre_treatment_id: string, pre_treatment_type: string }> => ({
        actionName: "assign-self-pre",
        endpoint: "PROD",
        type: 'EXEC',
        payload: { id, action, pre_treatment_id, pre_treatment_type }
    }),
    unassign_pre: (pre_treatment_id: string, pre_treatment_type: string): ServiceApiType<{ pre_treatment_id: string, pre_treatment_type: string }> => ({
        actionName: "unassign-pre",
        endpoint: "PROD",
        type: 'EXEC',
        payload: { pre_treatment_id, pre_treatment_type }
    })
}

export const DailyPreWaterTreatmentServiceAPI = (requestAction: RequestActions) => {
    return {
        getPlant: () => singleRequest<DailyPreWaterTreatmentPlant>(DailyPreWaterTreatmentAction.get_plant())(
            requestAction
        ),
        getControl: (plant_id: number) => singleRequest<DailyPreWaterTreatmentControl>(DailyPreWaterTreatmentAction.get_control(plant_id))(
            requestAction
        ),
        getPreTreatmentByDate: (assign_date: string, pre_treatment_type: string) =>
            singleRequest<DailyPreWaterTreatment>(DailyPreWaterTreatmentAction.get_pre_treatment_by_date(assign_date, pre_treatment_type))(
                requestAction
            ),
        getPreTreatmentByDateTime: (time: string, pre_treatment_type: string, pre_treatment_id: string) =>
            singleRequest<DailyPreWaterTreatment>(DailyPreWaterTreatmentAction.get_pre_treatment_by_date_time(time, pre_treatment_type, pre_treatment_id))(
                requestAction
            ),
        assign_pre_water_treatment: (data: DailyPreWaterTreatment) =>
            singleRequest<{ data: string; message: string }>(DailyPreWaterTreatmentAction.assign_pre_water_treatment(data))(
                requestAction
            ),
        post_daily_pre_water_treatment: (data: DailyPreWaterTreatmentList) =>
            singleRequest<{ data: string; message: string }>(DailyPreWaterTreatmentAction.post_daily_pre_water_treatment(data))(
                requestAction
            ),
        getShiftActivities: (pre_treatment_id: string, pre_treatment_type: string) =>
            singleRequest<DailyPreWaterTreatment>(DailyPreWaterTreatmentAction.get_shift_activities(pre_treatment_id, pre_treatment_type))(
                requestAction
            ),
        assign_self_pre: (id: number, action: string, pre_treatment_id: string, pre_treatment_type: string) =>
            singleRequest<DailyPreWaterTreatment>(DailyPreWaterTreatmentAction.assign_self_pre(id, action, pre_treatment_id, pre_treatment_type))(
                requestAction
            ),
        unassign_pre: (pre_treatment_id: string, pre_treatment_type: string) =>
            singleRequest<DailyPreWaterTreatment>(DailyPreWaterTreatmentAction.unassign_pre(pre_treatment_id, pre_treatment_type))(
                requestAction
            )
    }
}