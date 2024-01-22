import { Avatar } from "antd";
import {  ClockCircleOutlined, CheckOutlined, CloseOutlined, RiseOutlined } from "@ant-design/icons";

const TaskStatus = ({ status }: { status: string }) => (
    <Avatar
      style={{ backgroundColor: status === 'COMPLETED' ? 'gray' :  status === 'REJECTED' ? 'black':  'green' }}
      icon={status === 'COMPLETED' ? <CheckOutlined /> : status === 'PENDING'?  <ClockCircleOutlined />: status === 'REJECTED'? <CloseOutlined />:  <RiseOutlined />}
    />
  )

export default TaskStatus