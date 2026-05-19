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
    Feet = "Feet",                      // Лапы
    FeetAndFlange = "FeetAndFlange",    // Лапы и фланец
    Flange = "Flange",                  // Фланец
    SmallFlange = "SmallFlange",        // Малый фланец
    FeetAndSmallFlange = "FeetAndSmallFlange" // Лапы и малый фланец
}

export enum BearingPosition {
    Front = "Front",
    Rear = "Rear"
}

// --- DTO для подшипников (с полями производителя и поставщика) ---
export interface BearingDto {
    id: number;
    type: string;
    manufacturer: string;
    supplier: string;
}

export interface CreateBearingDto {
    type: string;
    manufacturer: string;
    supplier: string;
}

// --- DTO для истории перемещений ---
export interface LocationHistoryDto {
    id: number;
    location: string;
    startDate: string;
    endDate: string | null;
}

// --- DTO для журнала обслуживания (использует BearingDto) ---
export interface MaintenanceLogDto {
    id: number;
    workType: string;
    date: string;
    comment: string;
    performedBy: string;                // Кто выполнил
    bearingPosition?: string;       // "Front" / "Rear"
    lubricantTypeId?: number;
    lubricantTypeName?: string;
    oldBearing?: BearingDto | null; // старый подшипник (при замене)
    newBearing?: BearingDto | null; // новый подшипник (при замене)
}

// --- DTO полной истории двигателя (использует BearingDto) ---
export interface MotorFullHistoryDto {
    inventoryNumber: number;
    type: string;
    shaftDiameter: number;
    power: number;
    speed: number;
    frontBearing: BearingDto;      // объект подшипника вместо строки
    rearBearing: BearingDto;
    status: MotorStatus;
    mountingType: MountingType;
    locationHistory: LocationHistoryDto[];
    maintenanceLogs: MaintenanceLogDto[];
    frontBearingLastLubricant?: string;   // Название последней смазки переднего подшипника
    rearBearingLastLubricant?: string;    // Название последней смазки заднего подшипника
}

// --- DTO для создания двигателя (использует CreateBearingDto) ---
export interface CreateMotorDto {
    inventoryNumber: number;
    type: string;
    shaftDiameter: number;
    power: number;
    speed: number;
    frontBearing: CreateBearingDto;
    rearBearing: CreateBearingDto;
    status: MotorStatus;
    initialLocation: string;
    mountingType: MountingType;
}

// --- DTO для перемещения ---
export interface MoveMotorDto {
    newLocation: string;
    newStatus?: MotorStatus;
}

// --- DTO для добавления обслуживания (поддержка существующего или нового подшипника) ---
export interface MaintenanceDto {
    workType: MaintenanceType;
    comment: string;
    performedBy: string;                 // Кто выполнил
    bearingPosition?: BearingPosition;
    lubricantTypeId?: number;
    existingBearingId?: number;      // ID существующего подшипника (при замене)
    newBearing?: CreateBearingDto;   // данные нового подшипника (при замене)
}

// --- DTO для редактирования записи обслуживания ---
export interface UpdateMaintenanceLogDto {
    comment?: string;
    performedBy?: string;               // Кто выполнил (опционально)
    lubricantTypeId?: number;
    existingBearingId?: number;
    newBearing?: CreateBearingDto;
}

// --- DTO для редактирования истории перемещений ---
export interface UpdateLocationHistoryDto {
    location: string;
}

// --- Другие DTO ---
export interface MotorListItem {
    inventoryNumber: number;
    type: string;
    power: number;
    status: MotorStatus;
    currentLocation: string;
}

export interface UpdateMotorRequest {
    type: string;
    shaftDiameter: number;
    power: number;
    speed: number;
    frontBearingType: string;   // В бекенде UpdateMotorDto не меняет подшипники, оставляем строку для совместимости
    rearBearingType: string;
    status: MotorStatus;
    mountingType: MountingType;
}

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