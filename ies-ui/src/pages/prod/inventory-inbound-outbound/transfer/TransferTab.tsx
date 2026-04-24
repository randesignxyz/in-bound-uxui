import { ActionType, ProCard, ProList, ProTable } from '@ant-design/pro-components';
import { DrawerForm, DrawerFormProps } from '@ant-design/pro-form';
import moment from 'moment';
// import { ActivitiesItem, ProvidedItem, ProvidedList, TransferRequest, TransferRequestItem } from './data';
import { Button, Checkbox, Modal, message } from 'antd';
import { PlusOutlined, RedoOutlined } from '@ant-design/icons';
import { useEffect, useRef, useState } from 'react';
import { simpleRequestActions } from '@/services/model';
// import { TransferRequestServiceAPI } from '../../service';
// import AddTransfer from './AddTransfer';
// import TransferDetail from './TransferDetail';
import { formatDateTime } from '@/pages/utils';
import { TransferServiceAPI } from '@/pages/prod/inventory-inbound-outbound/transfer/service';
import TransferItemList from './TransferItemList';
import { ProvidedItem, ProvidedList } from '../request/data';
import ReceiveFormModal from './ReceiveFormModal';
import { TransferCreate } from './data';
import { useForm } from 'antd/lib/form/Form';
import RejectFormModal from './RejectFormModal';

interface Props extends DrawerFormProps {
    providedList: ProvidedList[];
    data?: any;
    refresh: (a: boolean) => void,
}

