import CrudWrapper from '@/components/DataCrud/CrudWrapper';
import { ProdPaths } from '..';
import ListView from './Listview';

export default () => {
  return (
    <CrudWrapper baseURL={ProdPaths.sparePartRequest}>
      {(view) => {
        switch (view) {
          case 'list':
            return <ListView />;
          default:
            throw new Error('Not supported');
        }
      }}
    </CrudWrapper>
  );
};
