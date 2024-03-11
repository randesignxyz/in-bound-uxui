
import CrudWrapper from '@/components/DataCrud/CrudWrapper';
import { DMSPaths } from '..';
import DetailView from './DetailView';

export default () => {
  return (
    <CrudWrapper baseURL={DMSPaths.document}>
      {(view, id) => {
        return (
          view == 'detail' && (<DetailView id={parseInt(`${id}`)} />) 
        );
      }}
    </CrudWrapper>
  );
};
