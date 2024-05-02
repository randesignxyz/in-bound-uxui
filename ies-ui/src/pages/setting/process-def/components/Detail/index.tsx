import ProcessFlowModel from '@/models/ProcessFlowModel';
import DiagramViewComp from '@/pages/process-flow/components/bpmn-viwer';
import {
  BMPNData,
  ConfigEndEventRs,
  OriginatorAuth,
  SaveFirstLevelApproval,
} from '@/services/process-workflow/data';
import { PageContainer } from '@ant-design/pro-components';
import { message, Modal, Spin } from 'antd';
import { useEffect, useState } from 'react';
import DestApproval from '../DestApproval';
import EndTask from '../EndTask';
import OriginatorComp from '../Originator';

interface Props {
  id: string;
  actionHandlers?: {
    onBack?: () => void;
  };
}

const ProcessDefDetailView: React.FC<Props> = ({ id, actionHandlers }) => {
  const processFlowModel = ProcessFlowModel();
  const { state, actions, modals } = processFlowModel;
  const [data, setData] = useState<{
    bmpnData?: BMPNData;
    originator?: OriginatorAuth;
    destination?: SaveFirstLevelApproval;
    eventId?: string;
    endTask?: ConfigEndEventRs;
  }>();

  useEffect(() => {
    try {
      actions.extractProcessDef(id).then((data) => setData({ bmpnData: data }));
    } catch (error) {
      message.error('Failed to load data.');
    }
  }, []);

  const handleShowDestinationModal = async (el: any) => {
    const { businessObject } = el;

    if ('bpmn:UserTask' === el.type) {
      const rs = await actions.fetchDestApproval(businessObject.id);
      setData((v) => ({ ...v, destination: rs }));
      modals.showModal('destination-setup');
      // if ('bpmn:UserTask' === el.type)
      //     fetchDestApprovalSrv.query({ id: id }, () => {
      //         visibility.show('directApprover', {
      //             type: 'directApprover',
      //             el: el
      //         })
      //     })
    } else if ('bpmn:StartEvent' === el.type) {
      const rs = await actions.fetchWorkflowOriginator(id);
      setData((v) => ({ ...v, originator: rs }));
      modals.showModal('originator-setup');

      // srv.data && fetchWorkflowOriginatorSrv.query({ id: srv.data?.id }, data => {
      //     if (data) {
      //         visibility.show('originator', {
      //             type: 'originator',
      //             el: el
      //         })
      //     }
      // })
    } else if ('bpmn:EndEvent' === el.type) {

      const rs = await actions.fetchConfigEndEvent(businessObject.id);
      console.log(rs);

      setData((v) => ({ ...v, endTask: rs, eventId: businessObject.id }));
      modals.showModal('end-task-setup');

      // srv.data && fetchNotificationFeedback.query ({id: srv.data.id}, data => {
      //     notificationFeedbackVisible.show('show', data)
      // })
    }
  };

  return (
    <PageContainer
      title="Process Instance Def"
      breadcrumb={undefined}
      subTitle={data?.bmpnData?.processDef?.name}
      onBack={actionHandlers?.onBack}
    >
      <Spin spinning={state.loading}>
        <DiagramViewComp
          drawingData={{ xml: data?.bmpnData?.bpmn20Xml }}
          onEventHandler={(el) => {
            handleShowDestinationModal(el);
          }}
        />

        <OriginatorComp
          title={'Originator'}
          width={'1000px'}
          visible={modals.isVisible('originator-setup')}
          originatorAuth={data?.originator}
          processDefId={id}
          onSave={(data) => {
            Modal.confirm({
              title: 'Save Originator',
              content: 'Are you sure?',
              onOk: async () => {
                try {
                  await actions.saveOriginator(data);
                  modals.hideModal('originator-setup');
                } catch (error) {
                  message.error('Failed to save.');
                }
              },
            });
          }}
          onCancel={() => modals.hideModal('originator-setup')}
        />

        <DestApproval
          workflow={processFlowModel}
          title={data?.destination?.taskName}
          width={'1000px'}
          visible={modals.isVisible('destination-setup')}
          destination={data?.destination}
          onSave={(data) => {
            Modal.confirm({
              title: 'Save Destination',
              content: 'Are you sure?',
              onOk: async () => {
                try {
                  await actions.saveDest(data);
                  modals.hideModal('destination-setup');
                } catch (error: any) {
                  message.error(error.message || 'Failed to save.');
                }
              },
            });
          }}
          onCancel={() => modals.hideModal('destination-setup')}
        />

        <EndTask
          workflow={processFlowModel}
          eventId={data?.eventId || ''}
          visible={modals.isVisible('end-task-setup')}
          onCancel={() => modals.hideModal('end-task-setup')}
          data={data?.endTask}
        />
      </Spin>
    </PageContainer>
  );
};
export default ProcessDefDetailView;
