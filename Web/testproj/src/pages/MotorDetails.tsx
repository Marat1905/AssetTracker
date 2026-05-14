// MotorDetails.tsx
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import MotorHistory from '../components/MotorHistory';
import EditMotorModal from '../components/EditMotorModal';
import MoveMotorForm from '../components/MoveMotorForm';
import MaintenanceForm from '../components/MaintenanceForm';
import { motorApi } from '../services/api';
import type { MotorFullHistoryDto, LocationHistoryDto, MaintenanceLogDto } from '../types';
import toast from 'react-hot-toast';
import Pagination from '../components/Pagination';
import { maintenanceTypeLabels, bearingPositionLabels } from '../utils/locales';
import { Map, ClipboardList, PlusCircle } from 'lucide-react';

export default function MotorDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const motorId = parseInt(id || '0', 10);
    const [motorData, setMotorData] = useState<MotorFullHistoryDto | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'location' | 'maintenance'>('location');

    // Модальные окна для добавления записей
    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
    const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);

    // Пагинация истории перемещений
    const [locationHistory, setLocationHistory] = useState<LocationHistoryDto[]>([]);
    const [locationPage, setLocationPage] = useState(1);
    const [locationTotalPages, setLocationTotalPages] = useState(1);
    const [locationTotalCount, setLocationTotalCount] = useState(0);
    const [locationPageSize, setLocationPageSize] = useState(5);

    // Пагинация журнала обслуживания
    const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLogDto[]>([]);
    const [maintenancePage, setMaintenancePage] = useState(1);
    const [maintenanceTotalPages, setMaintenanceTotalPages] = useState(1);
    const [maintenanceTotalCount, setMaintenanceTotalCount] = useState(0);
    const [maintenancePageSize, setMaintenancePageSize] = useState(5);

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

            {/* Блок паспортных данных */}
            {motorData && (
                <MotorHistory motorData={motorData} onMotorUpdated={refreshAll} />
            )}

            {/* Вкладки: История перемещений / Журнал обслуживания */}
            <div className="mt-6">
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="flex gap-6">
                        <button
                            onClick={() => setActiveTab('location')}
                            className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium transition-colors ${activeTab === 'location'
                                ? 'border-b-2 border-accent text-accent'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                        >
                            <Map size={18} />
                            История перемещений
                        </button>
                        <button
                            onClick={() => setActiveTab('maintenance')}
                            className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium transition-colors ${activeTab === 'maintenance'
                                ? 'border-b-2 border-accent text-accent'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                        >
                            <ClipboardList size={18} />
                            Журнал обслуживания и ремонтов
                        </button>
                    </nav>
                </div>

                <div className="mt-6">
                    {activeTab === 'location' && (
                        <div className="space-y-6">
                            {/* Кнопка добавления перемещения */}
                            <div className="flex justify-end">
                                <button
                                    onClick={() => setIsMoveModalOpen(true)}
                                    className="btn-primary inline-flex items-center gap-2"
                                >
                                    <PlusCircle size={18} />
                                    Добавить перемещение
                                </button>
                            </div>
                            {/* Список перемещений */}
                            <div className="card">
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
                                        onPageSizeChange={(newSize) => {
                                            setLocationPageSize(newSize);
                                            setLocationPage(1);
                                        }}
                                        totalCount={locationTotalCount}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'maintenance' && (
                        <div className="space-y-6">
                            {/* Кнопка добавления обслуживания */}
                            <div className="flex justify-end">
                                <button
                                    onClick={() => setIsMaintenanceModalOpen(true)}
                                    className="btn-primary inline-flex items-center gap-2"
                                >
                                    <PlusCircle size={18} />
                                    Добавить запись обслуживания
                                </button>
                            </div>
                            {/* Список обслуживаний */}
                            <div className="card">
                                <div className="p-6">
                                    {maintenanceLogs.length === 0 ? (
                                        <p className="text-gray-500 text-center py-4">Нет записей об обслуживании</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {maintenanceLogs.map(log => (
                                                <div key={log.id} className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4 hover:shadow-md transition-shadow">
                                                    <div className="flex justify-between items-start flex-wrap gap-2">
                                                        <span className="font-semibold text-text-h px-2 py-1 bg-accent/10 rounded-lg text-sm">
                                                            {maintenanceTypeLabels[log.workType] || log.workType}
                                                        </span>
                                                        <span className="text-xs text-gray-500">{new Date(log.date).toLocaleString('ru-RU')}</span>
                                                    </div>
                                                    {/* Дополнительная информация для смазки */}
                                                    {log.workType === 'Lubrication' && (
                                                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                                            <span className="font-medium">Позиция подшипника:</span> {bearingPositionLabels[log.bearingPosition || ''] || (log.bearingPosition === 'Front' ? 'Передний' : log.bearingPosition === 'Rear' ? 'Задний' : log.bearingPosition || '—')}
                                                            {log.lubricantTypeName && (
                                                                <>
                                                                    {' '}&nbsp;|&nbsp;
                                                                    <span className="font-medium">Смазка:</span> {log.lubricantTypeName}
                                                                </>
                                                            )}
                                                        </div>
                                                    )}
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
                                        onPageSizeChange={(newSize) => {
                                            setMaintenancePageSize(newSize);
                                            setMaintenancePage(1);
                                        }}
                                        totalCount={maintenanceTotalCount}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Модальное окно перемещения */}
            {isMoveModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" onClick={() => setIsMoveModalOpen(false)}>
                            <div className="absolute inset-0 bg-gray-500 opacity-75 dark:bg-gray-900 dark:opacity-80"></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                        <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-700">
                                <h3 className="text-lg font-semibold text-text-h flex items-center gap-2">
                                    <Map size={20} className="text-accent" />
                                    Перемещение двигателя
                                </h3>
                            </div>
                            <MoveMotorForm
                                motorId={motorId}
                                currentStatus={motorData?.status}
                                onMoved={() => {
                                    loadLocationHistory();
                                    loadMotorData();
                                    setIsMoveModalOpen(false);
                                }}
                                onCancel={() => setIsMoveModalOpen(false)}
                                isModal={true}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Модальное окно обслуживания */}
            {isMaintenanceModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" onClick={() => setIsMaintenanceModalOpen(false)}>
                            <div className="absolute inset-0 bg-gray-500 opacity-75 dark:bg-gray-900 dark:opacity-80"></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                        <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-700">
                                <h3 className="text-lg font-semibold text-text-h flex items-center gap-2">
                                    <ClipboardList size={20} className="text-accent" />
                                    Запись обслуживания / ремонта
                                </h3>
                            </div>
                            <MaintenanceForm
                                motorId={motorId}
                                onAdded={() => {
                                    loadMaintenanceLogs();
                                    loadMotorData();
                                    setIsMaintenanceModalOpen(false);
                                }}
                                onCancel={() => setIsMaintenanceModalOpen(false)}
                                isModal={true}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Модальное окно редактирования двигателя */}
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