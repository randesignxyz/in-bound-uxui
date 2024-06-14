import CrudWrapper from '@/components/DataCrud/CrudWrapper';
import { FleetPaths } from '..';
import Listview from './ListView';
import { PageContainer } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import ListView from './ListView';
export default () => {
  return (
    <ListView/>
    // <PageContainer
    //   title="Services Reminder"
    //   onBack={()=>history.back()}
    // >
    //   <CrudWrapper baseURL={FleetPaths.inspection}>
    //     {(view, id, navigate) => {
    //       return (
    //         view == 'list' && (
    //           <Listview
    //             onAdd={() => navigate?.goToCreate?.()}
    //             onDetail={(id) => {
    //               navigate?.goToDetail?.({ id: id });
    //             }}
    //             onEdit={(id) => {
    //               navigate?.gotoEdit?.({ id: id });
    //             }}
    //           />
    //         )
    //       );
    //     }}
    //   </CrudWrapper>
    // </PageContainer>
  );
};
