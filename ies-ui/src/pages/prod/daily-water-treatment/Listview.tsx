import BreadCrumbCom from '@/pages/sale/retailer/components/BreadCrumbCom';
import { useAccess } from '@umijs/max';
import { Button, Card, DatePicker, Flex, Modal, Progress, Space, Tabs, Tag, Tooltip, message } from 'antd';
import { ProdPaths } from '..';
import ShiftListview from './ShiftListview';
import { FileExcelOutlined, PlusOutlined, RedoOutlined } from '@ant-design/icons';
import { useEffect, useRef, useState } from 'react';
import { Moment } from 'moment';
import moment from 'moment';
import FormModal from './FormModal';
import { AssignDailyWaterTreatment, DailyWaterTreatmentMachine } from './data';
import { DailyWaterTreatmentMachineServiceAPI } from './service';
import { simpleRequestActions } from '@/services/model';
import { ActionType, ProTable } from '@ant-design/pro-components';
import { history } from 'umi'
import ExportExcel from './ExportExcel';
import { downloadReport } from '@/services/apiGateway';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

export default () => {
  dayjs.extend(utc);
  dayjs.extend(timezone);
  const access = useAccess();
  const [date, setDate] = useState<Moment>(moment());
  const [modalOpen, setModalOpen] = useState(false)
  const [onRefresh, setOnRefresh] = useState(false)
  const requestActions = simpleRequestActions();
  const services = DailyWaterTreatmentMachineServiceAPI(requestActions);
  const actionRef = useRef<ActionType>();
  const [data, setData] = useState<AssignDailyWaterTreatment[]>([])
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
      label: 'Daily Water Treatment Plant 2',
    },
  ];

  const shift = [
    {
      value: 'S1 (7:00)',
      label: 'S1 (7:00)',
    },
    {
      value: 'S1 (13:00)',
      label: 'S1 (13:00)',
    },
    {
      value: 'S2 (18:00)',
      label: 'S2 (18:00)',
    },
    {
      value: 'S2 (22:00)',
      label: 'S2 (22:00)',
    },
  ]

  useEffect(() => {
    const da = async () => {
      const dateWithoutTime = date?.format("YYYY-MM-DD");
      const list = await services.getTreatmentDaily(dateWithoutTime)
      setData(list)
    }
    da()
    setOnRefresh(false)
  }, [date, onRefresh == true])



  return (
    <>
      <BreadCrumbCom separator=">" routes={routes} />
      <Card size="small" style={{ textAlign: 'right', marginBottom: 10, marginTop: 10 }}>
        <Space >
          <DatePicker onChange={(v => setDate(v))} value={date} />
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

        {/* <Tabs
          items={[
            {
              label: 'S1',
              key: '1',
              children: <ShiftListview date={date} shift='S1 (7:00)' shift1='S1 (13:00)' refresh={onRefresh} onRefresh={(a)=>{a==true?setOnRefresh(true):setOnRefresh(false)}}/>,
            },
            {
              label: 'S2',
              key: '2',
              children: <ShiftListview date={date} shift='S2 (18:00)' shift1='S2 (22:00)' refresh={onRefresh} onRefresh={(a)=>{a==true?setOnRefresh(true):setOnRefresh(false)}}/>,
            },
          ]}
        /> */}
        <ProTable
          size="small"
          search={false}
          rowKey="id"
          dataSource={shift}
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
              title: 'Shift',
              width: 180,
              dataIndex: 'label',
              render: (_, record) => {
                const assignItem = data?.find(v => v.shift === record.label);
                return (
                  <a
                    onClick={() =>
                    (assignItem ?
                      (history.push(`/prod/daily-water-treatment/detail/${assignItem?.assign_date}/${assignItem?.shift}`))
                      : {})
                    }
                  >
                    {record.label}
                  </a>
                );
              },
            },
            {
              title: 'Assign To',
              width: 100,
              dataIndex: 'assign_to',
              render: (_, record) => {
                const assignTo = data.find(v => v.shift === record.label)?.assign_to;
                return assignTo ? assignTo : '-';
              },
            },
            {
              title: 'Progress',
              width: 100,
              render: (_, record) => {
                const assignItem = data.find(v => v.shift === record.label);
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

                const nonPendingCount = assignItem.treatmentlist.filter(
                  item => item.status !== 'pending'
                ).length;
                const totalCount = assignItem.treatmentlist.length;
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
                const assignItem = data.find(v => v.shift === record.label);
                const warningCount = assignItem?.treatmentlist.filter(
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
                for (let i = 0; i < data.length; i++) {
                  await services.assign_to(data[i])
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
      <ExportExcel
        title="Export Excel"
        open={exportModel.visible}
        loading={excelLoading}
        onCancel={() => setExportModal({ visible: false })}
        onSave={async (duration, shift) => {
          const result = {
            shift: shift,
            startDate: dayjs(duration[0]).format('YYYY-MM-DD'),
            endDate: dayjs(duration[1]).format('YYYY-MM-DD'),
          };
          try {
            setExcelLoading(true)
            await downloadReport(requestActions)({
              fileName: `daily-water-treatment-report-${moment().toDate().toDateString()}`,
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
      />
    </>
  );
};
