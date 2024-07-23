import { ProDescriptions } from '@ant-design/pro-components';
import { Card, Divider, Drawer, DrawerProps, Space } from 'antd';
import { DriverDTO } from './data';
import { formatDate } from '@/pages/utils';

interface Props extends DrawerProps {
  data?: DriverDTO;
}
export default ({ data, ...props }: Props) => {
  return (
    <>
      <Drawer {...props}
        width={720}
        styles={{
          body: {
            padding: 20, margin: 0, backgroundColor: '#fafafa'
          }
        }}
      >
        <Space size="large" direction='vertical'>
          <Card
            bordered={false}
            title="Basic Infomation"
            size='small'
          >
            <ProDescriptions<DriverDTO>
              dataSource={data}
              columns={[
                {
                  key: "1",
                  label: "Full Name",
                  render: (_, r) => [r.firstName, r.lastName].filter(it => it).join(" ")
                },
                {
                  key: "2",
                  label: "Date Of Birth",
                  dataIndex: "dob",
                  valueType: "date"
                },
                {
                  key: "3",
                  label: "Card Id",
                  dataIndex: "cardId",
                },
                {
                  key: "4",
                  label: "Phone Number",
                  dataIndex: "phone",
                },
                {
                  key: "5",
                  label: "Email",
                  dataIndex: "email",
                },
                {
                  key: "6",
                  label: "Lecence Driver",
                  dataIndex: "driverLicence",
                },
                {
                  key: "7",
                  label: "Employee No",
                  dataIndex: "employeeNumber",
                },
                {
                  key: "8",
                  label: "Resign",
                  dataIndex: "resign",
                },
                {
                  key: "9",
                  label: "Status",
                  dataIndex: "status",
                },
                {
                  key: "10",
                  label: "Job Title",
                  dataIndex: "jobTitle",
                },
                {
                  key: "11",
                  label: "Address",
                  dataIndex: "address",
                  span: 3
                },
              ]}
            />
          </Card>
          <Card
            bordered={false}
            title="Operation"
            size='small'
          >
            <ProDescriptions<DriverDTO>
              dataSource={data}
              column={2}
              contentStyle={{
                fontWeight: "bold"
              }}
              columns={[
                {
                  key: "1",
                  label: "Operation On",
                  render: (_, r) => r.vehicle?.plateNumber
                },
                {
                  key: "2",
                  label: "Type",
                  render: (_, r) => r.vehicleDriver?.driverType
                },
                {
                  key: "3",
                  label: "Start Date",
                  render: (_, r) => formatDate(r.vehicleDriver?.startDate)
                },
                {
                  key: "4",
                  label: "End Date",
                  render: (_, r) => formatDate(r.vehicleDriver?.startDate)
                },
                {
                  key: "5",
                  label: "Assigned Date",
                  render: (_, r) => formatDate(r.vehicleDriver?.createdDate)
                },
                {
                  key: "6",
                  label: "Assigned By",
                  render: (_, r) => r.vehicleDriver?.createdBy
                },
                {
                  key: "7",
                  label: "Reason",
                  render: (_, r) => r.vehicleDriver?.reason
                },
              ]}
            />
          </Card>
        </Space>
        <ProDescriptions />
      </Drawer >
    </>
  );
};
