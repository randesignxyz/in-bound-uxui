import { formatDate, formatDateTime } from '@/pages/utils';
import { ActionType, ProCard, ProForm, ProFormDatePicker, ProFormSelect, ProFormText, ProFormTextArea, ProList, ProTable } from '@ant-design/pro-components';
import { DrawerForm, DrawerFormProps } from '@ant-design/pro-form';
import { Button, Card, Checkbox, Col, Descriptions, Divider, Row, Space, Spin, Tabs, Typography, message } from 'antd';
import { useEffect, useRef, useState } from 'react';
import BreadCrumbCom from '@/pages/prod/shared/BreadCrumbCom';
import { ProdPaths } from '@/pages/prod';
import { simpleRequestActions } from '@/services/model';
import { TransferRequestServiceAPI } from '../request/service';
import { TransferServiceAPI } from './service';
import { ProvidedItem, ProvidedList } from '../request/data';
import {
  ReceiveStatusChange,
  SAPCloseDoc,
  Transfer,
  TransferAdvanceParams,
  TransferCreate,
  TransferItem,
} from './data';
import { useForm } from 'antd/lib/form/Form';
import CloseTransferFormModal from './CloseTransferFormModal';
import { useAccess } from '@@/exports';
import TransferTab from './TransferTab';
import ActivitiesTab from './ActivitiesTab';

interface Props extends DrawerFormProps {
    // data?: TransferRequest;
    id?: string
    reload?: (id: number) => Promise<void>;
    onEdit?: () => void;
    onAdd?: () => void;
}

