import FormModalComp, { FormModalProps } from "@/components/FormModal"
import { ProForm, ProFormDatePicker, ProFormDigit, ProFormSelect, ProFormText, ProFormTextArea } from "@ant-design/pro-components"
import { useForm } from "antd/lib/form/Form"
import { ContractDTO } from "./data"
import { Button, Col, Divider, Input, InputRef, Row, Space } from "antd"
import { CompanySerivceAPI } from "./company/service"
import { simpleRequestActions } from "@/services/model"
import { CoreServiceAPI } from "../service"
import { useEffect, useRef, useState } from "react"
import DocFileUploader from "../attachment/DocFileUploader"
import moment from "moment"
import { DepartmentServiceAPI } from "../setting/components/department/service"
import { Flex } from "antd/lib"
import { DocCreate } from "../documentation/data"
import { PlusOutlined } from "@ant-design/icons"

interface Props extends FormModalProps {
    onSave: (data: DocCreate) => void;
    data?: ContractDTO
}

const ContractFormEntry: React.FC<Props> = ({ onSave, data, ...props }) => {
    const requestAction = simpleRequestActions();
    const inputRef = useRef<InputRef>(null);
    const [name, setName] = useState('');
    const [form] = useForm<DocCreate>();
    const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    };
    useEffect(() => {
        props.open && form.resetFields();
        props.open && data && form.setFieldsValue({
            ...data,
          
        });

    }, [props.open]);

    return (<>
        <FormModalComp
            {...props}
            title="Contract Infomation"
            onSubmit={async () => {
                const dataForm = await form.validateFields();
                const entry:DocCreate = {
                    // ...dataForm,
                    id: data?.id,   
                    libraryId:1,
                    folderId:3,
                    term:{
                        ...dataForm
                    },
                    content:{...dataForm}
                }
                
                // onSave(entry);
            }}
        >
            <ProForm
                form={form}
                submitter={false}
            >
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
                                                width:"400px"
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
                                            Add New Company
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
                            name="vendorCode"
                        />
                    </Col>
                    <Col span={8}>
                        <ProFormSelect
                            name={"department"}
                            label={"Department"}
                            showSearch
                            request={async(k:{keyWords:string})=>{
                                const data = await DepartmentServiceAPI(requestAction).page({
                                    criteria:{
                                        searchValue:k.keyWords
                                    }
                                });

                                return data.items.map(o=>({
                                    label:(
                                        <Flex gap={3}><span>{o.name}</span>  <span style={{color:"gray", fontSize:12}}>{o.description}</span></Flex>
                                    ),
                                    value:o.id
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
                            rules={[{ required: true }]}
                        />
                    </Col>
                    <Col span={8}>
                        <ProFormSelect
                            name={"currency"}
                            rules={[{ required: true }]}
                            label="Currency"
                          
                            request={async () => {
                                const data = await CoreServiceAPI(requestAction).listLookupData({
                                    code: "CURRENCY"
                                });
                                return data.map(o => ({ value: o.id, label: o.name,selected:data[0].id}))
                            }}
                        />
                    </Col>
                    <Col span={8}>
                        <ProFormSelect
                            label="Contract Type"
                            name={"termType"}
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
                            rules={[{required:true}]}
                            initialValue={moment()}
                        />
                    </Col>
                    <Col span={6}>
                        <ProFormDatePicker
                            name={"originalExpDate"}
                            label="Original Expiry Date"
                            width={"md"}
                            rules={[{required:true}]}
                        />
                    </Col>
                    <Col span={6}>
                        <ProFormDatePicker
                            name={"currentExpDate"}
                            label="Current Expiry Date"
                            width={"md"}
                        />
                    </Col>
                    <Col span={6}>
                        <ProFormDigit
                            name={"renewalInterval"}
                            label="Renew Interval"
                            width={"md"}
                        />
                    </Col>
                    <Col span={12}>
                        <ProFormText
                            name={"noticePeriod"}
                            label="Notice Peroid"
                        />
                    </Col>
                    <Col span={12}>
                        <ProFormText
                            name={"noticeDate"}
                            label="Notice Date"
                        />
                    </Col>
                </Row>


                <DocFileUploader
                    required={true}
                    multi={false}
                    accept=".pdf,.docx,.doc,xlxs,.xls"
                />
            </ProForm>

        </FormModalComp>
    </>)
}

export default ContractFormEntry