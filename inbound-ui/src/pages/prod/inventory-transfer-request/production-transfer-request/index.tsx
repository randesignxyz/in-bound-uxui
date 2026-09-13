import CrudWrapper from '@/components/DataCrud/CrudWrapper';
import { ProdPaths } from '../..';
import ListView from './ProductionTransferReqListview';
import Detail from './Detail';
export default () => {
  return (
    <>
      <CrudWrapper baseURL={ProdPaths.dailyWaterTreatment}>
      {(view,id) => {
        switch (view){
          case 'list' :return <ListView/>
          case 'detail' : return <Detail id={id as string || ''}/>
          default: throw new Error('Not supported')
        }
      }}
    </CrudWrapper>
    </>
  );
};
