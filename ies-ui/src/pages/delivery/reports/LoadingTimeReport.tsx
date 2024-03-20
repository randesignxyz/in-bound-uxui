import loadingDock from "@/pages/queue/loading-dock";
import { MultiRequest } from "@/services/apiGateway";
import { Company, LoadingBay, LoadingDock, LoadingTeam } from "@/services/delivery/data";
import { DeliveryParams } from "@/services/delivery/delivery-params";
import { LoadingServiceParams } from "@/services/delivery/loading-bay-service-params";
import { DeliveryServiceAPI } from "@/services/delivery/services";
import { simpleRequestActions } from "@/services/model";
import { ModalForm, ModalFormProps, ProForm, ProFormDateRangePicker, ProFormDependency, ProFormSelect } from "@ant-design/pro-components"
import { Flex } from "antd"
import { useForm } from "antd/lib/form/Form";
import { Moment } from "moment";

import { useEffect, useState } from "react";

type initDataType = {
    companyList: Company[];
    loadingBayList: LoadingBay[];
    loadingDockList: LoadingDock[];
    loadingTeamList: LoadingTeam[];
}

type FormDataType = {
    dateRange: Moment[];
    sourceIds?: number[];
    loadingTeamIds?: number[];
    loadingBayIds?: number[];
    loadingDockIds?: number[];
    truckIds?: number[];

}

export default ({ ...rest }: ModalFormProps) => {


    const [data, setData] = useState<initDataType>()

    const [form] = useForm<FormDataType>()

    const requestActions = simpleRequestActions();

    const deliveryApi = DeliveryServiceAPI(requestActions)

    const init = async () => {
        const initData = await MultiRequest<initDataType>([
            DeliveryParams.listAllCompany(),
            LoadingServiceParams.listAllLoadingBay(),
            LoadingServiceParams.listAllLoadingDock(),
            LoadingServiceParams.listLoadingTeam(),
        ])(requestActions);

        setData(initData)
    }

    useEffect(() => {
        rest.open && init()
    }, [rest.open])

    const onDriverHandler = async (keyWords?: string) => {
        const rs = await deliveryApi.listDriver({
            criteria: {
                searchValue: keyWords
            }
        })
        return rs.items.map(it => ({ value: it.id, label: `${it.firstName} ${it.lastName}` }))
    }

    const onTruckSearchHandler = async (keyWords?: string) => {
        const rs = await deliveryApi.listTruck({
            criteria: {
                searchValue: keyWords
            }
        })
        return rs.items.map(it => ({ value: it.id, label: it.licensePlate }))
    }

    return <ModalForm form={form} loading={requestActions.request?.loading} title="WH - Loading time report" {...rest}

    // onValuesChange={(changeValues, values) => {
    //     if ("loadingBayIds" in changeValues) {
    //         form.resetFields(['loadingDockIds'])
    //     }
    // }}
    >
        <Flex flex={1} gap={10}>
            <Flex vertical flex={1}>
                <ProFormDateRangePicker name={"dateRange"} rules={[{ required: true }]} label="Date Range" />
                <ProFormSelect name={"sourceIds"} options={data?.companyList.map(it => ({ value: it.id, label: it.name }))} label="Sources" allowClear mode="multiple" />
                <ProFormSelect name={"driverIds"} request={({ keyWords }) => onDriverHandler(keyWords)} showSearch label="Driver" allowClear mode="multiple" />
            </Flex>
            <Flex vertical flex={1}>
                <ProFormSelect name={"loadingTeamIds"} label="Loading Team" options={data?.loadingTeamList.map(it => ({ value: it.id, label: it.name }))} allowClear mode="multiple" />
                <ProFormSelect name={"loadingBayIds"} label="Loading Bay" options={data?.loadingBayList.map(it => ({ value: it.id, label: it.name }))} allowClear mode="multiple" />
                <ProFormDependency name={['loadingBayIds']}  >
                    {({ loadingBayIds }) => {
                        return <ProFormSelect
                            name={"loadingDockIds"} options={data?.loadingDockList.filter(it => (loadingBayIds || []).length == 0 || (loadingBayIds as number[]).some(i => i == it.loadingBay.id)).map(it => ({ value: it.id, label: it.code }))} label="Loading Dock" allowClear mode="multiple" />
                    }}
                </ProFormDependency>


            </Flex>

        </Flex>
        <ProFormSelect showSearch request={({ keyWords }) => onTruckSearchHandler(keyWords)} name={"truckIds"} label="Truck" allowClear mode="multiple" />
    </ModalForm>
}