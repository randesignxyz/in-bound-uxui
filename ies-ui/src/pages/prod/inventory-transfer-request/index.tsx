import CrudWrapper from '@/components/DataCrud/CrudWrapper';
import { ProdPaths } from '..';
import ListView from './Listview';
export default () => {
  return (
    <CrudWrapper baseURL={ProdPaths.transferRequest}>
      {(view) => {
        return view === 'list' && <ListView />;
      }}
    </CrudWrapper>
  );
};
