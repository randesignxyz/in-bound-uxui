import { Card, Typography } from "antd"


interface Props {

}

const ContractSales: React.FC<Props> = () => {

    return (
        <>
            <Card
                styles={{
                    body:{
                        textAlign:"center"
                    }
                }}
            >
                <Typography.Title type="warning" level={5} >This page under construction</Typography.Title>
            </Card>

        </>
    )
}


export default ContractSales