import DeleteVisitPlanModal from '@/pages/crm/visit-plan/components/DeleteVisitPlanModal';
import VisitPlanModal from '@/pages/crm/visit-plan/components/VisitPlanModal';
import { Model } from '@/pages/crm/visit-plan/model';
import { AddressInfo, VisitPlanListItem } from '@/services/crm/data';
import { LookupData } from '@/services/data';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import ProList from '@ant-design/pro-list';
import { Button, Col, message, Modal, Row, Space, Spin } from 'antd';
import { useEffect, useState } from 'react';

interface Props {
  customerId: number;
  lookupDataList: LookupData[];
  list: () => Promise<VisitPlanListItem[]>;
  onLoadAddressList: () => Promise<AddressInfo[]>;
}

export default ({ lookupDataList, onLoadAddressList, list }: Props) => {
  const { state, actions, modals } = Model();
  const [dataList, setDataList] = useState<VisitPlanListItem[]>();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      setLoading(true);
      const rs = await list();
      setDataList(rs);
    } finally {
      setLoading(false);
    }
  };

  const onEditActionHandler = async (item: VisitPlanListItem) => {
    try {
      await modals.showVisitPlanModal(item);
    } catch (error) {
      message.error('Cannot fetch visit plan');
    }
  };

  const onAddActionHandler = async (
    customerAddressId: number,
    weekOfTheMonths: number[],
    dayOfTheWeeks: number[],
    numDaysBefore?: number,
    remarks?: string,
  ) => {
    Modal.confirm({
      title: 'Add New Visit Plan',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          await actions.saveVisitPlan(
            customerAddressId,
            weekOfTheMonths,
            dayOfTheWeeks,
            undefined,
            numDaysBefore,
            remarks,
          );
          message.success('Saved successfully.');
          modals.hideModal('visitPlan');
          await init();
        } catch (error) {
          message.error('Failed to save');
        }
      },
    });
  };

  const onSaveActionHandler = async (
    data: VisitPlanListItem,
    weekOfTheMonths: number[],
    dayOfTheWeeks: number[],
    numDaysBefore?: number,
    remarks?: string,
  ) => {
    Modal.confirm({
      title: 'Save Visit Plan',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          await actions.saveVisitPlan(
            data.address.customerAddressId || 0,
            weekOfTheMonths,
            dayOfTheWeeks,
            data,
            numDaysBefore,
            remarks,
          );
          message.success('Saved successfully.');
          modals.hideModal('visitPlan');
          await init();
        } catch (error) {
          message.error('Failed to save');
        }
      },
    });
  };

  const ListContent = (item: VisitPlanListItem) => (
    <Row>
      <Col flex={'200px'}>
        <span>Weeks of Month</span>
        <p>
          {lookupDataList
            ?.filter((it) =>
              item.visits?.some((vp) => vp.id == it.id && it.type == 'WEEK_OF_MONTH'),
            )
            .map((it) => it.name)
            .join(', ')}
        </p>
      </Col>
      <Col flex={'50px'}>
        <span>Weekday</span>
        <p>
          {lookupDataList
            ?.filter((it) => item.visits?.some((vp) => vp.id == it.id && it.type == 'DAY_OF_WEEK'))
            .map((it) => it.name)
            .join(', ')}
        </p>
      </Col>
      <Col flex={'Auto'} />
    </Row>
  );

  return (
    <Spin spinning={loading}>
      <ProList<VisitPlanListItem>
        dataSource={dataList}
        itemLayout="horizontal"
        locale={{ emptyText: 'No Visit plan available' }}
        metas={{
          title: {
            render: (_, r) => r.address.address,
          },
          content: {
            render: (_, r) => ListContent(r),
          },
          actions: {
            cardActionProps: 'extra',
            render: (_, r) => (
              <Space>
                <Button
                  type="link"
                  onClick={() => onEditActionHandler(r)}
                  icon={<EditOutlined />}
                />
                <Button
                  type="link"
                  onClick={() => modals.showDeleteVisitPlanModal(r)}
                  icon={<DeleteOutlined />}
                />
              </Space>
            ),
          },
        }}
      />
      <Button
        size="small"
        style={{ width: '100%', marginBottom: 8 }}
        type="dashed"
        onClick={() => modals.showAddVisitPlanModal()}
        icon={<PlusOutlined />}
      />
      <VisitPlanModal
        open={modals.isVisible('visitPlan')}
        item={state.data?.selectedItem}
        onCancel={() => modals.hideModal('visitPlan')}
        lookupDataList={lookupDataList}
        actionHandlers={{
          onSave: onSaveActionHandler,
          onAdd: onAddActionHandler,
          onLoadAddressList: onLoadAddressList,
        }}
      />

      <DeleteVisitPlanModal
        onDelete={(data) => {
          Modal.confirm({
            title: 'Remove Visit Plan',
            content: 'Are you sure?',
            onOk: async () => {
              await actions.deleteVisitPlan(data);
              modals.hideModal('delete-visi-plan');
              await init();
            },
          });
        }}
        title={'Delete Visit Plan'}
        onCancel={() => modals.hideModal('delete-visi-plan')}
        open={modals.isVisible('delete-visi-plan')}
      />
    </Spin>
  );
};
