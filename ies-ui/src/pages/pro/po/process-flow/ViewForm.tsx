import ViewFormWrapper from '@/pages/process-flow/components/forms/ViewFormWrapper';
import { DataViewProps } from '@/pages/process-flow/data';
import { Modal, Spin, message } from 'antd';
import { useState } from 'react';
import DataDetailView from '../DataDetailView';
import Flow from '../../flow';
import { PoRequestDetail } from '../data';
import { PartitionOutlined, UploadOutlined } from '@ant-design/icons';
import { createPoService } from '../services';

export default (props: DataViewProps) => {
  const [attatchFiles, setAttatchFiles] = useState<{ fileId: string; activity: string }[]>();
  const [openFlow, setOpenFlow] = useState<number>()
  const [poRequestDetail, setPoRequestDetail] = useState<PoRequestDetail>()
  const [forceReload, setForceReload] = useState(0)
  const srv = createPoService();
  const onPostHandler = () => {
    if (!poRequestDetail) return
    Modal.confirm({
      title: 'Post purchase order to SAP',
      content: "Are you sure?",
      onOk: async () => {
        try {
          await srv.postPo(poRequestDetail.id)
          message.success("Successfully posted.")
          setForceReload(v => v + 1)
        } catch (error: any) {
          message.error(error.message || "Failed to post.")

        }

      }
    })
  }

  return (
    <ViewFormWrapper<{ id: number }>
      workflowProp={props}
      attachedFiles={attatchFiles}

      moreActions={() => [
        {
          icon: <UploadOutlined />,
          danger: true,
          hidden: !poRequestDetail || poRequestDetail?.workflowStatus != 'APPROVED' || (poRequestDetail?.integratedStatus || 'FAILED') != 'FAILED',
          key: 'postToSAP',
          name: "Post To SAP",
          action: onPostHandler
        },
        {
          icon: <PartitionOutlined />, key: 'view-flow', name: "Flow", action: () => {
            setOpenFlow(poRequestDetail?.id)
          }
        }]}
      actionHandlers={{
        onRefresh: () => { },
      }}
    >
      {(data, _) => {
        if (!data?.processInstance?.procInstId) return <Spin spinning={true} />;
        return (
          <>
            <DataDetailView
              instanceId={data.processInstance.procInstId}
              forceReload={forceReload}
              onSet={setPoRequestDetail}
              setAttachFiles={(files) =>
                setAttatchFiles(files.map((it) => ({ fileId: it, activity: 'Start' })))
              }
            />
            <Flow
              open={!!openFlow}
              onOpenChange={(visible) => !visible && setOpenFlow(undefined)}
              type={'PO'}
              fromId={openFlow || 0}
            />
          </>

        );
      }}
    </ViewFormWrapper>
  );
};
