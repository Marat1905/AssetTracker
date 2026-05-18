// types/index.ts

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

export enum MountingType {
    Feet = "Feet",
    FeetAndFlange = "FeetAndFlange",
    Flange = "Flange",
    SmallFlange = "SmallFlange",
    FeetAndSmallFlange = "FeetAndSmallFlange"
}

export enum BearingPosition {
    Front = "Front",
    Rear = "Rear"
}

// --- DTO для подшипников ---
export interface Bearing {
    id: number;
    type: string;
    manufacturer?: string;
    supplier?: string;
}

export interface CreateBearingDto {
    type: string;
    manufacturer?: string;
    supplier?: string;
}

export interface UpdateBearingDto {
    type: string;
    manufacturer?: string;
    supplier?: string;
}

// --- DTO для двигателей (расширены ID подшипников) ---
export interface LocationHistoryDto {
    id: number;
    location: string;
    startDate: string;
    endDate: string | null;
}

export interface MaintenanceLogDto {
    id: number;
    workType: string;
    date: string;
    comment: string;
    bearingPosition?: string;
    lubricantTypeId?: number;
    lubricantTypeName?: string;
    oldBearingId?: number;
    oldBearingType?: string;
    oldBearingManufacturer?: string;
    oldBearingSupplier?: string;
    newBearingId?: number;
    newBearingType?: string;
    newBearingManufacturer?: string;
    newBearingSupplier?: string;
}

export interface MotorFullHistoryDto {
    inventoryNumber: number;
    type: string;
    shaftDiameter: number;
    power: number;
    speed: number;
    frontBearingId?: number;
    rearBearingId?: number;
    frontBearingType: string;
    rearBearingType: string;
    frontBearingManufacturer?: string;
    rearBearingManufacturer?: string;
    frontBearingSupplier?: string;
    rearBearingSupplier?: string;
    status: MotorStatus;
    mountingType: MountingType;
    locationHistory: LocationHistoryDto[];
    maintenanceLogs: MaintenanceLogDto[];
    frontBearingLastLubricant?: string;
    rearBearingLastLubricant?: string;
}

export interface CreateMotorDto {
    inventoryNumber: number;
    type: string;
    shaftDiameter: number;
    power: number;
    speed: number;
    frontBearingId?: number;
    rearBearingId?: number;
    status: MotorStatus;
    initialLocation: string;
    mountingType: MountingType;
}

export interface UpdateMotorRequest {
    type: string;
    shaftDiameter: number;
    power: number;
    speed: number;
    frontBearingId?: number;
    rearBearingId?: number;
    status: MotorStatus;
    mountingType: MountingType;
}

export interface MoveMotorDto {
    newLocation: string;
    newStatus?: MotorStatus;
}

export interface MaintenanceDto {
    workType: MaintenanceType;
    comment: string;
    bearingPosition?: BearingPosition;
    lubricantTypeId?: number;
    newBearingId?: number;          // теперь ID, а не строка
}

export interface MotorListItem {
    inventoryNumber: number;
    type: string;
    power: number;
    status: MotorStatus;
    currentLocation: string;
    frontBearingType?: string;
    rearBearingType?: string;
}

export interface UpdateMaintenanceLogDto {
    comment?: string;
    lubricantTypeId?: number;
    newBearingId?: number;
}

export interface UpdateLocationHistoryDto {
    location: string;
}

export interface PagedResult<T> {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}

// --- DTO для типа смазки (без изменений) ---
export interface LubricantType {
    id: number;
    name: string;
    description?: string;
}

export interface CreateLubricantTypeDto {
    name: string;
    description?: string;
}

export interface UpdateLubricantTypeDto {
    name: string;
    description?: string;
}