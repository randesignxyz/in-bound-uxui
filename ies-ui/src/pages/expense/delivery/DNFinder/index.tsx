import React, { useState, useEffect, useRef } from 'react'
import { Card, Button, Space, Checkbox, Alert, message } from 'antd'
import moment, { Moment } from 'moment'
import { DeliveryNoteFinder } from '@/services/del-expense/data'
import { ActionType, PageContainer, ProCard, ProForm, ProFormCheckbox, ProFormDateRangePicker, ProFormGroup, ProFormSelect, ProFormText, ProTable } from '@ant-design/pro-components'
import { ClearOutlined, EyeOutlined, SearchOutlined, SelectOutlined } from '@ant-design/icons'
import useLookupMultiData from '@/hooks/useLookupMultiData'
import { LookupData } from '@/components/core/comp'
import { simpleRequestActions } from '@/services/model'
import { DlvExpenseServices } from '../DeliveryList/services'
import { toReadable } from '@/pages/utils'
import ItemPriceList from '../DeliveryList/components/ItemPriceList'
import { history } from "@umijs/max";
import { fetchDataItemService } from '@/services/apiGateway'
import DeliveryDetail from '../DeliveryList/components/DeliveryDetail'

type SearchType = {
    shippingDate?: Moment[];
    shippingCode?: string;
    licenseFlat?: string,
    customerCode?: string,
    province?: string,
    claimedType?: string,
    canceled?: boolean
}
type ParamDNCriteria = {
    startDate?: moment.Moment,
    endDate?: moment.Moment,
    shippingCode?: string,
    licenseFlat?: string,
    customerCode?: string,
    province?: string,
    claimedType?: 'claimed' | 'unClaimed' | 'all',
    canceled?: 'Y' | 'all'
}

