export enum MotorStatus {
    InOperation = "InOperation",
    Reserve = "Reserve",
    Repair = "Repair",
    Scrapped = "Scrapped"
}

export enum MaintenanceType {
    Lubrication = "Lubrication",
    BearingReplacement = "BearingReplacement",
    StatorRewinding = "StatorRewinding",
    ShaftRepair = "ShaftRepair"
}

export interface LocationHistoryDto {
    id: number;
    location: string;
    startDate: string;      // ISO string
    endDate: string | null;
}

export interface MaintenanceLogDto {
    id: number;
    workType: string;
    date: string;
    comment: string;
}

export interface MotorFullHistoryDto {
    inventoryNumber: number;
    type: string;
    dimensions: string;
    power: number;
    speed: number;
    frontBearingType: string;
    rearBearingType: string;
    status: MotorStatus;
    locationHistory: LocationHistoryDto[];
    maintenanceLogs: MaintenanceLogDto[];
}

export interface CreateMotorDto {
    inventoryNumber: number;
    type: string;
    dimensions: string;
    power: number;
    speed: number;
    frontBearingType: string;
    rearBearingType: string;
    status: MotorStatus;
    initialLocation: string;
}

export interface MoveMotorDto {
    newLocation: string;
    newStatus?: MotorStatus;
}

export interface MaintenanceDto {
    workType: MaintenanceType;
    comment: string;
}

export interface MotorListItem {
    inventoryNumber: number;
    type: string;
    power: number;
    status: MotorStatus;
    currentLocation: string;   // добавлено поле текущего местоположения
}

export interface UpdateMotorStatusDto {
    status: MotorStatus;
}

export interface UpdateMotorRequest {
    type: string;
    dimensions: string;
    power: number;
    speed: number;
    frontBearingType: string;
    rearBearingType: string;
    status: MotorStatus;
}

// Пагинированный результат (соответствует бэкенду)
export interface PagedResult<T> {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}