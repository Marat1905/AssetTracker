import axios from 'axios';
import type {
    CreateMotorDto,
    MotorFullHistoryDto,
    MoveMotorDto,
    MaintenanceDto,
    MotorListItem,
    UpdateMotorStatusDto,
    UpdateMotorRequest
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

    // Редактировать двигатель (обновить основные характеристики)
    updateMotor: async (id: number, data: UpdateMotorRequest): Promise<void> => {
        await api.put(`/motors/${id}`, data);
    },

    // Удалить двигатель со всей историей
    deleteMotor: async (id: number): Promise<void> => {
        await api.delete(`/motors/${id}`);
    },

    // Переместить двигатель
    moveMotor: async (id: number, data: MoveMotorDto): Promise<void> => {
        await api.patch(`/motors/${id}/move`, data);
    },

    // Добавить обслуживание
    addMaintenance: async (id: number, data: MaintenanceDto): Promise<void> => {
        await api.post(`/motors/${id}/maintenance`, data);
    },

    // Получить полную историю
    getFullHistory: async (id: number): Promise<MotorFullHistoryDto> => {
        const response = await api.get<MotorFullHistoryDto>(`/motors/${id}/full-history`);
        return response.data;
    },

    // Получить список всех двигателей
    getAllMotors: async (): Promise<MotorListItem[]> => {
        const response = await api.get<MotorListItem[]>('/motors');
        return response.data;
    },
};