import { useState, useEffect } from 'react';
import { MaintenanceType, BearingPosition, type LubricantType, type MotorFullHistoryDto } from '../../../types/motor/motor';
import { motorApi, lubricantApi } from '../../../services/motor/api';
import toast from 'react-hot-toast';

const workTypes = [
    { value: MaintenanceType.Lubrication, label: 'Смазка', icon: '🛢️' },
    { value: MaintenanceType.BearingReplacement, label: 'Замена подшипника', icon: '⚙️' },
    { value: MaintenanceType.StatorRewinding, label: 'Перемотка статора', icon: '🔌' },
    { value: MaintenanceType.ShaftRepair, label: 'Ремонт вала', icon: '🔧' },
];

interface Props {
    /** Флаг видимости модального окна (только для модального режима) */
    isOpen?: boolean;
    /** Функция закрытия модального окна (только для модального режима) */
    onClose?: () => void;
    /** Инвентарный номер двигателя */
    motorId: number;
    /** Данные двигателя (для предзаполнения последней смазки или текущего подшипника) */
    motorData?: MotorFullHistoryDto | null;
    /** Коллбэк после успешного добавления */
    onAdded?: () => void;
    /** Коллбэк отмены для обычной формы (не модальной) */
    onCancel?: () => void;
}

/**
 * Форма добавления записи обслуживания (смазка, замена подшипника, перемотка статора, ремонт вала).
 * Поддерживает выбор типа работ, позиции подшипника, типа смазки (из справочника),
 * а для замены подшипника – создание нового подшипника с типом, производителем и поставщиком.
 *
 * Может работать в двух режимах:
 * - как модальное окно (если переданы isOpen и onClose)
 * - как обычная форма на отдельной странице (если isOpen и onClose отсутствуют)
 *
 * В модальном режиме используется затемняющий фон и центрирование.
 * Полностью поддерживает светлую и тёмную тему.
 */
