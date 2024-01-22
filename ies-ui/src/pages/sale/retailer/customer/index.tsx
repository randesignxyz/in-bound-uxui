import CrudWrapper from '@/components/DataCrud/CrudWrapper';
import { RetailerPath } from '..';
import CustomerDetailView from './CustomerDetailView';
import CustomerEdit from './CustomerEdit';
import CustomerListView from './CustomerListView';
import CustomerRequest from './CustomerUpgrade';

export default () => {
  // const access = useAccess();
  return (
    <CrudWrapper baseURL={RetailerPath.customer}>
      {(view, id, navigate) => {
        return (
          (view === 'list' && (
            <CustomerListView
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
          (view === 'detail' && (
            <CustomerDetailView
              id={id as string}
              // eslint-disable-next-line @typescript-eslint/no-shadow
              onEdit={(id) => {
                navigate?.gotoEdit?.({ id: id });
              }}
            />
          )) ||
          (view === 'edit' && <CustomerEdit />) ||
          (view === 'create' && <CustomerRequest />)
        );

        //  ||
        //    view === 'create' && <Access accessible = {access.canCreateEditSo} fallback={<div>Unauthorized</div>}> <Create/> </Access> ||
        //    view === 'edit' && <Access accessible = {access.canCreateEditSo} fallback={<div>Unauthorized</div>}> <Edit id = {id as number}/> </Access>
      }}
    </CrudWrapper>
  );
};
