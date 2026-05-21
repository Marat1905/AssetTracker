/**
 * Локализованные подписи для типов работ по обслуживанию.
 */
export const maintenanceTypeLabels: Record<string, string> = {
    Lubrication: 'Смазка',
    BearingReplacement: 'Замена подшипника',
    StatorRewinding: 'Перемотка статора',
    ShaftRepair: 'Ремонт вала',
    StatusChange: 'Изменение статуса',
};

/**
 * Локализованные подписи для статусов двигателя.
 */
export const motorStatusLabels: Record<string, string> = {
    InOperation: 'В эксплуатации',
    Reserve: 'Резерв',
    Repair: 'Ремонт',
    Scrapped: 'Списание',
};

/**
 * Локализованные подписи для типов монтажа.
 */
export const mountingTypeLabels: Record<string, string> = {
    Feet: 'Лапы',
    FeetAndFlange: 'Лапы и фланец',
    Flange: 'Фланец',
    SmallFlange: 'Малый фланец',
    FeetAndSmallFlange: 'Лапы и малый фланец',
};

/**
 * Коды монтажа по стандарту IM (числовой и буквенный варианты).
 */
export const mountingCodes: Record<string, { numeric: string; alpha: string }> = {
    Feet: { numeric: 'IM 1001 / IM 1081', alpha: 'IM B3' },
    Flange: { numeric: 'IM 3001 / IM 3081', alpha: 'IM B5' },
    FeetAndFlange: { numeric: 'IM 2001 / IM 2081', alpha: 'IM B35' },
    SmallFlange: { numeric: 'IM 3601 / IM 3681', alpha: 'IM B14' },
    FeetAndSmallFlange: { numeric: 'IM 2101 / IM 2181', alpha: 'IM B34' },
};

/**
 * Локализованные подписи для позиций подшипника.
 */
export const bearingPositionLabels: Record<string, string> = {
    Front: 'Передний',
    Rear: 'Задний'
};