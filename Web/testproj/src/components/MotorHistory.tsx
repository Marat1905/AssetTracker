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
                {/* Две колонки: рисунок и основные параметры */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Левая колонка – схема */}
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

                    {/* Правая колонка – основные параметры */}
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
                            <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-slate-700">
                                <span className="text-sm text-gray-500">Статус:</span>
                                <span className={`status-badge status-badge-${motorData.status}`}>
                                    {motorStatusLabels[motorData.status] || motorData.status}
                                </span>
                            </div>
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

                {/* Блок подшипников – на всю ширину под двумя колонками */}
                <div className="mt-8">
                    <h4 className="text-md font-semibold text-text-h mb-4 flex items-center gap-2 border-t border-gray-200 dark:border-slate-700 pt-6">
                        <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Подшипники
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Передний подшипник */}
                        <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4">
                            <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                                <span className="font-semibold text-text-h">Передний подшипник</span>
                                {motorData.frontBearingLastLubricant && (
                                    <span className="text-xs bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full">
                                        🛢️ {motorData.frontBearingLastLubricant}
                                    </span>
                                )}
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Тип:</span>
                                    <span className="font-medium text-text-h">{motorData.frontBearing.type}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Производитель:</span>
                                    <span className="font-medium text-text-h">{motorData.frontBearing.manufacturer}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Поставщик:</span>
                                    <span className="font-medium text-text-h">{motorData.frontBearing.supplier}</span>
                                </div>
                            </div>
                        </div>

                        {/* Задний подшипник */}
                        <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4">
                            <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                                <span className="font-semibold text-text-h">Задний подшипник</span>
                                {motorData.rearBearingLastLubricant && (
                                    <span className="text-xs bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full">
                                        🛢️ {motorData.rearBearingLastLubricant}
                                    </span>
                                )}
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Тип:</span>
                                    <span className="font-medium text-text-h">{motorData.rearBearing.type}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Производитель:</span>
                                    <span className="font-medium text-text-h">{motorData.rearBearing.manufacturer}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Поставщик:</span>
                                    <span className="font-medium text-text-h">{motorData.rearBearing.supplier}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}