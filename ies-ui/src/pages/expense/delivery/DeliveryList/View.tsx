import React, { useEffect, useState } from 'react'
import { useParams, useModel, history } from "@umijs/max";
import { Card, Descriptions, Dropdown, Button, Modal, message, Spin, Space, Typography, Tag } from 'antd'
import moment from 'moment'
import { FileExcelOutlined, CaretDownOutlined, ReloadOutlined, CheckOutlined, FilePdfOutlined, StopOutlined, AuditOutlined, RotateLeftOutlined } from '@ant-design/icons'
import DeliveryCostSearch from './components/DeliveryCostSearch'
import InvoiceItemList from './components/InvoiceItemList'
import AddInvoiceForm from './components/AddInvoiceForm'
import ChangeLocation from './components/ChangeLocation'
import useModalVisible from '@/hooks/useModalVisible'
import PricePreview from './components/PricePreview'
import DeliveryCostHis from './components/DeliveryCostHis'
import SplitDelivery from './components/SplitDeliveryItem'
import { domain } from '@/services/del-expense/data'
import { downloadReport } from '@/services/apiGateway'
import { simpleRequestActions } from '@/services/model'
import Remarks from '@/components/remarks'
import { PageContainer } from '@ant-design/pro-components'
import { DataFormType } from './components/SettlementValidationComplete'
import SettlmentDNConfirm from './components/SettlementDNConfirm'
import SettlementValidationComplete from './components/SettlementValidationComplete'
import { useAccess } from '@umijs/max'
import { formatDate, formatDateTime, toReadable } from '@/pages/utils'
import { DlvExpenseServices } from './services'
import Checkbox from 'antd/lib/checkbox'

