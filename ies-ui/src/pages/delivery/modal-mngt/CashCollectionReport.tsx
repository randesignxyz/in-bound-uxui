import { downloadReport } from "@/services/apiGateway";
import { DeliveryServiceAPI } from "@/services/delivery/services";
import { simpleRequestActions } from "@/services/model";
import { ModalForm, ModalFormProps, ProFormDateRangePicker, ProFormSelect } from "@ant-design/pro-components"
import { message } from "antd";
import { useForm } from "antd/es/form/Form";
import moment from "moment";
import { Moment } from "moment";

type FormDataType = {
    deliveryDate: Moment[];
    settledDate?: Moment[];
    status?: string[];
    driver?: number[];
    truck?: number[];
}

export default ({ ...rest }: ModalFormProps) => {

    const requestActions = simpleRequestActions();
    const deliveryApi = DeliveryServiceAPI(requestActions)

    const [form] = useForm<FormDataType>()

    const searchDrivers = async ({ keyWords }: { keyWords?: string }) => {
        const rs = await deliveryApi.listDriver({
            criteria: {
                searchValue: keyWords
            }
        })
        return rs.items.map(it => ({ label: `${it.firstName} - ${it.lastName}`, value: it.id }))

    }

    const searchTruck = async ({ keyWords }: { keyWords?: string }) => {
        const rs = await deliveryApi.listTruck({
            criteria: {
                searchValue: keyWords
            }
        })
        return rs.items.map(it => ({ label: it.licensePlate, value: it.id }))

    }

    return <ModalForm title="Cash Collection Report"
        {...rest} form={form}
        onFinish={async () => {
            const formData = await form.validateFields()
            try {
                await downloadReport<FormDataType>(requestActions)({
                    reportName: 'export-cash-collection',
                    fileName: `cash-collection-report-${moment().format()}.xls`,
                    type: 'EXCEL',
                    data: { ...formData }
                });
            } catch (error: any) {
                message.error(error.message || "Failed to generate report.")
            }
        }}
    >
        <ProFormDateRangePicker name={'deliveryDate'} label="Delivery Date" rules={[{ required: true }]} />
        <ProFormDateRangePicker name={'settledDate'} label="Settled Date" />
        <ProFormSelect name={"status"} label="Status" allowClear showSearch mode="multiple" options={[
            { label: 'Unsettled', value: 'UN_SETTLED' },
            { label: 'Hold', value: 'HOLD' },
            { label: 'Settled', value: 'SETTLED' },
        ]} />
        <ProFormSelect name={"driver"} label="Driver" allowClear showSearch mode="multiple" request={searchDrivers} />
        <ProFormSelect name={"truck"} label="Truck" allowClear showSearch mode="multiple" request={searchTruck} />
    </ModalForm>
}