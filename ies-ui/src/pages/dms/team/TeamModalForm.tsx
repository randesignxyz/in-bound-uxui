import FormModalComp, { FormModalProps } from "@/components/FormModal";
import { ProForm, ProFormSelect, ProFormText, ProFormTextArea } from "@ant-design/pro-components";


interface Props extends FormModalProps{

}

const TeamModalForm:React.FC<Props> = ({...props}:Props) =>{

    return (
        <FormModalComp
            {...props}
            width="500px"
            title="Create Folder Team Share"
        >
            <ProForm
                submitter={false}
            >
                <ProFormText
                    name="name"
                    label="Name"
                />
                <ProFormSelect
                    name={"role"}
                    label="Folder Team Role"
                    options={[
                        {
                            value:"share",
                            label:"Share to Other"
                        },
                        {
                            value:"globle",
                            label:"Accept Other"
                        },
                        {
                            value:"user",
                            label:"User Share Share"
                        },
                        {
                            value:"internal",
                            label:"Internal Share"
                        },
                    ]}
                />
                <ProFormTextArea
                    name={"description"}

                />
                
            </ProForm>

        </FormModalComp>
    )
}

export default TeamModalForm