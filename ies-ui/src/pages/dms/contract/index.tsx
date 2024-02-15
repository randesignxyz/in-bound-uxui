
import CrudWrapper from '@/components/DataCrud/CrudWrapper';
import { DMSPaths } from '..';
import ContractsDetail from './ContractDetail';
import CompanyDetail from './company/CompanyDetail';


export default () => {
    

    
  return (
    <CrudWrapper baseURL={DMSPaths.contracts} >
      {(view, id, navigate) => {
        console.log(view);
        
        return (
          view == 'detail' && (
            <ContractsDetail id={parseInt(`${id}`)}/>

          )
        );
      }}
    </CrudWrapper>
  );
};
