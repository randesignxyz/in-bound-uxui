import { VisitScheduleItem } from '@/services/crm/data';
import {
  Badge,
  Calendar,
  Col,
  DatePicker,
  Descriptions,
  Modal,
  ModalProps,
  Popover,
  Row,
  Spin,
} from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';

export interface CalenderViewProps extends ModalProps {
  modalProps: ModalProps;
  data: {
    scheduleList: VisitScheduleItem[];
  };
  actionHandlers: {
    loadData: (date: moment.Moment) => Promise<void>;
  };
}

const CalenderView: React.FC<CalenderViewProps> = ({
  modalProps,
  data: { scheduleList },
  actionHandlers: { loadData },
}) => {
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!modalProps.open) return;
    loadDataActionHandler(moment());
  }, [modalProps.open]);

  const loadDataActionHandler = async (date: moment.Moment) => {
    setLoading(true);
    try {
      await loadData(date);
    } finally {
      setLoading(false);
    }
  };

  const status = (it: VisitScheduleItem) => {
    switch (it.status) {
      case 'COMPLETED':
        return 'success';
      case 'PENDING':
        return 'processing';
      case 'CANCELED':
        return 'warning';
      default:
        return 'default';
    }
  };

  const detail = (it: VisitScheduleItem) => {
    return (
      <div>
        <Descriptions column={1} style={{ width: 400 }}>
          <Descriptions.Item label="Customer Name">{it.customer.name}</Descriptions.Item>
          <Descriptions.Item label="Salesperson">
            {[it.salesperson.code, it.salesperson.name].filter((it) => it).join('-')}
          </Descriptions.Item>
          <Descriptions.Item label="Address">{it.address.name}</Descriptions.Item>
          <Descriptions.Item label="Status">{it.status}</Descriptions.Item>
        </Descriptions>
      </div>
    );
  };

  return (
    <Modal destroyOnClose width="100%" title="Visit Schedules" footer={false} {...modalProps}>
      <Spin spinning={loading}>
        <Calendar
          headerRender={(config) => {
            return (
              <Row>
                <Col flex="Auto" />
                <Col flex="200px">
                  <DatePicker
                    picker="month"
                    onChange={(value) => value && config.onChange(value)}
                  />
                </Col>
              </Row>
            );
          }}
          fullscreen
          dateCellRender={(date) => {
            return (
              <ul
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: 'none',
                }}
              >
                {scheduleList
                  .filter(
                    (it) =>
                      moment(it.scheduleDate).date() == date.date() &&
                      moment(it.scheduleDate).month() == date.month(),
                  )
                  .map((it) => {
                    return (
                      <li key={it.id}>
                        <Popover content={detail(it)} title={it.customer.code}>
                          <Badge status={status(it)} text={it.customer.code} />
                        </Popover>
                      </li>
                    );
                  })}
              </ul>
            );
          }}
          onPanelChange={(date, mode) => {
            if (mode == 'year') return;
            loadDataActionHandler(date);
          }}
          mode="month"
        />
        ,
      </Spin>
    </Modal>
  );
};

export default CalenderView;
