import { simpleRequestActions } from "@/services/model";
import { ProForm, ProFormSelect, ProFormText, ProFormTextArea } from "@ant-design/pro-components"

import { Col, Row, Space } from "antd"
import { useForm } from "antd/es/form/Form";
import { useEffect, useState } from "react";
import FormModalComp, { FormModalProps } from "@/components/FormModal";
import { LookupDataServiceAPI } from "../lookupData/service";
import { LookUpDataDTO } from "../lookupData/data";
import { VehicleServiceAPI } from "../vehicle/service";
import { CarOutlined } from "@ant-design/icons";
import { ServiceTasksCreate, ServiceTasksDTO } from "./data";

interface Props extends FormModalProps {
  data?: ServiceTasksDTO;
  onSave: (data: ServiceTasksCreate) => void;
  actionType?: String;
  id?: string;

}



const ServiceTasksModalForm: React.FC<Props> = ({ onSave, data, actionType, id, ...props }) => {
  const [form] = useForm<ServiceTasksCreate>();
  const requestActions = simpleRequestActions()
  const [lookupData, setLookupData] = useState<LookUpDataDTO[]>([]);

  useEffect(() => {
    props.open && initFormData();
    props.open && dataLoad()
    props.open && truckLoadData()
  }, [props.open]);

  const dataLoad = async () => {
    setLookupData(
      await LookupDataServiceAPI(requestActions).lookupData({ type: "MAINTENANCEPLAN" })
    )
  }


  const truckLoadData = async (value?: string) => {
    const response = await VehicleServiceAPI(requestActions).pageVehicle({
      criteria: { searchValue: value },
      pagination: { pageSize: 20 }
    });
    const data = response.items.map((obj) => ({
      value: obj.id,
      label: (
        <>
          <Space>
            <CarOutlined twoToneColor={"#eb2f96"} />
            {`${obj.plateNumber}`}
            {`${obj.make.name}`}-{`${obj.weight.name}`}
          </Space>

        </>
      ),
      key: Math.random().toString()
    }))
  }



  const initFormData = () => {

    form.setFieldsValue({
      name:data?.name,
      status: data?.status || "Active",
      description: data?.description
    });
  };


  return (

    <FormModalComp
      title="Create Service Task"
      {...props}
      width={"400px"}
      onSubmit={async () => {
        const dataForm = await form.validateFields();
        const entity = {
          ...dataForm,
          id:data?.id
        }
        onSave(entity)
      
      }}
    >

      <ProForm
        form={form}
        submitter={false}
        onReset={() => form.resetFields()}
      >


        <Row gutter={4}>
            <Col span={24}>
                <ProFormText
                    rules={[{required:true}]}
                    name='name'
                    label="Name"
                />
            </Col>
            <Col span={24}>
                <ProFormSelect
                    rules={[{required:true}]}
                    name='status'
                    label="Status"
                    options={
                      [
                        {
                          key:"active",
                          label:"Active",
                          value:"Active"
                        },
                        {
                          key:"inactive",
                          label:"Inactive",
                          value:"Inactive"
                        }
                      ]
                    }
                />
            </Col>
            <Col span={24}>
                <ProFormTextArea
                    name={"description"}
                    label="Description"
                />
            </Col>
        </Row>

      </ProForm>


    </FormModalComp>
  );
};

export default ServiceTasksModalForm;        
