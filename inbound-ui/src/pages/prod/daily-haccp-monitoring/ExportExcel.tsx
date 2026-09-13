import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { ProFormDateRangePicker, ProFormDateTimeRangePicker, ProFormSelect } from '@ant-design/pro-components';
import ProForm from '@ant-design/pro-form';
import { Card, Col, Row } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect, useState } from 'react';
import { simpleRequestActions } from '@/services/model';
import { DailyHACCPMonitoringServiceAPI } from './service';

interface Props extends FormModalProps {
  // id: string;
  // transfer_id:string,
  loading: boolean
  onSave: (duration: string, line: string) => void;
}
export default ({ loading, onSave, ...props }: Props) => {
  const [form] = useForm<{ line: string; duration: any }>();
  const [line, setLine] = useState('')
  const requestActions = simpleRequestActions();
  const services = DailyHACCPMonitoringServiceAPI(requestActions);
  const [allLine, setAllLine] = useState([])
  const [disabledOptions, setDisabledOptions] = useState({
    Line2: false,
    Line3: false,
    Line4: false,
    Line5: false,
    Line6: false,
    Line7: false,
    Line8: false,
    LineBarrel: false
  });

  useEffect(() => {
    if (props.open) {
      form.resetFields();
      setLine('')
      setDisabledOptions({
        Line2: false,
        Line3: false,
        Line4: false,
        Line5: false,
        Line6: false,
        Line7: false,
        Line8: false,
        LineBarrel: false
      })
    }
  }, [props.open]);

  useEffect(() => {
    const getData = async () => {
      const line = await services.get_line();
      const activeLines = line
        .filter((item: { active: string }) => item.active === "1")
        .map((item: { active: string; prdname: string }) => {
          let label = item.prdname; // Default label
          if (item.prdname === "Barrel 01") {
            return { ...item, value: 'Line Barrel', label: 'Line Barrel', disabled: disabledOptions.LineBarrel };
          } else if (item.prdname === "Production Line 02") {
            return { ...item, value: 'Line 2', label: 'Line 2', disabled: disabledOptions.Line2 };
          } else if (item.prdname === "Production Line 03") {
            return { ...item, value: 'Line 3', label: 'Line 3', disabled: disabledOptions.Line3 };
          } else if (item.prdname === "Production Line 04") {
            return { ...item, value: 'Line 4', label: 'Line 4', disabled: disabledOptions.Line4 };
          } else if (item.prdname === "Production Line 05") {
            return { ...item, value: 'Line 5', label: 'Line 5', disabled: disabledOptions.Line5 };
          } else if (item.prdname === "Production Line 06") {
            return { ...item, value: 'Line 6', label: 'Line 6', disabled: disabledOptions.Line6 };
          } else if (item.prdname === "Production Line 07") {
            return { ...item, value: 'Production Line 07', label: 'Line 07', disabled: disabledOptions.Line7 };
          } else if (item.prdname === "Production Line 08") {
            return { ...item, value: 'Production Line 08', label: 'Line 08', disabled: disabledOptions.Line8 };
          }
  
          return {
            label,
            value: label,
            disabled: true,
          };
        });
  
      setAllLine(activeLines);
    };
    getData();
  }, [disabledOptions]);

  const handleLineChange = (value: string[]) => {
    const disableGroup1 = value.includes('Line 2') || value.includes('Line 3'); // Group 1: Line 2 & 3
    const disableGroup2 = value.includes('Line 7') || value.includes('Line 8'); // Group 2: Line 7 & 8
    const disableGroup3 = value.includes('Line 4') || value.includes('Line 5') || value.includes('Line 6'); // Group 3: Line 4, 5, 6
    const disableAllExceptBarrel = value.includes('Line Barrel'); // Barrel disables all other lines
  
    setDisabledOptions({
      // Group 1 disables Group 3 & Group 2
      Line2: disableGroup3 || disableGroup2 || disableAllExceptBarrel,
      Line3: disableGroup3 || disableGroup2 || disableAllExceptBarrel,
  
      // Group 2 disables Group 3 & Group 1
      Line7: disableGroup3 || disableGroup1 || disableAllExceptBarrel,
      Line8: disableGroup3 || disableGroup1 || disableAllExceptBarrel,
  
      // Group 3 disables Group 1 & Group 2
      Line4: disableGroup1 || disableGroup2 || disableAllExceptBarrel,
      Line5: disableGroup1 || disableGroup2 || disableAllExceptBarrel,
      Line6: disableGroup1 || disableGroup2 || disableAllExceptBarrel,
  
      // Line Barrel disables all except itself
      LineBarrel: disableGroup1 || disableGroup2 || disableGroup3,
    });
  
    const lineString = value.join(',');
    setLine(lineString);
  };

  return (
    <FormModalComp
      width="550px"
      {...props}
      confirmLoading={loading}
      onResetForm={() => form.resetFields()}
      onSubmit={async () => {
        const dataForm = await form.validateFields();
        onSave(dataForm.duration, line);
      }}
    >
      <Card>
        <ProForm form={form} submitter={false}>
          <Row gutter={6}>
            <Col span={23}>
              <ProFormSelect
                options={allLine}
                name="line"
                label="Line"
                mode="multiple"
                fieldProps={{
                  onChange: handleLineChange,
                }}
                rules={[{ required: true }]}
              />
            </Col>
          </Row>
          <Row gutter={6}>
            <Col span={24}>
              <ProFormDateRangePicker
                width={'lg'}
                name="duration"
                label="Duration (Assign Date)"
                placeholder={['start', 'end']}
                fieldProps={{
                  format: 'YYYY-MM-DD',
                }}
                rules={[{ required: true }]}
              />
            </Col>
          </Row>
          {/* <Text>{id}</Text>
          <Text>{transfer_id}</Text> */}
        </ProForm>
      </Card>
    </FormModalComp>
  );
};
