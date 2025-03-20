import { MultiRequest, downloadGenericReport, downloadReport } from "@/services/apiGateway";
import { Company, LoadingBay, LoadingDock, LoadingTeam } from "@/services/delivery/data";
import { DeliveryParams } from "@/services/delivery/delivery-params";
import { LoadingServiceParams } from "@/services/delivery/loading-bay-service-params";
import { DeliveryServiceAPI } from "@/services/delivery/services";
import { simpleRequestActions } from "@/services/model";
import { ModalForm, ModalFormProps, ProFormDateRangePicker, ProFormDependency, ProFormSelect } from "@ant-design/pro-components"
import { Flex, message } from "antd"
import { useForm } from "antd/lib/form/Form";
import moment from "moment";
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
    driverIds?: number[];
    statuses?: string[];
    loadingTeamIds?: number[];
    loadingBayIds?: number[];
    loadingDockIds?: number[];
    truckIds?: number[];
    loadingType?: number[];

}

export default ({ ...rest }: ModalFormProps) => {

    const [data, setData] = useState<initDataType>()

    const [form] = useForm<FormDataType>()

    const requestActions = simpleRequestActions();

    const deliveryApi = DeliveryServiceAPI(requestActions)

    const optionData = [
        { value: "PENDING", label: "Pending" },
        { value: "LOADING", label: "loading" },
        { value: "LOADING_STARTED", label: "Loading Started" },
        { value: "LOADED", label: "Loading End" },
        { value: "COMPLETED", label: "Completed" },
        { value: "CANCELED", label: "Canceled" },
    ]

    const loadingTypeData = [
        { value: 1, label: "Pallet" },
        { value: 0, label: "Manual" },
    ]

    const init = async () => {
        const initData = await MultiRequest<initDataType>([
            DeliveryParams.listAllCompany(),
            LoadingServiceParams.listAllLoadingBay(),
            LoadingServiceParams.listAllLoadingDock(),
            LoadingServiceParams.listLoadingTeam(),
        ])(requestActions);

        setData(initData)
    }

    // const onDownload = async () => {

    //     try {
    //         await downloadReport<FormDataType>(requestActions)({
    //             reportName: 'export-truck-loading-time',
    //             fileName: `truck-loading-time-report-${moment().format()}.xls`,
    //             type: 'EXCEL',
    //             data: { ...form.getFieldsValue() }
    //         });
    //     } catch (error: any) {
    //         message.error(error.message || "Failed to generate report.")
    //     }
    // }

    const onDownload = async () => {

        try {
            const dataForm = await form.validateFields()
            await downloadGenericReport(requestActions)({
                fileName: `truck-loading-time-report-${moment().format()}.xls`,
                type: 'EXCEL',
                data: {
                    reportName: "export-truck-loading-time-1",
                    reportPath: "/Reports/qa/delivery",
                    data: [{ key: 'dateFrom', value: dataForm.dateRange[0] },
                    { key: 'dateTo', value: dataForm.dateRange[1] },
                    ...(dataForm.loadingTeamIds || []).map(it => ({ key: 'loadingTeamIds', value: it })),
                    ...(dataForm.statuses || []).map(it => ({ key: 'statuses', value: it })),
                    ...(dataForm.loadingBayIds || []).map(it => ({ key: 'loadingBayIds', value: it })),
                    ...(dataForm.sourceIds || []).map(it => ({ key: 'sourceIds', value: it })),
                    ...(dataForm.loadingDockIds || []).map(it => ({ key: 'loadingDockIds', value: it })),
                    ...(dataForm.driverIds || []).map(it => ({ key: 'driverIds', value: it })),
                    ...(dataForm.truckIds || []).map(it => ({ key: 'truckIds', value: it })),
                    ...(dataForm.loadingType || []).map(it => ({ key: 'loadingType', value: it })),
                    ]
                }
            });
        } catch (error: any) {
            message.error(error.message || "Failed to generate report.")
        }
    }

    useEffect(() => {
        rest.open && init()
        return () => {
            form.resetFields()
        }

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

    return <ModalForm
        form={form}
        loading={requestActions.request?.loading}
        title="WH - Loading time report" {...rest}
        onFinish={async () => await onDownload()}

    >
        <Flex flex={1} gap={10}>
            <Flex vertical flex={1}>
                <ProFormDateRangePicker name={"dateRange"} rules={[{ required: true }]} label="Date Range" />
                <ProFormSelect mode="multiple" name={'statuses'} label="Status" options={optionData} />
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
                <ProFormSelect showSearch request={({ keyWords }) => onTruckSearchHandler(keyWords)} name={"truckIds"} label="Truck" allowClear mode="multiple" />
            </Flex>

        </Flex>
        <ProFormSelect name={"loadingType"} label="Loading Type" allowClear mode="multiple" options={loadingTypeData} />

    </ModalForm>
}