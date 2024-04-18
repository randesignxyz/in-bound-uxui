import { ProDescriptions } from "@ant-design/pro-components";
import { Card, Drawer, DrawerProps } from "antd";
import { TeamsDTO } from "./data";


interface Props extends DrawerProps{
    data?:TeamsDTO;
}

const TeamsDetail:React.FC<Props> = ({data,...props}) =>{

    return (
        <>
            <Drawer

                {...props}
                width={600}
                title="Group Detail"
            >
                <Card
                    
                >
                    <ProDescriptions
                        dataSource={data}
                        columns={[
                            {
                                title:""
                            }
                        ]}
                    />

                </Card>

                

            </Drawer>
        </>
    )
}

export default TeamsDetail