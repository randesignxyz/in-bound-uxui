import { ContractDetail } from "@/services/crm/data"
import ProForm from "@ant-design/pro-form";
import { Col, Form, Input, Row } from "antd"
import TextArea from "antd/lib/input/TextArea";
import React from "react"

const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
};

interface Props {
    data?: ContractDetail;
}

const CustomerInfo: React.FC<Props> = ({ data }) => {
    return <Form {...layout} >
        <ProForm.Group title='Info' />
        <Row gutter={10}>
            <Col flex='500px'>
                <Form.Item label='Customer No'>
                    <Input value={data?.customer.code || 'Not Assigned'} />
                </Form.Item>
                <Form.Item label='Customer'>
                    <Input value={data?.customer.name} />
                </Form.Item>
                <Form.Item label='Customer Type'>
                    <Input value={data?.customer.type?.name} />
                </Form.Item>
                <Form.Item label='Outlet Type'>
                    <Input value={data?.customer.outletType?.name} />
                </Form.Item>

            </Col>
            <Col flex='500px'>
                <Form.Item label='Channel Type'>
                    <Input value={[data?.customer.outletType?.mainChannel, data?.customer.outletType?.subChannel].join('/')} />
                </Form.Item>
                <Form.Item label='Sale Executive'>
                    <Input value={[data?.customer.sale?.code, data?.customer.sale?.name].filter(it => it).join('-')} />
                </Form.Item>
                <Form.Item label='Region'>
                    <Input value={data?.customer.region.name} />
                </Form.Item>
                <Form.Item label='Source Of Supply'>
                    <Input value={[data?.customer.supplySource?.code , data?.customer.supplySource?.name].filter(it => it).join('-')} />
                </Form.Item>



            </Col>
            <Col flex="Auto" />
        </Row>
        <ProForm.Group title='Contact' />
        <Row gutter={10}>
            <Col flex='500px'>
                <Form.Item label='Ownner Name'>
                    <Input />
                </Form.Item>
                <Form.Item label='Phone'>
                    <Input />
                </Form.Item>
                <Form.Item label='Email'>
                    <Input />
                </Form.Item>
            </Col>

        </Row>
        <ProForm.Group title='Address' />
        <Row gutter={10}>
            <Col flex='500px'>
                <Form.Item label='Address'>
                    <TextArea rows={3}
                        value={[
                            { name: 'Street', value: 'To be fixed' },
                            // { name: 'House', value: data?.customer?.address?.houseNo },
                            // { name: 'Village', value: data?.customer?.address?.village?.name },
                            // { name: 'Commune', value: data?.customer?.address?.commune.name },
                            // { name: 'District', value: data?.customer?.address?.district.name },
                            // { name: 'Province', value: data?.customer?.address?.province.name }
                        ]
                            .filter(it => it.value)
                            .map(it => `${it.name} ${it.value}`).join(", ")}
                    />
                </Form.Item>

            </Col>
        </Row>

    </Form>
}

export default CustomerInfo