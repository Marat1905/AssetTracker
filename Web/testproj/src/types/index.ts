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
    Feet = "Feet",                      // Лапы
    FeetAndFlange = "FeetAndFlange",    // Лапы и фланец
    Flange = "Flange",                  // Фланец
    SmallFlange = "SmallFlange",        // Малый фланец
    FeetAndSmallFlange = "FeetAndSmallFlange" // Лапы и малый фланец
}

// --- Добавлено: позиция подшипника ---
export enum BearingPosition {
    Front = "Front",
    Rear = "Rear"
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
    bearingPosition?: string;       // "Front" / "Rear"
    lubricantTypeId?: number;
    lubricantTypeName?: string;
}

export interface MotorFullHistoryDto {
    inventoryNumber: number;
    type: string;
    shaftDiameter: number;
    power: number;
    speed: number;
    frontBearingType: string;
    rearBearingType: string;
    status: MotorStatus;
    mountingType: MountingType;
    locationHistory: LocationHistoryDto[];
    maintenanceLogs: MaintenanceLogDto[];
    // Новые поля для последней использованной смазки
    frontBearingLastLubricant?: string;   // Название последней смазки переднего подшипника
    rearBearingLastLubricant?: string;    // Название последней смазки заднего подшипника
}

export interface CreateMotorDto {
    inventoryNumber: number;
    type: string;
    shaftDiameter: number;   // мм
    power: number;
    speed: number;
    frontBearingType: string;
    rearBearingType: string;
    status: MotorStatus;
    initialLocation: string;
    mountingType: MountingType;
}

export interface MoveMotorDto {
    newLocation: string;
    newStatus?: MotorStatus;
}

export interface MaintenanceDto {
    workType: MaintenanceType;
    comment: string;
    bearingPosition?: BearingPosition;   // только для смазки
    lubricantTypeId?: number;            // только для смазки
}

export interface MotorListItem {
    inventoryNumber: number;
    type: string;
    power: number;
    status: MotorStatus;
    currentLocation: string;
}

export interface UpdateMotorStatusDto {
    status: MotorStatus;
}

export interface UpdateMotorRequest {
    type: string;
    shaftDiameter: number;
    power: number;
    speed: number;
    frontBearingType: string;
    rearBearingType: string;
    status: MotorStatus;
    mountingType: MountingType;
}

// --- DTO для типа смазки ---
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
export interface PagedResult<T> {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}