import TableView from '@/components/DataCrud/TableView';
import { simpleRequestActions } from '@/services/model';

export default ({ }) => {
  const requestActions = simpleRequestActions();
  return (
    <>
      <TableView
        actionHandlers={{
          onRequest:(criteria, pagination, sort) => {
              return Promise.resolve({
                items:[],

              })
          },
        }}
        columns={[
          {
            title: "Store Name",
            dataIndex: "name"
          },
          {
            title: "Store Type",
            dataIndex: "type"
          },
          {
            title: "Responsibility",
            dataIndex: "type"
          },
          {
            title: "Status",
            dataIndex: "status"
          },
          {
            title: "Created By",
            dataIndex: "type"
          },
          {
            title: "Created Date",
            dataIndex: "type",
            valueType: "date"
          },
        ]}
      />
    </>
  );
};
