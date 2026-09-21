import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { motorApi } from '../../services/motor/api';
import type {
    LocationHistoryDto,
    MaintenanceLogDto,
    MotorFullHistoryDto,
} from '../../types/motor/motor';

/**
 * Хук управления состоянием страницы детальной информации о двигателе.
 * Загружает паспортные данные, историю перемещений и журнал обслуживания,
 * управляет пагинацией и фильтрацией журнала обслуживания,
 * а также предоставляет функции удаления и проверки правил редактирования записей.
 *
 * @param motorId - Суррогатный идентификатор двигателя.
 */
export function useMotorDetails(motorId: number) {
    // Паспортные данные двигателя (включая последние смазки)
    const [motorData, setMotorData] = useState<MotorFullHistoryDto | null>(null);

    // Пагинация истории перемещений
    const [locationHistory, setLocationHistory] = useState<LocationHistoryDto[]>([]);
    const [locationPage, setLocationPage] = useState(1);
    const [locationTotalPages, setLocationTotalPages] = useState(1);
    const [locationTotalCount, setLocationTotalCount] = useState(0);
    const [locationPageSize, setLocationPageSize] = useState(5);

    // Пагинация и фильтрация журнала обслуживания
    const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLogDto[]>([]);
    const [maintenancePage, setMaintenancePage] = useState(1);
    const [maintenanceTotalPages, setMaintenanceTotalPages] = useState(1);
    const [maintenanceTotalCount, setMaintenanceTotalCount] = useState(0);
    const [maintenancePageSize, setMaintenancePageSize] = useState(10);
    const [maintenanceWorkType, setMaintenanceWorkType] = useState<string>('');
    const [maintenanceDateRange, setMaintenanceDateRange] = useState<[Date | null, Date | null]>([null, null]);

    /**
     * Загружает паспортные данные двигателя и полную историю.
     */
    const loadMotorData = useCallback(async () => {
        if (isNaN(motorId) || motorId <= 0) return;
        try {
            const data = await motorApi.getFullHistory(motorId);
            setMotorData(data);
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка загрузки данных двигателя');
        }
    }, [motorId]);

    /**
     * Загружает пагинированную историю перемещений.
     */
    const loadLocationHistory = useCallback(async () => {
        if (isNaN(motorId) || motorId <= 0) return;
        try {
            const data = await motorApi.getLocationHistoryPaged(motorId, locationPage, locationPageSize);
            setLocationHistory(data.items);
            setLocationTotalPages(data.totalPages);
            setLocationTotalCount(data.totalCount);
        } catch {
            toast.error('Ошибка загрузки истории перемещений');
        }
    }, [motorId, locationPage, locationPageSize]);

    /**
     * Загружает пагинированный журнал обслуживания с учётом фильтров.
     */
    const loadMaintenanceLogs = useCallback(async () => {
        if (isNaN(motorId) || motorId <= 0) return;
        try {
            const fromDate = maintenanceDateRange[0] ? maintenanceDateRange[0].toISOString() : undefined;
            const toDate = maintenanceDateRange[1] ? maintenanceDateRange[1].toISOString() : undefined;
            const data = await motorApi.getMaintenanceLogsPaged(
                motorId,
                maintenancePage,
                maintenancePageSize,
                maintenanceWorkType || undefined,
                fromDate,
                toDate
            );
            setMaintenanceLogs(data.items);
            setMaintenanceTotalPages(data.totalPages);
            setMaintenanceTotalCount(data.totalCount);
        } catch {
            toast.error('Ошибка загрузки журнала обслуживания');
        }
    }, [motorId, maintenancePage, maintenancePageSize, maintenanceWorkType, maintenanceDateRange]);

    // Загружаем данные при изменении ID или параметров пагинации/фильтров
    useEffect(() => {
        if (!isNaN(motorId) && motorId > 0) {
            loadMotorData();
        }
    }, [motorId, loadMotorData]);

    useEffect(() => {
        if (!isNaN(motorId) && motorId > 0) {
            loadLocationHistory();
        }
    }, [motorId, loadLocationHistory]);

    useEffect(() => {
        if (!isNaN(motorId) && motorId > 0) {
            loadMaintenanceLogs();
        }
    }, [motorId, loadMaintenanceLogs]);

    /**
     * Применяет фильтры журнала обслуживания (сбрасывает на первую страницу).
     */
    const applyMaintenanceFilters = useCallback(() => {
        setMaintenancePage(1);
    }, []);

    /**
     * Сбрасывает фильтры журнала обслуживания.
     */
    const resetMaintenanceFilters = useCallback(() => {
        setMaintenanceWorkType('');
        setMaintenanceDateRange([null, null]);
        setMaintenancePage(1);
    }, []);

    /**
     * Обновляет все данные после изменений.
     */
    const refreshAll = useCallback(() => {
        loadMotorData();
        loadLocationHistory();
        loadMaintenanceLogs();
    }, [loadMotorData, loadLocationHistory, loadMaintenanceLogs]);

    /**
     * Проверяет, является ли запись истории перемещений последней (самой новой).
     */
    const isLastLocationRecord = useCallback((location: LocationHistoryDto): boolean => {
        if (locationHistory.length === 0) return false;
        const lastRecord = locationHistory.reduce((prev, current) =>
            new Date(current.startDate) > new Date(prev.startDate) ? current : prev
        );
        return lastRecord.id === location.id;
    }, [locationHistory]);

    /**
     * Проверяет, можно ли редактировать/удалять запись замены подшипника.
     * Правило: разрешено только для последней записи замены для данной позиции.
     */
    const canEditOrDeleteBearingLog = useCallback((log: MaintenanceLogDto): boolean => {
        if (log.workType !== 'BearingReplacement') return true;

        const samePositionLogs = maintenanceLogs
            .filter(l => l.workType === 'BearingReplacement' && l.bearingPosition === log.bearingPosition)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        if (samePositionLogs.length === 0) return true;
        return samePositionLogs[0].id === log.id;
    }, [maintenanceLogs]);

    return {
        // Данные
        motorData,
        locationHistory,
        maintenanceLogs,

        // Пагинация истории перемещений
        locationPage,
        locationTotalPages,
        locationTotalCount,
        locationPageSize,
        setLocationPage,
        setLocationPageSize,

        // Пагинация и фильтры журнала обслуживания
        maintenancePage,
        maintenanceTotalPages,
        maintenanceTotalCount,
        maintenancePageSize,
        maintenanceWorkType,
        maintenanceDateRange,
        setMaintenancePage,
        setMaintenancePageSize,
        setMaintenanceWorkType,
        setMaintenanceDateRange,

        // Действия
        loadMotorData,
        loadLocationHistory,
        loadMaintenanceLogs,
        refreshAll,
        applyMaintenanceFilters,
        resetMaintenanceFilters,

        // Утилиты
        isLastLocationRecord,
        canEditOrDeleteBearingLog,
    };
}