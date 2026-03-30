import CrudWrapper from '@/components/DataCrud/CrudWrapper';
import ListView from './ListView';
import { ProdPaths } from '../..';

export default () => {
  return (
    <CrudWrapper baseURL={ProdPaths.sparePartRequestTest}>
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