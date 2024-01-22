import FileUploaderButton from '@/components/FileUploaderButton';
import ProcessFlowModel from '@/models/ProcessFlowModel';
import { ProcessInstanceDef } from '@/services/process-workflow/data';
import { ClusterOutlined, EditOutlined } from '@ant-design/icons';
import { ProList } from '@ant-design/pro-components';
import { Button, Input, message, Modal, Spin, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import ProcessInfo from '../ProcessInfo';

interface Props {
  actionHandlers: {
    onDetail?: (data: ProcessInstanceDef) => void;
  };
}

const ProcessDefListView: React.FC<Props> = ({ actionHandlers }) => {
  const { state, actions, modals } = ProcessFlowModel();
  const [selectItem, setSelectedItem] = useState<ProcessInstanceDef>()
  useEffect(() => {
    actions.loadProcessDefList(0);
  }, []);
  return (
    <Spin spinning={state.loading}>
      <ProList<ProcessInstanceDef>
        headerTitle={<Input.Search onSearch={(searchValue) => actions.loadProcessDefList(0)} />}
        toolBarRender={() => [
          <FileUploaderButton
            label='Deploy'
            config={{ type: 'UploadFile', service: 'WorkflowService' }}
            onChangeHandler={(file) => {
              console.log(file);
              if (file.status == 'done') {
                Modal.confirm({
                  title: 'Confirmation',
                  content: 'Are you sure?',
                  onOk: async () => {
                    try {
                      file.response && await actions.deployProcessDef(file.response);
                      actions.loadProcessDefList(0);
                      message.success("Workflow deployed successfully.")
                    } catch (error: any) {
                      message.error(error.message || 'Failed to deploy workflow.')
                    }
                  }
                })
              }
            }}
          />
        ]}
        dataSource={state.processDefList}
        metas={{
          avatar: {
            render() {
              return <ClusterOutlined />
            }
          },
          title: {
            render(_, entity) {
              return <Typography.Link onClick={() => actionHandlers?.onDetail?.(entity)} strong>
                {entity.name}
              </Typography.Link>
            },
          },
          subTitle: {
            render(_, entity,) {
              return entity.version && <Tag>version {entity.version}</Tag>
            },
          },
          content: {
            dataIndex: 'description'
          },
          actions: {
            render(_, entity) {
              return <Button onClick={() => {
                modals.showModal('process-info')
                setSelectedItem(entity)
              }} icon={<EditOutlined />} type='link' />
            },
          }
        }
        }
      />
      {modals.isVisible('process-info') && selectItem && <ProcessInfo item={selectItem} open = {true} onOpenChange = {visible => !visible && modals.hideModal('process-info')} />}
    </Spin>
  );
};

export default ProcessDefListView;
