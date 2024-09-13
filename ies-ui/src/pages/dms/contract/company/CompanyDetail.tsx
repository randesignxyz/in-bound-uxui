import { ActionType, DrawerForm, DrawerFormProps, ProDescriptions, ProFormText } from "@ant-design/pro-components"
import { Button, Card, Space, message } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "antd/es/form/Form";
import { CompanySerivceAPI } from "./service";
import { simpleRequestActions } from "@/services/model";

interface Props extends DrawerFormProps {
    data?: CompanyDTO;
    onClose: () => void;
}

const CompanyDetail: React.FC<Props> = ({ data, onClose, ...props }) => {
    const [editState, setEditState] = useState<any>(false);
    const [form] = useForm<CompanyEntryCreate>();
    const requestAction = simpleRequestActions();
    const [companyDTO, setCompnayDTO] = useState<CompanyDTO>();
    const actionRef = useRef<ActionType>();
    const getData = async () => {
        const record = await CompanySerivceAPI(requestAction).fetch(data?.id);
        setCompnayDTO(record);
    }
    useEffect(() => {
        setEditState(false);
        data && getData();
    }, [props.open]);
    return (
        <DrawerForm
            {...props}
            width={600}
            title={`Company Profile #${data?.companyNumber}`}
            form={form}
            layout="horizontal"
            labelCol={{ span: 8 }}
            submitter={editState}
            drawerProps={{
                onClose: onClose,
                extra: [

                    <Button
                        disabled={editState}
                        onClick={() => {
                            setEditState(true);
                            form.setFieldsValue({ ...companyDTO });
                        }}>Edit</Button>
                ]
            }}
            onFinish={async () => {
                const dataForm = await form.validateFields();
                const entryData = {
                    ...dataForm,
                    id: data?.id
                }
                CompanySerivceAPI(requestAction).save(entryData);
                message.success("Success!");
                getData();
                setEditState(false)
            }}
        >
            {
                !editState && companyDTO && (
                    <Space
                        direction="vertical"
                        size={20}
                    >
                        <Card>
                            <ProDescriptions
                                dataSource={companyDTO}
                                labelStyle={{
                                    width: 150
                                }}
                                actionRef={actionRef}
                                column={1}
                                columns={[
                                    {
                                        title: "Company Name",
                                        dataIndex: "name",
                                    },
                                    {
                                        title: "Company Number",
                                        dataIndex: "companyNumber"
                                    },
                                    {
                                        title: "Company Group",
                                        dataIndex: "groupId"
                                    },
                                    {
                                        title: "Company Tax ID",
                                        dataIndex: "taxId"
                                    },
                                    {
                                        title: "Website URL",
                                        dataIndex: "websiteUrl"
                                    },
                                    {
                                        title: "Company Type",
                                        dataIndex: "companyType"
                                    },
                                    {
                                        title: "Phone",
                                        dataIndex: "phone"
                                    },
                                    {
                                        title: "status",
                                        dataIndex: "status"
                                    },
                                ]}
                            />
                        </Card>
                        <Card>
                            <ProDescriptions
                                dataSource={companyDTO}
                                actionRef={actionRef}
                                title="Address"
                                column={1}
                                columns={[
                                    {
                                        title: "Address 1",
                                        dataIndex: "address1"
                                    },
                                    {
                                        title: "Address 2",
                                        dataIndex: "address2"
                                    },
                                    {
                                        title: "City",
                                        dataIndex: "city"
                                    },
                                    {
                                        title: "State",
                                        dataIndex: "state"
                                    },
                                    {
                                        title: "Postal Code",
                                        dataIndex: "postalCode"
                                    },
                                    {
                                        title: "Country",
                                        dataIndex: "country"
                                    },
                                ]}
                            />
                        </Card>
                    </Space>
                ) ||
                (
                    <Card>
                        <ProFormText
                            label="Company Name"
                            name={"name"}
                            rules={[{ required: true }]}
                        />
                        <ProFormText
                            label="Company Number"
                            name={"companyNumber"}
                            rules={[{ required: true }]}
                        />
                        <ProFormText
                            name={"taxId"}
                            label="Company TaxId"
                        />
                        <ProFormText
                            name={"websiteUrl"}
                            label="Website URL"
                        />
                        <ProFormText
                            name={"companyType"}
                            label="Company Type"
                        />
                        <ProFormText
                            name={"phone"}
                            label="Phone"
                        />
                        <ProFormText
                            label="Address 1"
                            name={"address1"}
                            rules={[{ required: true }]}
                        />
                        <ProFormText
                            name={"address2"}
                            label="Address 2"
                        />
                        <ProFormText
                            label="City"
                            name={"city"}
                        />
                        <ProFormText
                            label="State"
                            name={"state"}
                        />
                        <ProFormText
                            label="Postal Code"
                            name={"postalCode"}
                        />
                        <ProFormText
                            name={"country"}
                            label="Country"
                        />
                    </Card>
                )
            }
        </DrawerForm>
    )
}

export default CompanyDetail