export default ({ providedList, data, refresh, ...rest }: Props) => {
    const actionRef = useRef<ActionType>();
    const [form] = useForm<TransferCreate>();
    const requestActions = simpleRequestActions();
    const services = TransferServiceAPI(requestActions);
    const [providedId, setProvidedId] = useState('')
    const [transferItemListOpen, setTransferItemListOpen] = useState<{ visible: boolean, provided: string, status?: string }>({ visible: false, provided: '' });
    const [providedStatus, setProvidedStatus] = useState('');
    const [transferIndex, setTransferIndex] = useState(0)
    const [itm, setItm] = useState<ProvidedItem[]>([])
    const [commentModal, setCommentModal] = useState<{
        visible: boolean;
    }>({
        visible: false
    });
    const [receiveModel, setReceiveModal] = useState<{
        visible: boolean;
    }>({
        visible: false
    });
    const [gettotal, setGetTotal] = useState<Record<string, number>>({});
    // const onSaveTransfer = (da: ProvidedItem[]) => {
    //     if (da.length == 0) {
    //         message.error('Please enter provide');
    //         return
    //     }
    //     Modal.confirm({
    //         title: 'Save Transfer record',
    //         content: 'are you sure',
    //         onOk: async () => {
    //             try {
    //                 await TransferRequestServiceAPI(requestActions).provided({
    //                     item: da,
    //                     status: '',
    //                     transfer_request_id: data.id,
    //                     transfer_request: data.transfer_id,
    //                     activities_name: 'Transfer',
    //                     action: `Add Transfer ${providedList.length + 1}`
    //                 })
    //                 setAddTransferOpen({ visible: false })
    //                 actionRef.current?.reloadAndRest?.();
    //                 refresh(true)
    //                 message.success('Success');
    //             } catch (e) {
    //                 message.error('Error');
    //             }
    //         },
    //     });
    // }

    // const getSap = async () => {
    //     try {
    //         const detail_sap = await TransferServiceAPI(requestActions).detail_sap(data.sapDocEntry);
    //         const detail = await services.detail(data.id);

    //         if (detail_sap?.transferRequests[0].transferRequestDetails && detail?.item) {
    //             // Convert the second list to a map for easy lookup
    //             const detailMap = new Map(detail.item.map(item => [item.item_code, item]));

    //             for (const sapItem of detail_sap?.transferRequests[0].transferRequestDetails) {
    //                 const detailItem = detailMap.get(sapItem.itemCode);
    //                 if (detailItem) {
    //                     // Compare quantity
    //                     if (sapItem.quantity !== parseInt(detailItem.quantity)) {
    //                         message.error(`Mismatch found for item code ${sapItem.itemCode} in IES ${detailItem.quantity} in SAP ${sapItem.quantity}!`);
    //                         return
    //                     }
    //                     setAddTransferOpen({ visible: true })
    //                 } else {
    //                     message.error(`Item code ${sapItem.itemCode} not found in the sap list!`);
    //                 }
    //             }
    //         } else {
    //             console.error("One of the lists is undefined or empty.");
    //         }
    //     } catch (error) {
    //         console.error('An error occurred:', error);
    //         message.error('Error');
    //     }
    // }

    useEffect(() => {
        const get = async () => {
            const transferId = Number(data?.id || 0);
            if (transferId <= 0) return;
            const transfer = await services.detail(transferId);
            const itemcode = (transfer.item || []).map((it) => it.item_code);
            for (let i = 0; i < itemcode.length; i++) {
                const it = await services.get_item_for_close({
                    item_code: itemcode[i],
                    transfer_request_id: transfer.id,
                    status: 'done'
                })
                const val = it.map((v) => parseFloat(v.received));
                let total = 0;
                for (let r = 0; r < val.length; r++) {
                    total += val[r];
                }
                setGetTotal((prevState) => ({
                    ...prevState,
                    [itemcode[i]]: total,
                }));
            }
        }
        get()
        refresh(false)
    }, [data?.id])

    return (
        <>
            <ProTable<ProvidedList>
                size="small"
                search={false}
                rowKey="id"
                editable={{
                    type: 'multiple',
                    // editableKeys: data?.item.map((it) => it.id),

                }}
                dataSource={providedList}
                options={{
                    density: false,
                    fullScreen: false,
                    reload: false,
                    setting: false,

                }}
                toolbar={{
                        actions: [
                            <Button
                                type="text"
                                icon={<RedoOutlined />}
                                onClick={() => refresh(true)}
                            />,
                            // Add other toolbar actions as needed
                        ]
                    }
                }
                pagination={false}
                columns={[
                    {
                        title: '',
                        width: 50,
                        render: (_, r, index) => (r.status == 'cancel' ? <Checkbox indeterminate disabled /> : r.status == 'done' ? <Checkbox defaultChecked disabled /> : <Checkbox defaultChecked={false} disabled />),
                    },
                    {
                        title: 'Transfer',
                        render: (_, r, index) =>
                            <a
                                onClick={() => { setTransferItemListOpen({ visible: true, provided: r.provided, status: r.status }), setProvidedId(r.provided), setProvidedStatus(r.status), setTransferIndex(index + 1) }}
                            >
                                {(`Transfer ${index + 1}`)}
                            </a>
                    },
                    {
                        title: 'Created By',
                        dataIndex: 'createdBy'
                    },
                    {
                        title: 'Created Date',
                        dataIndex: 'createdDate',
                        render: (_, r) => formatDateTime(moment(r.createdDate))
                    },
                    {
                        title: 'Verify By',
                        dataIndex: 'lastModifiedBy'
                    },
                    {
                        title: 'Verify Date',
                        dataIndex: 'lastModifiedDate',
                        render: (_, r) => (r.lastModifiedDate) == null ? "-" : formatDateTime(moment(r.lastModifiedDate))
                    },
                ]}
            />
            <TransferItemList
                provided={providedId}
                status={providedStatus}
                open={transferItemListOpen.visible}
                onCancel={() => setTransferItemListOpen({ visible: false, provided: '', status: '' })}
                type={data?.transfer_type}
                onSave={(itm) => (setReceiveModal({ visible: true }), setItm(itm))}
                onReject={() => setCommentModal({ visible: true })}
            />
            <ReceiveFormModal
                title="Receive Transfer"
                open={receiveModel.visible}
                onCancel={() => {
                    setReceiveModal({ visible: false })
                    setItm([])
                }}
                onSave={async (remarks) => {
                    try {
                        const updatedItems = itm?.map((it: any) => {
                            let itemReceive = it.received
                            let is_receive
                            const oldtotal = gettotal[it.item_code] || 0;
                            const total = oldtotal + parseFloat(it.received);
                            if (parseFloat(it.received) == 0) {
                                is_receive = '';
                            } else {
                                if (oldtotal + parseFloat(itemReceive) == parseFloat(it.quantity)) {
                                    is_receive = 'True';
                                } else {
                                    is_receive = 'False';
                                }
                            }
                            return { ...it, itemReceive, is_receive, total, oldtotal };
                        });
                        const allReceived = itm?.every((item: any) => {
                            const Quantity = parseFloat(item?.quantity);
                            const receivedQuantity = parseFloat(String(item?.received)) || 0;
                            return ((gettotal[item.item_code] + receivedQuantity) === Quantity);
                        });
                        let state
                        // console.log(allReceived)
                        if (allReceived) {
                            state = 'completed';
                        } else {
                            state = 'pending';
                        }

                        const dataForm = await form.validateFields();
                        const entity = {
                            ...dataForm,
                            id: data?.id,
                            items: updatedItems.map((v: any) => ({ ...v })),
                            transfer_type: data?.transfer_type,
                            business_unit: data?.business_unit,
                            transfer_request: data?.id,
                            posting_date: data?.posting_date,
                            due_date: data?.due_date,
                            from_warehouse: data.from_warehouse.map((v:any) => v.id).toLocaleString(),
                            to_warehouse: data.to_warehouse.map((v:any) => v.id).toLocaleString(),
                            line: data?.line,
                            shift: data?.shift,
                            status: state,
                        };
                        const res = {
                            transfer_request: data?.id,
                        };
                        const change = {
                            status: 'done',
                            remark: remarks,
                            provided: providedId,
                            transfer_request: data?.transfer_id,
                            activities_name: 'Receive',
                            action: `Receive Transfer ${transferIndex}`
                        }
                        await services.save(entity)
                        await services.receive_change(res)
                        await services.update_provided_status(change)
                        setReceiveModal({ visible: false })
                        setTransferItemListOpen({ visible: false, provided: '', status: '' })
                        setItm([])
                        refresh(true)
                        message.success('Success');
                    } catch (error) {
                        console.error('An error occurred:', error);
                        message.error('Error');
                    }
                }}
            />
            <RejectFormModal
                title="Reject Transfer"
                open={commentModal.visible}
                onCancel={() => {
                    setCommentModal({ visible: false });
                }}
                onSave={async (remarks) => {
                    try {
                        const change = {
                            status: 'cancel',
                            remark: remarks,
                            provided: providedId,
                            transfer_request: data?.transfer_id,
                            activities_name: 'Receive',
                            action: `Rejected Transfer ${transferIndex}`
                        }
                        await services.update_provided_status(change)
                        setTransferItemListOpen({ visible: false, provided: '', status: '' })
                        setCommentModal({ visible: false })
                        refresh(true)
                        message.success('Success');
                    } catch (error) {
                        console.error('An error occurred:', error);
                        message.error('Error');
                    }
                }}
            />
            {/* {addtransferOpen.visible == true ?
                <AddTransfer
                    open={addtransferOpen.visible}
                    data={data ?? {}}
                    transfer_request_id={data.id}
                    onCancel={() => setAddTransferOpen({ visible: false })}
                    onSave={onSaveTransfer}

                />
                : detailtransferOpen.visible == true ?
                    <TransferDetail
                        provided={providedId}
                        open={detailtransferOpen.visible}
                        onCancel={() => { setDeatilTransferOpen({ visible: false, provided: '' }), actionRef.current?.reloadAndRest?.(); }}
                    />
                    : <></>} */}
        </>

    );
};
