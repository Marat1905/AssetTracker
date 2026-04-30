import { useEffect, useState } from 'react';
import type { MotorFullHistoryDto } from '../types';
import { motorApi } from '../services/api';
import toast from 'react-hot-toast';
import MoveMotorForm from './MoveMotorForm';
import MaintenanceForm from './MaintenanceForm';
import { maintenanceTypeLabels, motorStatusLabels } from '../utils/locales';

interface Props {
    motorId: number;
}

export default function MotorHistory({ motorId }: Props) {
    const [history, setHistory] = useState<MotorFullHistoryDto | null>(null);
    const [loading, setLoading] = useState(true);

    const loadHistory = async () => {
        try {
            const data = await motorApi.getFullHistory(motorId);
            setHistory(data);
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка загрузки');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHistory();
    }, [motorId]);

    if (loading) {
        return (
            <div className="card p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-accent border-t-transparent"></div>
                <p className="mt-4 text-gray-500">Загрузка данных двигателя...</p>
            </div>
        );
    }

    if (!history) {
        return (
            <div className="card p-12 text-center">
                <svg className="w-16 h-16 text-danger mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-text-h mb-2">Двигатель не найден</h3>
                <p className="text-gray-500">Проверьте правильность инвентарного номера</p>
            </div>
        );
    }

    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Паспортные данные */}
            <div className="card">
                <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-700 bg-gradient-to-r from-accent/5 to-transparent">
                    <div className="flex justify-between items-start flex-wrap gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-text-h">Двигатель №{history.inventoryNumber}</h2>
                            <p className="text-gray-500 mt-1">Паспортные данные и технические характеристики</p>
                        </div>
                        <span className={`status-badge status-badge-${history.status} text-sm px-3 py-1`}>
                            {motorStatusLabels[history.status] || history.status}
                        </span>
                    </div>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 uppercase tracking-wider">Тип двигателя</span>
                            <span className="font-medium text-text-h mt-1">{history.type}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 uppercase tracking-wider">Габариты</span>
                            <span className="font-medium text-text-h mt-1">{history.dimensions}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 uppercase tracking-wider">Мощность</span>
                            <span className="font-medium text-text-h mt-1">{history.power} кВт</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 uppercase tracking-wider">Обороты</span>
                            <span className="font-medium text-text-h mt-1">{history.speed} об/мин</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 uppercase tracking-wider">Передний подшипник</span>
                            <span className="font-medium text-text-h mt-1">{history.frontBearingType}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 uppercase tracking-wider">Задний подшипник</span>
                            <span className="font-medium text-text-h mt-1">{history.rearBearingType}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Формы действий */}
            <div className="grid md:grid-cols-2 gap-6">
                <MoveMotorForm motorId={motorId} currentStatus={history.status} onMoved={loadHistory} />
                <MaintenanceForm motorId={motorId} onAdded={loadHistory} />
            </div>

            {/* История перемещений */}
            <div className="card">
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
                    {history.locationHistory.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">Нет записей о перемещениях</p>
                    ) : (
                        <div className="space-y-4">
                            {history.locationHistory.map((loc) => (
                                <div key={loc.id} className="relative pl-6 pb-4 last:pb-0 border-l-2 border-accent/30">
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-accent shadow-md"></div>
                                    <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4">
                                        <p className="font-semibold text-text-h">{loc.location}</p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {formatDate(loc.startDate)} – {loc.endDate ? formatDate(loc.endDate) : 'настоящее время'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Журнал обслуживания */}
            <div className="card">
                <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-text-h flex items-center gap-2">
                        <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Журнал обслуживания и ремонтов
                    </h3>
                </div>
                <div className="p-6">
                    {history.maintenanceLogs.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">Нет записей об обслуживании</p>
                    ) : (
                        <div className="space-y-3">
                            {history.maintenanceLogs.map(log => (
                                <div key={log.id} className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start flex-wrap gap-2">
                                        <span className="font-semibold text-text-h px-2 py-1 bg-accent/10 rounded-lg text-sm">
                                            {maintenanceTypeLabels[log.workType] || log.workType}
                                        </span>
                                        <span className="text-xs text-gray-500">{formatDate(log.date)}</span>
                                    </div>
                                    {log.comment && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{log.comment}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}