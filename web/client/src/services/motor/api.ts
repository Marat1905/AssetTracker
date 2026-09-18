import axios from 'axios';
import type {
    CreateMotorDto,
    MotorFullHistoryDto,
    MoveMotorDto,
    MaintenanceDto,
    MotorListItem,
    UpdateMotorRequest,
    PagedResult,
    LocationHistoryDto,
    MaintenanceLogDto,
    LubricantType,
    CreateLubricantTypeDto,
    UpdateLubricantTypeDto,
    UpdateMaintenanceLogDto,
    UpdateLocationHistoryDto,
    SetInventoryNumberDto,
    MaintenanceReportItemDto,
    MaintenanceReportSummaryDto,
} from '../../types/motor/motor';
import {
    requestInterceptor,
    requestErrorInterceptor,
    responseInterceptor,
    responseErrorInterceptor,
} from '../axiosInterceptors';

const API_BASE_URL = '/motor/api/v1';

// Создаём экземпляр axios с базовым URL и общими заголовками
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Применяем интерцепторы (аутентификация, обработка ошибок и т.д.)
apiClient.interceptors.request.use(requestInterceptor, requestErrorInterceptor);
apiClient.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

/**
 * API-функции для работы с электродвигателями.
 */
export const motorApi = {
    /**
     * Создать новый электродвигатель (первичная регистрация).
     * @param data - DTO с данными двигателя и подшипников.
     * @returns Полная карточка созданного двигателя (с суррогатным Id).
     */
    createMotor: async (data: CreateMotorDto): Promise<MotorFullHistoryDto> => {
        const response = await apiClient.post<MotorFullHistoryDto>('/motors', data);
        return response.data;
    },

    /**
     * Обновить основные характеристики двигателя (без подшипников).
     * @param id - Суррогатный идентификатор двигателя.
     * @param data - DTO с обновлёнными полями.
     */
    updateMotor: async (id: number, data: UpdateMotorRequest): Promise<void> => {
        await apiClient.put(`/motors/${id}`, data);
    },

    /**
     * Удалить двигатель вместе со всей историей.
     * @param id - Суррогатный идентификатор двигателя.
     */
    deleteMotor: async (id: number): Promise<void> => {
        await apiClient.delete(`/motors/${id}`);
    },

    /**
     * Переместить двигатель (автоматически закрывает текущую запись истории).
     * @param id - Суррогатный идентификатор двигателя.
     * @param data - Новое местоположение и опционально новый статус.
     */
    moveMotor: async (id: number, data: MoveMotorDto): Promise<void> => {
        await apiClient.patch(`/motors/${id}/move`, data);
    },

    /**
     * Добавить запись обслуживания (смазка, замена подшипника, ремонт).
     * @param id - Суррогатный идентификатор двигателя.
     * @param data - DTO с деталями обслуживания.
     */
    addMaintenance: async (id: number, data: MaintenanceDto): Promise<void> => {
        await apiClient.post(`/motors/${id}/maintenance`, data);
    },

    /**
     * Получить полную историю двигателя (паспортные данные, подшипники, история перемещений, обслуживание).
     * @param id - Суррогатный идентификатор двигателя.
     * @returns Полная карточка "жизни" двигателя.
     */
    getFullHistory: async (id: number): Promise<MotorFullHistoryDto> => {
        const response = await apiClient.get<MotorFullHistoryDto>(`/motors/${id}/full-history`);
        return response.data;
    },

    /**
     * Получить список всех двигателей (без пагинации – устаревший метод, рекомендуется использовать paged).
     * @returns Массив кратких DTO двигателей.
     */
    getAllMotors: async (): Promise<MotorListItem[]> => {
        const response = await apiClient.get<MotorListItem[]>('/motors');
        return response.data;
    },

    /**
     * Получить пагинированный список двигателей с фильтрацией.
     * @param page - Номер страницы (начиная с 1).
     * @param pageSize - Размер страницы.
     * @param inventoryNumber - Фильтр по инвентарному номеру (частичное совпадение).
     * @param location - Фильтр по текущему местоположению (частичное совпадение).
     * @param status - Фильтр по статусу.
     * @param hasInventoryNumber - Фильтр по наличию инвентарного номера: true – только с номером, false – только без номера, null – все.
     * @returns Пагинированный результат со списком двигателей.
     */
    getMotorsPaged: async (
        page: number = 1,
        pageSize: number = 10,
        inventoryNumber?: string,
        location?: string,
        status?: string,
        hasInventoryNumber?: boolean | null
    ): Promise<PagedResult<MotorListItem>> => {
        const params: Record<string, any> = {
            page,
            pageSize,
        };
        if (inventoryNumber) params.inventoryNumber = inventoryNumber;
        if (location) params.location = location;
        if (status) params.status = status;
        if (hasInventoryNumber !== undefined && hasInventoryNumber !== null) {
            params.hasInventoryNumber = hasInventoryNumber;
        }

        const response = await apiClient.get<PagedResult<MotorListItem>>('/motors/paged', { params });
        return response.data;
    },

    /**
     * Получить пагинированную историю перемещений двигателя.
     * @param id - Суррогатный идентификатор двигателя.
     * @param page - Номер страницы.
     * @param pageSize - Размер страницы.
     * @returns Пагинированный список записей перемещений.
     */
    getLocationHistoryPaged: async (
        id: number,
        page: number = 1,
        pageSize: number = 10
    ): Promise<PagedResult<LocationHistoryDto>> => {
        const response = await apiClient.get<PagedResult<LocationHistoryDto>>(
            `/motors/${id}/location-history/paged`,
            { params: { page, pageSize } }
        );
        return response.data;
    },

    /**
     * Получить пагинированный журнал обслуживания с поддержкой фильтрации по типу работ и периоду.
     * @param id - Суррогатный идентификатор двигателя.
     * @param page - Номер страницы.
     * @param pageSize - Размер страницы.
     * @param workType - Тип работ (Lubrication, BearingReplacement, StatorRewinding, ShaftRepair) или null.
     * @param fromDate - Дата начала периода (YYYY-MM-DD).
     * @param toDate - Дата окончания периода (YYYY-MM-DD).
     * @returns Пагинированный список записей обслуживания.
     */
    getMaintenanceLogsPaged: async (
        id: number,
        page: number = 1,
        pageSize: number = 10,
        workType?: string,
        fromDate?: string,
        toDate?: string
    ): Promise<PagedResult<MaintenanceLogDto>> => {
        const params: Record<string, any> = { page, pageSize };
        if (workType) params.workType = workType;
        if (fromDate) params.fromDate = fromDate;
        if (toDate) params.toDate = toDate;

        const response = await apiClient.get<PagedResult<MaintenanceLogDto>>(
            `/motors/${id}/maintenance-logs/paged`,
            { params }
        );
        return response.data;
    },

    /**
     * Редактировать запись обслуживания (комментарий, исполнитель, для смазки – тип смазки, для замены – подшипник).
     * @param motorId - Суррогатный идентификатор двигателя.
     * @param logId - Идентификатор записи обслуживания.
     * @param data - DTO с обновляемыми полями.
     */
    updateMaintenanceLog: async (motorId: number, logId: number, data: UpdateMaintenanceLogDto): Promise<void> => {
        await apiClient.put(`/motors/${motorId}/maintenance/${logId}`, data);
    },

    /**
     * Удалить запись обслуживания.
     * @param motorId - Суррогатный идентификатор двигателя.
     * @param logId - Идентификатор записи обслуживания.
     */
    deleteMaintenanceLog: async (motorId: number, logId: number): Promise<void> => {
        await apiClient.delete(`/motors/${motorId}/maintenance/${logId}`);
    },

    /**
     * Редактировать запись истории перемещений (только location).
     * @param motorId - Суррогатный идентификатор двигателя.
     * @param locationHistoryId - Идентификатор записи истории.
     * @param data - Объект с новым местоположением.
     */
    updateLocationHistory: async (motorId: number, locationHistoryId: number, data: UpdateLocationHistoryDto): Promise<void> => {
        await apiClient.put(`/motors/${motorId}/location-history/${locationHistoryId}`, data);
    },

    /**
     * Удалить запись истории перемещений (только последнюю, с проверкой целостности).
     * @param motorId - Суррогатный идентификатор двигателя.
     * @param locationHistoryId - Идентификатор записи истории.
     */
    deleteLocationHistory: async (motorId: number, locationHistoryId: number): Promise<void> => {
        await apiClient.delete(`/motors/${motorId}/location-history/${locationHistoryId}`);
    },

    /**
     * Установить или изменить инвентарный номер двигателя.
     * @param motorId - Суррогатный идентификатор двигателя.
     * @param data - DTO с новым инвентарным номером (null – удалить номер).
     */
    setInventoryNumber: async (motorId: number, data: SetInventoryNumberDto): Promise<void> => {
        await apiClient.patch(`/motors/${motorId}/inventory-number`, data);
    },
};

