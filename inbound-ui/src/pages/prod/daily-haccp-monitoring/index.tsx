import CrudWrapper from '@/components/DataCrud/CrudWrapper';
import { ProdPaths } from '..';
import ListView from './Listview';
import DetailView from './DetailView';
import InstructionView from './InstructionView';
export default () => {
  return (
    <CrudWrapper baseURL={ProdPaths.dailyHACCPMonitoring}>
      {(view,id) => {
        switch (view){
          case 'create' : return <InstructionView/>
          case 'list' :return <ListView/>
          case 'detail' : return <DetailView id={id as string || ''}/>
          default: throw new Error('Not supported')
        }
      }}
    </CrudWrapper>
  );
};
