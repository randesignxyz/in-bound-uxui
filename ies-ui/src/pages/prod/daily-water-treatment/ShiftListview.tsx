import { simpleRequestActions } from '@/services/model';
import { PlusOutlined, RedoOutlined } from '@ant-design/icons';
import { ActionType, ProCard, ProForm, ProFormText, ProTable } from '@ant-design/pro-components';
import { useAccess, useModel } from '@umijs/max';
import { Badge, Button, Card, Col, DatePicker, Descriptions, Divider, Flex, Modal, Progress, Radio, Row, Select, Space, Tabs, Tag, Typography, message } from 'antd';
import { useEffect, useRef, useState } from 'react';
import FormModal from './FormModal';
import { AssignDailyWaterTreatment, DailyWaterTreatmentItem, GetTreatmentByDateAssignParam } from './data';
import { DailyWaterTreatmentMachineServiceAPI } from './service';
import { useForm } from 'antd/lib/form/Form';
import moment, { Moment } from 'moment';
import RawWaterStockModel from './RawWaterStockModel';
import FilterModel from './FilterModel';
import MicroModel from './MicroModel';
import ReversesModel from './ReversesModel';
import { formatDate, formatDateTime } from '@/pages/utils';
import ActivitiesModel from './ActivitiesModel';
import { ProdPaths } from '..';
import BreadCrumbCom from '@/pages/fleet/components/BreadCrumbCom';
import DescriptionDisplay from '@/components/Descriptions';
import ItemTab from './ItemTab';

interface Props {
  id: string,
  onAdd?: () => void;
  shift?: string,
  shift1?: string,
  date?: Moment,
  refresh?: boolean,
}

export default ({ id, onAdd, shift, shift1, date, refresh }: Props) => {
  const { Text } = Typography;
  const requestActions = simpleRequestActions();
  const access = useAccess();
  const services = DailyWaterTreatmentMachineServiceAPI(requestActions);
  const actionRef = useRef<ActionType>();
  const [form] = useForm<AssignDailyWaterTreatment>();
  const [onRefresh, setOnRefresh] = useState(false)
  const [data, setData] = useState<AssignDailyWaterTreatment>()
  const routes = [
    {
      path: ProdPaths.prod,
      label: 'Prod',
    },
    {
      path: `${ProdPaths.dailyWaterTreatment}/list`,
      label: 'Daily Water Treatment Plant 2',
    },
    {
      path: '',
      label: 'Deatil',
    },
  ];

  useEffect(() => {
    const part = id.split("/");
    const date = moment(part[0]).format("YYYY-MM-DD")
    const data = async () => {
      const da = await services.get_treatment_by_date(date, part[1])
      setData(da[0])
      setOnRefresh(false)
    }
    data()
  }, [id, onRefresh == true])

  return (
    <>
      <BreadCrumbCom separator=">" routes={routes} />
      <ProForm form={form} onReset={() => form.resetFields()} submitter={false}>
        <Card size="small" style={{ textAlign: 'left', marginBottom: 10, marginTop: 20 }}>
          <Space >
            <ProForm submitter={false}>
              <DescriptionDisplay
                data={[
                  { label: 'Assign Date', value: formatDate(data?.assign_date) },
                  { label: 'Shift', value: data?.shift },
                  { label: 'Assign To', value: data?.assign_to },
                  // { label: 'Type', value: data?.pre_treatment_type },
                  { label: 'Created By', value: data?.createdBy },
                  { label: 'Created Date', value: formatDateTime(data?.createdDate) },
                  { label: 'Remark', value: data?.remark ? data?.remark : '-' },
                ]}
              />
            </ProForm>
          </Space>
        </Card>
        <Card size="small" style={{ textAlign: 'right', marginBottom: 10, marginTop: 20 }}>
          <Tabs
            items={[
              {
                label: 'List',
                key: '1',
                children: <ItemTab data={data ?? {}} refresh={(v) => { v == true ? setOnRefresh(true) : setOnRefresh(false) }} />,
              },
              {
                label: 'Activities',
                key: '2',
                children: <ActivitiesModel data={data?.treatment_id ?? ''} />,
              },
            ]}
          />
        </Card>
      </ProForm>
    </>
  );
};