const DeliveryPriceList: React.FC<{}> = ({ }) => {

    const initData = useLookupMultiData<{
        dest_customer: LookupData[],
        ship_province: LookupData[]
    }>('SAP', ['dest_customer', 'ship_province'])
    const [dataNotFound, setDataNotFound] = useState(true)
    const [deliveryDetail, setDeliveryDetail] = useState<DeliveryDetail>()
    const [searchForm] = ProForm.useForm<SearchType>()
    const actionRef = useRef<ActionType>();
    const provinceList = initData.data?.ship_province || []
    const [params, setParams] = useState<ParamDNCriteria>({})
    const requestActions = simpleRequestActions();

    const findDn = async (docNo: string) => {
        const rs = await fetchDataItemService<DeliveryDetail, { docNo: string; }>({
            actionName: 'fetch-delivery-note-detail',
            endpoint: 'SAP_SOURCE',
            payload: { docNo }
        }).query(requestActions)

        setDeliveryDetail(rs)
    }
    const gotoView = (id: number) => {
        history.push(`/expense/delivery/view/${id}`)
    }

    const reset = () => {
        searchForm.resetFields()
        searchForm.setFieldsValue({
            claimedType: 'all',
            canceled: false
        })
    }
    useEffect(() => {
        initData.load()
        reset()
    }, [])

    return <PageContainer onBack={() => history.back()} breadcrumb={undefined} title="Delivery Note Finder">
        <ProForm size='small' form={searchForm} layout='vertical'
            submitter={{
                render: (props, doms) => { return [] }
            }}
        >
            <ProCard size='small' boxShadow actions={<Space>
                <Button onClick={() => {
                    reset()
                }} icon={<ClearOutlined />}>Clear</Button>
                <Button type='primary' onClick={async () => {
                    const formData = await searchForm.validateFields()
                    const data = {
                        //    outsourceId:42,
                        startDate: formData.shippingDate?.[0],
                        endDate: formData.shippingDate?.[1],
                        shippingCode: formData.shippingCode,
                        licenseFlat: formData.licenseFlat,
                        customerCode: formData.customerCode,
                        province: formData.province,
                        claimedType: formData?.claimedType,
                        canceled: formData?.canceled ? 'Y' : 'all'
                    } as ParamDNCriteria
                    //    console.log('formdate',formData);
                    setParams(data)
                    actionRef.current?.reloadAndRest && actionRef.current?.reloadAndRest()
                }} icon={<SearchOutlined />}>Search</Button>
            </Space>
            }>
                <ProFormGroup size={'small'}>
                    <ProFormDateRangePicker name='shippingDate' label='Shipping Date' />
                    <ProFormText name='shippingCode' label="DN #" placeholder="DN #" />
                    <ProFormText name='licenseFlat' label='license Plate #' placeholder="license Plate #" />
                    <ProFormText label='Customer Code' name='customerCode' />
                    <ProFormSelect fieldProps={{ popupMatchSelectWidth: 250 }} name='province' label='Province' showSearch allowClear options={provinceList?.map(it => ({ label: it.display, value: it.value }))} />
                </ProFormGroup>
                <ProFormGroup size={'small'}>
                    <ProFormSelect fieldProps={{ popupMatchSelectWidth: 100 }} name={'claimedType'} label='Claimed Status' showSearch allowClear options={[{ label: "All", value: 'all' }, { label: "Claimed", value: 'claimed' }, { label: "Unclaimed", value: "unClaimed" }]} />
                    <ProFormCheckbox label='Canceled Only' name={'canceled'} />
                </ProFormGroup>
            </ProCard>
        </ProForm>
        {dataNotFound && (searchForm.getFieldValue('shippingCode') || "") != "" &&
            <Alert
                type='warning' message={`DN ${searchForm.getFieldValue('shippingCode')} not found, Do you want to find more in SAP?`}
                action={<Button loading={requestActions.request?.loading} icon={<SearchOutlined />} type='link' onClick={async () => {
                    try {
                        await findDn(searchForm.getFieldValue('shippingCode'))
                    } catch (error: any) {
                        message.error(error.message || 'Failed to fetch data.')
                    }

                }}>Find</Button>}
            />
        }
        <Card size='small' title='DN(s) List' style={{ marginTop: '5px' }}>
            <ProTable<DeliveryNoteFinder>
                actionRef={actionRef}
                search={false}
                size='small'
                options={{
                    fullScreen: false,
                    density: false,
                    reload: false,
                    setting: false,
                }}
                request={async (page) => {
                    const rs = await DlvExpenseServices.listFinderDNs(params, page.current || 0, page.pageSize || 20).query(requestActions)
                    return { data: rs.items.filter(it => it.docDate), success: true, total: rs.total }
                }}
                postData={(data: DeliveryNoteFinder[]) => {
                    setDataNotFound(data.length == 0)
                    return data
                }}
                expandable={{
                    expandedRowRender: (record => <ItemPriceList item={record} />),
                    rowExpandable: record => true,
                }}
                rowKey='docEntry'
                columns={[
                    {
                        title: 'Date',
                        dataIndex: 'docDate',
                        width: '110px',
                        hideInSearch: true,
                        render: (_, record) => moment(record.docDate).format('YYYY-MM-DD')
                    },
                    {
                        title: 'Shipping No',
                        dataIndex: 'docNo',
                        width: 120,
                        hideInSearch: true,

                    },
                    {
                        title: 'License Plate #',
                        dataIndex: 'licenseFlat',
                        width: 120,
                        hideInSearch: true,
                    },
                    {
                        title: 'Customer No',
                        dataIndex: 'customerNo',
                        width: 130,
                        hideInSearch: true,
                    },
                    {
                        title: 'Customer Name',
                        dataIndex: 'customerName',
                        width: 200,
                        hideInSearch: true,
                    },
                    {
                        title: 'Ship to',
                        dataIndex: 'shipTo',

                        hideInSearch: true,
                        render: (_, record) => `${record.province}/${record.district}`
                    },
                    /*
                    {
                        title: 'Price Place',
                        dataIndex: 'place',
                        width: 200,
                        hideInSearch: true,
                        render: (_, record) => {
                            return <span style={{ color: record.baseCurrAmount ? 'black' : 'red' }}>
                                {record.place}
                            </span>
                        }
                    },*/
                    {
                        title: 'Qty',
                        dataIndex: 'qty',
                        width: 100,
                        align: 'right',
                        hideInSearch: true,
                    },
                    {
                        title: 'Amount',
                        dataIndex: 'baseCurrAmount',
                        align: 'right',
                        width: 150,
                        hideInSearch: true,
                        render: (_, record) => record.baseCurrAmount && record.baseCurrAmount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')
                    },
                    {
                        title: 'Cancelled',
                        dataIndex: 'cancelled',
                        width: 100,
                        align: 'center',
                        hideInSearch: true,
                        render: (_, record) => record.cancelled == 'Y' && <Checkbox checked />
                    },
                    {
                        title: 'Outsource',
                        dataIndex: 'outsourceName',
                        width: 200,
                        hideInSearch: true,
                    },
                    {
                        title: 'Settled On',
                        dataIndex: 'settledOn',
                        width: 200,
                        hideInSearch: true,
                        render: (_, record) => {
                            return record?.settledId || 0 > 0 ? <Space size={0} style={{ padding: '0' }}>
                                <Button
                                    type="link"
                                    icon={<SelectOutlined />}
                                    onClick={async () => {
                                        window.open(`./view/${record?.settledId || 0}`, '_blank')?.focus();
                                    }} />
                                <Button style={{ padding: '0px' }} type="link" onClick={async () => { gotoView(record?.settledId || 0) }}>{record.settledOn}
                                </Button>
                            </Space> : ''


                        }
                    },
                    {
                        title: 'Settlement Status',
                        dataIndex: 'settleStatus',
                        width: 100,
                        hideInSearch: true,
                        render: (_, record) => toReadable(record.settleStatus)
                    },
                    {
                        title: 'Claimed By',
                        dataIndex: 'claimedBy',
                        width: 200,
                        hideInSearch: true,
                    },
                    {
                        title: 'Claimed Date',
                        dataIndex: 'claimedDate',
                        width: '200px',
                        hideInSearch: true,
                        render: (_, record) => (record.claimedDate ? moment(record.claimedDate).format('YYYY-MM-DD') : '')
                    }
                ]}

            />
        </Card>
        {deliveryDetail && <DeliveryDetail
            open={!!deliveryDetail} data={deliveryDetail}
            // onFix={onFix}
            onOpenChange={visible => !visible && setDeliveryDetail(undefined)} />}
    </PageContainer>
}

export default DeliveryPriceList