export default ({ id, ...rest }: Props) => {
    const [form] = useForm<TransferCreate>();
    const actionRef = useRef<ActionType>();
    const access = useAccess();
    const { Text } = Typography;
    const requestActions = simpleRequestActions();
    const services = TransferServiceAPI(requestActions);
    const [providedStatus, setProvidedStatus] = useState('');
    const [getToWarehouse, setGetToWarehouse] = useState<number[]>([]);
    const [getFromWarehouse, setGetFromWarehouse] = useState<number[]>([]);
    const [getTransfer, setGetTransfer] = useState<Transfer>();
    const [providedList, setProvidedList] = useState<ProvidedList[]>([])
    const [providedId, setProvidedId] = useState('')
    const [transferItemListOpen, setTransferItemListOpen] = useState<{ visible: boolean, provided: string, status?: string }>({ visible: false, provided: '' });
    const [refresh, setRefresh] = useState(false)
    const [getChange, setGetChange] = useState()
    const [transferIndex, setTransferIndex] = useState(0)
    const [itm, setItm] = useState<ProvidedItem[]>([])
    const [items, setItems] = useState<TransferItem[]>([]);
    const [closeModal, setCloseModal] = useState(false)
    const [advanceSearchParams, setAdvanceSearchParams] = useState<TransferAdvanceParams>({
        transfer_type: 'ALL',
        business_unit: 'ALL',
    });
    const [gettotal, setGetTotal] = useState<Record<string, number>>({});
    const routes = [
        {
            path: ProdPaths.prod,
            label: 'Prod',
        },
        {
            path: `${ProdPaths.inventoryInboundOutbound}/list`,
            label: 'Inventory Inbound Outbound',
        },
        {
            path: `${ProdPaths.inventoryOutboundTransfer}/list`,
            label: 'Inventory Outbound Transfer',
        },
        {
            path: '',
            label: 'Create',
        },
    ];
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

    useEffect(() => {
        const get = async () => {
            const requestId = Number(getChange || 0);
            if (requestId <= 0) {
                setGetTransfer(undefined);
                setProvidedList([]);
                return;
            }
            setGetTotal({});
            const transfer = await services.detail(requestId);
            const rs: ProvidedList[] = await TransferRequestServiceAPI(requestActions).get_provided_list(String(requestId))
            const itemcode = (transfer.item || []).map((it) => it.item_code);
            for (let i = 0; i < itemcode.length; i++) {
                const it: ProvidedItem[] = await services.get_item_for_close({
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
            setProvidedList(rs)
            setGetTransfer(transfer);
            setGetToWarehouse(transfer.to_warehouse.map((v) => v.id));
            setGetFromWarehouse(transfer.from_warehouse.map((v) => v.id));
            // setGetTransfer(transfer)
        }
        get()
        setRefresh(false)
    }, [getChange, refresh == true])

    useEffect(() => {
        const updatedItems: TransferItem[] = (getTransfer?.item ?? []).map((i) => {
            const total = gettotal[i.item_code] || 0

            return { ...i, total: String(total) }
        })
        setItems(updatedItems)
    }, [getTransfer, gettotal]);

    return (
        <>
            <Row justify="space-between">
                <>
                    <BreadCrumbCom separator=">" routes={routes} />
                    {(getChange && (access.canAccessTransferProductionItem || access.canAccessAll) && getTransfer?.transfer_type == 'PM/RM') ?
                        <Button
                            //   type="danger"
                            onClick={() => setCloseModal(true)}
                            style={{
                                cursor: 'pointer',
                                color: 'red',
                                borderColor: 'red',
                                transition: 'color 0.3s ease',
                            }}
                        >
                            Cancel Transfer / Close Transfer
                        </Button>
                        : (getChange && (access.canAccessTransferWarehouseItem || access.canAccessAll) && getTransfer?.transfer_type == 'FG') ?
                            <Button
                                //   type="danger"
                                onClick={() => setCloseModal(true)}
                                style={{
                                    cursor: 'pointer',
                                    color: 'red',
                                    borderColor: 'red',
                                    transition: 'color 0.3s ease',
                                }}
                            >
                                Cancel Transfer / Close Transfer
                            </Button>
                            : <></>}
                </>
            </Row>
            <ProForm submitter={false} form={form} style={{ marginTop: 20 }}>
                <Card size="small">
                    <Row gutter={6}>
                        <Col span={8}>
                            <ProFormSelect
                                labelAlign="left"
                                label="Request ID"
                                name="id"
                                rules={[{ required: true }]}
                                showSearch={true}
                                debounceTime={500}
                                // initialValue={data?.id}
                                request={async ({ keyWords }) => {
                                    const data = await services.pageFG({
                                        criteria: { searchValue: keyWords, advanceSearch: advanceSearchParams },
                                        pagination: { pageSize: 100 },
                                    });

                                    return data.items.map((obj) => ({
                                        value: obj.id,
                                        label: `PDR-${String(obj.id).padStart(6, '0')}`+ ` (${obj.transfer_type})`,
                                    }));
                                }}
                                fieldProps={{
                                    onChange: async (e: any) => {
                                        setGetChange(e)
                                    },
                                }}
                            />
                        </Col>
                        <Col span={8}>
                            <ProFormText
                                disabled
                                hasFeedback={false}
                                label="Type"
                                name={'transfer_type'}
                                fieldProps={{
                                    value: getTransfer?.transfer_type,
                                }}
                            />
                        </Col>
                        <Col span={4}>
                            <ProFormText
                                disabled
                                hasFeedback={false}
                                label="Line"
                                name={'line'}
                                fieldProps={{
                                    value: getTransfer?.line,
                                }}
                            />
                        </Col>
                        <Col span={4}>
                            <ProFormText
                                disabled
                                hasFeedback={false}
                                label="Shift"
                                name={'shift'}
                                fieldProps={{
                                    value: getTransfer?.shift,
                                }}
                            />
                        </Col>
                        <Col span={4}>
                            <ProFormText
                                disabled
                                hasFeedback={false}
                                label="From Warehouse"
                                name={'from_warehouse'}
                                fieldProps={{
                                    value: getTransfer?.from_warehouse.map((it) => it.whsCode),
                                }}
                            />
                        </Col>
                        <Col span={4}>
                            <ProFormText
                                disabled
                                hasFeedback={false}
                                label="To Warehouse"
                                name={'to_warehouse'}
                                fieldProps={{
                                    value: getTransfer?.to_warehouse.map((it) => it.whsCode),
                                }}
                            />
                        </Col>

                        <Col span={4}>
                            <ProFormText
                                disabled
                                hasFeedback={false}
                                label="Posting Date"
                                name={'posting_date'}
                                fieldProps={{
                                    value: formatDate(getTransfer?.posting_date),
                                }}
                            />
                            {/* <ProFormDatePicker
                                disabled
                                hasFeedback={false}
                                label="Posting Date"
                                name={'posting_date'}
                                fieldProps={{
                                    value: getTransfer?.posting_date as Dayjs,
                                }}
                            /> */}
                        </Col>
                        <Col span={4}>
                            <ProFormText
                                disabled
                                hasFeedback={false}
                                label="Due Date"
                                name={'due_date'}
                                fieldProps={{
                                    value: formatDate(getTransfer?.due_date)
                                }}
                            />
                            {/* <ProFormDatePicker
                                disabled
                                hasFeedback={false}
                                label="Due Date"
                                name={'due_date'}
                                fieldProps={{
                                    value: getTransfer?.due_date as Dayjs,
                                }}
                            /> */}
                        </Col>
                        <Col span={8}>
                            <ProFormTextArea
                                disabled
                                hasFeedback={false}
                                label="Remark"
                                name={'remark'}
                                fieldProps={{
                                    value: getTransfer?.remark === null ? '-' : getTransfer?.remark,
                                }}
                            />
                        </Col>
                    </Row>
                    <Tabs
                        items={[
                            {
                                label: 'Transfer',
                                key: '1',
                                children: <TransferTab providedList={providedList} data={getTransfer ?? {}} refresh={(v) => { v == true ? setRefresh(true) : setRefresh(false) }} />,
                            },
                            {
                                label: 'Activities',
                                key: '2',
                                children: <ActivitiesTab data={getTransfer} />,
                            },
                        ]}
                    />
                    {/* <Card title="Transfer" size="small" extra={<a onClick={() => setRefresh(true)} style={{ color: 'black' }}><RedoOutlined /></a>}>
                        <ProTable<ProvidedList>
                            size="small"
                            search={false}
                            rowKey="id"
                            editable={{
                                type: 'multiple',
                                editableKeys: getTransfer?.item.map((it) => it.id),

                            }}
                            dataSource={providedList}
                            options={{
                                density: false,
                                fullScreen: false,
                                reload: false,
                                setting: false,

                            }}
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
                    </Card> */}
                </Card>

            </ProForm>

            {/* <TransferItemList
                provided={providedId}
                status={providedStatus}
                open={transferItemListOpen.visible}
                onCancel={() => setTransferItemListOpen({ visible: false, provided: '', status: '' })}
                type={getTransfer?.transfer_type}
                onSave={(itm) => (setReceiveModal({ visible: true }), setItm(itm))}
                onReject={() => setCommentModal({ visible: true })}
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
                            transfer_request: getTransfer?.transfer_id,
                            activities_name: 'Receive',
                            action: `Rejected Transfer ${transferIndex}`
                        }
                        await services.update_provided_status(change)
                        setTransferItemListOpen({ visible: false, provided: '', status: '' })
                        setCommentModal({ visible: false })
                        setRefresh(true)
                        message.success('Success');
                    } catch (error) {
                        console.error('An error occurred:', error);
                        message.error('Error');
                    }
                }}
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
                        if (!getTransfer) {
                            message.error('Please select a request.');
                            return;
                        }

                        const updatedItems = itm.map((it: any) => {
                            const itemReceive = it.received
                            let is_receive;
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
                            return { ...it, itemReceive, is_receive, total: String(total), oldtotal: String(oldtotal) };
                        });
                        const allReceived = itm.every((item: any) => {
                            const Quantity = parseFloat(item?.quantity);
                            const receivedQuantity = parseFloat(String(item?.received)) || 0;
                            return ((gettotal[item.item_code] + receivedQuantity) === Quantity);
                        });
                        let state
                        if (allReceived) {
                            state = 'completed';
                        } else {
                            state = 'pending';
                        }

                        const dataForm = await form.validateFields();
                        const entity: TransferCreate = {
                            ...dataForm,
                            id: getTransfer.id,
                            items: updatedItems.map((v: any) => ({ ...v })),
                            transfer_type: getTransfer.transfer_type,
                            business_unit: getTransfer.business_unit,
                            transfer_request: String(getTransfer.id),
                            posting_date: getTransfer.posting_date,
                            due_date: getTransfer.due_date,
                            from_warehouse: getFromWarehouse[0] ?? getTransfer.from_warehouse[0]?.id ?? 0,
                            to_warehouse: getToWarehouse[0] ?? getTransfer.to_warehouse[0]?.id ?? 0,
                            line: getTransfer.line,
                            shift: getTransfer.shift,
                            key: getTransfer.key,
                            transfer_id: getTransfer.transfer_id,
                            status: state,
                        };
                        const res: ReceiveStatusChange = {
                            transfer_request: String(getTransfer.id),
                        };
                        const change = {
                            status: 'done',
                            remark: remarks,
                            provided: providedId,
                            transfer_request: getTransfer.transfer_id,
                            activities_name: 'Receive',
                            action: `Receive Transfer ${transferIndex}`
                        }
                        await services.save(entity)
                        await services.receive_change(res)
                        await services.update_provided_status(change)
                        setReceiveModal({ visible: false })
                        setTransferItemListOpen({ visible: false, provided: '', status: '' })
                        setItm([])
                        setRefresh(true)
                        message.success('Success');
                    } catch (error) {
                        console.error('An error occurred:', error);
                        message.error('Error');
                    }
                }}
            /> */}
            <CloseTransferFormModal
                open={closeModal}
                onCancel={() => setCloseModal(false)}
                onSave={async (remarks) => {
                    try {
                        if (!getTransfer) {
                            message.error('Please select a request.');
                            return;
                        }

                        const dataForm = await form.validateFields();
                        const closedoc: SAPCloseDoc = {
                            docEntry: getTransfer.sapDocEntry,
                            ...dataForm,
                            id: getTransfer.id,
                            items: items.map((v) => ({ ...v })),
                            transfer_type: getTransfer.transfer_type,
                            business_unit: getTransfer.business_unit,
                            transfer_request: String(getTransfer.id),
                            posting_date: getTransfer.posting_date,
                            due_date: getTransfer.due_date,
                            from_warehouse: getFromWarehouse[0] ?? getTransfer.from_warehouse[0]?.id ?? 0,
                            to_warehouse: getToWarehouse[0] ?? getTransfer.to_warehouse[0]?.id ?? 0,
                            line: getTransfer.line,
                            shift: getTransfer.shift,
                            key: getTransfer.key,
                            transfer_id: getTransfer.transfer_id,
                            status: 'completed',
                            statusChange: 'received',
                            state: 'completed',
                            activities_name: 'Receive',
                            action: `Close Transfer`,
                            remark: remarks
                        };
                        await services.close_request(closedoc);
                        setRefresh(true)
                        setCloseModal(false)
                        message.success('Success');
                    } catch (error) {
                        console.error('An error occurred:', error);
                        message.error('Error');
                    }

                }}
            />
        </>
    );
};
