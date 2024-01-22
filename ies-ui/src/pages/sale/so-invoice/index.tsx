import CrudWrapper from '@/components/DataCrud/CrudWrapper';
import { Access, useAccess } from 'umi';
// import { Access, useAccess } from 'umi';
import { SalePaths } from '..';
import CreateSoInvoice from './Create';
import EditSoInvoice from './Edit';
import SoInvoiceListView from './List';
// import StockControlDetail from './Detail';
// import StockListView from './List';

export default () => {
  const access = useAccess();
  return (
    <CrudWrapper baseURL={SalePaths.soInvoice}>
      {(view, id, navigate) => {
        return (
          (view === 'list' && (
            <SoInvoiceListView
              actionHandlers={{
                onAdd: navigate?.goToCreate,
                onDetail: navigate?.goToDetail,
              }}
            />
          )) ||
          (view === 'create' && (
            <Access accessible={access.canCreateEditSo} fallback={<div>Unauthorized</div>}>
              {' '}
              <CreateSoInvoice />{' '}
            </Access>
          )) ||
          (view === 'edit' && (
            <Access accessible={access.canCreateEditSo} fallback={<div>Unauthorized</div>}>
              {' '}
              <EditSoInvoice id={id as number} />{' '}
            </Access>
          ))
          //   ||
          //   (view === 'detail' && (
          //     <StockControlDetail
          //       id={id as number}
          //       actionHandlers={{
          //         onBack: navigate?.gotToListHandler,
          //       }}
          //     />
          //   ))
        );

        //
      }}
    </CrudWrapper>
  );
};
