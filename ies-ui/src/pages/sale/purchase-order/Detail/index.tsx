import React, { useEffect } from 'react';
import { Model } from '../model';
import { useAccess } from 'umi';
import { useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { message } from 'antd';
import MpuRequestItem from '../components/MpuRequestItem';
import PurchaseOrderDetail from '../components/PurchaseOrderDetail';
interface Props {
  actionHandlers?: {
    onBack?: () => void;
  };
}

const MpuRequestDetail: React.FC<Props> = ({ id, actionHandlers }) => {
    const { state, actions } = Model();
    const [forceUpdate, setForceUpdate] = useState<number>(0);
    const access = useAccess();

    const isOpenStock = (): boolean => {
        return state.data?.detail?.status !== 'closed';
    }

    useEffect(() => {
        (async () => {
            try {
                if (id) {
                    await actions.detail(id); 
                }
                actions.initData(id);
            } catch {
                message.error('Failed to get Detail MPU Request');
            }
        })();
    }, [id]);
    
    return (
        <>
            <PageContainer
                title={`${state.data?.detail?.stockName}`}
                onBack={actionHandlers?.onBack}
                breadcrumb={undefined}
            />
            <MpuRequestItem
                forceUpdate={forceUpdate}
                data={{
                    id: id,
                    isOpen: isOpenStock(),
                    details: state.data?.detail,
                    types: state.data?.initData?.types,
                    loading: state.loading,
                    listMpuStockDetailItems: state.data?.listMpuStockDetailItems,
                }}
                // actionHandlers={{
                //   onTransferMoney: () => setAddModal({ visible: true }),
                //   onAddItem: (sid: number, name: string) =>
                //     setAddStockModal({
                //       visible: true,
                //       title: `Add Request ${name}`,
                //       typeId: sid,
                //     }),
                // }}
            />
        </>
    )
}


export default MpuRequestDetail;
