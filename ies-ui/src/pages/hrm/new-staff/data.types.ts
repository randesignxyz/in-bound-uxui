import { SavePayLoad } from "@/pages/fma/new-staff/data.types";
import { SavePayLoad as SavePayLoadICT } from '@/pages/ict/new-staff/data.types';

export type SaveNewStaffPayLoad = {
    fma: SavePayLoad;
    ict: SavePayLoadICT;
}