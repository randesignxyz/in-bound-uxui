import CrudWrapper from '@/components/DataCrud/CrudWrapper';
import { RetailerPath } from '..';
import PricingDetailView from './PricingDetailView';
import PricingEntryFormView from './PricingEntryFormView';
import PricingListView from './PricingListView';

export default () => {
  // const access = useAccess();
  return (
    <CrudWrapper baseURL={RetailerPath.pricing}>
      {(view, id, navigate) => {
        return (
          (view === 'list' && (
            <PricingListView
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
          (view === 'create' && <PricingEntryFormView type="new" />) ||
          (view === 'detail' && (
            <PricingDetailView
              id={id as string}
              // eslint-disable-next-line @typescript-eslint/no-shadow
              onEdit={(id) => {
                navigate?.gotoEdit?.({ id: id });
              }}
              onAdd={() => navigate?.goToCreate?.()}
            />
          )) ||
          (view === 'edit' && <PricingEntryFormView type="edit" id={id as string} />)
        );
      }}
    </CrudWrapper>
  );
};
