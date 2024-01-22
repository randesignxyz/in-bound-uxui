import { formatDateTime, formatter } from '@/pages/utils';
import { SettlementDetail } from '@/services/delivery/data';
import { DrawerForm, DrawerFormProps } from '@ant-design/pro-form';
import { Alert, Card, Descriptions } from 'antd';
import SettlementItemView from './settlement-item-view';

interface Props extends DrawerFormProps {
  data: SettlementDetail;
}
const ViewData: React.FC<Props> = ({ data, ...props }) => {
  return (
    <DrawerForm {...props} submitter={false}>
      <Card size="small" title="General" style={{marginBottom: 10}}>
        <Descriptions>
          <Descriptions.Item label="Settled By">{data.settledBy}</Descriptions.Item>
          <Descriptions.Item label="Settled Date">
            {formatDateTime(data.settledDate)}
          </Descriptions.Item>
          <Descriptions.Item label="Total Ammount">
            {formatter.format(data.settledAmount)}
          </Descriptions.Item>
          <Descriptions.Item label="Remarks">{data.remarks}</Descriptions.Item>
        </Descriptions>
      </Card>

      {data.checkoutList.length> 0 && <Card size="small" title="Payment">
        {data.checkoutList.map((it) => <SettlementItemView data = {it}/> )}
      </Card>}

      {data.checkoutList.length ==  0 && <Alert type='warning'  message ="Payment was canceled."/>}
    </DrawerForm>
  );
};

export default ViewData;
