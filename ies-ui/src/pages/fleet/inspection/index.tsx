import CrudWrapper from '@/components/DataCrud/CrudWrapper';
import { FleetPaths } from '..';
import DetailView from './DetailView';
import EntryForm from './EntryForm';
import ListView from './Listview';

export default () => {
  return (
    <CrudWrapper baseURL={FleetPaths.inspection}>
      {(view, id, navigate) => {
        return (
          (view == 'list' && (
            <ListView
              onAdd={() => navigate?.goToCreate?.()}
              onDetail={(id) => {
                navigate?.goToDetail?.({ id: id });
              }}
              onEdit={(id) => {
                navigate?.gotoEdit?.({ id: id });
              }}
            />
          )) ||
          (view === 'create' && <EntryForm />) ||
          (view === 'detail' && <DetailView id={id as string} />)
        );
      }}
    </CrudWrapper>
  );
};
