import ListMenuComp from "@/components/ListMenu";
import { useAccess } from "@umijs/max";


export const FleetPaths = {
  request: '/fleet/booking/request',

};
export default () => {
  const access = useAccess();
  const items = [
    {
      id: 'Booking Request',
      name: 'Booking Request',
      description: 'Booking Request',
      link: `${FleetPaths.request}`,
    },
    // {
    //   id: 'bookingcar',
    //   name: 'Request Car',
    //   description: 'Booking Car List',
    //   link: `${FleetPaths.fleet}/carbooking`,
    //   icon: requestCar,
    // },
    // {
    //   id: 'maintenance',
    //   name: 'Maintenance & Service',
    //   description: 'Manage Maintenance ',
    //   link: `/fleet/maintenance/list`,
    //   icon: vehicletool,
    //   isMenu: true,
    // },

    // {
    //   id: 'inspection',
    //   name: 'Inspection',
    //   description: 'Inspection On Vehicle',
    //   link: `/fleet/inspection/list`,
    //   icon: carcheck,
    //   isMenu: true,
    // },
    // {
    //   id: 'flue',
    //   name: 'Fuel Consumption',
    //   description: 'Vehicle Fuel Consumption',
    //   link: `/fleet/fuel/list`,
    //   icon: fuelStation,
    //   isMenu: true,
    // },
    // {
    //   id: 'maintenanceplan',
    //   name: 'Service Reminder',
    //   description: 'Service Reminder and Alert',
    //   link: `/fleet/maintenance-and-service/list`,
    //   icon: maintenancePlan,
    //   isMenu: true,
    // },

    // {
    //   id: 'dashboard',
    //   name: 'Dashboard',
    //   description: 'Analysis as Graphic',
    //   link: `/fleet/dashboard/list`,
    //   icon: dashboard,
    //   isMenu: true,
    // },
    // // {
    // //   id: 'servicetasks',
    // //   name: 'Service Tasks',
    // //   description: 'Create and View Tasks',
    // //   link: `/fleet/service-tasks/list`,
    // //   icon: taskList,
    // //   isMenu: true,
    // // },
    // {
    //   id: 'stock',
    //   name: 'Fuel & Energy',
    //   description: 'Diesel and Lubricant',
    //   link: `/fleet/stock/list`,
    //   icon: fuelStock,
    //   isMenu: true,
    // },
    // // {
    // //   id: 'accessory',
    // //   name: 'Accessory Stock',
    // //   description: 'Track spare auto parts inventory',
    // //   link: `/fleet/accessory/list`,
    // //   icon: inventory,
    // //   isMenu: true,
    // // },
    // {
    //   id: 'setting',
    //   name: 'Setting',
    //   description: 'Modules set up ',
    //   link: `/fleet/setting/driver`,
    //   icon: addon,
    //   isMenu: true,
    // },
   
  ];
  

  return (
      <ListMenuComp items={items} />
  );
}
