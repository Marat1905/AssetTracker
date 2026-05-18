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
    Bearing,
    CreateBearingDto,
    UpdateBearingDto,
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

// ---- API для подшипников ----
export const bearingApi = {
    getAll: async (): Promise<Bearing[]> => {
        const response = await api.get<Bearing[]>('/bearings');
        return response.data;
    },
    getById: async (id: number): Promise<Bearing> => {
        const response = await api.get<Bearing>(`/bearings/${id}`);
        return response.data;
    },
    create: async (data: CreateBearingDto): Promise<Bearing> => {
        const response = await api.post<Bearing>('/bearings', data);
        return response.data;
    },
    update: async (id: number, data: UpdateBearingDto): Promise<Bearing> => {
        const response = await api.put<Bearing>(`/bearings/${id}`, data);
        return response.data;
    },
    delete: async (id: number): Promise<void> => {
        await api.delete(`/bearings/${id}`);
    }
};

// ---- API для двигателей (обновлённые сигнатуры) ----
export const motorApi = {
    createMotor: async (data: CreateMotorDto): Promise<MotorFullHistoryDto> => {
        const response = await api.post<MotorFullHistoryDto>('/motors', data);
        return response.data;
    },

    updateMotor: async (id: number, data: UpdateMotorRequest): Promise<void> => {
        await api.put(`/motors/${id}`, data);
    },

    deleteMotor: async (id: number): Promise<void> => {
        await api.delete(`/motors/${id}`);
    },

    moveMotor: async (id: number, data: MoveMotorDto): Promise<void> => {
        await api.patch(`/motors/${id}/move`, data);
    },

    addMaintenance: async (id: number, data: MaintenanceDto): Promise<void> => {
        await api.post(`/motors/${id}/maintenance`, data);
    },

    getFullHistory: async (id: number): Promise<MotorFullHistoryDto> => {
        const response = await api.get<MotorFullHistoryDto>(`/motors/${id}/full-history`);
        return response.data;
    },

    getAllMotors: async (): Promise<MotorListItem[]> => {
        const response = await api.get<MotorListItem[]>('/motors');
        return response.data;
    },

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

    getMaintenanceLogsPaged: async (
        id: number,
        page: number = 1,
        pageSize: number = 10
    ): Promise<PagedResult<MaintenanceLogDto>> => {
        const response = await api.get<PagedResult<MaintenanceLogDto>>(
            `/motors/${id}/maintenance-logs/paged?page=${page}&pageSize=${pageSize}`
        );
        return response.data;
    },

    updateMaintenanceLog: async (motorId: number, logId: number, data: UpdateMaintenanceLogDto): Promise<void> => {
        await api.put(`/motors/${motorId}/maintenance/${logId}`, data);
    },

    deleteMaintenanceLog: async (motorId: number, logId: number): Promise<void> => {
        await api.delete(`/motors/${motorId}/maintenance/${logId}`);
    },

    updateLocationHistory: async (motorId: number, locationHistoryId: number, data: UpdateLocationHistoryDto): Promise<void> => {
        await api.put(`/motors/${motorId}/location-history/${locationHistoryId}`, data);
    },

    deleteLocationHistory: async (motorId: number, locationHistoryId: number): Promise<void> => {
        await api.delete(`/motors/${motorId}/location-history/${locationHistoryId}`);
    }
};

// ---- API для типов смазки (без изменений) ----
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