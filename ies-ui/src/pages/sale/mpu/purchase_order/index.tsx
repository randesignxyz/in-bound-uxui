import CrudWrapper from '@/components/DataCrud/CrudWrapper';
import { MPUPath } from '..';
import MpuPurchaseOrderListView from './MpuPurchaseOrderListView';
import MpuPurchaseOrderDetail from './MpuPurchaseOrderDetail';

export default () => {
  return (
    <CrudWrapper baseURL={MPUPath.mpuPurchaseOrder}>
      {(view, id, navigate) => {
        return (
          view === 'list' && <MpuPurchaseOrderListView
            onDetail={(id) => {
              navigate?.goToDetail?.({ id: id });
            }}
          /> ||
          view == "detail" && <MpuPurchaseOrderDetail id={id as number} />
        );
      }}
    </CrudWrapper>
  );
};
