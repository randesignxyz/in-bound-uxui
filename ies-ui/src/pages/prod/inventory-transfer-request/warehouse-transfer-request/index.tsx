import CrudWrapper from '@/components/DataCrud/CrudWrapper';
import { ProdPaths } from '../..';
import ListView from './WarehouseTransferReqListview';
import Detail from './Detail/index';

export default () => {
  return (
    <>
      <CrudWrapper baseURL={ProdPaths.inventoryTransfer}>
        {(view, id, navigate) => {
          return (
            view === 'list' && (
              <ListView
                onAdd={() => navigate?.goToCreate?.()}
                onDetail={(id) => {
                  navigate?.goToDetail?.({ id: id });
                }}
                onEdit={(id) => {
                  navigate?.gotoEdit?.({ id: id });
                }}
              />
            )
            // ||
            // (view === 'create' && <EntryForm  />)

            // ||(view ==="detail" && <Detail id={id as string} /> )
          );
        }}
      </CrudWrapper>
    </>
  );
};
