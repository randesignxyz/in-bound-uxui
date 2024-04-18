import { durationFormat, formatDateTime } from '@/pages/utils';
import { LoadingItemDetail, QueueTicketDetail } from '@/services/delivery/data';
import { DeleteOutlined } from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import { Button, Card, Descriptions, Drawer, DrawerProps, message, Modal, Rate } from 'antd';
import moment, { duration } from 'moment';
import { useState } from 'react';
import RemarkModal from './remark-modal';

const QUEUED_STATUS = 'QUEUED';

interface Props extends DrawerProps {
  queueTicket: QueueTicketDetail;
  onSetPriority: (id: number, rate: number, remarks: string) => Promise<any>;
  onRefresh: (id: number) => Promise<any>;
  onCancelTicket: (id: number, remarks: string) => Promise<any>;
}

type DisplayItem = {
  label: string;
  display: string | React.ReactElement;
};

const TicketDetailView: React.FC<Props> = ({
  queueTicket,
  onSetPriority,
  onCancelTicket,
  onRefresh,
  ...rest
}) => {
  const [modal, setModal] = useState<
    { type: 'RATING'; visible: boolean; rate: number } | { type: 'CANCEL'; visible: boolean }
  >();

  const setPriorityHandler = async (rate: number) => {
    if (queueTicket.status !== QUEUED_STATUS) {
      return;
    }
    setModal({ type: 'RATING', visible: true, rate: rate });
  };

  const queueTicketDisplay: DisplayItem[] = [
    { label: 'Queue Num', display: `${queueTicket.ticketNum}/${queueTicket.resetNum}` },
    { label: 'Queue Type', display: queueTicket.queueName },
    { label: 'Issued Date', display: formatDateTime(queueTicket.createdDate) || 'Error' },
    { label: 'Issued By', display: queueTicket.issuedBy },
    {
      label: 'Priority',
      display: (
        <Rate
          disabled={queueTicket.status !== QUEUED_STATUS}
          onChange={setPriorityHandler}
          value={queueTicket.priority}
        />
      ),
    },
    { label: 'Driver', display: `${queueTicket.driver.firstName} ${queueTicket.driver.lastName}` },
    { label: 'License Plate', display: queueTicket.truck.licensePlate },
    { label: 'Truck', display: queueTicket.truck.code },
    { label: 'Loading Capacity', display: queueTicket.truck.loadingCapacity?.name?.toString() || 'N/A' },
    { label: 'Created Date', display: formatDateTime(queueTicket.createdDate) || 'Error' },
    { label: 'Last Modified By', display: queueTicket.lastModifiedBy || '' },
    { label: 'Last Modified Date', display: formatDateTime(queueTicket.lastModifiedDate) || '' },
    { label: 'Status', display: queueTicket.status },
  ];

  const loadingDisplay: DisplayItem[] | undefined = queueTicket.loading && [
    { label: 'Loading Started', display: formatDateTime(queueTicket.loading.loadingStarted) || '' },
    { label: 'Loading Ended', display: formatDateTime(queueTicket.loading.loadingEnded) || '' },
    {
      label: 'Loading Duration',
      display: durationFormat(moment(queueTicket.loading?.loadingStarted || new Date()), moment(queueTicket.loading?.loadingEnded || new Date())),
    },
    { label: 'Loading Dock', display: queueTicket.loading.loadingDock },
    { label: 'Shift', display: queueTicket.loading.shift },
    { label: 'Picking Assigned By', display: queueTicket.loading.assignedPickingSlipBy },
    { label: 'Picking Remarks', display: queueTicket.loading.assignedPickingSlipBy },
  ];

  const onSavePriorityHandler = async (id: number, remarks: string) => {
    Modal.confirm({
      title: 'Set priority',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          await onSetPriority(
            queueTicket.id,
            (modal?.type === 'RATING' && modal.rate) || 0,
            remarks,
          );
          await onRefresh(queueTicket.id);
          closeModal();
        } catch (error: any) {
          message.error(error.message || 'Failed to set priority');
        }
      },
    });
  };

  const onCancelTicketHandler = async (id: number, remarks: string) => {
    Modal.confirm({
      title: 'Set priority',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          await onCancelTicket(id, remarks);
          await onRefresh(queueTicket.id);
          closeModal();
        } catch (error: any) {
          message.error(error.message || 'Failed to set priority');
        }
      },
    });
  };

  const closeModal = (visible?: boolean) => {
    !visible && setModal(undefined);
  };

  const extra = (
    <Button
      type="link"
      onClick={() => {
        setModal({ type: 'CANCEL', visible: true });
      }}
      icon={<DeleteOutlined />}
    >
      Cancel
    </Button>
  );

  return (
    <Drawer
      destroyOnClose
      width={700}
      title="Ticket Detail"
      {...rest}
      extra={queueTicket.status === QUEUED_STATUS && extra}
    >
      <Card title="Queue Ticket Info" bordered={false} size="small">
        <Descriptions column={2}>
          {queueTicketDisplay.map((it, index) => (
            <Descriptions.Item key={`item-${index}`} label={it.label}>
              {it.display}
            </Descriptions.Item>
          ))}
        </Descriptions>
      </Card>

      {loadingDisplay && (
        <Card title="Loading Info" bordered={false} size="small">
          <Descriptions column={2}>
            {loadingDisplay.map((it, index) => (
              <Descriptions.Item key={`item-loading-${index}`} label={it.label}>
                {it.display}
              </Descriptions.Item>
            ))}
          </Descriptions>

          {queueTicket.loading && queueTicket.loading.items.length > 0 && (
            <ProTable<LoadingItemDetail>
              bordered={false}
              pagination={false}
              search={false}
              dataSource={queueTicket.loading.items}
              options={{ setting: false, reload: false, density: false }}
              columns={[
                { title: 'Item Code', dataIndex: 'itemCode' },
                { title: 'Item Description', dataIndex: 'itemDescription' },
                { title: 'UOM', dataIndex: 'uom' },
                { title: 'QTY', dataIndex: 'qty', align: 'right' },
                { title: 'Batch Num', dataIndex: 'batchNum' },
                { title: 'Whs Code', dataIndex: 'whsCode' },
                { title: 'Loaded Qty', dataIndex: 'loadedQty', align: 'right' },
              ]}
            />
          )}
        </Card>
      )}

      <RemarkModal
        title="Set Priority"
        open={modal?.type === 'RATING' && modal?.visible}
        onCancel={closeModal}
        id={0}
        onSave={onSavePriorityHandler}
      />

      <RemarkModal
        title="Cancel ticket"
        open={modal?.type === 'CANCEL' && modal?.visible}
        onCancel={closeModal}
        id={queueTicket.id}
        onSave={onCancelTicketHandler}
      />
    </Drawer>
  );
};

export default TicketDetailView;
