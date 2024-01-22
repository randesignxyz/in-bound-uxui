import CrudWrapper from '@/components/DataCrud/CrudWrapper';
import { RetailerPath } from '..';
import ProductDetailView from './ProductDetailView';
import ProductEntryFormView from './ProductEntryFormView';
import ProductListView from './ProductListView';

export default () => {
  // const access = useAccess();
  return (
    <CrudWrapper baseURL={RetailerPath.productItem}>
      {(view, id, navigate) => {
        return (
          (view === 'list' && (
            <ProductListView
              onAdd={() => navigate?.goToCreate?.()}
              // eslint-disable-next-line @typescript-eslint/no-shadow
              onDetail={(id) => {
                navigate?.goToDetail?.({ id: id });
              }}
              // eslint-disable-next-line @typescript-eslint/no-shadow
              onEdit={(id) => {
                navigate?.gotoEdit?.({ id: id });
              }}
            />
          )) ||
          (view === 'create' && <ProductEntryFormView type="new" />) ||
          (view === 'detail' && (
            <ProductDetailView
              id={id as string}
              // eslint-disable-next-line @typescript-eslint/no-shadow
              onEdit={(id) => {
                navigate?.gotoEdit?.({ id: id });
              }}
              onAdd={() => navigate?.goToCreate?.()}
            />
          )) ||
          (view === 'edit' && <ProductEntryFormView type="edit" id={id as string} />)
        );

        //  ||
        //    view === 'create' && <Access accessible = {access.canCreateEditSo} fallback={<div>Unauthorized</div>}> <Create/> </Access> ||
        //    view === 'edit' && <Access accessible = {access.canCreateEditSo} fallback={<div>Unauthorized</div>}> <Edit id = {id as number}/> </Access>
      }}
    </CrudWrapper>
  );
};
