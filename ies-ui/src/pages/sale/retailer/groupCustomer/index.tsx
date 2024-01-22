import CrudWrapper from '@/components/DataCrud/CrudWrapper';
import { RetailerPath } from '..';
import GroupCustomerDetail from '../groupCustomer/GroupCustomerDetail';
import GroupCustomerForm from './GroupCustomerForm';
import GroupCustomerListView from './GroupCustomerListView';

export default () => {
  // const access = useAccess();
  return (
    <CrudWrapper baseURL={RetailerPath.customergroup}>
      {(view, id, navigate) => {
        return (
          (view === 'list' && (
            <GroupCustomerListView
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
            <GroupCustomerDetail
              id={id as string}
              // eslint-disable-next-line @typescript-eslint/no-shadow
              onEdit={(id) => {
                navigate?.gotoEdit?.({ id: id });
              }}
              //onAdd={() => navigate?.goToCreate?.()}
            />
          )) ||
          (view === 'create' && <GroupCustomerForm type="new" />) ||
          (view === 'edit' && <GroupCustomerForm type="edit" id={id as string} />)
        );

        //  ||
        //    view == 'create' && <Access accessible = {access.canCreateEditSo} fallback={<div>Unauthorized</div>}> <Create/> </Access> ||
        //    view == 'edit' && <Access accessible = {access.canCreateEditSo} fallback={<div>Unauthorized</div>}> <Edit id = {id as number}/> </Access>
      }}
    </CrudWrapper>
  );
};
