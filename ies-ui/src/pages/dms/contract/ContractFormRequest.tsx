import FormModalComp, { FormModalProps } from "@/components/FormModal";
import { simpleRequestActions } from "@/services/model";
import { PlusOutlined } from "@ant-design/icons";
import { ProForm, ProFormDatePicker, ProFormSelect, ProFormText, ProFormTextArea } from "@ant-design/pro-components";
import { Button, Col, Divider, Input, InputRef, Row, Space } from "antd";
import { useForm } from "antd/es/form/Form";
import React, { useRef, useState } from "react";
import { CompanySerivceAPI } from "./company/service";
import { ContractRequestCreate } from "./data";


interface Props extends FormModalProps {
    onSave: (data: ContractRequestCreate) => void
}

const ContractFormRequest: React.FC<Props> = ({ onSave, ...props }) => {
    const [form] = useForm<ContractRequestCreate>();
    const requestAction = simpleRequestActions();
    const [name, setName] = useState('');
    const inputRef = useRef<InputRef>(null);

    const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    };

    return (
        <>
            <FormModalComp
                title="Request Contract "
                onSubmit={async () => {
                    const dataForm = await form.validateFields();
                   
                    const entry ={
                        ...dataForm,
                    }
                    onSave(dataForm);
                    console.log(dataForm);
                    
                }}
                
                {...props}
            >
                <ProForm
                    form={form}
                    submitter={false}
                >
                    <Row gutter={16}>
                        <Col span={24}>
                            <ProFormSelect
                                name={'companyName'}
                                label="Company Name"
                                rules={[{ required: true }]}
                                showSearch
                                request={async(k:{keyWords:string})=>{
                                    const data = await CompanySerivceAPI(requestAction).page({
                                        criteria:{
                                            searchValue:k.keyWords
                                        }
                                    });
                                    return data.items.map(o=>({
                                        value:o.id,
                                        label:o.name
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

                        <Col span={24}>
                            <ProFormTextArea
                                name={"description"}
                                label="Contract Description"
                                rules={[{ required: true }]}
                            />
                        </Col>

                        <Col span={12}>
                            <h4>Contract Information</h4>
                                <ProFormText
                                    name={"purpose"}
                                    label="Contract Purpose"
                                />
                                <ProFormDatePicker
                                    name={"estimateDate"}
                                    label="Estimate Start Date"
                                    width={"xl"}
                                />
                        </Col>

                        <Col span={12}>
                            <h4>Company Information</h4>
                                <ProFormText
                                    name={"address1"}
                                    label="Company Address Line 1"
                                />
                                <ProFormText
                                    name={"city"}
                                    label="Company City"
                                />
                                <ProFormText
                                    name={"state"}
                                    label="Company State"
                                />
                                <ProFormText
                                    name={"postalCode"}
                                    label="Company Postal Code"
                                />
                                {/* <ProFormText
                                    name={"manager"}
                                    label="Contract Manager"
                                /> */}
                        </Col>
                    </Row>



                </ProForm>

            </FormModalComp>
        </>
    )
}


export default ContractFormRequest