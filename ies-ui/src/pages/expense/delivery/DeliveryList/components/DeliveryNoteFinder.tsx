import { LookupData } from '@/components/core/comp'
import { BulbOutlined, ClearOutlined, EditOutlined, EyeOutlined, SearchOutlined, SplitCellsOutlined } from '@ant-design/icons'
import {
    ActionType, ModalForm, ModalFormProps,
    ProCard, ProFormCheckbox, ProFormDateRangePicker,
    ProFormGroup, ProFormSelect, ProFormText, ProTable
} from "@ant-design/pro-components"
import { Alert, Button, message, Space, Table } from 'antd'
import moment, { Moment } from "moment"
import { Pagination } from "@/services/shared/data";
import { RequestData } from "@ant-design/pro-table";
import { DeliveryCost, domain } from '@/services/del-expense/data'
import { searchDeliveryCost } from '@/models/delivery'
import { useEffect, useRef, useState } from 'react'
import ItemPriceList from './ItemPriceList'
import styles from './style.less';
import { useForm } from 'antd/lib/form/Form'
import DropdownButton from 'antd/es/dropdown/dropdown-button'
import { simpleRequestActions } from '@/services/model'
import { fetchDataItemService } from '@/services/apiGateway'
import DeliveryDetail from './DeliveryDetail'
import { formatter } from '@/pages/utils'

type SearchType = {
    shippingDate?: Moment[];
    shippingCode?: string;
    customerCode?: string,
    province?: string,
    licenseFlat?: string,
    cancelled?: boolean,
    unclaimedOnly?: boolean,
}

