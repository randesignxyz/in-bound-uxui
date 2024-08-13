import { simpleRequestActions } from '@/services/model';
import { PageContainer, ProDescriptions, ProTable } from '@ant-design/pro-components';
import { Card, Space, Spin, Tag } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { InspectionDTO, InspectionItemCreate } from './data';
import { InspectionServiceAPI } from './service';
import { ExternalLayout } from '../fleet';

interface Props {
  id: string;
}
export default ({ id }: Props) => {
  const requestActions = simpleRequestActions();
  const service = InspectionServiceAPI(requestActions);
  const [inspectionData, setInspectionData] = useState<InspectionDTO>();
  const initData = useCallback(async () => {
    setInspectionData(await service.detail(id));
  }, []);

  useEffect(() => {
    initData();
  }, []);
  return (
    <>
      <PageContainer
        onBack={!ExternalLayout.isExternal("fleet/inspection") ? ExternalLayout.handleBackHandler : undefined}
        onBack={!ExternalLayout.isExternal("fleet/inspection") ? ExternalLayout.handleBackHandler : undefined}
        title="Inspection"
        subTitle={`#${inspectionData?.plateNumber}`}
        fixedHeader
        style={{
          margin:"-30px -40px 0",
        }}
      />
        <Spin spinning={requestActions.request?.loading}>
          <Space size={12} direction="vertical">
            <Card key={'inspection'} size={'small'}>
              <ProDescriptions<InspectionDTO>
                dataSource={inspectionData}
                key={'description'}
                contentStyle={{ fontWeight: 'bold' }}
                column={4}
                columns={[
                  {
                    key: 'vehicle',
                    title: 'Truck Number',
                    dataIndex: 'vehicleNumber',
                    render: (_, r) => r.plateNumber,
                  },
                  {
                    key: 'itemcount',
                    title: 'Item',
                    dataIndex: 'item',
                  },
                  {
                    key: 'checked',
                    title: 'Checked',
                    dataIndex: 'checked',
                  },
                  {
                    key: 'rating',
                    title: 'Rating',
                    dataIndex: 'rating',
                    render: (_, r) => (
                      <Tag color={'error'}>{[((r.checked / r.item) * 100) ^ 0, '%'].join(' ')}</Tag>
                    ),
                  },
                  {
                    key: 'type',
                    title: 'Inspection Type ',
                    dataIndex: 'inspectionType',
                  },
                  {
                    key: 'createdby',
                    title: 'Inspected By ',
                    render: (_, r) =>
                      [r.inspectedBy?.firstName, r.inspectedBy?.lastName]
                        .filter((it) => it)
                        .join(' '),
                  },
                  {
                    key: 'Technician ',
                    title: 'Technician Name',
                    dataIndex: 'technicianName',
                  },
                  {
                    key: 'status',
                    title: 'Status',
                    render: (_, r) =>
                      r.status == 1 ? (
                        '-'
                      ) : (
                        <Tag color="error" bordered={false}>
                          void
                        </Tag>
                      ),
                  },
                ]}
              />
            </Card>
            <Card key={'itemdata'} size="small" title="Item">
              <ProTable<InspectionItemCreate>
                dataSource={inspectionData?.inspectionItem}
                key="itemdata"
                toolBarRender={false}
                search={false}
                pagination={false}
                columns={[
                  {
                    key: 'item',
                    title: 'Inspection Item',
                    search: false,
                    render: (_, r) => (
                      <>
                        {r.item}
                        <br />
                        {r.itemKh}
                      </>
                    ),
                  },
                  {
                    title: 'result',
                    key: 'result',
                    dataIndex: 'result',
                    search: false,
                    render: (_, r) => (
                      <Tag key={r.id?.toString()} color={r.result ? 'green' : 'error'}>
                        {r.result ? 'Yes' : 'No'}
                      </Tag>
                    ),
                  },
                  {
                    key: 'remark',
                    title: 'Remark',
                    dataIndex: 'remark',
                    search: false,
                  },
                ]}
              ></ProTable>
            </Card>
          </Space>
        </Spin>
    </>
  );
};
