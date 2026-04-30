export const maintenanceTypeLabels: Record<string, string> = {
    Lubrication: 'Смазка',
    BearingReplacement: 'Замена подшипника',
    StatorRewinding: 'Перемотка статора',
    ShaftRepair: 'Ремонт вала',
    StatusChange: 'Изменение статуса',   // если добавили на бэкенде
};

export const motorStatusLabels: Record<string, string> = {
    InOperation: 'В эксплуатации',
    Reserve: 'Резерв',
    Repair: 'Ремонт',
    Scrapped: 'Списание',
};