import { ProcessFlowModalWrapper } from '@/pages/process-flow/components/ProcessFlowModalWrapper';
import { simpleRequestActions } from '@/services/model';
import { RequisitionDetailResponse } from '@/services/pro/data';
import { RequisitionServiceAPI } from '@/services/pro/services';
import { StartWorkFlowParam } from '@/services/process-workflow/params';
import { EditFilled, FormOutlined, CopyOutlined } from '@ant-design/icons';
import { DrawerForm, DrawerFormProps } from '@ant-design/pro-form';
import { Button, message, Modal, Space, Spin } from 'antd';
import { useState } from 'react';
import { useAccess } from 'umi';
import ViewData from './components/ViewData';
import { AcquisitionFormNames } from './process-flow';

interface Props extends DrawerFormProps {
  data?: RequisitionDetailResponse;
  reload?: (id: number) => Promise<void>;
  onEdit?: () => void;
  onAdd?: () => void;
}

export default ({ data, onEdit, onAdd, reload, ...rest }: Props) => {
  const [startFormVisible, setStartFormVisible] = useState<boolean>(false);
  const requestActions = simpleRequestActions();
  const services = RequisitionServiceAPI(requestActions);
  const onRequest = () => setStartFormVisible(true);
  const [loading, setLoading] = useState(false);
  const access = useAccess();
  return (
    <DrawerForm
      title="Requisition Detail"
      {...rest}
      resize={{
        maxWidth: window.innerWidth * 0.9,
        minWidth: 1000,
      }}
      submitter={false}
      drawerProps={{
        extra: (
          <div>
            <Space>
              {data?.processStatus?.toLocaleLowerCase() == 'draft' && (
                <Button icon={<FormOutlined />} type="link" onClick={onRequest}>
                  Submit Request
                </Button>
              )}
              {data?.processStatus?.toLocaleLowerCase() == 'draft' && (
                <Button icon={<EditFilled />} type="link" onClick={onEdit}>
                  Edit
                </Button>
              )}
              <Button icon={<CopyOutlined />} type="link" onClick={onAdd}>
                Copy Data
              </Button>
              {access.canPostPRrToSap &&
                data &&
                data?.processStatus?.toLocaleLowerCase() == 'approved' &&
                (!data?.sapStatus || data?.sapStatus?.toLocaleLowerCase() == 'failed') && (
                  <Button
                    onClick={async () => {
                      Modal.confirm({
                        title: 'Post to SAP',
                        content: 'Are you sure?',
                        onOk: async () => {
                          try {
                            setLoading(true);
                            await services.post(data.id);
                            await reload?.(data.id);
                            message.success('Posted successfully.');
                          } catch (error: any) {
                            message.error(error.message || 'Failed to post.');
                          } finally {
                            setLoading(false);
                          }
                        },
                      });
                    }}
                  >
                    Post To SAP
                  </Button>
                )}
            </Space>
          </div>
        ),
      }}
    >
      <Spin spinning={loading}>
        <ViewData data={data} />
        <ProcessFlowModalWrapper
          type="action"
          action="Start"
          loading={false}
          formKey={AcquisitionFormNames.start}
          visible={startFormVisible}
          noAttachment
          actionHandlers={{
            onStartWorkflow: async (processDef, formKey, buId, requestor, comment) => {
              if (!data?.id) return;

              const reqData: StartWorkFlowParam<{ id: number }> = {
                processDef: processDef,
                formKey: formKey,
                buId: buId,

                requestor: requestor.id,
                comment: comment,
                payload: {
                  id: data.id,
                },
              };

              try {
                const rs = await services.requestOnly(reqData);
                message.success(
                  `Your request is summited. Please tracking your request with form no ${rs.formNo} `,
                );
                return Promise.resolve();
              } catch (error: any) {
                message.error(error.message || 'Failed to start process.');
                Promise.reject();
              }
            },
            onCancel: (_) => {
              setStartFormVisible(false);
            },
          }}
        />
      </Spin>
    </DrawerForm>
  );
};
