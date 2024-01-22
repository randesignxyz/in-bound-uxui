import { AccidentCreate, AccidentDTO } from '../../accident/data';
import { simpleRequestActions } from "@/services/model";
import { Button, Drawer, Modal, message, Divider, Space, Card } from 'antd';
import { useRef, useState } from "react";
import { AccidentServiceAPI } from "../../accident/service";
import AccidentModalForm from "../../accident/EntiryForm";
import { ActionType, ProDescriptions, ProTable } from "@ant-design/pro-components";
import { PlusOutlined } from "@ant-design/icons";
import { formatDate, formatter } from "@/pages/utils";
import AttachedFileList from '@/components/Attachment/AttachedFileList';


interface Props {
  id: string
}

export default ({ id }: Props) => {

  const requestActions = simpleRequestActions();
  const services = AccidentServiceAPI(requestActions);
  const actionRef = useRef<ActionType>();
  const [accident, setAccident] = useState<AccidentDTO[]>([]);

  const [drawer, setDrawer] = useState<{
    visible: boolean; entry?: AccidentDTO
  }>();
  const [state, setSate] = useState<{
    visible?: { name: 'modal'; type: 'ADD' | 'Edit'; payload?: { vehicle: AccidentDTO } };

  }>({});

  const onSaveHandler = (data: AccidentCreate) => {

    Modal.confirm({
      title: "Are you sure?",
      content: "Save Accident record",
      onOk: async () => {

        const response = await services.save(data) as ({
          data: string,
          message: string
        });
        setSate((v) => ({ ...v, visible: undefined }));
        message.success(response.message);
        actionRef.current?.reloadAndRest?.();
      }
    })
  };

  const onRequestHandle = async () => {

    const data = await services.page({
      criteria: { searchValue: id }
    });

    setAccident(data.items)
  }


  const onAddHandler = async () => {
    setSate((v) => ({
      ...v,
      visible: { name: 'modal', type: 'ADD' },
    }));
  };



  return (
    <>

      <ProTable
        search={false}
        actionRef={actionRef}
        toolBarRender={() => [
          <Button
            icon={<PlusOutlined />}
            type={"link"}
            onClick={() => onAddHandler()}
          />
        ]}
        options={{
          density: false,
          setting: false
        }}
        dataSource={accident}
        request={async () => {
          onRequestHandle()

          return accident || []
        }}
        columns={[
          {
            key: "date",
            title: "Accident Date",
            valueType: "dateTime",
            dataIndex: "accidentDate",
            render: (_, r) => (<>
              <Button
                type="link"
                onClick={() => setDrawer((v) => ({
                  ...v,
                  visible: true,
                  entry: r
                })
                )}
              >{formatDate(r.accidentDate)}</Button>
            </>)
          },
          {
            key: "drivername",
            title: "Driver Name",
            render: (_, r) => [r.driverName.firstName, r.driverName.lastName].filter(it => it).join("-")
          },

          {
            key: "payment",
            title: "Payment Out",
            dataIndex: "payment",
            render: (_, r) => formatter.format(r.payment)
          },
          {
            key: "accidentType",
            title: "Accident Type",
            render: (_, r) => [r.accidentType?.name, r.lightConditions?.name, r.weather?.name, r.preAccident?.name].filter(it => it).join("/")
          },
          {
            key: "createdBy",
            title: "Create By",
            dataIndex: "createdBy"
          }

        ]}

      />
      <AccidentModalForm
        open={state.visible?.name == 'modal'}
        onCancel={() => setSate((v) => ({ ...v, visible: undefined }))}
        onSave={onSaveHandler}
        id={id}
        data={state.visible?.payload?.vehicle}

      />


      <Drawer
        title="Detail"
        onClose={() => setDrawer((v) => ({ ...v, visible: false }))}
        open={drawer?.visible}
        width={720}
        styles={{
          body: {
            backgroundColor: "#fafafa"
          }
        }}

      >
        <Card>
          <ProDescriptions
            dataSource={drawer?.entry}
            contentStyle={{ fontWeight: 'bold' }}
            column={3}
            columns={[
              {
                title: "Employee Number",
                key: "employeeNumber",
                render: (_, r) => r.driverName?.employeeNumber,
              },
              {
                title: "Driver Name",
                key: "driverName",
                render: (_, r) => [r.driverName.firstName, r.driverName?.lastName].filter(it => it).join("")
              },
              {
                title: "Phone Number",
                key: "phoneNumber",
                render: (_, r) => r.driverName?.phone,
              },
              {
                title: "Resign",
                key: "resign",
                render: (_, r) => r.driverName?.resign,
                span: 4
              },

            ]}
          />
          <Divider orientation='left'>Accident Infomation</Divider>

          <ProDescriptions
            layout='vertical'
            contentStyle={{ fontWeight: 'bold' }}
            columns={[

              {
                title: "Date ",
                key: "date",
                valueType: "date",
                dataIndex: "accidentDate"
              },
              {
                title: "Police Report",
                key: "policeReport",
                dataIndex: "policeReport",
                render: (_, r) => r.policeReport != false ? "YES" : "NO"
              },
              {
                title: "Payment Out",
                key: "payment",
                dataIndex: "payment",
                render: (_, r) => formatter.format(r.payment)
              },
              {
                title: "Accident Type",
                key: "accidentType",
                render: (_, r) => r.accidentType?.name,
              },
              {
                title: "Weather",
                key: "weather",
                render: (_, r) => r.weather?.name,
              },
              {
                title: "Light Condition",
                key: "lightCondition",
                render: (_, r) => r.lightConditions?.name,
              },
              {
                title: "Pre-Accident",
                key: "preAccidnet",
                render: (_, r) => r.preAccident?.name,
              },
              {
                title: "Location",
                key: "Address",
                dataIndex: "locationAccident",
                span: 3
              },
              {
                title: "Description",
                key: "description",
                dataIndex: "description"
              },
            ]}
            dataSource={drawer?.entry}

          />
        </Card>
        <AttachedFileList
          initFiles={drawer?.entry?.attacheFile}
          readonly
        />
        <hr />
        <Space direction='vertical' style={{ color: "#8c8c8c" }}>
          <span>created by : {drawer?.entry?.createdBy}</span>
          <span>created date : {formatDate(drawer?.entry?.createdDate)}</span>
          <span>last modified by : {drawer?.entry?.lastModifiedBy}</span>
        </Space>
      </Drawer>

    </>








  )
}