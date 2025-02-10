import CrudWrapper from '@/components/DataCrud/CrudWrapper';
import { SalePaths } from '..';
import MpuListView from './MpuListView';
import { Access, useAccess } from 'umi';
import Create from './Create';
import Detail from './Detail';
import MpuRequestDetail from './Detail';
import MainPurchaseOrderList from './MainPurchaseOrderList';
import PurchaseOrderDetail from './components/PurchaseOrderDetail';

export default () => {
  const access = useAccess();
  return (
    <CrudWrapper baseURL={SalePaths.purchaseOrder} disablePageContainer>
      {(view, id, navigate) => {
        return (
          (view === 'list' && (
            <MainPurchaseOrderList/>
          // <MpuListView  
          //   actionHandlers={{
          //     onAdd: navigate?.goToCreate,
          //     onDetail: navigate?.goToDetail,
          //   }}
          // />
          )) ||
          (view === 'create' && (
            <Access
              accessible={access.canCreateEditMpuRequest}
              fallback={<div>Unauthorized</div>}
            >
              <Create />
            </Access>
          )) 
          ||
          (view === 'detail' && (
            <PurchaseOrderDetail
              id={id as number}
              onEdit={(id: number) => {
                navigate?.gotoEdit?.({id: id});
              }}
            />
            // <MpuRequestDetail
            //   id={stockControlId}
            //   actionHandlers={{
            //     onBack: navigate?.gotToListHandler,
            //   }}
            // />
          ))
        );
      }}
    </CrudWrapper>
  );
};
