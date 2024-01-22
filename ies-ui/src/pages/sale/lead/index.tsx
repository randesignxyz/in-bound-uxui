import CrudWrapper from '@/components/DataCrud/CrudWrapper';
import { SalePaths } from '..';
import LeadDetailView from './LeadDetailView';
import LeadEntryFormView from './LeadEntryFormView';
import LeadListView from './LeadListView';
// import StockControlDetail from './Detail';
// import LeadListView from './List';

export default () => {
  // const access = useAccess();
  return (
    <CrudWrapper baseURL={SalePaths.lead}>
      {(view, id, navigate) => {
        return (
          (view === 'list' && (
            <LeadListView
              onDetail={(id) => {
                navigate?.goToDetail?.({ id: id!! });
              }}
            />
          )) ||
          (view === 'detail' && (
            <LeadDetailView
              id={id as number}
              onEdit={(id) => {
                navigate?.gotoEdit?.({ id: id });
              }}
            // onAdd={() => navigate?.goToCreate?.()}
            />
          )) ||
          (view === 'edit' && <LeadEntryFormView type="edit" id={id as number} />)
        );

        //  ||
        //    view === 'create' && <Access accessible = {access.canCreateEditSo} fallback={<div>Unauthorized</div>}> <Create/> </Access> ||
        //
      }}
    </CrudWrapper>
  );
};
