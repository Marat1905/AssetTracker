// services/api.ts
import axios from 'axios';
import type {
    CreateMotorDto,
    MotorFullHistoryDto,
    MoveMotorDto,
    MaintenanceDto,
    MotorListItem,
    UpdateMotorStatusDto,
    UpdateMotorRequest,
    PagedResult,
    LocationHistoryDto,
    MaintenanceLogDto,
    LubricantType,
    CreateLubricantTypeDto,
    UpdateLubricantTypeDto
} from '../types';

const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' }
});

api.interceptors.response.use(
    response => response,
    error => {
        console.error('🌐 API Error:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            data: error.response?.data
        });
        return Promise.reject(error);
    }
);

export const motorApi = {
    // Создать двигатель
    createMotor: async (data: CreateMotorDto): Promise<MotorFullHistoryDto> => {
        const response = await api.post<MotorFullHistoryDto>('/motors', data);
        return response.data;
    },

    // Редактировать двигатель
    updateMotor: async (id: number, data: UpdateMotorRequest): Promise<void> => {
        await api.put(`/motors/${id}`, data);
    },

    // Удалить двигатель
    deleteMotor: async (id: number): Promise<void> => {
        await api.delete(`/motors/${id}`);
    },

    // Переместить двигатель
    moveMotor: async (id: number, data: MoveMotorDto): Promise<void> => {
        await api.patch(`/motors/${id}/move`, data);
    },

    // Добавить обслуживание (с учётом смазки)
    addMaintenance: async (id: number, data: MaintenanceDto): Promise<void> => {
        await api.post(`/motors/${id}/maintenance`, data);
    },

    // Получить полную историю
    getFullHistory: async (id: number): Promise<MotorFullHistoryDto> => {
        const response = await api.get<MotorFullHistoryDto>(`/motors/${id}/full-history`);
        return response.data;
    },

    // Получить список всех двигателей (устаревший)
    getAllMotors: async (): Promise<MotorListItem[]> => {
        const response = await api.get<MotorListItem[]>('/motors');
        return response.data;
    },

    // Пагинированный список с фильтрацией
    getMotorsPaged: async (
        page: number = 1,
        pageSize: number = 10,
        inventoryNumber?: string,
        location?: string,
        status?: string
    ): Promise<PagedResult<MotorListItem>> => {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('pageSize', pageSize.toString());
        if (inventoryNumber) params.append('inventoryNumber', inventoryNumber);
        if (location) params.append('location', location);
        if (status) params.append('status', status);

        const response = await api.get<PagedResult<MotorListItem>>(`/motors/paged?${params.toString()}`);
        return response.data;
    },

    // Пагинированная история перемещений
    getLocationHistoryPaged: async (
        id: number,
        page: number = 1,
        pageSize: number = 10
    ): Promise<PagedResult<LocationHistoryDto>> => {
        const response = await api.get<PagedResult<LocationHistoryDto>>(
            `/motors/${id}/location-history/paged?page=${page}&pageSize=${pageSize}`
        );
        return response.data;
    },

    // Пагинированный журнал обслуживания
    getMaintenanceLogsPaged: async (
        id: number,
        page: number = 1,
        pageSize: number = 10
    ): Promise<PagedResult<MaintenanceLogDto>> => {
        const response = await api.get<PagedResult<MaintenanceLogDto>>(
            `/motors/${id}/maintenance-logs/paged?page=${page}&pageSize=${pageSize}`
        );
        return response.data;
    }
};

// --- Новый API для типов смазки ---
export const lubricantApi = {
    getAll: async (): Promise<LubricantType[]> => {
        const response = await api.get<LubricantType[]>('/lubricanttypes');
        return response.data;
    },

    getById: async (id: number): Promise<LubricantType> => {
        const response = await api.get<LubricantType>(`/lubricanttypes/${id}`);
        return response.data;
    },

    create: async (data: CreateLubricantTypeDto): Promise<LubricantType> => {
        const response = await api.post<LubricantType>('/lubricanttypes', data);
        return response.data;
    },

    update: async (id: number, data: UpdateLubricantTypeDto): Promise<LubricantType> => {
        const response = await api.put<LubricantType>(`/lubricanttypes/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/lubricanttypes/${id}`);
    }
};