import CrudWrapper from '@/components/DataCrud/CrudWrapper';
import { RetailerPath } from '..';
import OrderDetailView from './components/OrderDetailView';
import OrderListView from './components/OrderListView';

export default () => {
  // const access = useAccess();
  return (
    <CrudWrapper baseURL={RetailerPath.orderItem}>
      {(view, id, navigate) => {
        return (
          (view === 'list' && (
            <OrderListView
              onDetail={(id) => {
                navigate?.goToDetail?.({ id: id });
              }}
            />
          )) ||
          (view === 'detail' && <OrderDetailView id={id as string} sumDetail={false} />)
        );

        //  ||
        //    view === 'create' && <Access accessible = {access.canCreateEditSo} fallback={<div>Unauthorized</div>}> <Create/> </Access> ||
        //    view === 'edit' && <Access accessible = {access.canCreateEditSo} fallback={<div>Unauthorized</div>}> <Edit id = {id as number}/> </Access>
      }}
    </CrudWrapper>
  );
};
