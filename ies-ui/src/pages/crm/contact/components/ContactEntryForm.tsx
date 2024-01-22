import { LookupData } from "@/services/data"
import { ProFormSelect, ProFormText, ProFormTextArea } from "@ant-design/pro-form"
import { Card, Col, Row } from "antd"

export default (data:{ lookupDataList?: LookupData[]}) => {
    return (
        <Card size='small' >
                <Row gutter={10}>
                    <Col flex='50%'>
                        <ProFormText rules={[{ required: true }]} label='Name (KH)' name='internalName' />
                        <ProFormText label='Name (Latin)' name='name' />
                        <ProFormText label='First Name' name='firstName' />
                        <ProFormText label='Last Name' name='lastName' />   
                        <ProFormSelect name='genderId' label='Gender' options= {data.lookupDataList?.map(it => ({
                            value: it.id,
                            label: it.name
                        }))} />

                    </Col>
                    <Col flex='50%'>
                        <ProFormSelect name='jobTitle' label='Job Title' options={[
                            { value: 'Ownder', label: 'Biz Owner' },
                            { value: 'Purchaser', label: 'Purchaser' }
                        ]} />
                        <ProFormText rules={[{ required: true }]} label='Phone1' name='phone1' />
                        <ProFormText label='Phone2' name='phone2' />
                        <ProFormText label='Phone3' name='phone3' />
                        <ProFormText label='Email' name='email' />

                    </Col>
                </Row>
                <ProFormTextArea name='remarks' label='Remarks' />
            </Card>
    )
}

