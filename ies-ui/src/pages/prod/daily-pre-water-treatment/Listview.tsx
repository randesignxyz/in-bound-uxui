import BreadCrumbCom from '@/pages/sale/retailer/components/BreadCrumbCom';
import { useAccess } from '@umijs/max';
import { ProdPaths } from '..';
import { useEffect, useRef, useState } from 'react';
import { Moment } from 'moment';
import moment from 'moment';
import { simpleRequestActions } from '@/services/model';
import { ActionType, ProForm, ProFormSelect, ProTable } from '@ant-design/pro-components';
import { Button, Card, DatePicker, Flex, Modal, Progress, Space, Tag, message } from 'antd';
import { PlusOutlined, RedoOutlined } from '@ant-design/icons';
import { DailyPreWaterTreatmentServiceAPI } from './service';
import { DailyPreWaterTreatment } from './data';
import { history } from 'umi'
import FormModal from './FormModal';

export default () => {
  const access = useAccess();
  const [date, setDate] = useState<Moment>(moment());
  const [modalOpen, setModalOpen] = useState(false)
  const [onRefresh, setOnRefresh] = useState(false)
  const requestActions = simpleRequestActions();
  const services = DailyPreWaterTreatmentServiceAPI(requestActions);
  const actionRef = useRef<ActionType>();
  const [list, setList] = useState<DailyPreWaterTreatment[]>([]);
  const [initialValue, setInitialValue] = useState('Water Treatment Plant 2');
  const routes = [
    {
      path: ProdPaths.prod,
      label: 'Prod',
    },
    {
      path: '',
      label: 'Daily Pre Water Treatment',
    },
  ];

  const time = [
    {
      name: '7:00'
    },
    {
      name: '11:00'
    },
    {
      name: '15:00'
    },
    {
      name: '19:00'
    },
    {
      name: '23:00'
    },
    {
      name: '3:00'
    }
  ]

  useEffect(() => {
    const getList = async () => {
      const dateWithoutTime = date?.format("YYYY-MM-DD");
      const list = await services.getPreTreatmentByDate(dateWithoutTime, initialValue)
      setList(list)
    }
    getList()
    setOnRefresh(false)
  }, [date, initialValue, onRefresh == true])

  return (
    <>
      <BreadCrumbCom separator=">" routes={routes} />
      <Card size="small" style={{ textAlign: 'right', marginBottom: 10, marginTop: 10 }}>
        <Space >
          <ProForm submitter={false}>
            <ProFormSelect
            style={{marginTop:-10}}
              request={async ({ }) => {
                const data = await services.getPlant();

                return data.map((obj: any) => ({
                  value: obj.plant,
                  label: `${obj.plant}`,
                }));
              }}
              // options={options}
              fieldProps={{
                onChange: async (e: string) => {
                  setInitialValue(e)
                }
              }}
              name="plant"
              label=" "
              initialValue={initialValue}
            />

          </ProForm>
          <DatePicker onChange={(v => setDate(v))} value={date} style={{marginTop:7}}/>
          {access.canAssignItem ?
            <Button
              key="click-add"
              type="link"
              icon={<PlusOutlined />}
              onClick={() => setModalOpen(true)}
            />
            : <></>}
          <Button
            key="refresh"
            type="link"
            icon={<RedoOutlined />}
            onClick={() => setOnRefresh(true)}
          />
        </Space>
      </Card>
      <Card size="small">

        <ProTable
          size="small"
          search={false}
          rowKey="id"
          dataSource={time}
          options={{
            density: false,
            fullScreen: false,
            reload: false,
            setting: false,

          }}
          pagination={false}
          columns={[
            // {
            //   title: 'No',
            //   width: 10,
            //   render: (_, r, index) => index + 1
            // },
            {
              title: 'Time',
              width: 180,
              dataIndex: 'name',
              render: (_, record) => {
                const assignItem = list.find(v => v.time === record.name);
                return (
                  <a
                    onClick={() =>
                    (assignItem ?
                      (history.push(`/prod/daily-pre-water-treatment/detail/${assignItem?.pre_treatment_id}/${assignItem?.time}/${assignItem?.pre_treatment_type}`))
                      : {})
                    }
                  >
                    {record.name}
                  </a>
                );
              },
            },
            {
              title: 'Assign To',
              width: 100,
              dataIndex: 'assign_to',
              render: (_, record) => {
                const assignTo = list.find(v => v.time === record.name)?.assign_to;
                return assignTo ? assignTo : '-';
              },
            },
            {
              title: 'Progress',
              width: 100,
              render: (_, record) => {
                const assignItem = list.find(v => v.time === record.name);
                if (!assignItem) return <Flex
                  vertical
                  gap="small"
                  style={{
                    width: 150,
                  }}
                >
                  <Progress
                    percent={0}
                    strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
                    size="small"
                    status="active"
                  />
                </Flex>;

                const nonPendingCount = assignItem.pretreatmentlist.filter(
                  item => item.status !== 'pending'
                ).length;
                const totalCount = assignItem.pretreatmentlist.length;
                const percentage = totalCount > 0 ? ((nonPendingCount / totalCount) * 100).toFixed(2) : '0.00';

                return (
                  <Flex
                    vertical
                    gap="small"
                    style={{
                      width: 150,
                    }}
                  >
                    <Progress
                      percent={parseFloat(percentage)}
                      strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
                      size="small"
                      status="active"
                    />
                  </Flex>
                );
              },
            },
            {
              // title: 'Assign To',
              width: 50,
              render: (_, record) => {
                const assignItem = list.find(v => v.time === record.name);
                const warningCount = assignItem?.pretreatmentlist.filter(
                  item => item.status == 'warning'
                ).length ?? 0;
                return (warningCount > 0 ?
                  <Tag color="error" bordered={false}>
                    warning
                  </Tag> : '')
              },
            },

          ]}
        />
      </Card>
      <FormModal
        title="Assign Form"
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
        }}
        onSave={async (data: any) => {
          Modal.confirm({
            title: "Assign",
            content: 'are you sure',
            onOk: async () => {
              try {
                for (let i = 0; i < data.length; i++){
                  await services.assign_pre_water_treatment(data[i])
                }
                setModalOpen(false)
                setOnRefresh(true)
                message.success('Success');
              } catch (e: any) {
                message.error(e.message);
              }
            }
          })
        }}
      />
    </>
  );
};
