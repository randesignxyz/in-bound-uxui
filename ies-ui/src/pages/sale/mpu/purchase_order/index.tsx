import CrudWrapper from '@/components/DataCrud/CrudWrapper';
import { MPUPath } from '..';
import MpuPurchaseOrderListView from './MpuPurchaseOrderListView';
import MpuPurchaseOrderDetail from './MpuPurchaseOrderDetail';
import POMainPage from './POMainPage';

export default () => {
  return (
    <CrudWrapper baseURL={MPUPath.mpuPurchaseOrder} disablePageContainer> 
      {(view, id, navigate) => {
        return (
          view ==="list" && <POMainPage/>
          // view === 'list' && <MpuPurchaseOrderListView
          //   onDetail={(id) => {
          //     navigate?.goToDetail?.({ id: id });
          //   }}
          // /> ||
          // view == "detail" && <MpuPurchaseOrderDetail id={id as number} />
        );
      }}
    </CrudWrapper>
  );
};
