import CrudWrapper from '@/components/DataCrud/CrudWrapper';
import { ProdPaths } from '..';
import ListView from './Listview';
import ShiftListview from './ShiftListview';
export default () => {
  return (
    <CrudWrapper baseURL={ProdPaths.dailyWaterTreatment}>
      {(view,id) => {
        switch (view){
          case 'list' :return <ListView/>
          case 'detail' : return <ShiftListview id={id as string || ''}/>
          default: throw new Error('Not supported')
        }
      }}
    </CrudWrapper>
  );
};
