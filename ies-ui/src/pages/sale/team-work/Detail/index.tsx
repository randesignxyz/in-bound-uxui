import DescriptionDisplay, { DescriptionDisplayDataItem } from '@/components/Descriptions';
import { formatDate } from '@/pages/utils';
import { SalesTeamWorkLess } from '@/services/sale/data';
import { EditOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import ProTable from '@ant-design/pro-table';
import { Button, Card } from 'antd';
import { useEffect } from 'react';
import { history, useAccess } from 'umi';
import { SalePaths } from '../..';
import { Model } from '../model';

interface Props {
  id?: number;
  actionHandlers?: {
    onBack?: () => void;
  };
}

const DetailTeamWork: React.FC<Props> = ({ actionHandlers, id }) => {
  const access = useAccess();
  const { state, actions } = Model();
  useEffect(() => {
    if (!id) return;
    actions.initData(id);
  }, [id]);

  const displayItems: (DescriptionDisplayDataItem | undefined)[] = [
    { label: 'Team Name', value: state.data?.detail?.teamName },
    {
      label: 'Owner',
      value: `${state.data?.detail?.requester?.salespersonCode} - ${state.data?.detail?.requester?.salespersonName}`,
    },
    { label: 'Description', value: state.data?.detail?.description },
    { label: 'Plate Number', value: state.data?.detail?.vehicle?.plateNumber },
    { label: 'Created Date', value: formatDate(state.data?.detail?.createdDate) },
  ];

  return (
    <PageContainer
      breadcrumb={undefined}
      onBack={actionHandlers?.onBack}
      extra={
        access.canCreateEditStockControl && [
          <Button
            type="link"
            htmlType="button"
            icon={<EditOutlined />}
            onClick={() => history.push(`${SalePaths.teamWork}/edit/${id}`)}
            key="edit"
          >
            Edit
          </Button>,
        ]
      }
    >
      <Card size="small" title="General Info" style={{ marginBottom: 10 }}>
        <DescriptionDisplay data={displayItems} />
      </Card>
      <Card size="small" style={{ marginBottom: 10 }} title="Members">
        <ProTable<SalesTeamWorkLess>
          //actionRef={actionRefBeginning}
          size="small"
          rowKey="id"
          pagination={false}
          bordered={false}
          search={false}
          dataSource={state.data?.detail?.members}
          // toolBarRender={() => [
          //   <Button
          //     type="primary"
          //     size="small"
          //     disabled={state.loading}
          //     //onClick={() => setAddNewModal({ visible: true, isFromRequest: false })}
          //     icon={<PlusOutlined />}
          //   />,
          // ]}
          options={{
            setting: false,
            density: false,
            fullScreen: false,
            reload: false,
          }}
          columns={[
            // {
            //   title: '#',
            //   dataIndex: 'index',
            //   defaultSortOrder: 'ascend',
            //   // sorter: (a, b) => a.index! - b.index!,
            //   key: 'id',
            // },
            { title: 'Code', dataIndex: 'salespersonCode' },
            { title: 'Full Name', dataIndex: 'salespersonName' },
            { title: 'Phone Number', dataIndex: 'phoneNumber' },
            { title: 'Position', dataIndex: 'position' },
          ]}
        />
      </Card>
    </PageContainer>
  );
};

export default DetailTeamWork;
