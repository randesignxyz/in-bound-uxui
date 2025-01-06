import FormModalComp, { FormModalProps } from "@/components/FormModal";
import { AddressInfo } from "@/services/crm/data";
import { 
    ProForm, 
    ProFormCheckbox, 
    ProFormDependency, 
    ProFormDigit, 
    ProFormList, 
    ProFormSelect, 
    ProFormText, 
    ProFormTextArea 
} from "@ant-design/pro-components";
import { Col, Row } from "antd";
import { useForm } from "antd/es/form/Form";
import React, { useEffect, useState } from "react";
import ImageUploader from "@/pages/fleet/components/UploadImage";
import { LookupData } from "@/services/data";
import { CrmServices } from "../../services";
import { simpleRequestActions } from "@/services/model";

interface Props extends FormModalProps {
    onSave: (data: SpaceReserveItem) => void;
    data?: SpaceReserveItem;
    addressList?: AddressInfo[];
}

const SpaceReservedModalForm: React.FC<Props> = ({ onSave, addressList, data, ...props }) => {
    const requestActions = simpleRequestActions();
    const [form] = useForm<SpaceReserveItem>();
    const [dataLookup, setLookupData] = useState<LookupData[]>();
    const [fileList, setFileList] = useState<string[]>();
    useEffect(() => {
        props.open && form.resetFields()
        props.open && CrmServices.listLookupData(["SPACE_RESERVED_ATTRIBUTE"]).query(requestActions).then(o => setLookupData(o))
        props.open && data && form.setFieldsValue(data)
    }, [props.open]);

    return (
        <>
            <FormModalComp
                {...props}
                width="700px"
                title="Create Space Reserve"
                onSubmit={async () => {
                    const dataForm = await form.validateFields();
                    const addressName = addressList?.find(p => p.id = dataForm.addressId);
                    const entry = {
                        ...dataForm,
                        addressName: addressName?.address,
                        id: data?.id,
                        attribute: dataForm.attribute?.map(p => ({
                            ...p,
                            typeName: dataLookup?.find(t => t.id == p.typeId)?.name
                        })),
                        fileId: fileList
                    }
                    onSave(entry);
                }}
            >
                <ProForm
                    form={form}
                    submitter={false}
                >
                    <ProFormSelect
                        name={"addressId"}
                        showSearch
                        label="Space Reserved Address"
                        rules={[{ required: true }]}
                        options={addressList?.map(p => ({ label: p.address, value: p.id }))}
                    />
                    <ProFormText
                        name={"name"}
                        label="Name"
                    />
                    <Row gutter={12}>
                        <Col span={8}>
                            <ProFormDigit
                                name={"length"}
                                label="Space Length"
                                rules={[{ required: true }]}
                                addonAfter={"m"}
                            />
                        </Col>
                        <Col span={8}>
                            <ProFormDigit
                                name={"width"}
                                label="Space Width"
                                rules={[{ required: true }]}
                                addonAfter={"m"}
                            />
                        </Col>
                        <Col span={8}>
                            <ProFormDigit
                                name={"height"}
                                label="Space Height"
                                addonAfter={"m"}
                            />
                        </Col>
                    </Row>
                    <ProFormCheckbox
                        name={"hasAttribute"}
                        label="Has Properties"
                    />
                    <ProFormDependency name={["hasAttribute"]} dependencies={["hasAttribute"]}>
                        {({ hasAttribute }) => {
                            return hasAttribute && (
                                <>
                                    <ProFormList name={"attribute"}>
                                        <Row gutter={12}>
                                            <Col span={9}>
                                                <ProFormSelect
                                                    name={"typeId"}
                                                    label="Attribute Type"
                                                    width={"md"}
                                                    rules={[{ required: true }]}
                                                    options={dataLookup?.map(o => ({ label: o.name, value: o.id }))}
                                                />
                                            </Col>
                                            <Col span={9}>
                                                <ProFormText
                                                    name={"name"}
                                                    label="Attribute Name"
                                                />
                                            </Col>
                                            <Col span={6}>
                                                <ProFormDigit
                                                    name={"quantity"}
                                                    label="Quantity"
                                                    rules={[{ required: true }]}
                                                />
                                            </Col>
                                        </Row>
                                    </ProFormList>
                                </>
                            )
                        }}
                    </ProFormDependency>
                    <ProFormTextArea
                        name={"remark"}
                        label="Remark"
                    />
                    <ImageUploader
                        multiple
                        onSetFiles={(s) => setFileList(s.map(p => p.response))}
                    />
                </ProForm>
            </FormModalComp>
        </>
    )
}

export default SpaceReservedModalForm