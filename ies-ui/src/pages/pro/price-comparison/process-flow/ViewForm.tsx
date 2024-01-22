import ViewFormWrapper from '@/pages/process-flow/components/forms/ViewFormWrapper';
import { DataViewProps } from '@/pages/process-flow/data';
import { Modal, Spin, message } from 'antd';
import { useState } from 'react';
import DataDetailView from '../DataDetailView';
import Flow from '../../flow';
import { PriceComparisonDetail, PriceComparisonListItem } from '../data';
import { PartitionOutlined, UploadOutlined } from '@ant-design/icons';
import { createQuotationService } from '../../quotation/services';
import _ from 'lodash';
import { downloadReport } from '@/services/apiGateway';
import { ProcessInstanceData } from '@/services/process-workflow/data';
import moment from 'moment';

export default (props: DataViewProps) => {
  const [attatchFiles, setAttatchFiles] = useState<{ fileId: string; activity: string }[]>();
  const [openFlow, setOpenFlow] = useState<number>()
  const [priceComparisonDetail, setPriceComparisonDetail] = useState<PriceComparisonDetail>()
  const srvQuote = createQuotationService()
  const [forceReload, setForceReload] = useState(0)
  const [processData, setProcessData] = useState<ProcessInstanceData<{ id: number }>>()
  const onPosting = () => {
    if (!priceComparisonDetail) return
    Modal.confirm({
      title: "Posting quotations to SAP.",
      content: "Are you sure?",
      onOk: async () => {
        try {
          await srvQuote.postPQs(priceComparisonDetail.id)
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
      onSetProcessData={setProcessData}
      actionHandlers={{
        onRefresh: () => { },
        onActionInterceptor: async (action, requestAction, cb) => {
          const vendorNum = _.uniq(priceComparisonDetail?.items.flatMap(it => it.items.flatMap(it1 => it1.vendorId))).length
          if (action == 'export' && (vendorNum >= 3 || priceComparisonDetail?.isService)) {
            if (!processData) {
              message.error("Process data not found")
              return true
            }
            await downloadReport<{ processInstId: string; processDefKey: string; }>(requestAction)({
              reportName: 'export-form',
              fileName: `${processData?.processInstance?.procName}_${moment().toDate().toDateString()}`,
              type: 'PDF',
              data: {
                processInstId: processData?.processInstance?.procInstId!!,
                processDefKey: `${processData?.processInstance?.procDefKey}${vendorNum >= 3 ? '_vendor_' + vendorNum.toString() : ''}${priceComparisonDetail?.isService ? "_service" : ''}`!!
              }
            })
            return true
          }
          return false
        },
      }}

      moreActions={() => [{
        icon: <UploadOutlined />,
        danger: true,
        hidden: !priceComparisonDetail || priceComparisonDetail?.workflowStatus != 'APPROVED' || priceComparisonDetail?.quotations?.some(it => (it.integratedStatus || 'FAILED') != 'FAILED'),
        key: 'postToSAP',
        name: "Post quotations to SAP",
        action: onPosting
      }, {
        icon: <PartitionOutlined />, key: 'view-flow', name: "Flow", action: () => {
          setOpenFlow(priceComparisonDetail?.id)
        },

      },
      ]}
    >
      {(data,) => {
        if (!data?.processInstance?.procInstId) return <Spin spinning={true} />;
        return (
          <>
            <DataDetailView
              forceReload={forceReload}

              setAttachFiles={(files) =>
                setAttatchFiles(files.map((it) => ({ fileId: it, activity: 'Start' })))
              }
              instanceId={data?.processInstance?.procInstId}
              onSet={setPriceComparisonDetail}
            />

            <Flow
              open={!!openFlow}
              onOpenChange={(visible) => !visible && setOpenFlow(undefined)}
              type={'QC'}
              fromId={openFlow || 0}
            />
          </>
        );
      }}
    </ViewFormWrapper>
  );
};
