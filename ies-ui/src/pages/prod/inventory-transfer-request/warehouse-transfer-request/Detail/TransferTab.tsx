import { ActionType, ProCard, ProList, ProTable } from '@ant-design/pro-components';
import { DrawerForm, DrawerFormProps } from '@ant-design/pro-form';
import moment from 'moment';
import { ActivitiesItem, ProvidedItem, ProvidedList, TransferRequest, TransferRequestItem } from '../../data';
import { Button, Checkbox, Modal, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useEffect, useRef, useState } from 'react';
import { simpleRequestActions } from '@/services/model';
import { TransferRequestServiceAPI } from '../../service';
import AddTransfer from './AddTransfer';
import TransferDetail from './TransferDetail';

interface Props extends DrawerFormProps {
    providedList: ProvidedList[];
    data?: any;
}

export default ({ providedList, data, ...rest }: Props) => {
    const actionRef = useRef<ActionType>();
    const requestActions = simpleRequestActions();
    const services = TransferRequestServiceAPI(requestActions);
    const [addtransferOpen, setAddTransferOpen] = useState<{visible: boolean;}>({ visible: false });
    const [detailtransferOpen, setDeatilTransferOpen] = useState<{visible: boolean, provided:string}>({ visible: false,provided:'' });
    const [providedId, setProvidedId] = useState('')
    const onSaveTransfer = (da: ProvidedItem[]) => {
        Modal.confirm({
            title: 'Save Transfer record',
            content: 'are you sure',
            onOk: async () => {
                await TransferRequestServiceAPI(requestActions).provided({ item: da, status: '', transfer_request_id: data.id })
                setAddTransferOpen({ visible: false })
                actionRef.current?.reloadAndRest?.();
                message.success('Success');
            },
        });
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
                    reload: true,
                    setting: false,

                }}
                
                toolbar={
                    data.status === 'request-production-approve' ? undefined :{
                        actions: [
                            <Button
                                key="add-button"
                                type="link"
                                icon={<PlusOutlined />}
                                onClick={() => setAddTransferOpen({ visible: true })}
                            />,
                            // Add other toolbar actions as needed
                        ],
                    }
                }
                pagination={false}
                columns={[
                    {
                        title: '',
                        width: 50,
                        render: (_, r, index) => (r.status == 'cancel' ? <Checkbox indeterminate disabled /> : r.status == 'done' ? <Checkbox defaultChecked disabled /> : <Checkbox defaultChecked={false} disabled />),
                    },
                    { title: 'Transfer', render: (_, r, index) => <a onClick={()=>{setDeatilTransferOpen({visible:true,provided:r.provided}),setProvidedId(r.provided)}}>{('Transfer ' + (index + 1))}</a> },
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
                    onCancel={() => {setDeatilTransferOpen({ visible: false,provided:'' }),actionRef.current?.reloadAndRest?.();}}
                />
                :<></>}
        </>

    );
};
