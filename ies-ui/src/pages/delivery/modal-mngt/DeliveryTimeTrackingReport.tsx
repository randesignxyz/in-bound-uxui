import { downloadGenericReport, MultiRequest } from "@/services/apiGateway";
import { Company, DriverListItem, } from "@/services/delivery/data";
import { DeliveryParams } from "@/services/delivery/delivery-params";
import { DeliveryServiceAPI } from "@/services/delivery/services";
import { simpleRequestActions } from "@/services/model";
import { ModalForm, ModalFormProps, ProFormDateRangePicker, ProFormSelect } from "@ant-design/pro-components"
import { message } from "antd";
import { useForm } from "antd/es/form/Form";
import moment, { Moment } from "moment";
import { useEffect, useState } from "react";

type initDataType = {
    companyList: Company[];
}

type FormDataType = {
    dateRange: Moment[];
    sourceIds?: number[];
    driverIds?: number[];
}

export default ({ ...rest }: ModalFormProps) => {

    const [form] = useForm<FormDataType>()
    const requestActions = simpleRequestActions();
    const [data, setData] = useState<initDataType>()
    const [drivers, setDrivers] = useState<DriverListItem[]>()

    const deliveryApi = DeliveryServiceAPI(requestActions)

    const init = async () => {
        const initData = await MultiRequest<initDataType>([
            DeliveryParams.listAllCompany(),
        ])(requestActions);

        const rs = await deliveryApi.listDriver({
            criteria: {}
        })
        setData(initData)
        setDrivers(rs.items)
    }

    const onDriverHandler = async (keyWords?: string) => {
        const rs = await deliveryApi.listDriver({
            criteria: {
                searchValue: keyWords
            }
        })
        return rs.items.map(it => ({ value: it.id, label: `${it.firstName} ${it.lastName}` }))
    }


    const onDownload = async () => {
        try {
            const dataForm = await form.validateFields()
            await downloadGenericReport(requestActions)({
                fileName: `transportation-time-tracking-report-${moment().format()}.xls`,
                type: 'EXCEL',
                data: {
                    reportName: 'transportation-time-tracking-report',
                    reportPath: '/Reports/qa/delivery',
                    data: [
                        { key: 'dateFrom', value: dataForm.dateRange[0] },
                        { key: 'dateTo', value: dataForm.dateRange[1] },
                        ...(dataForm.sourceIds || []).map(it => ({ key: 'sourceIds', value: it })),
                        ...(dataForm.driverIds || []).map(it => ({ key: 'driverIds', value: it })),
                    ]
                }
            })
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

    return <ModalForm
        form={form}
        // loading={requestActions.request?.loading}
        title="Transportation Time Tracking Report" {...rest}
        onFinish={async () => await onDownload()}

    >
        <ProFormDateRangePicker name={"dateRange"} rules={[{ required: true }]} label="Date Range" />
        <ProFormSelect name={"sourceIds"} options={data?.companyList.map(it => ({ value: it.id, label: it.name }))} label="Sources" allowClear mode="multiple" />
        <ProFormSelect
            name={"driverIds"}
            options={drivers?.map(it => ({ value: it.id, label: `${it.firstName} ${it.lastName}` }))}
            request={({ keyWords }) => onDriverHandler(keyWords)}
            showSearch label="Driver"
            allowClear mode="multiple" />
    </ModalForm>
}