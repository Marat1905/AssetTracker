import {
    FaEdit,
    FaTrashAlt,
    FaMapMarkerAlt,
    FaBolt,
    FaTachometerAlt,
    FaHashtag,
    FaInfoCircle,
} from 'react-icons/fa';
import type { MotorListItem, MountingType } from '../../../types/motor/motor';
import { motorStatusLabels } from '../../../utils/motor/locales';
import { getStatusColorClasses } from '../../../utils/motor/statusColors';
import MotorDiagram from '../MotorDiagram';
import { MountingType as MountingTypeEnum } from '../../../types/motor/motor';

/**
 * Свойства компонента карточного отображения списка двигателей.
 */
interface Props {
    /** Список двигателей. */
    motors: MotorListItem[];
    /** Признак, что пользователь является админом или электриком. */
    isAdminOrElectric: boolean;
    /** Обработчик клика по карточке (переход к деталям). */
    onCardClick: (id: number) => void;
    /** Обработчик клика по кнопке редактирования. */
    onEdit: (motor: MotorListItem, e: React.MouseEvent) => void;
    /** Обработчик клика по кнопке удаления. */
    onDelete: (id: number, e: React.MouseEvent) => void;
}

/**
 * Карточный режим отображения списка двигателей.
 * Каждая карточка содержит основную информацию и мини-схему двигателя.
 */
export default function MotorListCardView({
    motors,
    isAdminOrElectric,
    onCardClick,
    onEdit,
    onDelete,
}: Props) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {motors.map((motor) => (
                <div
                    key={motor.id}
                    onClick={() => onCardClick(motor.id)}
                    className="group cursor-pointer bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                    <div className={`h-1.5 ${motor.status === 'InOperation' ? 'bg-green-500' : motor.status === 'InRepair' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>

                    <div className="p-5">
                        <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <FaHashtag className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
                                <span className="font-mono font-semibold text-gray-900 dark:text-gray-100 truncate">
                                    {motor.inventoryNumber ? `№${motor.inventoryNumber}` : '—'}
                                </span>
                            </div>
                            {isAdminOrElectric && (
                                <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        onClick={(e) => onEdit(motor, e)}
                                        className="p-1.5 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                                        title="Редактировать"
                                    >
                                        <FaEdit size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => onDelete(motor.id, e)}
                                        className="p-1.5 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                                        title="Удалить"
                                    >
                                        <FaTrashAlt size={16} />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                    <FaBolt className="text-amber-500 dark:text-amber-400 flex-shrink-0" />
                                    <span className="text-gray-800 dark:text-gray-200 font-medium truncate">
                                        {motor.type} • {motor.power} кВт
                                    </span>
                                </div>

                                <div className="mb-2">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColorClasses(motor.status)}`}>
                                        <FaTachometerAlt className="mr-1.5 h-3 w-3" />
                                        {motorStatusLabels[motor.status] || motor.status}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <FaMapMarkerAlt className="flex-shrink-0 text-blue-500 dark:text-blue-400" />
                                    <span className="truncate">{motor.currentLocation || '—'}</span>
                                </div>
                            </div>

                            <div className="w-24 flex-shrink-0">
                                <MotorDiagram mountingType={(motor as any).mountingType || MountingTypeEnum.Feet} />
                            </div>
                        </div>

                        <div className="mt-3 text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 justify-end">
                            <FaInfoCircle size={12} />
                            <span>Нажмите для деталей</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}