/**
 * Перечисление возможных статусов электродвигателя.
 */
export enum MotorStatus {
    /** В эксплуатации */
    InOperation = "InOperation",
    /** Резерв */
    Reserve = "Reserve",
    /** Ремонт */
    Repair = "Repair",
    /** Списание */
    Scrapped = "Scrapped"
}

/**
 * Перечисление типов выполняемых работ по обслуживанию.
 */
export enum MaintenanceType {
    /** Смазка подшипников */
    Lubrication = "Lubrication",
    /** Замена подшипника */
    BearingReplacement = "BearingReplacement",
    /** Перемотка статора */
    StatorRewinding = "StatorRewinding",
    /** Ремонт вала */
    ShaftRepair = "ShaftRepair"
}

/**
 * Перечисление типов монтажа электродвигателя (по стандарту IM).
 */
export enum MountingType {
    /** Лапы (IM B3) */
    Feet = "Feet",
    /** Лапы и фланец (IM B35) */
    FeetAndFlange = "FeetAndFlange",
    /** Фланец (IM B5) */
    Flange = "Flange",
    /** Малый фланец (IM B14) */
    SmallFlange = "SmallFlange",
    /** Лапы и малый фланец (IM B34) */
    FeetAndSmallFlange = "FeetAndSmallFlange"
}

/**
 * Перечисление позиций подшипника (передний/задний).
 */
export enum BearingPosition {
    /** Передний подшипник */
    Front = "Front",
    /** Задний подшипник */
    Rear = "Rear"
}

/**
 * DTO для чтения информации о подшипнике.
 */
export interface BearingDto {
    /** Идентификатор подшипника */
    id: number;
    /** Тип подшипника (например, 6304) */
    type: string;
    /** Производитель */
    manufacturer: string;
    /** Поставщик */
    supplier: string;
}

/**
 * DTO для создания нового подшипника.
 */
export interface CreateBearingDto {
    /** Тип подшипника */
    type: string;
    /** Производитель */
    manufacturer: string;
    /** Поставщик */
    supplier: string;
}

/**
 * DTO для записи истории перемещений двигателя.
 */
export interface LocationHistoryDto {
    /** Идентификатор записи */
    id: number;
    /** Местоположение */
    location: string;
    /** Дата начала периода */
    startDate: string;
    /** Дата окончания (null – активная запись) */
    endDate: string | null;
    /** Статус двигателя в этот период */
    status?: string;
}

/**
 * DTO для записи журнала обслуживания (ремонтов, смазки, замены подшипников).
 */
export interface MaintenanceLogDto {
    /** Идентификатор записи */
    id: number;
    /** Тип работ (строка из MaintenanceType) */
    workType: string;
    /** Дата выполнения */
    date: string;
    /** Комментарий */
    comment: string;
    /** Кто выполнил обслуживание */
    performedBy: string;
    /** Позиция подшипника (Front / Rear) – для смазки и замены */
    bearingPosition?: string;
    /** Идентификатор типа смазки (для смазки) */
    lubricantTypeId?: number;
    /** Название типа смазки (для отображения) */
    lubricantTypeName?: string;
    /** Старый подшипник (при замене) */
    oldBearing?: BearingDto | null;
    /** Новый подшипник (при замене) */
    newBearing?: BearingDto | null;
}

/**
 * DTO для полной истории двигателя, включая текущие данные, подшипники,
 * историю перемещений и последние записи обслуживания.
 */
export interface MotorFullHistoryDto {
    /** Суррогатный идентификатор */
    id: number;
    /** Инвентарный номер (может отсутствовать) */
    inventoryNumber: string | null;
    /** Тип двигателя */
    type: string;
    /** Диаметр вала (мм) */
    shaftDiameter: number;
    /** Мощность (кВт) */
    power: number;
    /** Обороты (об/мин) */
    speed: number;
    /** Передний подшипник */
    frontBearing: BearingDto;
    /** Задний подшипник */
    rearBearing: BearingDto;
    /** Текущий статус */
    status: MotorStatus;
    /** Тип монтажа */
    mountingType: MountingType;
    /** История перемещений */
    locationHistory: LocationHistoryDto[];
    /** Последние 100 записей обслуживания */
    maintenanceLogs: MaintenanceLogDto[];
    /** Последняя использованная смазка для переднего подшипника */
    frontBearingLastLubricant?: string;
    /** Последняя использованная смазка для заднего подшипника */
    rearBearingLastLubricant?: string;
}

/**
 * DTO для первичной регистрации нового электродвигателя.
 */
export interface CreateMotorDto {
    /** Инвентарный номер (опциональный, уникальный) */
    inventoryNumber: string | null;
    /** Тип двигателя (марка, модель) */
    type: string;
    /** Диаметр вала (мм) */
    shaftDiameter: number;
    /** Мощность (кВт) */
    power: number;
    /** Обороты (об/мин) */
    speed: number;
    /** Данные переднего подшипника */
    frontBearing: CreateBearingDto;
    /** Данные заднего подшипника */
    rearBearing: CreateBearingDto;
    /** Начальный статус */
    status: MotorStatus;
    /** Начальное место установки */
    initialLocation: string;
    /** Тип монтажа */
    mountingType: MountingType;
}

