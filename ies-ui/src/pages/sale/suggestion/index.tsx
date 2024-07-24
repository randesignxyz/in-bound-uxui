import CrudWrapper from '@/components/DataCrud/CrudWrapper';
// import { Access, useAccess } from 'umi';
import { SalePaths } from '..';
//import Create from './Create';
// import StockStoreDetail from './Detail';
import SuggestionListView from './List';
//import Edit from './Edit';
//import StoreListView from './List';

export default () => {
  //   const access = useAccess();
  return (
    <CrudWrapper baseURL={SalePaths.store} disablePageContainer>
      {(view, id, navigate) => {
        return (
          view === 'list' && (
            <SuggestionListView
              actionHandlers={{
                onAdd: navigate?.goToCreate,
                onDetail: navigate?.goToDetail,
              }}
            />
          )
          //   ||
          //   (view === 'detail' && (
          //     <StockStoreDetail
          //       id={id as number}
          //       actionHandlers={{
          //         onBack: navigate?.gotToListHandler,
          //       }}
          //     />
          //   ))
          //   ||
          //   (view === 'create' && (
          //     <Access
          //       accessible={access.canCreateEditStockControl}
          //       fallback={<div>Unauthorized</div>}
          //     >
          //       <Create />
          //     </Access>
          //   )) ||
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
