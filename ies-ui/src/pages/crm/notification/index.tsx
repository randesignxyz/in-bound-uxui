import CrudWrapper from '@/components/DataCrud/CrudWrapper';
// import { CrmPaths } from '.';
// import ContactDetailView from './components/Detail';
import { CrmPaths } from '@/pages/crm';
import CreateNotification from './components/Create';
import DetailNotification from './components/Detail';
import EditNotification from './components/Edit';
import { NotificationListView } from './components/List';

export default () => {
  return (
    <CrudWrapper baseURL={CrmPaths.notification}>
      {(view, id, navigate) => {
        switch (view) {
          case 'create':
            return <CreateNotification></CreateNotification>;
          case 'edit':
            return <EditNotification id={id as number}></EditNotification>;
          case 'list':
            return (
              <NotificationListView
                actionHandlers={{
                  onAdd: navigate?.goToCreate,
                  onDetail: navigate?.goToDetail,
                }}
              />
            );
          case 'detail':
            return <DetailNotification id={(id as number) || 0} />;
          default:
            throw new Error('Not supported');
        }
      }}
    </CrudWrapper>
  );
};
