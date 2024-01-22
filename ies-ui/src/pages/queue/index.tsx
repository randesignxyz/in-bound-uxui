import ListMenuComp, { ListMenuItem } from "@/components/ListMenu"
import queueIcon from '@/assets/queue.png'
import ticketIcon from '@/assets/ticket.png'
import trollyIcon from '@/assets/trolley.png'
import settingIcon from '@/assets/settings.png'
import qrCodeIcon from '@/assets/qr-code.png'
import forkLift from '@/assets/fork-lift.png'
import { Divider } from "antd"

export const QueuePaths = {
   ticket: '/queue/ticket',
   ticketBoard: '/queue/ticket-board',

   setting: '/queue/setting',
   display: '/queue/display',
   loadingBoard: '/queue/loading-board',
   loadingHistory: '/delivery/loading-history',
   loadingDock: '/queue/loading-dock',
   loadingBay: '/queue/loading-bay',
   qrCode: '/queue/qr-code',
   history: '/queue/ticket-history',
}

const items: ListMenuItem[] = [
   {
      id: 'ticket',
      name: 'Queue Ticket',
      description: 'Queue Ticket List',
      link: `${QueuePaths.ticket}/list`,
      icon: ticketIcon
   },
   {
      id: 'ticketBoard',
      name: 'Ticket Board',
      description: 'Ticket List',
      link: `${QueuePaths.ticketBoard}`,
      icon: ticketIcon
   },
   {
      id: 'dashboard',
      name: 'Loading Board',
      description: 'Manage Loading',
      link: `${QueuePaths.loadingBoard}`,
      icon: forkLift
   },
   {
      id: 'dashboard',
      name: 'Queue Board',
      description: 'Display Board',
      link: `${QueuePaths.display}`,
      icon: queueIcon
   },
   
]

const setupItems = [
   {
      id: 'queue',
      name: 'Queue',
      description: 'Queue List',
      link: `${QueuePaths.setting}/list`,
      icon: settingIcon
   },
   {
      id: 'qrCode',
      name: 'QR Code',
      description: 'QR Code List',
      link: `${QueuePaths.qrCode}/list`,
      icon: qrCodeIcon
   },
   {
      id: 'loadingBay',
      name: 'Loading Bay',
      description: 'Loading Bay List',
      link: `${QueuePaths.loadingBay}/list`,
      icon: trollyIcon
   },
   {
      id: 'loadingDock',
      name: 'Loading Dock',
      description: 'Loading Dock List',
      link: `${QueuePaths.loadingDock}/list`,
      icon: trollyIcon
   }
]

export default () => {
   return <>
   <ListMenuComp items={items} />
   <Divider/>
   <ListMenuComp items={setupItems} />
   </> 
}