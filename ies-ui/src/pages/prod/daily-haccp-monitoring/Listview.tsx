import BreadCrumbCom from '@/pages/sale/retailer/components/BreadCrumbCom';
import { useAccess } from '@umijs/max';
import { ProdPaths } from '..';
import { useEffect, useRef, useState } from 'react';
import { Moment } from 'moment';
import moment from 'moment';
import { simpleRequestActions } from '@/services/model';
import { ActionType, ProForm, ProFormSelect, ProTable } from '@ant-design/pro-components';
import { Badge, Button, Card, Col, DatePicker, Flex, Modal, Progress, Row, Space, Tag, Tooltip, Typography, message } from 'antd';
import { ArrowRightOutlined, EditOutlined, EllipsisOutlined, FileExcelOutlined, PlusOutlined, RedoOutlined, SettingOutlined } from '@ant-design/icons';
import { DailyHACCPMonitoringServiceAPI } from './service';
import { HACCPMonitoring } from './data';
import FormModal from './FormModal';
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
  const services = DailyHACCPMonitoringServiceAPI(requestActions);
  const actionRef = useRef<ActionType>();
  const [data, setData] = useState<HACCPMonitoring[]>([])
  const { Text } = Typography;
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
      label: 'Daily HACCP Monitoring',
    },
  ];

  const line = [
    // {
    //   name: 'Line 1'
    // },
    {
      name: 'Line 2'
    },
    {
      name: 'Line 3'
    },
    {
      name: 'Line 4'
    },
    {
      name: 'Line 5'
    },
    {
      name: 'Line 6'
    }
  ]

  useEffect(() => {
    const getData = async () => {
      const dateWithoutTime = date?.format("YYYY-MM-DD");
      const data = await services.getHaccpByDate(dateWithoutTime)
      setData(data)
    }
    getData()
    setOnRefresh(false)
  }, [date, onRefresh == true])

  return (
    <>
      <BreadCrumbCom separator=">" routes={routes} />
      <Card size="small" style={{ textAlign: 'right', marginBottom: 10, marginTop: 10 }}>
        <Space >
          <ProForm submitter={false}>
          </ProForm>
          <DatePicker onChange={(v => setDate(v))} value={date} style={{ marginTop: 7 }} />
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
      <Card>

        <Row gutter={16}>

          {line.map((item, index) => {
            // Filter data based on the current line name
            const filteredData = data.filter(i => i.line === item.name);
            const total = (filteredData[0]?.haccplist.length || 0)
            const warningStatus = (filteredData[0]?.haccplist || []).filter(item => item.status === 'warning').length;
            const normalStatus = (filteredData[0]?.haccplist || []).filter(item => item.status === 'normal').length;
            const percentage = total > 0 ? ((normalStatus / total) * 100).toFixed(2) : '0.00';

            return (
              <Col span={8} key={index}>
                <Card
                  title={item.name}
                  extra={<a
                    onClick={() => (filteredData[0] ? (history.push(`/prod/daily-haccp-monitoring/detail/${filteredData[0]?.assign_date}/${filteredData[0]?.line}/${filteredData[0]?.haccp_id}`))
                      : {})
                    }>
                    <ArrowRightOutlined />
                  </a>}
                  style={{ marginTop: 40, borderWidth: '2px', borderStyle: 'solid',
                    borderColor: filteredData[0] !== undefined ? 'rgba(216, 204, 120, 0.5)' : 'rgba(128, 128, 128, 0.1)',
                      
                    }}
                  actions={[
                    <Badge status={'success'} text={`Total: ${total}`} />,
                    <Badge status={'error'} text={`Warning: ${warningStatus}`} />,
                    <Badge status={'processing'} text={`Normal: ${normalStatus}`} />,
                  ]}
                >
                  <Flex
                    vertical
                    gap="small"
                    style={{
                      // width: 150,
                    }}
                  >
                    <Progress
                      percent={parseFloat(percentage)}
                      strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
                      size="small"
                      status="active"
                    />
                    <Col >
                      <Row>
                        <Text>Assign To: {filteredData[0]?.assign_to || 'N/A'}</Text>
                      </Row>
                    </Col>
                    {/* {filteredData.map((i, idx) => (
                  <p key={idx}>{i.value}</p>
                ))} */}
                  </Flex>
                </Card>
              </Col>
            );
          })}
        </Row>
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
                  await services.assign_haccp(data[i])
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
        onSave={async (duration, line) => {
          const result = {
            line: line,
            startDate: dayjs(duration[0]).format('YYYY-MM-DD'),
            endDate: dayjs(duration[1]).format('YYYY-MM-DD'),
            pre: 'haccp'
          };
          try {
            setExcelLoading(true)
            await downloadReport(requestActions)({
              fileName: `daily-haccp-monitoring-report-${moment().toDate().toDateString()}`,
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
