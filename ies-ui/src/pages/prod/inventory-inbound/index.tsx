import CrudWrapper from '@/components/DataCrud/CrudWrapper';
import { ProdPaths } from '..';
import ListView from './Listview';

export default () => {
  return (
    <CrudWrapper baseURL={ProdPaths.inventoryInbound}>
      {(view) => {
        if (view === 'list') {
          return <ListView />;
        }
        throw new Error('Not supported');
      }}
    </CrudWrapper>
  );
};
