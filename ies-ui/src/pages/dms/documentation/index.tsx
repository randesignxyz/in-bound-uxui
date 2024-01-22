
import CrudWrapper from '@/components/DataCrud/CrudWrapper';
import { DMSPaths } from '..';
import DocumentationDetail from './DetailView';

export default () => {
  return (
    <CrudWrapper baseURL={DMSPaths.document}>
      {(view, id, navigate) => {
        return (
          view == 'detail' && (
            <DocumentationDetail id={parseInt(`${id}`)}/>

          )
        );
      }}
    </CrudWrapper>
  );
};
