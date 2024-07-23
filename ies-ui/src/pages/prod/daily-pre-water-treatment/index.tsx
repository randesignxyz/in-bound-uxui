import CrudWrapper from '@/components/DataCrud/CrudWrapper';
import { ProdPaths } from '..';
import ListView from './Listview';
import DetailView from './DetailView';
export default () => {
  return (
    <CrudWrapper baseURL={ProdPaths.dailyPreWaterTreatment}>
      {(view,id) => {
        switch (view){
          case 'list' :return <ListView/>
          case 'detail' : return <DetailView id={id as string || ''}/>
          default: throw new Error('Not supported')
        }
      }}
    </CrudWrapper>
  );
};
