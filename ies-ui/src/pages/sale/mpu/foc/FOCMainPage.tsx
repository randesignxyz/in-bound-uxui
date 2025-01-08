import PageWrapper from "@/components/PageWrapper"


interface Props{

}

const FOCMainPage:React.FC<Props> =()=>{
    
    return (
        <PageWrapper
            listView={{
                type:"Table",
                title:"FOC",
                statuses:[
                    {option:{ label:"Open", value:"OPEN" }},
                    {option:{ label:"Closed", value:"CLOSED" }},
                ],
                props:{
                    columns:[
                        {
                            title:"Customer",

                        },
                        {
                            title:""
                        },
                    ]
                }
            }}
        />
    )
}


export default FOCMainPage