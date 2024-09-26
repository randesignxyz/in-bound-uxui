import BreadCrumbCom from '@/pages/sale/retailer/components/BreadCrumbCom';
import { useAccess } from '@umijs/max';
import { ProdPaths } from '..';
import { useEffect, useRef, useState } from 'react';
import { Moment } from 'moment';
import moment from 'moment';
import { simpleRequestActions } from '@/services/model';
import { ActionType, ProForm, ProFormSelect, ProTable } from '@ant-design/pro-components';
import { Button, Card, DatePicker, Flex, Modal, Progress, Row, Space, Tag, Tooltip, message } from 'antd';
import { FileExcelOutlined, PlusOutlined, RedoOutlined } from '@ant-design/icons';
// import { DailyPreWaterTreatmentServiceAPI } from './service';
// import { DailyPreWaterTreatment } from './data';
import { history } from 'umi'
// import FormModal from './FormModal';
// import ExportExcel from './ExportExcel';
import { downloadReport } from '@/services/apiGateway';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { HACCPMonitoringOzoneServiceAPI } from './service';
import FormModal from './FormModal';
import { HACCPMonitoringOzone } from './data';

export default () => {
  dayjs.extend(utc);
  dayjs.extend(timezone);
  const access = useAccess();
  const [date, setDate] = useState<Moment>(moment());
  const [modalOpen, setModalOpen] = useState(false)
  const [onRefresh, setOnRefresh] = useState(false)
  const requestActions = simpleRequestActions();
  const [list, setList]=useState<HACCPMonitoringOzone[]>([])
  const services = HACCPMonitoringOzoneServiceAPI(requestActions);
  const actionRef = useRef<ActionType>();
  // const [list, setList] = useState<DailyPreWaterTreatment[]>([]);
  const [initialValue, setInitialValue] = useState('Reverses Osmosis System (RO1)');
  const [excelLoading, setExcelLoading] = useState(false)
  const [exportModel, setExportModal] = useState<{ visible: boolean }>({
    visible: false,
  });
  const routes = [
    {
      path: ProdPaths.prod,
      label: 'Prod',
    },
    {
      path: '',
      label: 'HACCP Monitoring Ozone',
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
      const list = await services.getOzoneDaily(dateWithoutTime, initialValue)
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
            <Row style={{alignItems:'center'}}>
              <ProFormSelect
                style={{ marginTop: -5 }}
                request={async ({ }) => {
                  const data = await services.getOzoneSystem();

                  return data.map((obj: any) => ({
                    value: obj.ozone,
                    label: `${obj.ozone}`,
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
              <DatePicker onChange={(v => setDate(v))} value={date} style={{ height: '32px', marginLeft: 10 }} />
            </Row>
          </ProForm>
          {/* <DatePicker onChange={(v => setDate(v))} value={date} style={{ marginTop: 7 }} /> */}
          {access.canAssignItem ?
            <Tooltip title="Assign Task">
              <Button
                key="click-add"
                type="link"
                icon={<PlusOutlined />}
                onClick={() => setModalOpen(true)}
              />
            </Tooltip>
            : <></>}
          <Tooltip title="Dowload Excel File"><Button type="link" icon={<FileExcelOutlined />} onClick={() => setExportModal({ visible: true })} /></Tooltip>
          <Tooltip title="Refresh">
            <Button
              key="refresh"
              type="link"
              icon={<RedoOutlined />}
              onClick={() => setOnRefresh(true)}
            />
          </Tooltip>
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
                const assignItem = list?.find(v => v.time === record.name);
                return (
                  <a
                    onClick={() =>
                    (assignItem ?
                      (history.push(`/prod/daily-haccp-monitoring-ozone/detail/${assignItem?.haccp_ozone_id}/${assignItem?.time}/${assignItem?.haccp_ozone_type}`))
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

                const nonPendingCount = assignItem.ozonelist.filter(
                  item => item.status !== 'pending'
                ).length;
                const totalCount = assignItem.ozonelist.length;
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
                const warningCount = assignItem?.ozonelist.filter(
                  item => item.status == 'warning'
                ).length ?? 0;
                return (warningCount > 0 ?
                  <Tag color="error" bordered={false}>
                    warning
                  </Tag> : '')
              },
            },
            ...(access.canAssignItem ? [{
              width: 10,
              render: (_:any, record:any) => {
                const assignItem = list.find(v => v.time === record.name);
                return (assignItem ?
                  <Button onClick={async () => {
                    Modal.confirm({
                      title: "Unassign",
                      content: 'Are you sure to unassign? This assign will disappare forever',
                      onOk: async () => {
                        try {
                          await services.unassignOzone(assignItem.haccp_ozone_id)
                          setOnRefresh(true)
                          message.success('Success');
                        } catch (e: any) {
                          message.error(e.message);
                        }
                      }
                    })
                  }}
                  >Unassign</Button>
                  : <></>)
              }
            }] : []),

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
                for (let i = 0; i < data.length; i++) {
                  await services.assign_ozone_to_user(data[i])
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
      {/* <ExportExcel
        title="Export Excel"
        open={exportModel.visible}
        loading={excelLoading}
        onCancel={() => setExportModal({ visible: false })}
        onSave={async (duration, time, type) => {
          const result = {
            time: time,
            startDate: dayjs(duration[0]).format('YYYY-MM-DD'),
            endDate: dayjs(duration[1]).format('YYYY-MM-DD'),
            pre: 'pre-treatment',
            type: type
          };
          try {
            setExcelLoading(true)
            await downloadReport(requestActions)({
              fileName: `daily-water-pre-treatment-report-${moment().toDate().toDateString()}`,
              reportName: 'prod-daily-water-treatment-report',
              data: result,
              type: 'EXCEL',
              // target: '_blank'
            });
          } catch (error) {
            message.error('Failed to download.');
          } finally {
            setExcelLoading(false)
          }
          setExportModal({ visible: false });
        }}
      /> */}
    </>
  );
};
