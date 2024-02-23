import { ProFormSelect, ProFormText, ProFormDigit, ProFormTextArea, ProFormDatePicker, ProFormCheckbox } from "@ant-design/pro-components";
import { Row, Col, Divider, Flex, Button, Input, Space, InputRef } from "antd";
import { CoreServiceAPI } from "../service";
import { DepartmentServiceAPI } from "../setting/components/department/service";
import { CompanySerivceAPI } from "./company/service";
import { simpleRequestActions } from "@/services/model";
import { PlusOutlined } from "@ant-design/icons";
import { useRef, useState } from "react";


export default () => {
    const requestAction = simpleRequestActions();
    const inputRef = useRef<InputRef>(null);
    const [name, setName] = useState('');
    const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    };
    return (<>
        <Row gutter={12}>
            <Col span={12}>
                
            </Col>
        </Row>
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
                        dropdownRender:(menu)=>{

                            return (
                                <>
                                {menu}
                                <Divider style={{ margin: '8px 0' }} />
                                <Space style={{ padding: '0 8px 4px' }}>
                                  <Input
                                    placeholder="Please enter item"
                                    style={{
                                        width:"200px"
                                    }}
                                    ref={inputRef}
                                    value={name}
                                    onChange={onNameChange}
                                    onKeyDown={(e) => e.stopPropagation()}
                                  />
                                  <Button type="text" icon={<PlusOutlined />}
                                   onClick={()=>{
                                    const stringName = inputRef.current?.input?.value
                                    const data ={
                                        name:stringName,
                                        // companyNumber:stringName?.split(/\s/).reduce((response,word)=> response+=word.slice(0,1),'')
                                        companyNumber:stringName?.substring(0,3).toUpperCase(),
                                    }
                                        CompanySerivceAPI(requestAction).save(data).then(s=>{
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
                <ProFormText
                    label={"Customer/Vendor Name"}
                    name="vendorName"
                />
            </Col>
            <Col span={8}>
                <ProFormText
                    label={"Customer/Vendor Number"}
                    name="vendorNumber"
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
            <Col span={8}>
                <ProFormText
                    name={"gratis"}
                    label="Gratis"
                />
            </Col>
        </Row>
        <Divider plain orientation="left">Contract Information</Divider>
        <Row gutter={12}>
            <Col span={11}>
                <ProFormText
                    name={"docName"}
                    label="Contract Name"
                    rules={[{ required: true }]}
                />
            </Col>
            <Col span={5}>
                <ProFormText
                    name={"docNumber"}
                    label="Contract Number"
                    rules={[{ required: true, max:20 }]}
                />
            </Col>
            <Col span={8}>
                <ProFormSelect
                    name={"currency"}
                    rules={[{ required: true }]}
                    label="Currency"
                    initialValue={1001}
                    request={async () => {
                        const data = await CoreServiceAPI(requestAction).listLookupData({
                            code: "CURRENCY"
                        });
                        return data.map(o => ({ value: o.id, label: o.name }))
                    }}
                />
            </Col>
            <Col span={8}>
                <ProFormSelect
                    label="Contract Type"
                    name={"contractType"}
                    rules={[{ required: true }]}
                    request={async () => {
                        const data = await CoreServiceAPI(requestAction).listLookupData({
                            code: "TERMTYPE"
                        });
                        return data.map(o => ({ value: o.id, label: o.name }))
                    }}
                />
            </Col>
            <Col span={8}>
                <ProFormDigit
                    name={"contractValue"}
                    label="Contract Value"

                />
            </Col>
            <Col span={8}>
                <ProFormDigit
                    name={"purposeValue"}
                    label="Purpose Value"
                />
            </Col>
            <Col span={24}>
                <ProFormTextArea
                    name={"description"}
                    label="Description"
                />
            </Col>
        </Row>

        <Divider plain orientation="left">Term and Renewal</Divider>
        <Row gutter={16}>
            <Col span={6}>
                <ProFormDatePicker
                    name={"effectiveDate"}
                    label="Effective Date"
                    width={"md"}
                    rules={[{ required: true }]}
                />
            </Col>
            <Col span={6}>
                <ProFormDatePicker
                    name={"expiryDate"}
                    label="Expiry Date"
                    width={"md"}
                    rules={[{ required: true }]}
                />
            </Col>
            {/* <Col span={6}>
                <ProFormDatePicker
                    name={"currentExpDate"}
                    label="Current Expiry Date"
                    width={"md"}
                />
            </Col> */}
            <Col span={6}>
                <ProFormDigit
                    name={"renewalInterval"}
                    label="Renew Interval"
                    width={"md"}
                />
            </Col>
            <Col span={10}>
                <ProFormText
                    name={"noticePeriod"}
                    label="Notice Peroid"
                />
            </Col>
            <Col span={10}>
                <ProFormDatePicker
                    name={"noticeDate"}
                    label="Notice Date"
                    width={"md"}
                />
            </Col>
            <Col span={4}>
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