import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import MotorHistory from '../components/MotorHistory';
import EditMotorModal from '../components/EditMotorModal';
import MoveMotorForm from '../components/MoveMotorForm';
import MaintenanceForm from '../components/MaintenanceForm';
import Pagination from '../components/Pagination';
import { motorApi } from '../services/api';
import type { MotorFullHistoryDto, LocationHistoryDto, MaintenanceLogDto } from '../types';
import toast from 'react-hot-toast';

export default function MotorDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const motorId = parseInt(id || '0', 10);
    const [motorData, setMotorData] = useState<MotorFullHistoryDto | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Пагинация истории перемещений
    const [locationHistory, setLocationHistory] = useState<LocationHistoryDto[]>([]);
    const [locationPage, setLocationPage] = useState(1);
    const [locationPageSize, setLocationPageSize] = useState(5);
    const [locationTotalPages, setLocationTotalPages] = useState(1);
    const [locationTotalCount, setLocationTotalCount] = useState(0);

    // Пагинация журнала обслуживания
    const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLogDto[]>([]);
    const [maintenancePage, setMaintenancePage] = useState(1);
    const [maintenancePageSize, setMaintenancePageSize] = useState(5);
    const [maintenanceTotalPages, setMaintenanceTotalPages] = useState(1);
    const [maintenanceTotalCount, setMaintenanceTotalCount] = useState(0);

    // Загрузка паспортных данных
    const loadMotorData = async () => {
        if (isNaN(motorId) || motorId <= 0) return;
        try {
            const data = await motorApi.getFullHistory(motorId);
            setMotorData(data);
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка загрузки данных двигателя');
        }
    };

    // Загрузка пагинированной истории перемещений
    const loadLocationHistory = async () => {
        try {
            const data = await motorApi.getLocationHistoryPaged(motorId, locationPage, locationPageSize);
            setLocationHistory(data.items);
            setLocationTotalPages(data.totalPages);
            setLocationTotalCount(data.totalCount);
        } catch (err: any) {
            toast.error('Ошибка загрузки истории перемещений');
        }
    };

    // Загрузка пагинированного журнала обслуживания
    const loadMaintenanceLogs = async () => {
        try {
            const data = await motorApi.getMaintenanceLogsPaged(motorId, maintenancePage, maintenancePageSize);
            setMaintenanceLogs(data.items);
            setMaintenanceTotalPages(data.totalPages);
            setMaintenanceTotalCount(data.totalCount);
        } catch (err: any) {
            toast.error('Ошибка загрузки журнала обслуживания');
        }
    };

    // Сброс страницы при изменении размера страницы
    useEffect(() => {
        setLocationPage(1);
    }, [locationPageSize]);

    useEffect(() => {
        setMaintenancePage(1);
    }, [maintenancePageSize]);

    useEffect(() => {
        if (!isNaN(motorId) && motorId > 0) {
            loadMotorData();
            loadLocationHistory();
            loadMaintenanceLogs();
        }
    }, [motorId, locationPage, locationPageSize, maintenancePage, maintenancePageSize]);

    const handleDelete = async () => {
        if (!confirm('Удалить двигатель без возможности восстановления?')) return;
        try {
            await motorApi.deleteMotor(motorId);
            toast.success('Двигатель удалён');
            navigate('/');
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка удаления');
        }
    };

    const refreshAll = () => {
        loadMotorData();
        loadLocationHistory();
        loadMaintenanceLogs();
    };

    if (isNaN(motorId) || motorId <= 0) {
        return (
            <div className="card p-8 text-center">
                <svg className="w-16 h-16 text-danger mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-2xl font-bold text-text-h mb-2">Неверный идентификатор</h2>
                <p className="text-gray-500 mb-6">Пожалуйста, проверьте номер двигателя</p>
                <Link to="/" className="btn-primary inline-flex">Вернуться к списку</Link>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <Link to="/" className="inline-flex items-center text-accent hover:text-accent-dark transition-colors group">
                    <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Назад к списку
                </Link>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="btn-secondary inline-flex items-center gap-1"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Редактировать
                    </button>
                    <button
                        onClick={handleDelete}
                        className="btn-secondary inline-flex items-center gap-1 text-danger hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Удалить
                    </button>
                </div>
            </div>

            {/* Паспортная часть */}
            {motorData && (
                <MotorHistory motorData={motorData} onMotorUpdated={refreshAll} />
            )}

            {/* Формы действий */}
            <div className="grid md:grid-cols-2 gap-6 mt-6">
                <MoveMotorForm
                    motorId={motorId}
                    currentStatus={motorData?.status}
                    onMoved={() => {
                        loadLocationHistory();
                        loadMotorData();
                    }}
                />
                <MaintenanceForm
                    motorId={motorId}
                    onAdded={() => {
                        loadMaintenanceLogs();
                        loadMotorData();
                    }}
                />
            </div>

            {/* История перемещений */}
            <div className="card mt-6">
                <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-text-h flex items-center gap-2">
                        <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        История перемещений
                    </h3>
                </div>
                <div className="p-6">
                    {locationHistory.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">Нет записей о перемещениях</p>
                    ) : (
                        <div className="space-y-4">
                            {locationHistory.map((loc) => (
                                <div key={loc.id} className="relative pl-6 pb-4 last:pb-0 border-l-2 border-accent/30">
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-accent shadow-md"></div>
                                    <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4">
                                        <p className="font-semibold text-text-h">{loc.location}</p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {new Date(loc.startDate).toLocaleString('ru-RU')} – {loc.endDate ? new Date(loc.endDate).toLocaleString('ru-RU') : 'настоящее время'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <Pagination
                        currentPage={locationPage}
                        totalPages={locationTotalPages}
                        onPageChange={setLocationPage}
                        pageSize={locationPageSize}
                        onPageSizeChange={setLocationPageSize}
                        totalCount={locationTotalCount}
                    />
                </div>
            </div>

            {/* Журнал обслуживания */}
            <div className="card mt-6">
                <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-text-h flex items-center gap-2">
                        <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Журнал обслуживания и ремонтов
                    </h3>
                </div>
                <div className="p-6">
                    {maintenanceLogs.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">Нет записей об обслуживании</p>
                    ) : (
                        <div className="space-y-3">
                            {maintenanceLogs.map(log => (
                                <div key={log.id} className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start flex-wrap gap-2">
                                        <span className="font-semibold text-text-h px-2 py-1 bg-accent/10 rounded-lg text-sm">
                                            {log.workType}
                                        </span>
                                        <span className="text-xs text-gray-500">{new Date(log.date).toLocaleString('ru-RU')}</span>
                                    </div>
                                    {log.comment && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{log.comment}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                    <Pagination
                        currentPage={maintenancePage}
                        totalPages={maintenanceTotalPages}
                        onPageChange={setMaintenancePage}
                        pageSize={maintenancePageSize}
                        onPageSizeChange={setMaintenancePageSize}
                        totalCount={maintenanceTotalCount}
                    />
                </div>
            </div>

            {motorData && (
                <EditMotorModal
                    motor={motorData}
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSuccess={() => {
                        loadMotorData();
                    }}
                />
            )}
        </div>
    );
}