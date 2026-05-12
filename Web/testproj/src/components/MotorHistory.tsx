import type { MotorFullHistoryDto } from '../types';
import { motorStatusLabels, mountingTypeLabels } from '../utils/locales';
import MotorDiagram from './MotorDiagram';

interface Props {
    motorData: MotorFullHistoryDto;
    onMotorUpdated?: () => void;
}

export default function MotorHistory({ motorData, onMotorUpdated }: Props) {
    return (
        <div className="card">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-700 bg-gradient-to-r from-accent/5 to-transparent">
                <div className="flex justify-between items-start flex-wrap gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-text-h">Двигатель №{motorData.inventoryNumber}</h2>
                        <p className="text-gray-500 mt-1">Паспортные данные и технические характеристики</p>
                    </div>
                    <span className={`status-badge status-badge-${motorData.status} text-sm px-3 py-1`}>
                        {motorStatusLabels[motorData.status] || motorData.status}
                    </span>
                </div>
            </div>

            {/* Две колонки: слева рисунок, справа характеристики */}
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* ЛЕВАЯ КОЛОНКА – Рисунок ЭД */}
                    <div className="flex justify-center items-center">
                        <MotorDiagram
                            shaftDiameter={motorData.shaftDiameter}
                            frontBearingType={motorData.frontBearingType}
                            rearBearingType={motorData.rearBearingType}
                            mountingType={motorData.mountingType}
                        />
                    </div>

                    {/* ПРАВАЯ КОЛОНКА – Технические характеристики */}
                    <div>
                        <h3 className="text-lg font-semibold text-text-h mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Паспортные данные
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-slate-700">
                                <span className="text-sm font-medium text-gray-500">Тип двигателя:</span>
                                <span className="text-sm font-semibold text-text-h">{motorData.type}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-slate-700">
                                <span className="text-sm font-medium text-gray-500">Диаметр вала:</span>
                                <span className="text-sm font-semibold text-text-h">{motorData.shaftDiameter} мм</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-slate-700">
                                <span className="text-sm font-medium text-gray-500">Мощность:</span>
                                <span className="text-sm font-semibold text-text-h">{motorData.power} кВт</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-slate-700">
                                <span className="text-sm font-medium text-gray-500">Обороты:</span>
                                <span className="text-sm font-semibold text-text-h">{motorData.speed} об/мин</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-slate-700">
                                <span className="text-sm font-medium text-gray-500">Передний подшипник:</span>
                                <span className="text-sm font-semibold text-text-h">{motorData.frontBearingType}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-slate-700">
                                <span className="text-sm font-medium text-gray-500">Задний подшипник:</span>
                                <span className="text-sm font-semibold text-text-h">{motorData.rearBearingType}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-slate-700">
                                <span className="text-sm font-medium text-gray-500">Тип монтажа:</span>
                                <span className="text-sm font-semibold text-text-h">
                                    {mountingTypeLabels[motorData.mountingType] || motorData.mountingType}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-sm font-medium text-gray-500">Текущий статус:</span>
                                <span className={`status-badge status-badge-${motorData.status} text-xs`}>
                                    {motorStatusLabels[motorData.status] || motorData.status}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}