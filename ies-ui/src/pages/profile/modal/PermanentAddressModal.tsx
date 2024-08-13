import { LookupDataItem2 } from "@/services/data"
import { ModalForm, ModalFormProps,ProCard, ProFormDatePicker, ProFormSelect, ProFormText, ProFormTextArea } from "@ant-design/pro-components"
import { useForm } from "antd/lib/form/Form"
import { SaveEssProfile,LocationData } from "../data.ess"
import { Spin,message} from 'antd';
import { useEffect,useState } from 'react'; 
import { simpleRequestActions } from '@/services/model';
import { ProfileServicesEss } from '../service_ess'; 

interface Props extends ModalFormProps<SaveEssProfile> { 
    data?: SaveEssProfile,
    locations?:LocationData[];
}

export default ({ data,locations, ...rest }: Props) => {
    const requestActions = simpleRequestActions();

    const [district, setDistrict] = useState<LocationData[]>();
    const [commune, setCommune] = useState<LocationData[]>();
    const [isLoading,setLoading] = useState(false); 

    const [form] = useForm<SaveEssProfile>()

    useEffect(() => {
        initData();
    }, [data]);
    const initData = async () => { 
        form.setFieldsValue(data)
    }; 
    
    const districtList = async(val:number)=>{
        try {
            const list = await ProfileServicesEss.listLocation(val).query(requestActions);
            setDistrict(list); 
            setLoading(false);
        } catch (error: any) {
            setLoading(false);
            message.error(error.message || 'Failed to load data.');
        } 
    }
    const communeList = async(val:number)=>{
        try {
            const list = await ProfileServicesEss.listLocation(val).query(requestActions);
            setCommune(list); 
            setLoading(false);
        } catch (error: any) {
            setLoading(false);
            message.error(error.message || 'Failed to load data.');
        }  
    }

    return <ModalForm  {...rest} form={form} width={'30%'} title="Modify permanent adress"
        onOpenChange={visible => {
            form.resetFields() 
            rest.onOpenChange?.(visible)
        }}

        submitter={{
            searchConfig: {
                submitText: 'Save',
                resetText: 'Cancel',
            },
        }} 
        >
        <Spin spinning = {isLoading}> 
        
            <ProCard bordered> 
                <ProFormSelect 
                    label="City/ Province" 
                    name={'province_id'}
                    options={locations?.map((it) => {
                        return { value: it.id, label: it.internal_name };
                    })}
                    fieldProps={{
                        onChange: (val) => {
                            setLoading(true);
                            districtList(val); 
                        }, 
                    }}
                />         
                {/*  */}
                <ProFormSelect 
                    label="Khan/ District" 
                    name={'district_id'}
                    options={district?.map((it) => {
                        return { value: it.id, label: it.internal_name };
                    })}
                    fieldProps={{
                        onChange: (val) => {
                            setLoading(true);
                            communeList(val); 
                        }, 
                    }}
                />         
                {/*  */}
                <ProFormSelect 
                    label="Sangkhat/ Commune" 
                    name={'commune_id'}
                    options={commune?.map((it) => {
                        return { value: it.id, label: it.internal_name };
                    })}
                />
                {/*  */}
                <ProFormText label="House No" name={'home_no'} />  
                <ProFormText label="Street" name={'street'} /> 
                <ProFormText label="Group/Village" name={'village_id'} />
                <ProFormTextArea name={'remark'} label='Remark'/>
            </ProCard>
        </Spin>

    </ModalForm>
}