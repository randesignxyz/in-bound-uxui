import CrudWrapper from '@/components/DataCrud/CrudWrapper';
import { ProdPaths } from '@/pages/prod';
import ListView from './WarehouseTransferReqListview';

export default () => {
  return (
    <>
      <CrudWrapper baseURL={ProdPaths.inventoryInboundRequest}>
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
