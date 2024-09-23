import CrudWrapper from '@/components/DataCrud/CrudWrapper';
import { Access, useAccess } from 'umi';
import { SalePaths } from '..';
import Create from './Create';
import StockStoreDetail from './Detail';
import Edit from './Edit';
import StoreMainPage from './MainPage';

export default () => {
  const access = useAccess();
  return (
    <CrudWrapper baseURL={SalePaths.store} disablePageContainer>
      {(view, id, navigate) => {
        return (
          (view === 'list' && (
            <StoreMainPage/>
          )) ||
          (view === 'detail' && (
            <StockStoreDetail
              id={id as number}
              actionHandlers={{
                onBack: navigate?.gotToListHandler,
              }} onEdit={function (id?: number): void {
                throw new Error('Function not implemented.');
              } } onAdd={function (): void {
                throw new Error('Function not implemented.');
              } }            />
          )) ||
          (view === 'create' && (
            <Access
              accessible={access.canCreateEditStockControl}
              fallback={<div>Unauthorized</div>}
            >
              <Create />
            </Access>
          )) ||
          (view === 'edit' && (
            <Access
              accessible={access.canCreateEditStockControl}
              fallback={<div>Unauthorized</div>}
            >
              <Edit id={id as number} />
            </Access>
          ))
        );
      }}
    </CrudWrapper>
  );
};
