
import { ServiceType } from "../API"
import { findMultiService, RequestActions } from "../apiGateway"
import { InitSettingParamsType, SettingServiceName } from "./type"

export const SettingService = (serviceName?: SettingServiceName): ServiceType => {
    return {
        type: 'SETTING',
        name: serviceName
    }
}

export namespace SettingServiceAPI {
    export const initCustomerData = (actions?: RequestActions) => findMultiService<InitSettingParamsType, {}>(SettingService(), actions)

}