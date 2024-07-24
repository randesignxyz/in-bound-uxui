
import CrudWrapper from '@/components/DataCrud/CrudWrapper';
import { DMSPaths } from '..';
import DocumentationDetail from './DetailView';
import DocumentMainPage from './MainPage';

export default () => {
  return ( 
    //  <DocumentMainPage/>
    <CrudWrapper baseURL={DMSPaths.document} disablePageContainer>
      {(view, id, navigate) => {
        return (
          view == 'detail' && (
            <DocumentationDetail id={parseInt(`${id}`)} />
          ) 
        );
      }}
    </CrudWrapper>
  );
};
