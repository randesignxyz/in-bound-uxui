import { simpleRequestActions } from "@/services/model"
import { useEffect, useState } from "react";
import { ShareDTO } from "./data";
import { useParams } from "@umijs/max";
import DetailView from "../documentation/DetailView";
import { ShareServiceAPI } from "./service";

interface Props{
    id:number;
}

export default ({id}:Props)=>{

    const requestActions = simpleRequestActions();
    const [shared, setShared] = useState<ShareDTO>();
    const params = useParams();

    const fetchData = async()=>{
        const data = await ShareServiceAPI(requestActions).fetch(id);
        setShared(data)
    }
    useEffect(()=>{
        fetchData();
    } ,[params["id"]])
    return (
        <>
            {shared &&(
                       <DetailView
                       share={shared}
                       id={shared?.document.id ||0}
                  />
            )}
        </>
    )
}