export default function MaintenanceForm({ isOpen, onClose, motorId, motorData, onAdded, onCancel }: Props) {
    const [workType, setWorkType] = useState<MaintenanceType>(MaintenanceType.Lubrication);
    const [comment, setComment] = useState('');
    const [performedBy, setPerformedBy] = useState('');
    const [loading, setLoading] = useState(false);
    const [lubricants, setLubricants] = useState<LubricantType[]>([]);
    const [bearingPosition, setBearingPosition] = useState<BearingPosition>(BearingPosition.Front);
    const [lubricantTypeId, setLubricantTypeId] = useState<number | ''>('');
    // Поля для нового подшипника (при замене)
    const [newBearingType, setNewBearingType] = useState('');
    const [newBearingManufacturer, setNewBearingManufacturer] = useState('');
    const [newBearingSupplier, setNewBearingSupplier] = useState('');

    // Загрузка типов смазки
    useEffect(() => {
        const fetchLubricants = async () => {
            try {
                const data = await lubricantApi.getAll();
                setLubricants(data);
            } catch (err) {
                console.error('Ошибка загрузки типов смазки', err);
                toast.error('Не удалось загрузить типы смазки');
            }
        };
        fetchLubricants();
    }, []);

    // Предустановка значений на основе текущего двигателя
    useEffect(() => {
        if (!motorData) return;

        if (workType === MaintenanceType.Lubrication && lubricants.length > 0) {
            const lastLubricantName = bearingPosition === BearingPosition.Front
                ? motorData.frontBearingLastLubricant
                : motorData.rearBearingLastLubricant;
            if (lastLubricantName) {
                const matched = lubricants.find(l => l.name === lastLubricantName);
                if (matched) {
                    setLubricantTypeId(matched.id);
                    return;
                }
            }
            if (lubricants.length > 0) {
                setLubricantTypeId(lubricants[0].id);
            }
        } else if (workType === MaintenanceType.BearingReplacement) {
            // Подставляем текущие данные подшипника (тип, производитель, поставщик)
            const currentBearing = bearingPosition === BearingPosition.Front
                ? motorData.frontBearing
                : motorData.rearBearing;
            setNewBearingType(currentBearing.type);
            setNewBearingManufacturer(currentBearing.manufacturer);
            setNewBearingSupplier(currentBearing.supplier);
        }
    }, [workType, bearingPosition, motorData, lubricants]);

    const handleWorkTypeChange = (newType: MaintenanceType) => {
        setWorkType(newType);
        if (newType === MaintenanceType.BearingReplacement) {
            setLubricantTypeId('');
        } else if (newType === MaintenanceType.Lubrication) {
            setNewBearingType('');
            setNewBearingManufacturer('');
            setNewBearingSupplier('');
        } else {
            setBearingPosition(BearingPosition.Front);
            setLubricantTypeId('');
            setNewBearingType('');
            setNewBearingManufacturer('');
            setNewBearingSupplier('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!performedBy.trim()) {
            toast.error('Укажите, кто выполнил обслуживание');
            return;
        }
        setLoading(true);
        try {
            const payload: any = {
                workType,
                comment,
                performedBy: performedBy.trim()
            };

            if (workType === MaintenanceType.Lubrication) {
                if (!bearingPosition) {
                    toast.error('Выберите позицию подшипника');
                    return;
                }
                if (!lubricantTypeId) {
                    toast.error('Выберите тип смазки');
                    return;
                }
                payload.bearingPosition = bearingPosition;
                payload.lubricantTypeId = Number(lubricantTypeId);
            } else if (workType === MaintenanceType.BearingReplacement) {
                if (!bearingPosition) {
                    toast.error('Выберите позицию подшипника');
                    return;
                }
                if (!newBearingType.trim()) {
                    toast.error('Введите тип нового подшипника');
                    return;
                }
                if (!newBearingManufacturer.trim()) {
                    toast.error('Введите производителя нового подшипника');
                    return;
                }
                if (!newBearingSupplier.trim()) {
                    toast.error('Введите поставщика нового подшипника');
                    return;
                }
                payload.bearingPosition = bearingPosition;
                // Отправляем данные нового подшипника
                payload.newBearing = {
                    type: newBearingType.trim(),
                    manufacturer: newBearingManufacturer.trim(),
                    supplier: newBearingSupplier.trim(),
                };
            }

            await motorApi.addMaintenance(motorId, payload);
            toast.success('Запись обслуживания добавлена');
            // Сброс
            setComment('');
            setPerformedBy('');
            setWorkType(MaintenanceType.Lubrication);
            setBearingPosition(BearingPosition.Front);
            setLubricantTypeId('');
            setNewBearingType('');
            setNewBearingManufacturer('');
            setNewBearingSupplier('');
            onAdded?.();
            if (onClose) onClose(); // Закрываем модальное окно, если оно есть
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка добавления записи');
        } finally {
            setLoading(false);
        }
    };

    const isLubrication = workType === MaintenanceType.Lubrication;
    const isBearingReplacement = workType === MaintenanceType.BearingReplacement;

    // Содержимое формы (одинаковое для модального и обычного режимов)
    const formContent = (
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Тип работ
                </label>
                <select
                    value={workType}
                    onChange={(e) => handleWorkTypeChange(e.target.value as MaintenanceType)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                    {workTypes.map(wt => (
                        <option key={wt.value} value={wt.value}>
                            {wt.icon} {wt.label}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Кто выполнил *
                </label>
                <input
                    type="text"
                    value={performedBy}
                    onChange={(e) => setPerformedBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="ФИО или должность"
                    required
                />
            </div>

            {(isLubrication || isBearingReplacement) && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Позиция подшипника
                    </label>
                    <select
                        value={bearingPosition}
                        onChange={(e) => setBearingPosition(e.target.value as BearingPosition)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                        <option value={BearingPosition.Front}>Передний</option>
                        <option value={BearingPosition.Rear}>Задний</option>
                    </select>
                </div>
            )}

            {isLubrication && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Тип смазки
                    </label>
                    <select
                        value={lubricantTypeId}
                        onChange={(e) => setLubricantTypeId(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        required
                    >
                        {lubricants.map(l => (
                            <option key={l.id} value={l.id}>{l.name}</option>
                        ))}
                    </select>
                    {lubricants.length === 0 && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                            Нет доступных типов смазки. Добавьте через справочник.
                        </p>
                    )}
                </div>
            )}

            {isBearingReplacement && (
                <div className="space-y-3 border-t border-gray-200 dark:border-slate-700 pt-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Тип нового подшипника
                        </label>
                        <input
                            type="text"
                            value={newBearingType}
                            onChange={(e) => setNewBearingType(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            placeholder="например: 6310"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Производитель нового подшипника
                        </label>
                        <input
                            type="text"
                            value={newBearingManufacturer}
                            onChange={(e) => setNewBearingManufacturer(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            placeholder="SKF, FAG, NSK, ..."
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Поставщик нового подшипника
                        </label>
                        <input
                            type="text"
                            value={newBearingSupplier}
                            onChange={(e) => setNewBearingSupplier(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            placeholder="ООО 'ПодшипникСервис'"
                            required
                        />
                    </div>
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                        Будет создан новый подшипник в базе данных.
                    </p>
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Комментарий
                </label>
                <textarea
                    placeholder="Опишите выполненные работы, замененные детали и т.д."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    rows={3}
                />
            </div>

            <div className="flex justify-end gap-3">
                {(onClose || onCancel) && (
                    <button
                        type="button"
                        onClick={() => {
                            if (onClose) onClose();
                            if (onCancel) onCancel();
                        }}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                        Отмена
                    </button>
                )}
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center min-w-[140px]"
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Добавление...
                        </span>
                    ) : 'Добавить запись'}
                </button>
            </div>
        </form>
    );

    // Если передан isOpen – работаем как модальное окно (с затемнением)
    if (isOpen !== undefined) {
        if (!isOpen) return null;
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Затемняющий фон (overlay) */}
                <div className="fixed inset-0 transition-opacity" onClick={onClose}>
                    <div className="absolute inset-0 bg-gray-500 opacity-75 dark:bg-gray-900 dark:opacity-80"></div>
                </div>

                {/* Модальное окно – адаптивная ширина, высота автоматическая */}
                <div className="relative z-10 w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                            Запись обслуживания / ремонта
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Заполните данные о выполненной работе
                        </p>
                    </div>
                    {formContent}
                </div>
            </div>
        );
    }

    // Иначе – режим обычной формы (без модального фона)
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    Запись обслуживания / ремонта
                </h2>
            </div>
            {formContent}
        </div>
    );
}