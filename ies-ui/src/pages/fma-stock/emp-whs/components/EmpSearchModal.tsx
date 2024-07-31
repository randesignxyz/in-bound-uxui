import FormModalComp, { FormModalProps } from "@/components/FormModal";
import { ModalForm, ModalFormProps } from "@ant-design/pro-components";
import { Button, Card, Input, List, Space, Typography } from "antd";
import { EmployeeList } from "../data.types";
import { Paging } from "@/services/API";
import { PhoneOutlined, PlusOutlined, UserOutlined } from "@ant-design/icons";

interface Props extends ModalFormProps {
    loading?: boolean;
    added?: number[];
    onSearch?: (value?: string) => void;
    onAssign:(emp: EmployeeList) => void;
    data?: Paging<EmployeeList>;
}

const EmpSearchModal: React.FC<Props> = ({loading, added, onAssign, onSearch, data, ...rest})=>{
    // const onAssign=(emp: EmployeeList)=>{

    // }
    return  <ModalForm 
        title="Search Employee" 
        {...rest} 
        modalProps={{
            footer:false,            
        }}
        submitter={false}
    >
       <Card size='small' extra={(
            <Space>
                <Input.Search onSearch={onSearch} />
            </Space>
        )}>
            <List<EmployeeList>
                  loading={loading}
                  dataSource={data?.items || []}
                  renderItem={item => (
                    <List.Item actions={ added?.some(id => id == item.id)?[]:[<Button onClick = {() => onAssign?.(item)} type='link' icon={<PlusOutlined />} />]}>
                        <List.Item.Meta
                            avatar={<UserOutlined />}
                            title={
                                <Space>
                                    <Typography.Text strong >{[item.employeeCode, item.employeeLocalName, (item.firstName +' '+item.lastName)].filter(it => it).join("/ ")}</Typography.Text>
                                    <Typography.Text style={{ fontSize: 12 }} type="secondary">{item.jobTitle}</Typography.Text>
                                </Space>
                            }
                            description={(
                                <div>
                                    <div>
                                        <Space>
                                            {['Department: '+item.department, 'BU: '+ item.bu].filter(it => it).map((it, index) => (
                                                <Space key={`pnone_${index}`} align='baseline'><Typography.Text>{it}</Typography.Text></Space>
                                            ))}
                                          
                                        </Space>
                                    </div>
                                </div>
                            )}
                        />
                    </List.Item>
                )}
            />
        </Card>
    </ModalForm>
}
export default EmpSearchModal