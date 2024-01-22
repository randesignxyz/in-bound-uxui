
import { UIBuilder } from "@/components/UIBuilder"
import { LookupDataItem } from "@/services/data"
import { ProFormDigit, ProFormSelect } from "@ant-design/pro-form"
import { Col, Form, Row } from "antd"
import React from "react"

const ForcastingEntryForm: React.FC<{
    itemList?: LookupDataItem[],
}> = ({itemList }) => {
    return (
        <Row>
            <Col flex='500px'>
                <Form.List name="forcasting">
                    {
                        UIBuilder.createFormListElements((field, index) => {
                            return <>
                                <ProFormSelect name={[field.name, 'itemId']}
                                    placeholder='Item (SKU)'
                                    width='sm'
                                    help={<span />}
                                    rules={[{ required: true }]}
                                    fieldKey={[field.fieldKey, 'itemId']}
                                    options={UIBuilder.toOption(itemList)}
                                />
                                <ProFormDigit
                                    placeholder="Qty"
                                    width='sm'
                                    help={<span />}
                                    rules={[{ required: true }]}
                                    name={[field.name, 'quantity']}
                                    fieldKey={[field.fieldKey, 'quantity']}
                                />
                            </>
                        }, () => true)
                    }
                </Form.List>
            </Col>
            <Col flex="Auto" />
        </Row>
    )
}

export default ForcastingEntryForm