
import CrudWrapper from '@/components/DataCrud/CrudWrapper';
import { DMSPaths } from '..';

export default () => {
    
  return (
    <CrudWrapper baseURL={DMSPaths.contracts} >
      {(view, id, navigate) => {
        return (
         <></>
        );
      }}
    </CrudWrapper>
  );
};
