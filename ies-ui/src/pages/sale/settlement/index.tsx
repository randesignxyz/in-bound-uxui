import CrudWrapper from '@/components/DataCrud/CrudWrapper';
// import { Access, useAccess } from 'umi';
import { SalePaths } from '..';
import SettlementCreate from './Create';
import SettlementDetail from './Detail';
import SettlementListView from './SettlementListView';
//import Create from './Create';
// import StockStoreDetail from './Detail';
//import Edit from './Edit';
//import StoreListView from './List';

export default () => {
  //   const access = useAccess();
  return (
    <CrudWrapper baseURL={SalePaths.settlement}>
      {(view, id, navigate) => {
        return (
          (view === 'list' && (
            <SettlementListView />
            // <SettlementListView
            //   actionHandlers={{
            //     onAdd: navigate?.goToCreate,
            //     onDetail: navigate?.goToDetail,
            //   }}
            // />
          )) ||
          (view === 'detail' && (
            <SettlementDetail
              id={id as number}
              actionHandlers={{
                onBack: navigate?.gotToListHandler,
              }}
            />
          )) ||
          (view === 'create' && (
            <SettlementCreate />
            // <Access
            //   accessible={access.canCreateEditStockControl}
            //   fallback={<div>Unauthorized</div>}
            // >

            // </Access>
          ))
          // ||
          //   (view === 'edit' && (
          //     <Access
          //       accessible={access.canCreateEditStockControl}
          //       fallback={<div>Unauthorized</div>}
          //     >
          //       <Edit id={id as number} />
          //     </Access>
          //   ))
        );
      }}
    </CrudWrapper>
  );
};
