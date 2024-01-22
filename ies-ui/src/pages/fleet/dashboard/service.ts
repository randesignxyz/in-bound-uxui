import { RequestActions, ServiceApiType, singleRequest } from "@/services/apiGateway";
import { DieselUsageDaysInMonthDTO, DieselUsageDaysInMonthParam, InspectionDaysInMonthDTO, MonthlyAvgVehicleRepair, MonthlyAvgVehicleRepairParam, ServiceTaskMoreMaintenanceDTO, ServiceTaskMoreMaintenanceParam, TruckFuelUsageDTO, TruckFuelUsageParam, TruckMaintenanceCostDTO, TruckMaintenanceCostParam } from "./data";
import moment from "moment";


const DashboardAction = {
    
    truckFuelUsageList: (param: TruckFuelUsageParam): ServiceApiType<{ gasType?: number }> => ({
        type: "LIST_QUERY",
        actionName: "dashboard-truck-fuel-usages",
        endpoint: "FLEET",
        payload: param
    }),
    truckMaintenanceCostList: (param: TruckMaintenanceCostParam): ServiceApiType<{ status?: string }> => ({
        type: "LIST_QUERY",
        actionName: "dashboard-truck-maintenance-cost",
        endpoint: "FLEET",
        payload: param
    }),

    serviceTaskMostMaintenanceList: (param: ServiceTaskMoreMaintenanceParam): ServiceApiType<{ status?: string }> => ({
        type: "LIST_QUERY",
        actionName: "dashboard-service-task-more-maintenance",
        endpoint: "FLEET",
        payload: param
    }),
    monthlyAvgTruckRepair: (param: MonthlyAvgVehicleRepairParam): ServiceApiType<{ date?: moment.Moment }> => ({
        type: "LIST_QUERY",
        actionName: "dashboard-monthly-avg-repair",
        endpoint: "FLEET",
        payload: param
    }),

    dieselUsageDaysInMonth: (param: DieselUsageDaysInMonthParam): ServiceApiType<{ date?: moment.Moment }> => ({
        type: "LIST_QUERY",
        actionName: "diesel-usage-days-in-month",
        endpoint: "FLEET",
        payload: param
    }),
    inspectionDaysInMonth: (param: DieselUsageDaysInMonthParam): ServiceApiType<{ date?: moment.Moment }> => ({
        type: "LIST_QUERY",
        actionName: "inspection-days-in-month",
        endpoint: "FLEET",
        payload: param
    }),

}

export const DashboardServiceAPI = (requestActions: RequestActions) => {

    return {
        truckFuelUsageList: (param:TruckFuelUsageParam) => singleRequest<TruckFuelUsageDTO>(DashboardAction.truckFuelUsageList(param))(requestActions) as Promise<TruckFuelUsageDTO[]>,
        truckMaintenanceCostList: (param:TruckMaintenanceCostParam) => singleRequest<TruckMaintenanceCostDTO>(DashboardAction.truckMaintenanceCostList(param))(requestActions) as Promise<TruckMaintenanceCostDTO[]>,
        serviceTaskMostMaintenanceList: (param:ServiceTaskMoreMaintenanceParam) => singleRequest<ServiceTaskMoreMaintenanceDTO>(DashboardAction.serviceTaskMostMaintenanceList(param))(requestActions) as Promise<ServiceTaskMoreMaintenanceDTO[]>,
        monthlyAvgTruckRepair: (param:MonthlyAvgVehicleRepairParam) => singleRequest<MonthlyAvgVehicleRepair>(DashboardAction.monthlyAvgTruckRepair(param))(requestActions) as Promise<MonthlyAvgVehicleRepair[]>,
        dieselUsageDaysInMonth: (param:DieselUsageDaysInMonthParam) => singleRequest<DieselUsageDaysInMonthDTO>(DashboardAction.dieselUsageDaysInMonth(param))(requestActions) as Promise<DieselUsageDaysInMonthDTO[]>,
        inspectionDaysInMonth: (param:DieselUsageDaysInMonthParam) => singleRequest<InspectionDaysInMonthDTO>(DashboardAction.inspectionDaysInMonth(param))(requestActions) as Promise<InspectionDaysInMonthDTO[]>,

    }

}