export default ({
    defaultSearchValue,
    onRemoveItem,
    addSingleItem,
    onChangeLocation,
    onShowPriceLIstDetail,
    onShowSplitDelivery,
    onShowHistory,
    onFix,
    findDeliveryNotes,
    onClaim,
    provinceList,
    forceReload, ...rest
}: ModalFormProps<SearchType> & {
    provinceList: LookupData[];
    defaultSearchValue: searchDeliveryCost;
    onRemoveItem: (docEntry: number, cb?: () => void) => void;
    addSingleItem?: (item: domain.delivery.DeliveryCost, invoiceId?: number, comment?: string, cb?: () => void) => void;
    onChangeLocation?: (item: domain.delivery.DeliveryCost) => void;
    onShowPriceLIstDetail?: (record: domain.delivery.DeliveryCost) => void,
    onShowHistory?: (record: domain.delivery.DeliveryCost) => void;
    onShowSplitDelivery?: (record: domain.delivery.DeliveryCost) => void;
    onFix?: (docEntry: number) => void;
    findDeliveryNotes: (params: any, isRemote: boolean, pagination?: Pagination) => Promise<RequestData<domain.delivery.DeliveryCost>>;
    onClaim?: (docEntryList: number[]) => void
    forceReload?: number;
}) => {
    const requestActions = simpleRequestActions();
    var timeout: NodeJS.Timeout
    const [summary, setSummary] = useState<domain.delivery.DeliveryCost>()
    const [params, setParams] = useState<searchDeliveryCost>({
        ...defaultSearchValue,
        settlementId: undefined,
        startDate: defaultSearchValue.settledOn.startOf('month'),
        endDate: defaultSearchValue.settledOn.endOf('month'),
        claimedType: 'unClaimed'
    })
    const [dataNotFound, setDataNotFound] = useState(true)
    const [searching, setSearching] = useState(0)
    const actionRef = useRef<ActionType>();
    const [form] = useForm<SearchType>()
    const [selected, setSelected] = useState<domain.delivery.DeliveryCost[]>()
    const [deliveryDetail, setDeliveryDetail] = useState<DeliveryDetail>()
    
    const findDn = async (docNo: string) => {
        const rs = await fetchDataItemService<DeliveryDetail, { docNo: string; }>({
            actionName: 'fetch-delivery-note-detail',
            endpoint: 'SAP_SOURCE',
            payload: { docNo }
        }).query(requestActions)

        setDeliveryDetail(rs)
    }

    const reset = () => {

        setParams({
            ...defaultSearchValue,
            settlementId: undefined,
            startDate: defaultSearchValue.settledOn.startOf('month'),
            endDate: defaultSearchValue.settledOn.endOf('month'),
            claimedType: 'unClaimed'
        })

        form.resetFields()

        form.setFieldsValue({
            shippingDate: [
                moment(defaultSearchValue.settledOn.startOf('month').toDate()),
                moment(defaultSearchValue.settledOn.endOf('month').toDate()),
            ],
            unclaimedOnly: true
        })
        setSearching(v => v + 1)
    }

    useEffect(() => {
        if (!rest.open) return
        reset()
        return () => form.resetFields()
    }, [rest.open])
    useEffect(() => {
        forceReload && forceReload > 0 && actionRef.current?.reloadAndRest?.()
    }, [forceReload])

    return <ModalForm form={form}
        onFinish={async () => {
            if (!selected || selected.length == 0) {
                message.warning("No DNs selected to claim.")
                return
            }
            onClaim?.(selected.map(it => it.docEntry))
        }}
        submitter={{
            searchConfig: {
                submitText: "Claim All"
            }
        }}
         title='Delivery Finder' {...rest} width='90%'>
        <Space direction='vertical' style={{width: '100%'}}>
            <ProCard boxShadow actions={<Space>
                <Button onClick={() => {
                    reset()
                }} icon={<ClearOutlined />}>Clear</Button>
                <Button type='primary' onClick={async () => {
                   const formData = await form.validateFields()
                   const data = {
                       ...params,
                       claimedType: formData.unclaimedOnly ? 'unClaimed' : 'all',
                       startDate: formData.shippingDate?.[0],
                       endDate: formData.shippingDate?.[1],
                       shippingCode: formData.shippingCode,
                       customerCode: formData.customerCode,
                       province: formData.province,
                       licenseFlat: formData.licenseFlat,
                       settlementId: undefined,
                       cancelled: formData.cancelled
                   } as searchDeliveryCost
                   setParams(data)
                   actionRef.current?.reloadAndRest && actionRef.current?.reloadAndRest()
                }} icon={<SearchOutlined />}>Search</Button>
            </Space>
            }>
                <ProFormGroup size={'small'}>
                    <ProFormCheckbox name={'unclaimedOnly'} label="Unclaimed DN only" />
                    <ProFormDateRangePicker name='shippingDate' label='Shipping Date' />
                    <ProFormText name='shippingCode' label="DN #" placeholder="DN #" />
                    <ProFormText name='licenseFlat' label='license Plate #' placeholder="license Plate #" />
                    <ProFormText label='Customer Code' name='customerCode' />
                    <ProFormSelect name='province' label='Province' showSearch allowClear options={provinceList.map(it => ({ label: it.display, value: it.value }))} />
                </ProFormGroup>
               
            </ProCard>
            {
                    dataNotFound && (form.getFieldValue('shippingCode') || "") != "" &&
                    <Alert
                        type='warning' message={`DN ${form.getFieldValue('shippingCode')} not found, Do you want to find more in SAP?`}
                        action={<Button loading={requestActions.request?.loading} icon={<SearchOutlined />} type='link' onClick={async () => {
                            try {
                                await findDn(form.getFieldValue('shippingCode'))
                            } catch (error: any) {
                                message.error(error.message || 'Failed to fetch data.')
                            }

                        }}>Find</Button>}
                    />
                }
            <ProCard bordered >
                <ProTable<domain.delivery.DeliveryCost> actionRef={actionRef} search={false}
                    size='small'
                    request={async (page) => {
                        return await findDeliveryNotes({ ...params }, true, {
                            page: (page.current || 1) - 1, pageSize: page.pageSize || 20
                        })
                    }}
                    postData={(data: domain.delivery.DeliveryCost[]) => {
                        const list = data.filter(item => item.docNo !== 'total')
                        setDataNotFound(list.length == 0)
                        const summary = data.find(item => item.docNo === 'total')
                        setSummary(summary)
                        return list
                    }}
                    rowSelection={{

                        selections: ["SELECT_ALL", "SELECT_INVERT", "SELECT_NONE"],
                        selectedRowKeys: selected?.map(it => it.docEntry),
                        checkStrictly: true,
                        getCheckboxProps: (data) => ({ disabled: !!data.invoiceNo || !data.baseCurrAmount }),
                        onSelect(item, selected) {
                            if (selected) {
                                setSelected(v => ([...(v || []), item]))
                            } else {
                                setSelected(v => v?.filter(it => it.docEntry != item.docEntry))
                            }
                        },
                        onChange(_, selectedRows, info) {
                            if (info.type !== 'single') {
                                setSelected(selectedRows)
                            }
                        },
                    }}

                    expandable={{
                        expandedRowRender: (record => <ItemPriceList item={record} />),
                        rowExpandable: record => true,
                    }}
                    rowClassName={(data) => data.invoiceNo && styles.selectedItem}
                    options={{
                        setting: false,
                    }} columns={[{
                        title: 'Date',
                        dataIndex: 'docDate',
                        width: '100px',
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
                    },
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
                        title: 'Action',
                        render: (_, r) => !r.invoiceNo && <DropdownButton menu={{
                            items: [
                                { label: "View Price Rate", key: 'view_price_rate', icon: <EyeOutlined />, onClick: () => onShowPriceLIstDetail?.(r) },
                                { label: "Split DN", key: 'split-dn', icon: <SplitCellsOutlined />, onClick: () => onShowSplitDelivery?.(r) },
                                { label: "Fix Pricing", key: 'fix-pricing', icon: <BulbOutlined />, onClick: () => onFix?.(r.docEntry) },
                            ]
                        }} onClick={() => { onChangeLocation?.(r) }} ><EditOutlined /></DropdownButton>
                    }
                    ]}
                    rowKey='docEntry'

                    summary={_ => {
                        return <Table.Summary.Row style={{ textAlign: 'right', fontWeight: 'bold' }}>
                            <Table.Summary.Cell colSpan={9} index={1}>Total</Table.Summary.Cell>
                            <Table.Summary.Cell index={8}>{summary?.qty || 0}</Table.Summary.Cell>
                            <Table.Summary.Cell index={9}> {(summary?.baseCurrAmount || 0).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}</Table.Summary.Cell>
                            <Table.Summary.Cell index={10}></Table.Summary.Cell>
                        </Table.Summary.Row>

                    }}
                />
            </ProCard>
            {(selected?.length || 0) > 0 && <ProCard >
                <Alert banner type='warning' message={`${selected?.length} DN(s), total quantity =  ${selected?.map(it => it.qty).reduce((p, c) => p + c, 0)}  and total amount =  ${formatter.format(selected?.map(it => it.baseCurrAmount || 0).reduce((p, c) => p + c, 0) || 0)} `} />
            </ProCard>}
        </Space>
        {deliveryDetail && <DeliveryDetail
            open={!!deliveryDetail} data={deliveryDetail}
            onFix={onFix}
            onOpenChange={visible => !visible && setDeliveryDetail(undefined)} />}
    </ModalForm>
}