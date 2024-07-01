import CrudWrapper from '@/components/DataCrud/CrudWrapper';
import { ProdPaths } from '..';
import ListView from './Listview';
import ReceiveForm from './ReceiveForm';
export default () => {
  return (
    // <CrudWrapper baseURL={ProdPaths.transferRequest}>
    //   {(view) => {
    //     return view === 'list' && <ListView />;
    //   }}
    // </CrudWrapper>
    <CrudWrapper baseURL={ProdPaths.transferRequest}>
    {
      (view,id) => {
        switch (view){
          case 'list' :return <ListView/>
          case 'create' : return <ReceiveForm/>
          default: throw new Error('Not supported')
        }
      // return view === 'list' && <ListView />;
    }}
  </CrudWrapper>
  );
};
