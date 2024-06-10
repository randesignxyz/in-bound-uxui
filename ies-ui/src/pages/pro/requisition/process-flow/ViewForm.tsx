import ProcessFlowModel from '@/models/ProcessFlowModel';
import { DataViewProps } from '@/pages/process-flow/data';
import ViewFormWrapper from '@/pages/process-flow/components/forms/ViewFormWrapper';
import { Card, message, Modal, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { simpleRequestActions } from '@/services/model';
import { RequisitionServiceAPI } from '@/services/pro/services';
import { RequisitionDetailResponse } from '@/services/pro/data';
import ViewData from '../components/ViewData';
import { PartitionOutlined, UploadOutlined } from '@ant-design/icons';
import Flow from '../../flow';

export default (props: DataViewProps) => {

  const workflowModel = ProcessFlowModel();
  const requestActions = simpleRequestActions();
  const services = RequisitionServiceAPI(requestActions);
  const [openFlow, setOpenFlow] = useState<number>();
  const [requisition, setRequisition] = useState<RequisitionDetailResponse>();

  useEffect(() => {
    loadData();
  }, [workflowModel.state.instanceData]);

  const loadData = async () => {
    const instId = workflowModel.state?.instanceData?.processInstance?.procInstId;
    if (!instId) return;
    try {
      const data = await services.detailByProcessFlow(instId);
      setRequisition({ ...data });
    } catch (error: any) {
      message.error(error.message || 'Failed to load requisition.');
    }
  };

  const refreshData = async () => {
    try {
      await workflowModel.actions.loadInstanceData(props.id, props.type || 'task');
    } catch (error: any) {
      message.error(error.message || "Failed to load data")
    }
  }

  const onPost = () => {

    if (!requisition) return
    Modal.confirm({
      title: 'Post to SAP',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          await services.post(requisition.id);
          loadData();
          message.success('Posted successfully.');
        } catch (error: any) {
          message.error(error.message || 'Failed to post.');
        } finally {

        }
      },
    });
  }

  return (
    <ViewFormWrapper<{ id: number }>
      workflowModel={workflowModel}
      workflowProp={props}
      attachedFiles={requisition?.fileIds?.map(it => ({ fileId: it, activity: 'Start' }))}
      moreActions={() => [
        {
          icon: <UploadOutlined />,
          danger: true,
          hidden: !requisition || requisition?.processStatus != 'APPROVED' || (requisition?.sapStatus || 'FAILED') != 'FAILED',
          key: 'postToSAP',
          name: "Post To SAP",
          action: onPost
        },
        {
          icon: <PartitionOutlined />, key: 'view-flow', name: "Flow", action: () => {
            setOpenFlow(requisition?.id)
          }
        }
      ]}
      actionHandlers={{
        onRefresh: refreshData
      }}
    >

      {(_) => {
        return (<Spin spinning={requestActions.request?.loading}>
          <Card title='Requisition' size='small' style={{ marginTop: 10 }}>
            <ViewData data={requisition} />
          </Card>
          <Flow
            open={!!openFlow}
            onOpenChange={(visible) => !visible && setOpenFlow(undefined)}
            type={'PR'}
            fromId={openFlow || 0}
          />
        </Spin>)
      }}


    </ViewFormWrapper>
  );
};


