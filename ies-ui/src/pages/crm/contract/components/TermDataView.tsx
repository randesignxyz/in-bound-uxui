import { ContractDetail } from "@/services/crm/data";
import { Col, Form, Input, Row, Space, Tag } from "antd";
import React from "react";
import { LayoutConfig } from "../model";

const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
};

interface Props {
    data?: ContractDetail,
    layoutConfig?: LayoutConfig;

}

const TermDataView: React.FC<Props> = ({ data, layoutConfig }) => {

    return (
        <Form>
            <Row gutter={10}>
                <Col flex='500px'>
                    {layoutConfig?.showExclusiveProduct &&
                        <Form.Item {...layout} label='Exclusive Product'>
                            {
                                data?.options.filter(i => i.type == 'EXCLUSIVE_PRODUCT').
                                    map(it => {
                                        return <Tag key={it.id}> {it.name} </Tag>
                                    })
                            }
                        </Form.Item>
                    }

                </Col>
                <Col flex='auto' />
            </Row>
            <Row>
                <Col flex='500px'>
                    <Form.Item  {...layout} label='Settlement Plan'>
                        <Input style={{ width: '200px' }} value={data?.settlementPlan.name} />
                    </Form.Item>
                </Col>
                <Col flex='auto' />
            </Row>


            {layoutConfig?.displayProduct && <Row gutter={10}>
                <Col flex='500px'>
                    <Form.Item  {...layout} label={"Customer Display Offer"}>
                        {
                            data?.options?.
                                filter(it => it.type == 'CUSTOMER_DISPLAY').
                                map(it => {
                                    return <Tag key={it.id}>{it.name}</Tag>
                                })
                        }
                    </Form.Item>
                </Col>
                <Col flex='auto' />
            </Row>}

            {layoutConfig?.displayProduct && <Row gutter={10}>
                <Col flex='500px'>
                    <Form.Item  {...layout} label='Display Product'>
                        {
                            data?.productDisplay.map(it => {
                                return (
                                    <Row key={it.id}>
                                        <Col>
                                            <Space key={`s-${it.id}`} align="baseline">
                                                <div>
                                                    SKU = {it.name},
                                                </div>
                                                <div>
                                                    Qty = {it.amount}
                                                </div>

                                            </Space>
                                        </Col>
                                    </Row>
                                )
                            })
                        }
                    </Form.Item>
                </Col>
                <Col flex='auto' />
            </Row>}

            {layoutConfig?.pos && <Row gutter={10}>
                <Col flex='500px'>
                    <Form.Item  {...layout} label='O.F.L offer'>
                        {
                            data?.options?.
                                filter(it => it.type == 'OFL_OFFER').
                                map(it => {
                                    return <Tag key={it.id}>{it.name}</Tag>
                                })
                        }
                    </Form.Item>
                </Col>
                <Col flex='auto' />
            </Row>}

            {layoutConfig?.showSponsor && <Row gutter={10}>
                <Col flex='500px'>
                    <Form.Item  {...layout} label='Monthly Sponsor'>
                        {
                            data?.itemSponsor.map((it, index) => {
                                return (
                                    <Row key={index}>
                                        <Col>
                                            <Space key={`s-${it.id}`} align="baseline" size='small'>
                                                <div>
                                                    SKU = {it.name},
                                                </div>
                                                <div>
                                                    Qty = {it.amount}
                                                </div>
                                            </Space>
                                        </Col>
                                    </Row>
                                )
                            })
                        }
                    </Form.Item>
                </Col>
                <Col flex='auto' />
            </Row>}

            <Row gutter={10}>
                <Col flex='500px'>
                    <Form.Item  {...layout} label='Offer Frequency'>
                        <Input style={{ width: '200px' }} value={data?.frequencySettlement.name} />
                    </Form.Item>
                </Col>
                <Col flex='auto' />
            </Row>

            <Row gutter={10}>
                <Col flex='500px'>
                    <Form.Item  {...layout} label='Settlement Plan'>
                        <Input style={{ width: '200px' }} value={data?.settlementPlan.name} />
                    </Form.Item>
                </Col>
                <Col flex='auto' />
            </Row>
            
        </Form>
    )
}

export default TermDataView;