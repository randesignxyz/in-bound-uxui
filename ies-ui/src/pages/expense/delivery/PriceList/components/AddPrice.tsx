import React, { useState, useEffect } from 'react'
import FormModalComp from '@/components/FormModal'
import { Card, Form, Select, DatePicker, Row, Col, message } from 'antd'
import _ from 'lodash'
import moment from 'moment';
import { LookupData, PageResult } from '@/components/core/comp';
import { domain } from '@/services/del-expense/data';


const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
};

const AddPrice: React.FC<{
    visible: boolean,
    pricePlaceList?: PageResult<domain.delivery.PricePlace>
    productTypeList: LookupData[],
    findPreviousPrice: (destCode: string, type: string, effectiveDate: moment.Moment, productTypeId: number) => domain.delivery.OutsourcePrice | undefined;
    savePrice: (destCode: string, uom: String, currency: string, type: string,  productTypeId: number, effectiveDate: moment.Moment, expiryDate?: moment.Moment, cb?: () => void) => void
    onHide: () => void
}> = ({ visible, pricePlaceList, productTypeList, findPreviousPrice, savePrice, onHide }) => {

    const [provinces, setProvinces] = useState<string[]>([])
    const [pricePlaceItem, setPricePlaceItem] = useState<domain.delivery.PricePlace[]>([])
    const [selectedProvince, setSelectedProvince] = useState<string>()
    const [effectiveDate, setEffectiveDate] = useState<moment.Moment>()
    const [destCode, setDestCode] = useState<string>()
    const [priceType, setPriceType] = useState<string>('DEFAULT')
    const [productTypeId, setProductTypeId ] = useState<number>()
    const [previousPrice, setPreviousPrice] = useState<domain.delivery.OutsourcePrice>()
    const [form] = Form.useForm()

    useEffect(() => {
        setProvinces(_.uniq(pricePlaceList?.data?.map(item => item.province)))
    }, [pricePlaceList])

    useEffect(() => {
        form.resetFields(['place'])
        setPricePlaceItem((pricePlaceList?.data || []).filter(item => item.province === selectedProvince))
    }, [selectedProvince])

    useEffect(() => {
        if (destCode && effectiveDate && priceType && productTypeId) {
            setPreviousPrice(findPreviousPrice(destCode, priceType, effectiveDate, productTypeId))
        } else {
            setPreviousPrice(undefined)
        }

    }, [destCode, effectiveDate, priceType, productTypeId])

    const checkOverlapExpiryDate = () => {
        return previousPrice && effectiveDate && effectiveDate.diff(moment(previousPrice.expiryDate || previousPrice.effectiveDate), "day") <= 0
    }
    const messages = () => {

        if (previousPrice && effectiveDate)
            return checkOverlapExpiryDate() ?
                `Effective date is overlap with previous  ${previousPrice.expiryDate ? 'expiry' : 'effective'}  date ${moment(previousPrice.expiryDate || previousPrice.effectiveDate).format("YYYY-MM-DD")}` :
                !previousPrice.expiryDate ? `Previous price will be set to expired on ${effectiveDate.clone().add(-1, 'day').format("YYYY-MM-DD")}` : ''
        else return undefined
    }

    const reset = () => {
        setSelectedProvince(undefined)
        setDestCode(undefined)
        setEffectiveDate(undefined)
        setPreviousPrice(undefined)
        form.resetFields()
    }

    return <FormModalComp
        title="Price Setup"
        visible={visible}
        onCancel={() => {
            reset()
            onHide()
        }}
        onResetForm={() => {
            reset()
        }}
        onSubmit={() => {
            form.validateFields().then(values => {
                const { place, uom, currency, type, productTypeId, effectiveDate, expiryDate } = values

                if (checkOverlapExpiryDate()) {
                    message.error({ content: 'Expiry date overlap' })
                    return
                }

                if (expiryDate && (effectiveDate as moment.Moment).diff(expiryDate as moment.Moment) > 0) {
                    message.error({ content: 'Expiry date must be after effective date.' })
                    return
                }

                savePrice(place, uom, currency, type, productTypeId, effectiveDate, expiryDate, () => {
                    message.info("Save successfully")
                    // reset()

                })
            })
        }}>
        <Card>
            <Form {...layout} form={form} initialValues={{
                uom: 'Case',
                currency: 'USD',
                type: 'DEFAULT'
            }}>
                <Row>
                    <Col span={12}>
                        <Form.Item name='province' label="Province">
                            <Select
                                allowClear
                                showSearch
                                onChange={(value) => setSelectedProvince(value.toString())}
                                options={provinces.map(item => {
                                    return {
                                        value: item,
                                        key: item
                                    }
                                })}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="place" label="Place" rules={[{ required: true }]}>
                            <Select showSearch
                                optionFilterProp="children"
                                onChange={value => setDestCode(value.toString())}
                                filterOption={(input, option: any) =>
                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }>
                                {
                                    (pricePlaceItem).map(it => {
                                        return <Select.Option value={it.code} key={it.code}>{it.description}</Select.Option>
                                    })
                                }
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={12}>
                        <Form.Item name='uom' label="UoM" rules={[{ required: true }]}>
                            <Select>
                                <Select.Option value="Case">
                                    Case
                                </Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name='currency' label="Currency" rules={[{ required: true }]}>
                            <Select>
                                <Select.Option value="USD">
                                    USD
                                </Select.Option>

                                <Select.Option value="RIEL">
                                    Riel
                                </Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={12}>
                        <Form.Item name='type' label="Type" rules={[{ required: true }]}>
                            <Select onChange={value => setPriceType(value.toString())}>
                                <Select.Option value="DEFAULT">
                                    Default
                                </Select.Option>

                                <Select.Option value="5T">
                                    5T Truck
                                </Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                    
                        <Form.Item name='productTypeId' label="Product Type" rules={[{ required: true }]}>
                            <Select  onChange={value => setProductTypeId(parseInt(value.toString()))}>
                                {
                                    productTypeList.map(item => {
                                        return <Select.Option value={item.value} key={item.value}>{item.display}</Select.Option>
                                    })
                                }
                            </Select>

                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={12}>
                        <Form.Item name='effectiveDate' label="Effective Date" rules={[{ required: true }]}>
                            <DatePicker onChange={value => {
                                setEffectiveDate(value || undefined)
                            }} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="expiryDate" label="Expiry Date">
                            <DatePicker />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Card>

        {messages() && <Card style={{ marginTop: '10px' }}>
            <div style={{ color: 'red' }}>   {
                messages()
            }
            </div>
        </Card>}
    </FormModalComp>
}

export default AddPrice