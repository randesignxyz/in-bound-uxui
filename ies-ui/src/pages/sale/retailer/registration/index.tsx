import CrudWrapper from '@/components/DataCrud/CrudWrapper';
import { RetailerPath } from '..';
import RegistrationDetailView from './RegistrationDetailView';
import RegistrationFormListView from './RegistrationFormListView';

export default () => {
  // const access = useAccess();
  return (
    <CrudWrapper baseURL={RetailerPath.registration}>
      {(view, id, navigate) => {
        return (
          (view === 'list' && (
            <RegistrationFormListView
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
          // || (view === 'create' && <ProductEntryFormView type="new" />)
          (view === 'detail' && (
            <RegistrationDetailView
              id={id as string}
              // onEdit={(id) => {
              //   navigate?.gotoEdit?.({ id: id });
              // }}
              //onAdd={() => navigate?.goToCreate?.()}
            />
          ))
          // || (view === 'edit' && <ProductEntryFormView type="edit" id={id as string} />)
        );
      }}
    </CrudWrapper>
  );
};
