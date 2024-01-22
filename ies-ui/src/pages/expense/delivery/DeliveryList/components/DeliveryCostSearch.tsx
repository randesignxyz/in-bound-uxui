import React, { useState, useRef, useEffect } from 'react'
import { Table, Form, Button, Space, Checkbox, Row, Col, message, Spin, Modal } from 'antd'
import moment from 'moment'
import _ from 'lodash'
import ProTable, { ActionType, } from '@ant-design/pro-table'
import { searchDeliveryCost } from '@/models/delivery'
import useLookupMultiData from '@/hooks/useLookupMultiData'
import ItemPriceList from './ItemPriceList'
import { deliveryCostCols } from './DeliveryCostCols'
import { DeliveryModel } from '../../Model/model'
import { CheckOutlined, ClearOutlined, PlusOutlined } from '@ant-design/icons'
import MultiClaimedDialog from './MultiClaimedItemDialog'
import { domain } from '@/services/del-expense/data'
import { LookupData } from '@/components/core/comp'
import { PageContainer, ProCard, ProFormDateRangePicker, ProFormSelect, ProFormText } from '@ant-design/pro-components'
import DeliveryNoteFinder from './DeliveryNoteFinder'
import ActivityView from '../../components/ActivityView'
const DeliveryCostSearch: React.FC<{
    delivery: domain.delivery.DeliveryItem;
    completed: boolean
    settleOn: number;
    addedList: number[];
    search: boolean;
    claimedOnly?: Boolean;
    invoiceList?: domain.delivery.DeliveryInvoice[]
    onRemoveItem: (docEntry: number, cb?: () => void) => void;
    addSingleItem?: (item: domain.delivery.DeliveryCost, invoiceId?: number, comment?: string, cb?: () => void) => void;
    onChangeLocation?: (item: domain.delivery.DeliveryCost) => void;
    onShowPriceLIstDetail?: (record: domain.delivery.DeliveryCost) => void,
    onShowHistory?: (record: domain.delivery.DeliveryCost) => void;
    onShowSplitDelivery?: (record: domain.delivery.DeliveryCost) => void;
    onFix?: (docEntry: number, cb?: () => void) => void;
    forceReload?: number;
}> = ({
    delivery,
    completed,
    settleOn,
    addedList,
    search,
    claimedOnly,
    invoiceList,
    onRemoveItem,
    addSingleItem,
    onChangeLocation,
    onShowPriceLIstDetail,
    onShowHistory,
    onShowSplitDelivery,
    onFix,
    forceReload
}) => {
        
        const isDisable = (delivery.status === 'COMPLETED' || delivery.status ==='SUBMITTED' || delivery.status ==='CANCELED')    
        const defaultClaimedType = claimedOnly ? 'claimed' : 'unClaimed'
        const defaultSearchValue = {
            outsourceId: delivery.outsourceId,
            settledOn: moment(settleOn),
            endDate: moment(settleOn),
            claimedType: defaultClaimedType,
            settlementId: claimedOnly ? delivery.id : undefined
        } as searchDeliveryCost

        const loadRemoteData = useState<boolean>(true)
        const [params, setParams] = useState<searchDeliveryCost>(defaultSearchValue)
        const [paramUnclaim, setParamUnclaim] = useState<searchDeliveryCost>(defaultSearchValue)
        const [searchForm] = Form.useForm()

        const actionRef = useRef<ActionType>();
        const [summary, setSummary] = useState<domain.delivery.DeliveryCost>()
        const initData = useLookupMultiData<{
            dest_customer: LookupData[],
            ship_province: LookupData[]
        }>('SAP', ['dest_customer', 'ship_province'])

        const model = DeliveryModel()
        const [contentType, setContentType] = useState('dnClaimedList');

        const onMultiClaimed = ( docEntryList: number[] ) => {
            // //SKH-20230529: BACKUP
            // if(delivery.status == 'COMPLETED') {
            //     message.error("Settlement completed. Claim is not possible.")
            //     return
            // }           
            // Modal.confirm({
            //     title: 'Confirmation',
            //     content: 'Are you sure to proceed',
            //     onOk: async () => {
            //         const invoiceId = invoiceList?.find(_ => true)?.id
            //         if (!invoiceId) {
            //             message.error('No invoice found')
            //         } else {
            //             try {
            //                 await model.actions.multiClaimed(invoiceId, docEntryList)
            //                 model.modals.hideModal('dn-finder')
            //                 actionRef.current?.reloadAndRest?.()
            //                 message.success('DNs claimed successfully.')
            //             } catch (error:any) {
            //                 message.error(error.message || 'Failed to claim.');
            //             }
            //         }
            //     }
            // })
            onClaimed(docEntryList,()=>{ model.modals.hideModal('dn-finder');});
        } 

        const onClaimed = ( docEntryList: number[],cb?:()=>void ) => {
            if(delivery.status == 'COMPLETED') {
                message.error("Settlement completed. Claim is not possible.")
                return
            }   
                    
            Modal.confirm({
                title: 'Confirmation',
                content: 'Are you sure to proceed?',
                onOk: async () => {
                    const invoiceId = invoiceList?.find(_ => true)?.id
                    if (!invoiceId) {
                        message.error('No invoice found')
                    } else {
                        try {
                            await model.actions.multiClaimed(invoiceId, docEntryList)                            
                            cb?.();
                            setParams({...defaultSearchValue});
                            actionRef.current?.reloadAndRest?.()
                            message.success('DNs claimed successfully.')
                        } catch (error:any) {
                            message.error(error.message || 'Failed to claim.');
                        }
                    }
                }
            })
        } 
       const removeHandler= (docEntry: number, cb?: () => void)=>{
            onRemoveItem(docEntry,()=>{
                actionRef.current?.reload?.();
            });
        }
        useEffect(() => {
            initData.load()
        }, [])

        useEffect(() => {
            forceReload && forceReload > 0 && actionRef.current?.reloadAndRest?.()
        }, [forceReload])

        const onClaimedItemHandler = async (item: domain.delivery.DeliveryCost) => {

            const invoiceId = invoiceList?.find(item => true)?.id
            if (!invoiceId) {
                message.error('No invoice found')
            } else {
                await model.actions.claimed(invoiceId, {
                    docEntry: item.docEntry,
                    amount: item.baseCurrAmount || 0,
                    qty: item.qty,
                    // comment: comment
                })

                loadRemoteData[1](false)
                actionRef.current?.reload?.()
            }

        }

        const filter = (
            claimedType: string,
            startDate?: moment.Moment,
            endDate?: moment.Moment,
            shippingCode?: string,
            customerCode?: string,
            province?: string,
            licenseFlat?: string,
            cancelled?: boolean
        ) => {

            const data = {
                ...params,
                claimedType: claimedOnly ? 'claimed' : claimedType || defaultClaimedType,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
                shippingCode: shippingCode || undefined,
                customerCode: customerCode || undefined,
                province: province,
                licenseFlat: licenseFlat,
                cancelled: cancelled || undefined
            } as searchDeliveryCost

            setParams(data)
            actionRef.current?.reloadAndRest && actionRef.current?.reloadAndRest()
        }

        var timeout: NodeJS.Timeout

        return <PageContainer
        header={{
            title:'',
            ghost: true,
            breadcrumb: {
              items: [],
            },
        }}     
        tabList={[
            { tab: 'DN Claimed List', key: 'dnClaimedList', tabKey: 'dnClaimedList' },
            { tab: 'Activities', key: 'activities', tabKey: 'activities' }
        ]}
        onTabChange={setContentType}
        >
        {contentType == 'dnClaimedList' &&<Spin spinning={model.state.loading}>
            <ProCard extra={<Button icon={<ClearOutlined />}
                onClick={() => {
                    searchForm.resetFields()
                    setParams(defaultSearchValue)
                    actionRef.current?.reload?.()

                }}>Clear</Button>}
                boxShadow title='Filter' size='small' defaultCollapsed collapsible bordered={false} style={{ marginBottom: 20 }} >
                <Form form={searchForm} layout='vertical' onFieldsChange={(changedFields, allFields) => {
                    clearTimeout(timeout)
                    const shippingDate = allFields.find(it => it.name == 'shippingDate')
                    const shippingCode = allFields.find(it => it.name == 'shippingCode')
                    const customerCode = allFields.find(it => it.name == 'customerCode')
                    const province = allFields.find(it => it.name == 'shipProvince')
                    const claimed = allFields.find(it => it.name == 'claimed')
                    const cancelled = allFields.find(it => it.name == 'cancelled')
                    const licenseFlat = allFields.find(it => it.name == 'licenseFlat')

                    const [startDate, endDate] = shippingDate?.value || [undefined, undefined]

                    timeout = setTimeout(function () {
                        filter(claimed?.value ? 'all' : 'unClaimed', startDate, endDate, shippingCode?.value, customerCode?.value, province?.value, licenseFlat?.value, cancelled?.value)
                    }, 100)
                }}>
                    {!claimedOnly && <Row>
                        <Col flex='1'>
                            <Space>
                                <Form.Item valuePropName="checked" name='claimed'>
                                    <Checkbox >Including claimed</Checkbox>
                                </Form.Item>
                                <Form.Item valuePropName="checked" name='cancelled'>
                                    <Checkbox>Including Cancelled</Checkbox>
                                </Form.Item>
                            </Space>
                        </Col>
                    </Row>}
                    <Row>
                        <Col flex='1'>
                            <Space>
                                <ProFormDateRangePicker name='shippingDate' label='Shipping Date' />
                                <ProFormText name='shippingCode' label="DN #" placeholder="" />
                                <ProFormText name='licenseFlat' label='license Plate #' placeholder="license Plate #" />
                                <ProFormSelect fieldProps={{popupMatchSelectWidth: 250}} width={'lg'} showSearch allowClear label='Customer Code' name='customerCode' options={
                                    (initData.data?.dest_customer || []).map(it => ({ label: it.display, value: it.value }))
                                } />
                                <ProFormSelect fieldProps={{popupMatchSelectWidth: 250}} width={'md'} name='shipProvince' label='Province' showSearch allowClear options={(initData.data?.ship_province || []).map(it => ({ label: it.display, value: it.value }))} />
                            </Space>
                        </Col>
                    </Row>
                </Form>
            </ProCard>
            
            <ProTable<domain.delivery.DeliveryCost>
                columns={deliveryCostCols(
                    delivery,
                    isDisable,
                    addedList,
                    search,
                    actionRef,
                    removeHandler,
                    onClaimedItemHandler,                
                    onShowPriceLIstDetail,
                    addSingleItem,
                    onChangeLocation,
                    onShowHistory,
                    onShowSplitDelivery,
                    onFix
                )}
                toolBarRender={() => completed?[]:[
                //SKH-20230529: finding unclaimed DN(s) Equal or LessThan settledOn
                <Button type='primary' hidden={isDisable} onClick={() => {                           
                    setParamUnclaim({...defaultSearchValue, claimedType:"unClaimed"});
                    model.modals.showModal('claimedByProvince');
                    }} 
                    icon={<CheckOutlined/>}
                    > Claim All </Button>,
                <Button type='primary' hidden={isDisable}  onClick={() => model.modals.showModal('dn-finder')} icon={<PlusOutlined />}> Add DN(s) </Button>
                ]}
                // headerTitle='DN Claimed List'
                actionRef={actionRef}
                search={false}
                loading={false}
                bordered
                onLoad={data => {
                    loadRemoteData[1](true)
                    return data
                }}

                postData={(data: domain.delivery.DeliveryCost[]) => {
                    const summary = data.find(item => item.docNo === 'total')
                    setSummary(summary)
                    return data.filter(item => item.docNo !== 'total')
                }}
                request={async (page) => {
                    return await model.actions.findDeliveryNotes({ ...params }, loadRemoteData[0], {
                            page: (page.current || 1) - 1, pageSize: page.pageSize || 20
                        })
                }}
                expandable={{
                    expandedRowRender: (record => <ItemPriceList item={record} />),
                    rowExpandable: record => true,
                }}
                rowKey='docEntry'
                size='small'

                summary={_ => {
                    return <Table.Summary.Row style={{ textAlign: 'right', fontWeight: 'bold' }}>
                        <Table.Summary.Cell colSpan={8} index={1}>Total</Table.Summary.Cell>
                        <Table.Summary.Cell index={8}>{summary?.qty || 0}</Table.Summary.Cell>
                        <Table.Summary.Cell index={9}> {(summary?.baseCurrAmount || 0).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}</Table.Summary.Cell>
                        <Table.Summary.Cell index={10}></Table.Summary.Cell>
                    </Table.Summary.Row>

                }}
            />            
            <MultiClaimedDialog
                params = {paramUnclaim}
                open={model.modals.isVisible('claimedByProvince')}
                onCancel={() => {model.modals.hideModal('claimedByProvince')}}
                onOkButton={(data) => {                  
                    if(data && data.length>0){
                        onClaimed(data.map(r => r.docEntry),()=>{model.modals.hideModal('claimedByProvince');});
                    }
                }}

            />
            {model.modals.isVisible('dn-finder') && <DeliveryNoteFinder
                open={true}
                defaultSearchValue={defaultSearchValue}
                provinceList={initData.data?.ship_province || []}
                onOpenChange={visible => !visible && model.modals.hideModal('dn-finder')}
                findDeliveryNotes={model.actions.findDeliveryNotes}
                onRemoveItem = {onRemoveItem}
                addSingleItem = {addSingleItem}
                onChangeLocation = {onChangeLocation}
                onShowPriceLIstDetail = {onShowPriceLIstDetail}
                onShowHistory = {onShowHistory}
                onShowSplitDelivery = {onShowSplitDelivery}
                onFix={onFix}
                onClaim = {onMultiClaimed}
                forceReload={forceReload}
                
            />}           
        </Spin>}
        {contentType == 'activities' && (
            <ActivityView deliverySettlementId={delivery.id}/>
          )}
        </PageContainer>
    }

export default DeliveryCostSearch