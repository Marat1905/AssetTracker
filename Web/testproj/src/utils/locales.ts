export const maintenanceTypeLabels: Record<string, string> = {
    Lubrication: 'Смазка',
    BearingReplacement: 'Замена подшипника',
    StatorRewinding: 'Перемотка статора',
    ShaftRepair: 'Ремонт вала',
    StatusChange: 'Изменение статуса',
};

export const motorStatusLabels: Record<string, string> = {
    InOperation: 'В эксплуатации',
    Reserve: 'Резерв',
    Repair: 'Ремонт',
    Scrapped: 'Списание',
};

export const mountingTypeLabels: Record<string, string> = {
    Feet: 'Лапы',
    FeetAndFlange: 'Лапы и фланец',
    Flange: 'Фланец',
};