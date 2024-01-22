import CrudWrapper from '@/components/DataCrud/CrudWrapper';
// import { Access, useAccess } from 'umi';
import { SalePaths } from '..';
import StockControlDetail from './Detail';
import StockListView from './List';

export default () => {
  // const access = useAccess();
  return (
    <CrudWrapper baseURL={SalePaths.stock}>
      {(view, id, navigate) => {
        return (
          (view === 'list' && (
            <StockListView
              actionHandlers={{
                onAdd: navigate?.goToCreate,
                onDetail: navigate?.goToDetail,
              }}
            />
          )) ||
          (view === 'detail' && (
            <StockControlDetail
              id={id as number}
              actionHandlers={{
                onBack: navigate?.gotToListHandler,
              }}
            />
          ))
        );

        //  ||
        //    view === 'create' && <Access accessible = {access.canCreateEditSo} fallback={<div>Unauthorized</div>}> <Create/> </Access> ||
        //    view === 'edit' && <Access accessible = {access.canCreateEditSo} fallback={<div>Unauthorized</div>}> <Edit id = {id as number}/> </Access>
      }}
    </CrudWrapper>
  );
};
