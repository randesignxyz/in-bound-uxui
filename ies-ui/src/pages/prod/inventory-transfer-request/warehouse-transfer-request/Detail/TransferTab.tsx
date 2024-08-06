import { ActionType, ProCard, ProList, ProTable } from '@ant-design/pro-components';
import { DrawerForm, DrawerFormProps } from '@ant-design/pro-form';
import moment from 'moment';
import { ActivitiesItem, ProvidedItem, ProvidedList, TransferRequest, TransferRequestItem } from '../../data';
import { Button, Checkbox, Modal, message } from 'antd';
import { PlusOutlined, RedoOutlined } from '@ant-design/icons';
import { useEffect, useRef, useState } from 'react';
import { simpleRequestActions } from '@/services/model';
import { TransferRequestServiceAPI } from '../../service';
import AddTransfer from './AddTransfer';
import TransferDetail from './TransferDetail';
import { formatDateTime } from '@/pages/utils';
import { TransferServiceAPI } from '@/pages/prod/inventory-transfer/service';

interface Props extends DrawerFormProps {
    providedList: ProvidedList[];
    data?: any;
    refresh: (a: boolean) => void,
}

export default ({ providedList, data, refresh, ...rest }: Props) => {
    const actionRef = useRef<ActionType>();
    const requestActions = simpleRequestActions();
    const services = TransferRequestServiceAPI(requestActions);
    const [addtransferOpen, setAddTransferOpen] = useState<{ visible: boolean; }>({ visible: false });
    const [detailtransferOpen, setDeatilTransferOpen] = useState<{ visible: boolean, provided: string }>({ visible: false, provided: '' });
    const [providedId, setProvidedId] = useState('')

    const onSaveTransfer = (da: ProvidedItem[]) => {
        if (da.length == 0) {
            message.error('Please enter provide');
            return
        }
        Modal.confirm({
            title: 'Save Transfer record',
            content: 'are you sure',
            onOk: async () => {
                try {
                    await TransferRequestServiceAPI(requestActions).provided({
                        item: da,
                        status: '',
                        transfer_request_id: data.id,
                        transfer_request: data.transfer_id,
                        activities_name: 'Transfer',
                        action: `Add Transfer ${providedList.length + 1}`
                    })
                    setAddTransferOpen({ visible: false })
                    actionRef.current?.reloadAndRest?.();
                    refresh(true)
                    message.success('Success');
                } catch (e) {
                    message.error('Error');
                }
            },
        });
    }

    const getSap = async () => {
        try {
            const detail_sap = await TransferServiceAPI(requestActions).detail_sap(data.sapDocEntry);
            const detail = await services.detail(data.id);

            if (detail_sap?.transferRequests[0].transferRequestDetails && detail?.item) {
                // Convert the second list to a map for easy lookup
                const detailMap = new Map(detail.item.map(item => [item.item_code, item]));

                for (const sapItem of detail_sap?.transferRequests[0].transferRequestDetails) {
                    const detailItem = detailMap.get(sapItem.itemCode);
                    if (detailItem) {
                        // Compare quantity
                        if (sapItem.quantity !== parseInt(detailItem.quantity)) {
                            message.error(`Mismatch found for item code ${sapItem.itemCode} in IES ${detailItem.quantity} in SAP ${sapItem.quantity}!`);
                            return
                        }
                    } else {
                        message.error(`Item code ${sapItem.itemCode} not found in the sap list!`);
                    }
                }
                setAddTransferOpen({ visible: true })
            } else {
                console.error("One of the lists is undefined or empty.");
            }
        } catch (error) {
            console.error('An error occurred:', error);
            message.error('Error');
        }
    }
    return (
        <>
            <ProTable<ProvidedList>
                size="small"
                search={false}
                rowKey="id"
                dataSource={providedList}
                options={{
                    density: false,
                    fullScreen: false,
                    reload: false,
                    setting: false,
                }}

                toolbar={
                    (data.status === 'request-warehouse-approve' && data.transfer_type == 'PM/RM')? {
                        actions: [
                            <Button
                                key="add-button"
                                type="link"
                                icon={<PlusOutlined />}
                                onClick={() => getSap()}
                            />,
                            <Button
                                type="text"
                                icon={<RedoOutlined />}
                                onClick={() => refresh(true)}
                            />,
                            // Add other toolbar actions as needed
                        ],
                    } : {
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
                        render: (_, r, index) => <a onClick={() => { setDeatilTransferOpen({ visible: true, provided: r.provided }), setProvidedId(r.provided) }}>{('Transfer ' + (index + 1))}</a>
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
            {addtransferOpen.visible == true ?
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
                    : <></>}
        </>

    );
};
