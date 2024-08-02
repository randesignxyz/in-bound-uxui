import { Moment } from "moment";

export type LocationTracking = {
    processInstanceId: number;
    deliveryId: number;
    deliveryDate: Moment;
    finishedDate: Moment;
    shift: string;
    cardCode: string;
    cardName: string;
    shipToCode: string;
    checkInDate: Moment;
    checkInLat: number;
    checkInLng: number;
    checkoutDate: Moment;
    checkoutLat: number;
    checkoutLng: number;
    firstName: string;
    lastName: string;
    licensePlane: string;
}