/**
 * DTO для операции перемещения двигателя.
 */
export interface MoveMotorDto {
    /** Новое местоположение */
    newLocation: string;
    /** Новый статус (опционально) */
    newStatus?: MotorStatus;
}

/**
 * DTO для добавления записи обслуживания (смазка, замена подшипника, ремонт).
 */
export interface MaintenanceDto {
    /** Тип работ */
    workType: MaintenanceType;
    /** Комментарий */
    comment: string;
    /** Кто выполнил обслуживание */
    performedBy: string;
    /** Позиция подшипника (для смазки и замены) */
    bearingPosition?: BearingPosition;
    /** Идентификатор типа смазки (для смазки) */
    lubricantTypeId?: number;
    /** Идентификатор существующего подшипника (при замене) */
    existingBearingId?: number;
    /** Данные нового подшипника (при замене) */
    newBearing?: CreateBearingDto;
}

/**
 * DTO для редактирования существующей записи обслуживания.
 */
export interface UpdateMaintenanceLogDto {
    /** Новый комментарий (опционально) */
    comment?: string;
    /** Новый исполнитель (опционально) */
    performedBy?: string;
    /** Новый тип смазки (только для смазки) */
    lubricantTypeId?: number;
    /** Существующий подшипник (для замены) */
    existingBearingId?: number;
    /** Новый подшипник (для замены) */
    newBearing?: CreateBearingDto;
}

/**
 * DTO для редактирования записи истории перемещений (только изменение места).
 */
export interface UpdateLocationHistoryDto {
    /** Новое место расположения */
    location: string;
}

/**
 * DTO для установки/изменения инвентарного номера двигателя.
 */
export interface SetInventoryNumberDto {
    /** Новый инвентарный номер (null – удалить номер) */
    inventoryNumber: string | null;
}

/**
 * Краткое DTO для отображения двигателя в списке.
 */
export interface MotorListItem {
    /** Суррогатный идентификатор */
    id: number;
    /** Инвентарный номер */
    inventoryNumber: string | null;
    /** Тип двигателя */
    type: string;
    /** Мощность (кВт) */
    power: number;
    /** Статус */
    status: MotorStatus;
    /** Текущее местоположение */
    currentLocation: string;
}

/**
 * DTO для обновления основных характеристик двигателя (без изменения подшипников).
 */
export interface UpdateMotorRequest {
    /** Тип двигателя */
    type: string;
    /** Диаметр вала (мм) */
    shaftDiameter: number;
    /** Мощность (кВт) */
    power: number;
    /** Обороты (об/мин) */
    speed: number;
    /** Тип переднего подшипника (только для совместимости) */
    frontBearingType: string;
    /** Тип заднего подшипника (только для совместимости) */
    rearBearingType: string;
    /** Статус */
    status: MotorStatus;
    /** Тип монтажа */
    mountingType: MountingType;
}

/**
 * DTO для чтения типа смазки.
 */
export interface LubricantType {
    /** Идентификатор */
    id: number;
    /** Название */
    name: string;
    /** Описание */
    description?: string;
}

/**
 * DTO для создания типа смазки.
 */
export interface CreateLubricantTypeDto {
    /** Название */
    name: string;
    /** Описание */
    description?: string;
}

/**
 * DTO для обновления типа смазки.
 */
export interface UpdateLubricantTypeDto {
    /** Название */
    name: string;
    /** Описание */
    description?: string;
}

/**
 * Обёртка для пагинированного ответа от API.
 * @template T Тип элементов на странице.
 */
export interface PagedResult<T> {
    /** Элементы текущей страницы */
    items: T[];
    /** Общее количество записей */
    totalCount: number;
    /** Номер текущей страницы */
    pageNumber: number;
    /** Размер страницы */
    pageSize: number;
    /** Общее количество страниц */
    totalPages: number;
}

/**
* DTO для записи в отчёте по обслуживанию (детальная информация).
*/
export interface MaintenanceReportItemDto {
    /** Идентификатор записи обслуживания */
    id: number;
    /** Дата выполнения */
    date: string;
    /** Тип выполненной работы (строка) */
    workType: string;
    /** Комментарий */
    comment: string;
    /** Исполнитель */
    performedBy: string;
    /** Позиция подшипника (передний/задний), если применимо */
    bearingPosition?: string | null;
    /** Название типа смазки, если применимо */
    lubricantTypeName?: string | null;
    /** Старый подшипник (при замене) */
    oldBearing?: BearingDto | null;
    /** Новый подшипник (при замене) */
    newBearing?: BearingDto | null;
    // Информация о двигателе
    motorId: number;
    motorInventoryNumber?: string | null;
    motorType: string;
    motorPower: number;
    motorSpeed: number;
    motorMountingType: string;
    motorCurrentLocation: string;
}

/**
 * DTO для сводки по типам работ за период.
 */
export interface MaintenanceReportSummaryDto {
    /** Тип работы (строковое представление) */
    workType: string;
    /** Количество записей обслуживания данного типа */
    count: number;
}