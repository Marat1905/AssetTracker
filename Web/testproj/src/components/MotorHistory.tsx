import type { MotorFullHistoryDto } from '../types';
import { motorStatusLabels, mountingTypeLabels } from '../utils/locales';

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
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase tracking-wider">Тип двигателя</span>
                        <span className="font-medium text-text-h mt-1">{motorData.type}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase tracking-wider">Диаметр вала (мм)</span>
                        <span className="font-medium text-text-h mt-1">{motorData.shaftDiameter}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase tracking-wider">Мощность</span>
                        <span className="font-medium text-text-h mt-1">{motorData.power} кВт</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase tracking-wider">Обороты</span>
                        <span className="font-medium text-text-h mt-1">{motorData.speed} об/мин</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase tracking-wider">Передний подшипник</span>
                        <span className="font-medium text-text-h mt-1">{motorData.frontBearingType}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase tracking-wider">Задний подшипник</span>
                        <span className="font-medium text-text-h mt-1">{motorData.rearBearingType}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase tracking-wider">Тип монтажа</span>
                        <span className="font-medium text-text-h mt-1">
                            {mountingTypeLabels[motorData.mountingType] || motorData.mountingType}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}