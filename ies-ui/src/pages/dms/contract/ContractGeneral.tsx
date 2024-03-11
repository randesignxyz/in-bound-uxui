import { ProFormSelect, ProFormText, ProFormDigit, ProFormTextArea, ProFormDatePicker, ProFormCheckbox } from "@ant-design/pro-components";
import { Row, Col, Divider, Flex, Button, Input, Space, InputRef } from "antd";
import { CoreServiceAPI } from "../service";
import { DepartmentServiceAPI } from "../setting/components/department/service";
import { CompanySerivceAPI } from "./company/service";
import { simpleRequestActions } from "@/services/model";
import { PlusOutlined } from "@ant-design/icons";
import { useRef, useState } from "react";


interface Props {
    lookupData?: LookupDataDTO[]
}

export default ({ lookupData }: Props) => {
    const requestAction = simpleRequestActions();
    const inputRef = useRef<InputRef>(null);
    const [name, setName] = useState('');
    const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    };
    return (<>

        <Row gutter={12}>
            <Col span={8}>
                <ProFormSelect
                    name={"company"}
                    label="Company Name"
                    rules={[{ required: true }]}
                    showSearch
                    request={async (k: { keyWords: string }) => {
                        const data = await CompanySerivceAPI(requestAction).page({
                            criteria: {
                                searchValue: k.keyWords
                            }
                        });
                        return data.items.map(o => ({
                            value: o.id,
                            label: o.name,
                        }))
                    }}
                    fieldProps={{
                        dropdownRender: (menu) => {
                            return (
                                <>
                                    {menu}
                                    <Divider style={{ margin: '8px 0' }} />
                                    <Space style={{ padding: '0 8px 4px' }}>
                                        <Input
                                            placeholder="Please enter item"
                                            style={{
                                                width: "200px"
                                            }}
                                            ref={inputRef}
                                            value={name}
                                            onChange={onNameChange}
                                            onKeyDown={(e) => e.stopPropagation()}
                                        />
                                        <Button type="text" icon={<PlusOutlined />}
                                            onClick={() => {
                                                const stringName = inputRef.current?.input?.value
                                                const data = {
                                                    name: stringName,
                                                    companyNumber: stringName?.substring(0, 3).toUpperCase(),
                                                }
                                                CompanySerivceAPI(requestAction).save(data).then(s => {
                                                    setName('')
                                                });
                                            }}
                                        >
                                            Add
                                        </Button>
                                    </Space>
                                </>
                            )
                        }
                    }}
                />
            </Col>
            <Col span={8}>
                <ProFormSelect
                    label="Vendor Name"
                    name={"vendorName"}
                    rules={[{ required: true }]}
                    showSearch
                    debounceTime={500}
                    fieldProps={{
                        filterOption: false
                    }}
                    request={async (k: { keyWords: string }) => {
                        const data = await CoreServiceAPI(requestAction).pageVendor({
                            criteria: {
                                searchValue: k.keyWords || ""
                            }
                        });

                        return data.items?.map(o => ({
                            value: o.id,
                            label: o.name
                        }))
                    }}
                />
            </Col>
            <Col span={8}>
                <ProFormSelect
                    name={"department"}
                    label={"Department"}
                    showSearch
                    request={async (k: { keyWords: string }) => {
                        const data = await DepartmentServiceAPI(requestAction).page({
                            criteria: {
                                searchValue: k.keyWords
                            }
                        });
                        return data.items.map(o => ({
                            label: (
                                <Flex gap={3}><span>{o.name}</span>  <span style={{ color: "gray", fontSize: 12 }}>{o.description}</span></Flex>
                            ),
                            value: o.id
                        }))
                    }}
                />
            </Col>

        </Row>
        <Divider plain orientation="left">Contract Information</Divider>
        <Row gutter={12}>
            <Col span={6}>
                <ProFormText
                    name={"docNumber"}
                    label="Contract Number"
                    rules={[{ required: true, max: 20 }]}
                />
            </Col>
            <Col span={18}>
                <ProFormText
                    name={"docName"}
                    label="Contract Title"
                    rules={[{ required: true }]}
                />
            </Col>

            <Col span={6}>
                <ProFormSelect
                    name={"currency"}
                    rules={[{ required: true }]}
                    label="Currency"
                    initialValue={1001}
                    showSearch
                    request={async () => {
                        const data = await CoreServiceAPI(requestAction).listLookupData({
                            code: "CURRENCY"
                        });
                        return data.map(o => ({ value: o.id, label: o.name }))
                    }}
                />
            </Col>
            <Col span={6}>
                <ProFormSelect
                    label="Contract Type"
                    name={"contractType"}
                    showSearch
                    rules={[{ required: true }]}
                    request={async () => {
                        const data = await CoreServiceAPI(requestAction).listLookupData({
                            code: "TERMTYPE"
                        });
                        return data.map(o => ({ value: o.id, label: o.name }))
                    }}
                />
            </Col>
            <Col span={6}>
                <ProFormDigit
                    name={"contractValue"}
                    label="Contract Value"
                />
            </Col>
            <Col span={6}>
                <ProFormText
                    name={"gratis"}
                    label="Gratis"
                />
            </Col>
            <Col span={24}>
                <ProFormTextArea
                    name={"description"}
                    label="Description"
                />
            </Col>
        </Row>
        <Divider plain orientation="left">Term and Condition</Divider>
        <Row gutter={12}>
            <Col span={5}>
                <ProFormSelect
                    label="Type"
                    showSearch
                    name={"type"}
                    rules={[{ required: true }]}
                    options={lookupData?.filter(it => it.code === "TYPE").map(o => ({ value: o.id, label: o.name }))}
                />
            </Col>
            <Col span={5}>
                <ProFormDatePicker
                    name={"effectiveDate"}
                    label="Effective Date"
                    width={"md"}
                    rules={[{ required: true }]}
                />
            </Col>
            <Col span={5}>
                <ProFormDatePicker
                    name={"expiryDate"}
                    label="Expiry Date"
                    width={"md"}
                    rules={[{ required: true }]}
                />
            </Col>

            <Col span={6}>
                <ProFormDigit
                    name={"noticePeriod"}
                    initialValue={2}
                    label="Notice Peroid Day"
                    addonAfter={"days"}
                    rules={[{ required: true, }]}
                />
            </Col>

            <Col span={3}>
                <ProFormCheckbox
                    initialValue={true}
                    labelAlign="left"
                    label="Sen Email"
                    name={"sendEmail"}
                />
            </Col>
        </Row>
    </>)
}