/**
 * API-функции для работы со справочником типов смазки.
 */
export const lubricantApi = {
    /**
     * Получить список всех типов смазки.
     * @returns Массив типов смазки.
     */
    getAll: async (): Promise<LubricantType[]> => {
        const response = await apiClient.get<LubricantType[]>('/lubricanttypes');
        return response.data;
    },

    /**
     * Получить тип смазки по идентификатору.
     * @param id - Идентификатор типа смазки.
     * @returns Тип смазки.
     */
    getById: async (id: number): Promise<LubricantType> => {
        const response = await apiClient.get<LubricantType>(`/lubricanttypes/${id}`);
        return response.data;
    },

    /**
     * Создать новый тип смазки.
     * @param data - DTO с названием и описанием.
     * @returns Созданный тип смазки.
     */
    create: async (data: CreateLubricantTypeDto): Promise<LubricantType> => {
        const response = await apiClient.post<LubricantType>('/lubricanttypes', data);
        return response.data;
    },

    /**
     * Обновить существующий тип смазки.
     * @param id - Идентификатор типа смазки.
     * @param data - DTO с новыми данными.
     * @returns Обновлённый тип смазки.
     */
    update: async (id: number, data: UpdateLubricantTypeDto): Promise<LubricantType> => {
        const response = await apiClient.put<LubricantType>(`/lubricanttypes/${id}`, data);
        return response.data;
    },

    /**
     * Удалить тип смазки.
     * @param id - Идентификатор типа смазки.
     */
    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/lubricanttypes/${id}`);
    },
};

/**
* API-функции для отчётов.
*/
export const reportsApi = {
    /**
     * Получить детальный отчёт по обслуживанию за период (с пагинацией).
     * @param fromDate - Начало периода (YYYY-MM-DD)
     * @param toDate - Окончание периода (YYYY-MM-DD)
     * @param workType - Тип работ (опционально)
     * @param page - Номер страницы (начиная с 1)
     * @param pageSize - Размер страницы
     * @returns Пагинированный результат с записями обслуживания
     */
    getMaintenanceReport: async (
        fromDate?: string,
        toDate?: string,
        workType?: string,
        page: number = 1,
        pageSize: number = 20
    ): Promise<PagedResult<MaintenanceReportItemDto>> => {
        const params = new URLSearchParams();
        if (fromDate) params.append('fromDate', fromDate);
        if (toDate) params.append('toDate', toDate);
        if (workType) params.append('workType', workType);
        params.append('page', page.toString());
        params.append('pageSize', pageSize.toString());
        const response = await apiClient.get<PagedResult<MaintenanceReportItemDto>>(`/reports/maintenance?${params.toString()}`);
        return response.data;
    },

    /**
     * Получить сводку по обслуживанию за период (количество записей по каждому типу работ).
     * @param fromDate - Начало периода (YYYY-MM-DD)
     * @param toDate - Окончание периода (YYYY-MM-DD)
     * @returns Список сводок по типам работ
     */
    getMaintenanceReportSummary: async (
        fromDate?: string,
        toDate?: string
    ): Promise<MaintenanceReportSummaryDto[]> => {
        const params = new URLSearchParams();
        if (fromDate) params.append('fromDate', fromDate);
        if (toDate) params.append('toDate', toDate);
        const response = await apiClient.get<MaintenanceReportSummaryDto[]>(`/reports/maintenance/summary?${params.toString()}`);
        return response.data;
    }
};