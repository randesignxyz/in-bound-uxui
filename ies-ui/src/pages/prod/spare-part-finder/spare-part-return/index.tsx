import CrudWrapper from '@/components/DataCrud/CrudWrapper';
import ListView from './Listview';
import { ProdPaths } from '../..';

export default () => {
  return (
    <CrudWrapper baseURL={ProdPaths.sparePartReturn}>
      {(view, id) => {
        switch (view) {
          case 'list':
            return <ListView />;
          case 'detail':
            return <div>Detail View for ID: {id}</div>;
          case 'view':
            return <div>View Detail for ID: {id}</div>;
          default:
            throw new Error('View not supported: ' + view);
        }
      }}
    </CrudWrapper>
  );
};