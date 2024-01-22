import { Drawer, DrawerProps } from "antd";

interface Props extends DrawerProps{

}

const GroupDetail:React.FC<Props> = ({...props}) =>{

    return (
        <>
            <Drawer

                {...props}
                width={600}
                title="Group Detail"
            >

                sas

            </Drawer>
        </>
    )
}

export default GroupDetail