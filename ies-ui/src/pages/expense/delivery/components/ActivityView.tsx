import { formatDateTime, toReadable } from '@/pages/utils';
import { domain } from '@/services/del-expense/data';
import { FieldTimeOutlined } from '@ant-design/icons';
import ProList from '@ant-design/pro-list';
import moment from 'moment';
import { DlvExpenseServices } from "../DeliveryList/services";
import { simpleRequestActions } from "@/services/model"

const ActivityView: React.FC<{
  deliverySettlementId: number;
}> = ({ deliverySettlementId}) => {
  const requestActions = simpleRequestActions();
  return (
    <ProList<domain.delivery.Activity>     
      metas = {{
        avatar: {render: () => <FieldTimeOutlined />},
        title: {render: (_,r )=> `${toReadable(r.action)} by ${r.actionBy}`},
        subTitle: {render: (_,r )=> `${moment(moment(r.actionDate)).fromNow()}`},
        description: {dataIndex: 'comment'},
        extra: {render: (r:any)=>  formatDateTime(moment(r.actionDate)) }
      }}
      request={async (page) => {
        const rs= await DlvExpenseServices.listSettlementActivities({ deliverySettlementId }, (page.current || 1) - 1,  page.pageSize || 20).query(requestActions)
        return {data: rs.items, success: true, total: rs.total}
    }}
    />
  );
};

export default ActivityView;
