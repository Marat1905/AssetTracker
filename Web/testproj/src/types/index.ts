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

// Позиция подшипника
export enum BearingPosition {
    Front = "Front",
    Rear = "Rear"
}

// DTO для вывода информации о подшипнике
export interface BearingDto {
    id: number;
    type: string;
    manufacturer: string;
    supplier: string;
}

// DTO для создания подшипника (используется внутри при создании двигателя или замене)
export interface CreateBearingDto {
    type: string;
    manufacturer: string;
    supplier: string;
}

// Информация о подшипнике для использования в CreateMotorDto и UpdateMotorDto
export interface BearingInfoDto {
    type: string;
    manufacturer: string;
    supplier: string;
}

export interface LocationHistoryDto {
    id: number;
    location: string;
    startDate: string;      // ISO string
    endDate: string | null;
}

// DTO для записи в журнале обслуживания
export interface MaintenanceLogDto {
    id: number;
    workType: string;
    date: string;
    comment: string;
    bearingPosition?: string;       // "Front" / "Rear"
    lubricantTypeId?: number;
    lubricantTypeName?: string;
    oldBearingId?: number;
    oldBearingType?: string;
    oldBearingManufacturer?: string;  // производитель старого подшипника
    oldBearingSupplier?: string;      // поставщик старого подшипника
    newBearingId?: number;
    newBearingType?: string;
    newBearingManufacturer?: string;  // производитель нового подшипника
    newBearingSupplier?: string;      // поставщик нового подшипника
}

export interface MotorFullHistoryDto {
    inventoryNumber: number;
    type: string;
    shaftDiameter: number;
    power: number;
    speed: number;
    frontBearing: BearingDto;
    rearBearing: BearingDto;
    status: MotorStatus;
    mountingType: MountingType;
    locationHistory: LocationHistoryDto[];
    maintenanceLogs: MaintenanceLogDto[];
    frontBearingLastLubricant?: string;   // Название последней смазки переднего подшипника
    rearBearingLastLubricant?: string;    // Название последней смазки заднего подшипника
}

export interface CreateMotorDto {
    inventoryNumber: number;
    type: string;
    shaftDiameter: number;   // мм
    power: number;
    speed: number;
    frontBearing: BearingInfoDto;
    rearBearing: BearingInfoDto;
    status: MotorStatus;
    initialLocation: string;
    mountingType: MountingType;
}

export interface UpdateMotorRequest {
    type: string;
    shaftDiameter: number;
    power: number;
    speed: number;
    frontBearing?: BearingInfoDto;  // опционально, можно обновить
    rearBearing?: BearingInfoDto;
    status: MotorStatus;
    mountingType: MountingType;
}

export interface MoveMotorDto {
    newLocation: string;
    newStatus?: MotorStatus;
}

// DTO для добавления обслуживания
export interface MaintenanceDto {
    workType: MaintenanceType;
    comment: string;
    bearingPosition?: BearingPosition;   // для смазки и замены подшипника
    lubricantTypeId?: number;            // только для смазки
    newBearing?: CreateBearingDto;       // только для замены подшипника
}

export interface MotorListItem {
    inventoryNumber: number;
    type: string;
    power: number;
    status: MotorStatus;
    currentLocation: string;
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

// DTO для редактирования записи обслуживания
export interface UpdateMaintenanceLogDto {
    comment?: string;
    lubricantTypeId?: number;
    newBearing?: CreateBearingDto;
}

// DTO для редактирования истории перемещений
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