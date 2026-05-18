// components/MotorHistory.tsx
import type { MotorFullHistoryDto } from '../types';
import { motorStatusLabels, mountingTypeLabels, mountingCodes } from '../utils/locales';
import MotorDiagram from './MotorDiagram';

interface Props {
    motorData: MotorFullHistoryDto;
    onMotorUpdated?: () => void;
}

export default function MotorHistory({ motorData, onMotorUpdated }: Props) {
    const codes = mountingCodes[motorData.mountingType] || { numeric: '', alpha: '' };

    return (
        <div className="card">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 bg-gradient-to-r from-accent/5 to-transparent">
                <div>
                    <h2 className="text-2xl font-bold text-text-h">Двигатель №{motorData.inventoryNumber}</h2>
                    <p className="text-gray-500 mt-1 text-sm">Паспортные данные и технические характеристики</p>
                </div>
            </div>

            <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* ЛЕВАЯ КОЛОНКА – Рисунок ЭД с типами смазки */}
                    <div className="flex justify-center items-center w-96 max-w-full mx-auto">
                        <MotorDiagram
                            shaftDiameter={motorData.shaftDiameter}
                            frontBearingType={motorData.frontBearing.type}
                            rearBearingType={motorData.rearBearing.type}
                            mountingType={motorData.mountingType}
                            frontBearingLastLubricant={motorData.frontBearingLastLubricant}
                            rearBearingLastLubricant={motorData.rearBearingLastLubricant}
                        />
                    </div>

                    {/* ПРАВАЯ КОЛОНКА – Технические характеристики */}
                    <div className="flex flex-col justify-start">
                        <h3 className="text-md font-semibold text-text-h mb-3 flex items-center gap-2">
                            <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Паспортные данные
                        </h3>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-slate-700">
                                <span className="text-sm text-gray-500">Тип двигателя:</span>
                                <span className="text-sm font-medium text-text-h">{motorData.type}</span>
                            </div>
                            <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-slate-700">
                                <span className="text-sm text-gray-500">Диаметр вала:</span>
                                <span className="text-sm font-medium text-text-h">{motorData.shaftDiameter} мм</span>
                            </div>
                            <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-slate-700">
                                <span className="text-sm text-gray-500">Мощность:</span>
                                <span className="text-sm font-medium text-text-h">{motorData.power} кВт</span>
                            </div>
                            <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-slate-700">
                                <span className="text-sm text-gray-500">Обороты:</span>
                                <span className="text-sm font-medium text-text-h">{motorData.speed} об/мин</span>
                            </div>

                            {/* Передний подшипник с производителем и поставщиком */}
                            <div className="py-1.5 border-b border-gray-100 dark:border-slate-700">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Передний подшипник:</span>
                                    <span className="text-sm font-medium text-text-h text-right">{motorData.frontBearing.type}</span>
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                    <span className="text-xs text-gray-400">Производитель:</span>
                                    <span className="text-xs text-gray-600 dark:text-gray-400">{motorData.frontBearing.manufacturer}</span>
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                    <span className="text-xs text-gray-400">Поставщик:</span>
                                    <span className="text-xs text-gray-600 dark:text-gray-400">{motorData.frontBearing.supplier}</span>
                                </div>
                            </div>

                            {/* Задний подшипник с производителем и поставщиком */}
                            <div className="py-1.5 border-b border-gray-100 dark:border-slate-700">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Задний подшипник:</span>
                                    <span className="text-sm font-medium text-text-h text-right">{motorData.rearBearing.type}</span>
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                    <span className="text-xs text-gray-400">Производитель:</span>
                                    <span className="text-xs text-gray-600 dark:text-gray-400">{motorData.rearBearing.manufacturer}</span>
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                    <span className="text-xs text-gray-400">Поставщик:</span>
                                    <span className="text-xs text-gray-600 dark:text-gray-400">{motorData.rearBearing.supplier}</span>
                                </div>
                            </div>

                            {/* Последние смазки */}
                            {motorData.frontBearingLastLubricant && (
                                <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-slate-700">
                                    <span className="text-sm text-gray-500">Последняя смазка (передний):</span>
                                    <span className="text-sm font-medium text-orange-600 dark:text-orange-400">{motorData.frontBearingLastLubricant}</span>
                                </div>
                            )}
                            {motorData.rearBearingLastLubricant && (
                                <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-slate-700">
                                    <span className="text-sm text-gray-500">Последняя смазка (задний):</span>
                                    <span className="text-sm font-medium text-orange-600 dark:text-orange-400">{motorData.rearBearingLastLubricant}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-slate-700">
                                <span className="text-sm text-gray-500">Тип монтажа:</span>
                                <div className="text-right">
                                    <span className="text-sm font-medium text-text-h block">
                                        {mountingTypeLabels[motorData.mountingType] || motorData.mountingType}
                                    </span>
                                    {codes.numeric && (
                                        <span className="text-xs text-gray-500 font-mono">
                                            {codes.numeric} · {codes.alpha}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}