const ViewDelivery: React.FC<{}> = ({ }) => {
    type ModalName = 'changeLocation' | 'showPriceRateList' | 'showHistory' | 'splitDelivery'
    const requestActions = simpleRequestActions();

    const { deliveryDetail, fetchDeliveryDetail, submit, cancel, clearAll, complete, rework } = useModel('delivery')
    const [addInvoiceVisible, setAddInvoiceVisible] = useState(false)
    const [selectedInvoiceId, setSelectedInvoiceId] = useState<number>()
    const [downloading, setDownloading] = useState(false)
    const [invoiceItemVisible, setInvoiceItemVisible] = useState(false)
    const modalVisibility = useModalVisible<ModalName, domain.delivery.DeliveryCost>({
        changeLocation: false,
        showPriceRateList: false,
        showHistory: false,
        splitDelivery: false
    })
    const [forceUpdate, setForceUpdate] = useState<number>(0)

    const [modal, setModal] = useState<{
        type: 'cancel';
        required: boolean;
        cb: (remakrs: string) => void;
    }>()
    const [modalRework, setModalRework] = useState<{
        type: 'rework';
        required: boolean;
        cb: (remakrs: string) => void;
    }>()
    const [modalComplet, setModalComplet] = useState<{
        type: 'complete';
        required: boolean;
        cb: (docRef: string, remakrs: string, reconcile?: boolean) => void;
    }>()

    const access = useAccess()
    const params = useParams()
    const paramId = params['id']
    const id = paramId ? parseInt(paramId) : 0
    useEffect(() => {
        fetchDeliveryDetail(id)
        return () => {
            clearAll()
        }
    }, [])
    const { loading, saveSingleItem, removeInvoiceItem, fix } = useModel('delivery')

    /** Status      |  Action Button
     *------------------------------ 
     * isPending    -> Cancel | Submit
     * isSubmitted  -> Rework | Complete
     * isReworked   -> Cancel | Submit
     * isCanceled | isCompleted -> NA
     */
    const completed = deliveryDetail?.item.status !== 'PENDING' && deliveryDetail?.item.status !== 'REWORKED'
    const isPending = deliveryDetail?.item.status === 'PENDING'
    const isSubmitted = deliveryDetail?.item.status === 'SUBMITTED'
    const isCompleted = deliveryDetail?.item.status === 'COMPLETED'
    const isReworked = deliveryDetail?.item.status === 'REWORKED'

    const onSubmitHandler = (dataForm: DataFormType, cb: (v: boolean) => void) => {
        Modal.confirm({
            title: 'Submite Settlement',
            content: 'Are you sure to process?',
            onOk: async () => {
                try {
                    deliveryDetail && await submit(deliveryDetail?.item.id, dataForm.completedRemarks, () => {
                        message.success("Settlement successfully submitted")
                        fetchDeliveryDetail(id)
                        cb(true)
                    })
                } catch (error: any) {
                    message.error(error.message || 'Failed to claim.');
                }


            }
        })
    }

    const onCancelHandler = () => {
        setModal({
            type: 'cancel',
            required: true,
            cb(remakrs) {
                Modal.confirm({
                    title: "Cancel Settlement",
                    content: "Are you sure?",
                    onOk: async () => {
                        try {
                            deliveryDetail && await cancel(deliveryDetail?.item.id, remakrs)
                            message.success("Settlement is canceled.")
                            fetchDeliveryDetail(id)
                            setModal(undefined)
                        } catch (error: any) {
                            message.error(error?.message || 'Failed to cancel.')
                        }
                    }
                })
            },
        })
    }
    const onReworkHandler = () => {
        setModalRework({
            type: 'rework',
            required: true,
            cb(remakrs) {
                Modal.confirm({
                    title: "Rework Settlement",
                    content: "Are you sure?",
                    onOk: async () => {
                        try {
                            deliveryDetail && await rework(deliveryDetail?.item.id, remakrs)
                            message.success("Settlement is reworked.")
                            fetchDeliveryDetail(id)
                            setModalRework(undefined)
                        } catch (error: any) {
                            message.error(error?.message || 'Failed to rework.')
                        }
                    }
                })
            },
        })
    }
    //SKH-20230601
    const completedConfirmModal = async (docRef?: string, remakrs?: string, reconcile?: boolean) => {
        Modal.confirm({
            title: "Complete Settlement",
            content: "Are you sure?",
            onOk: async () => {
                try {
                    deliveryDetail && await complete(deliveryDetail?.item.id, docRef, remakrs, reconcile)
                    message.success("Settlement is conpleted.")
                    fetchDeliveryDetail(id)
                    setModalComplet(undefined)
                } catch (error: any) {
                    message.error(error?.message || 'Failed to confirm.')
                }
            }
        })
    }
    const onCompleteHandler = async () => {
        setModalComplet({
            type: 'complete',
            required: true,
            async cb(docRef, remakrs, reconcile) {
                try {
                    if (docRef && docRef != '') {
                        const rs = await DlvExpenseServices.findDeliveryNoteDocNumInSAP({ docNo: docRef }).query(requestActions)
                        if (rs && rs.docNum === docRef) {
                            completedConfirmModal(docRef, remakrs, reconcile)
                        }
                    } else {
                        completedConfirmModal(docRef, remakrs, reconcile)
                    }
                } catch (error: any) {
                    message.error(`DocNum ${docRef} not found, please try another one.`)
                }
            },
        })
    }

    /**
     * SKH-20230606: BACKUP
     const onSaveSingleInvoiceItemHandler = (item: domain.delivery.DeliveryCost, invoiceId?: number, comment?: string, cb?: () => void) => {
 
         const saveItem = {
             docEntry: item.docEntry,
             amount: item.baseCurrAmount,
             qty: item.qty,
             comment: comment
         } as domain.delivery.SaveInvoiceItem
         const invNo = deliveryDetail?.invoiceList.find(item => item.id == invoiceId)?.invoiceNo
         const findInvId = invoiceId || deliveryDetail?.invoiceList.map(item => item.id)[0]
         findInvId && saveSingleItem(findInvId, invNo || '', saveItem, () => {
             cb && cb()
         })
 
     }*/

    const onRemoveInvoiceItemHandler = (docEntry: number, cb?: () => void) => {
        removeInvoiceItem(docEntry, () => {
            cb?.()
        })
    }

    const onChangeLocationHandler = (item: domain.delivery.DeliveryCost) => {
        modalVisibility.show('changeLocation', item)
    }

    const onShowPriceLIstDetailHandler = (record: domain.delivery.DeliveryCost) => {
        modalVisibility.show('showPriceRateList', record)
    }

    const onShowHistoryHandler = (record: domain.delivery.DeliveryCost) => {
        modalVisibility.show('showHistory', record)
    }

    const onShowSplitDeliveryHandler = (record: domain.delivery.DeliveryCost) => {
        modalVisibility.show('splitDelivery', record)
    }

    const onFixedHandler = (docEntry: number, cb?: () => void) => {
        Modal.confirm({
            title: 'Fix transaction from SAP',
            content: 'Are you sure?',
            onOk: async () => {
                try {
                    await fix(docEntry, () => {
                        cb?.()
                    })
                    message.success("Fixed succesfully.")
                } catch (error: any) {
                    message.error(error.message || "Failed to fix.")
                }

            }
        })

    }


    return <PageContainer onBack={() => history.back()} breadcrumb={undefined} title={`Settlement`}
        subTitle={`${deliveryDetail?.item.settledCode} for ${deliveryDetail?.item.outsource}`}
        extra={
            <Space key="settlement_actions">
                {(isPending || isReworked) && access.canClaimDeliveryExpense && <Button danger key="0" icon={<StopOutlined />} onClick={onCancelHandler}>Cancel</Button>}
                {(isPending || isReworked) && access.canClaimDeliveryExpense && <SettlementValidationComplete onFinish={(formData, cb) => onSubmitHandler(formData, cb)} settlementId={deliveryDetail?.item.id} trigger={<Button type='primary' key="1" icon={<CheckOutlined />} >Submit</Button>} />}
                {isSubmitted && access.canConfirmDeliveryExpense && <Button key="0" icon={<RotateLeftOutlined />} onClick={onReworkHandler}>Rework</Button>}
                {isSubmitted && access.canConfirmDeliveryExpense && <Button type='primary' key="1" icon={<AuditOutlined />} onClick={onCompleteHandler}>Complete</Button>}
                <Button key="2" icon={<ReloadOutlined />} onClick={() => fetchDeliveryDetail(id)}>Refresh</Button>
                <Dropdown key="3" trigger={['click']} menu={{
                    items: [
                        {
                            label: ' Transportation Detail', key: 'export-del-expense', icon: <FileExcelOutlined />, onClick: () => {
                                return downloadReport<{ id: number; reportName: string; }>(requestActions)({
                                    reportName: 'export-del-expense',
                                    fileName: `Transport-Detail-${moment().format()}-${deliveryDetail?.item.outsource}.xls`,
                                    type: 'EXCEL',
                                    data: {
                                        id: deliveryDetail?.item.id,
                                        reportName: 'TransportDetail'
                                    }
                                });
                            }
                        },
                        {
                            label: ' Transportation Detail V1', key: 'TransportDetail_b', icon: <FileExcelOutlined />, onClick: () => {
                                return downloadReport<{ id: number; reportName: string; }>(requestActions)({
                                    reportName: 'export-del-expense',
                                    fileName: `Transport-Detail-v1-${moment().format()}-${deliveryDetail?.item.outsource}.xls`,
                                    type: 'EXCEL',
                                    data: {
                                        id: deliveryDetail?.item.id,
                                        reportName: 'TransportDetail_b'
                                    }
                                });
                            }
                        },
                        {
                            label: 'Transportation Vendor Invoice', key: 'TransportVendorInvoice', icon: <FileExcelOutlined />, onClick: () => {
                                return downloadReport<{ id: number; reportName: string; }>(requestActions)({
                                    reportName: 'export-del-expense',
                                    fileName: `Transport_Vendor_Invoice-${moment().format()}-${deliveryDetail?.item.outsource}.xls`,
                                    type: 'EXCEL',
                                    data: {
                                        id: deliveryDetail?.item.id,
                                        reportName: 'TransportVendorInvoice'
                                    }
                                });
                            }
                        },
                        {
                            label: 'Transportation Vendor Invoice (PDF)', key: 'TransportVendorInvoicePdf', icon: <FilePdfOutlined />, onClick: () => {
                                return downloadReport<{ id: number; reportName: string; }>(requestActions)({
                                    reportName: 'export-del-expense',
                                    fileName: `Transport_Vendor_Invoice-${moment().format()}-${deliveryDetail?.item.outsource}.pdf`,
                                    type: 'PDF',
                                    data: {
                                        id: deliveryDetail?.item.id,
                                        reportName: 'TransportVendorInvoice'
                                    }
                                });
                            }
                        },
                        {
                            label: 'Transportation Expense Report', key: 'TransportSummary', icon: <FileExcelOutlined />, onClick: () => {
                                return downloadReport<{ id: number; reportName: string; }>(requestActions)({
                                    reportName: 'export-del-expense',
                                    fileName: `Transport-Expense-Report-${moment().format()}-${deliveryDetail?.item.outsource}.xls`,
                                    type: 'EXCEL',
                                    data: {
                                        id: deliveryDetail?.item.id,
                                        reportName: 'TransportSummary'
                                    }
                                });
                            }
                        }
                    ]
                }} ><Button icon={<CaretDownOutlined />}>Export</Button></Dropdown>
            </Space>
        }
    >
        <Spin spinning={downloading || loading || (requestActions.request?.loading || false)}>
            <Card title="Delivery Settlement" key={'Delivery_Settlement'}
                size="small"
                style={{ marginBottom: '10px' }}>
                <Descriptions size='small'  >
                    <Descriptions.Item label="Outsource">{deliveryDetail?.item.outsource}</Descriptions.Item>
                    <Descriptions.Item label="Settled On">{deliveryDetail?.item.settledCode}</Descriptions.Item>
                    <Descriptions.Item label="Created Date">{deliveryDetail?.item.createdDate && formatDate(moment(deliveryDetail?.item.createdDate))}</Descriptions.Item>
                    <Descriptions.Item label="Prepared By">{deliveryDetail?.item.preparedBy}</Descriptions.Item>
                    <Descriptions.Item label="Total Amount">{deliveryDetail?.item.amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}</Descriptions.Item>
                    <Descriptions.Item label="Status" ><Tag><Typography.Text type={deliveryDetail?.item.status == 'CANCELED' ? 'danger' : deliveryDetail?.item.status == 'COMPLETED' || 'CONFIRMED' ? 'success' : 'secondary'}> {toReadable(deliveryDetail?.item.status)}</Typography.Text></Tag></Descriptions.Item>

                    {(isCompleted || isSubmitted) && <><Descriptions.Item label="Last Submitted By">{deliveryDetail?.item.submittedBy}</Descriptions.Item>
                        <Descriptions.Item label="Last Submitted Date">{deliveryDetail?.item.submittedDate && formatDateTime(moment(deliveryDetail?.item.submittedDate))}</Descriptions.Item>
                        <Descriptions.Item label="Last Remarks">{deliveryDetail?.item.submittedRemarks}</Descriptions.Item></>}
                    {(isCompleted || isSubmitted) && (deliveryDetail?.item.docRef !== null) && <><Descriptions.Item label="Last Completed By">{deliveryDetail?.item.completedBy}</Descriptions.Item>
                        <Descriptions.Item label="Last Completed Date">{deliveryDetail?.item.completedDate && formatDateTime(moment(deliveryDetail?.item.completedDate))}</Descriptions.Item>
                        <Descriptions.Item label="Doc Ref">{deliveryDetail?.item.docRef}</Descriptions.Item>
                        <Descriptions.Item label="Last Completed Remarks" span={2}>{deliveryDetail?.item.completedRemarks}</Descriptions.Item>
                        <Descriptions.Item label="Reconcile" > <Checkbox checked={deliveryDetail?.item.reconcile} /></Descriptions.Item></>}

                </Descriptions>
            </Card>

            <Card size="small" style={{ marginBottom: '10px' }} key={'Delivery_transactions'}>
                {deliveryDetail && <DeliveryCostSearch
                    search={false}
                    completed={completed}
                    claimedOnly={true}
                    onRemoveItem={onRemoveInvoiceItemHandler}
                    settleOn={deliveryDetail.item.settledOn}
                    delivery={deliveryDetail.item}
                    addedList={[]}
                    onShowPriceLIstDetail={onShowPriceLIstDetailHandler}
                    onShowHistory={onShowHistoryHandler}
                    onChangeLocation={onChangeLocationHandler}
                    onShowSplitDelivery={onShowSplitDeliveryHandler}
                    invoiceList={deliveryDetail.invoiceList}
                    onFix={onFixedHandler}
                    forceReload={forceUpdate}

                />}
            </Card>

            <AddInvoiceForm
                completed={completed}
                savedInvoice={() => fetchDeliveryDetail(id)}
                invoiceId={selectedInvoiceId}
                deliveryId={deliveryDetail?.item.id}
                visible={addInvoiceVisible}
                onCancel={() => {
                    setAddInvoiceVisible(false)
                    setSelectedInvoiceId(undefined)
                }} />

            <Modal title="Invoice Items"
                open={invoiceItemVisible}
                destroyOnClose
                onCancel={() => {
                    setSelectedInvoiceId(undefined)
                    setInvoiceItemVisible(false)
                }}
                footer={false}
                width='1400px'>
                {selectedInvoiceId && (<InvoiceItemList invoiceId={selectedInvoiceId} />)}

            </Modal>

            <PricePreview
                visible={modalVisibility.modalName.showPriceRateList}
                delivery={deliveryDetail?.item}
                docEntry={modalVisibility.data?.docEntry || 0}
                onCancel={() => modalVisibility.hide('showPriceRateList')}
            />

            <DeliveryCostHis
                visible={modalVisibility.modalName.showHistory}
                docEntry={modalVisibility.data?.docEntry || 0}
                onHide={() => modalVisibility.hide('showHistory')}
            />

            <ChangeLocation
                visible={modalVisibility.modalName.changeLocation}
                onComplete={() => {
                    modalVisibility.hide('changeLocation')
                    setForceUpdate(v => v + 1)
                }}
                tran={modalVisibility.data}
                onHide={() => modalVisibility.hide('changeLocation')}
            />
            {modalVisibility.data && <SplitDelivery
                visible={modalVisibility.modalName.splitDelivery}
                item={modalVisibility.data}
                onHide={() => modalVisibility.hide('splitDelivery')}
                onCompleted={() => {
                    modalVisibility.hide('splitDelivery')
                    setForceUpdate(v => v + 1)
                }}
            />}
        </Spin>

        {
            modal?.type === 'cancel' && <Remarks title='Cancel Settlement' open={true}
                onOpenChange={visible => !visible && setModal(undefined)}
                required={modal.required}
                onSave={modal.cb} />
        }
        {
            modalRework?.type === 'rework' && <Remarks title='Rework Settlement' open={true}
                onOpenChange={visible => !visible && setModalRework(undefined)}
                required={modalRework.required}
                onSave={modalRework.cb} />
        }
        {
            modalComplet?.type === 'complete' && <SettlmentDNConfirm open={true}
                onOpenChange={visible => !visible && setModalComplet(undefined)}
                required={modalComplet.required}
                onSave={modalComplet.cb} />
        }
    </PageContainer>
}

export default ViewDelivery
