import CrudWrapper from '@/components/DataCrud/CrudWrapper';
import { ProPaths } from '..';
import DataEntryView from './DataEntryView';
import ListView from './ListView';

export default () => {
  return (
    <CrudWrapper baseURL={ProPaths.priceComparison}>
      {(view, id, navigate) => {
        switch (view) {
          case 'list':
            return (
              <ListView
                onAdd={(id) => navigate?.goToCreate?.({ id })}
                onEdit={(id) => navigate?.gotoEdit?.({ id })}
              />
            );
          case 'create':
            return (
              <DataEntryView
                onBack={() => navigate?.gotToListHandler?.()}
                type="CREATE"
                id={id as number}
              />
            );
          case 'edit':
            return (
              <DataEntryView
                onBack={() => navigate?.gotToListHandler?.()}
                type="EDIT"
                id={id as number}
              />
            );
          case 'detail':
            return <div></div>;
          default:
            throw Error('Not supported');
        }
      }}
    </CrudWrapper>
  );
};
