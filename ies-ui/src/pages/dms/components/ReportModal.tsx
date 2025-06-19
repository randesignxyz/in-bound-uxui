import { getUrlReporting } from "@/pages/ReportUrl";
import { downloadGenericReport } from "@/services/apiGateway";
import { simpleRequestActions } from "@/services/model";
import { DrawerForm, DrawerFormProps, ModalForm, ModalFormProps, ProForm, ProFormDatePicker, ProFormDateRangePicker, ProFormSelect } from "@ant-design/pro-components";
import { message, Space } from "antd";
import { useForm } from "antd/es/form/Form";
import moment from "moment";
import React from "react";
import { DocumentServiceAPI } from "../documentation/service";
import { DepartmentServiceAPI } from "../setting/components/department/service";

interface Props extends ModalFormProps {
    onDownload: (data: any) => void
}

const ReportModal: React.FC<Props> = ({ onDownload, ...props }) => {
    const [form] = useForm()
    const requestActions = simpleRequestActions();
    const onDowloadReportHandler = async (data: any) => {

    }
    return (
        <>
            <ModalForm
                {...props}
                width={500}
                title={"Export"}
                form={form}
                onFinish={async () => {
                    const dataForm = await form.validateFields();
                    onDownload(dataForm)

                }}
            >
                <ProFormDateRangePicker
                    name="dates"
                    label={["From", "To"]}
                />
                <ProFormSelect
                    label={"Document Expire"}
                    name={"expired"}
                    options={[
                        {
                            label: "Expire Soon",
                            value: "expiredSoon"
                        },
                        {
                            label: "Expired",
                            value: "expired"
                        },
                    ]}
                />
                <ProFormSelect
                    label={"Type"}
                    name="type"
                    options={[
                        {
                            value: "GENERAL",
                            label: "Document"
                        },
                        {
                            value: "PURCHASE",
                            label: "Purchase Contract"
                        },
                        {
                            value: "SALES",
                            label: "Sales Contract"
                        }
                    ]}
                />
                <ProFormSelect
                    label={"Category"}
                    name="category"
                    options={[
                        {
                            value: "GENERAL",
                            label: "General"
                        },
                        {
                            value: "LEGAL",
                            label: "Legal"
                        },
                        {
                            value: "PURCHASE",
                            label: "Purchase"
                        }
                    ]}
                />
                <ProFormSelect
                        name={"department"}
                        label="Department"
                        showSearch
                        fieldProps={{
                            filterOption: false
                        }}
                        request={async (k: { keyWords: string }) => {
                            const data = await DepartmentServiceAPI(requestActions).page({
                                criteria: {
                                    searchValue: k.keyWords || ""
                                }
                            });
                            return data.items?.map(v => ({ label: <Space size={"small"}><span>{v.name}</span><span style={{ color: "gray" }}>{v.description}</span></Space>, value: v.id }))
                        }}
                    />

            </ModalForm>
        </>
    )
}

export default ReportModal