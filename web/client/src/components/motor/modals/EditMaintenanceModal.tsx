import { useState, useEffect } from 'react';
import { motorApi, lubricantApi } from '../../../services/motor/api';
import type { MaintenanceLogDto, LubricantType, UpdateMaintenanceLogDto } from '../../../types/motor/motor';
import toast from 'react-hot-toast';

interface Props {
    /** Флаг видимости окна */
    isOpen: boolean;
    /** Инвентарный номер двигателя */
    motorId: number;
    /** Редактируемая запись обслуживания */
    log: MaintenanceLogDto;
    /** Функция закрытия */
    onClose: () => void;
    /** Коллбэк после успешного обновления */
    onSuccess: () => void;
}

/**
 * Модальное окно редактирования записи обслуживания.
 * Позволяет изменить комментарий, исполнителя, тип смазки (для смазки)
 * или данные нового подшипника (для замены подшипника).
 * Полностью поддерживает светлую и тёмную тему.
 * Использует затемнённый фон (overlay) как в CreateMotorForm.
 */
export default function EditMaintenanceModal({ isOpen, motorId, log, onClose, onSuccess }: Props) {
    const [comment, setComment] = useState(log.comment || '');
    const [performedBy, setPerformedBy] = useState(log.performedBy || '');
    const [lubricantTypeId, setLubricantTypeId] = useState<number | ''>(log.lubricantTypeId ?? '');
    // Поля для замены подшипника (если тип работ - замена)
    const [newBearingType, setNewBearingType] = useState(log.newBearing?.type || '');
    const [newBearingManufacturer, setNewBearingManufacturer] = useState(log.newBearing?.manufacturer || '');
    const [newBearingSupplier, setNewBearingSupplier] = useState(log.newBearing?.supplier || '');
    const [lubricants, setLubricants] = useState<LubricantType[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingLubricants, setLoadingLubricants] = useState(false);

    const isLubrication = log.workType === 'Lubrication';
    const isBearingReplacement = log.workType === 'BearingReplacement';

    // Загружаем типы смазки только для смазки
    useEffect(() => {
        if (isOpen && isLubrication) {
            const fetchLubricants = async () => {
                setLoadingLubricants(true);
                try {
                    const data = await lubricantApi.getAll();
                    setLubricants(data);
                } catch (err) {
                    console.error('Ошибка загрузки типов смазки', err);
                    toast.error('Не удалось загрузить типы смазки');
                } finally {
                    setLoadingLubricants(false);
                }
            };
            fetchLubricants();
        }
    }, [isOpen, isLubrication]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload: UpdateMaintenanceLogDto = {};

            // Обновляем комментарий, если изменился
            if (comment !== log.comment) {
                payload.comment = comment;
            }
            if (performedBy !== log.performedBy && performedBy.trim()) {
                payload.performedBy = performedBy.trim();
            }

            if (isLubrication) {
                // Обновляем тип смазки, если изменился
                if (lubricantTypeId !== log.lubricantTypeId) {
                    payload.lubricantTypeId = lubricantTypeId === '' ? undefined : Number(lubricantTypeId);
                }
            } else if (isBearingReplacement) {
                // Проверяем, изменились ли данные подшипника
                const currentNewBearing = log.newBearing;
                const bearingChanged =
                    newBearingType !== (currentNewBearing?.type || '') ||
                    newBearingManufacturer !== (currentNewBearing?.manufacturer || '') ||
                    newBearingSupplier !== (currentNewBearing?.supplier || '');

                if (bearingChanged) {
                    if (!newBearingType.trim()) {
                        toast.error('Тип подшипника не может быть пустым');
                        return;
                    }
                    if (!newBearingManufacturer.trim()) {
                        toast.error('Производитель подшипника не может быть пустым');
                        return;
                    }
                    if (!newBearingSupplier.trim()) {
                        toast.error('Поставщик подшипника не может быть пустым');
                        return;
                    }
                    payload.newBearing = {
                        type: newBearingType.trim(),
                        manufacturer: newBearingManufacturer.trim(),
                        supplier: newBearingSupplier.trim(),
                    };
                }
            }

            // Если нет изменений, выходим
            if (Object.keys(payload).length === 0) {
                toast.error('Нет изменений');
                setLoading(false);
                return;
            }

            await motorApi.updateMaintenanceLog(motorId, log.id, payload);
            toast.success('Запись обслуживания обновлена');
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка обновления');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Затемняющий фон (overlay) */}
            <div className="fixed inset-0 transition-opacity" onClick={onClose}>
                <div className="absolute inset-0 bg-gray-500 opacity-75 dark:bg-gray-900 dark:opacity-80"></div>
            </div>

            {/* Модальное окно – адаптивная ширина, высота с прокруткой при необходимости */}
            <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Редактирование записи обслуживания
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Тип работ: {log.workType === 'Lubrication' ? 'Смазка' :
                            log.workType === 'BearingReplacement' ? 'Замена подшипника' :
                                log.workType === 'StatorRewinding' ? 'Перемотка статора' :
                                    log.workType === 'ShaftRepair' ? 'Ремонт вала' : log.workType}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="form-label block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Кто выполнил
                        </label>
                        <input
                            type="text"
                            value={performedBy}
                            onChange={(e) => setPerformedBy(e.target.value)}
                            className="form-input w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            placeholder="ФИО или должность"
                        />
                    </div>

                    <div>
                        <label className="form-label block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Комментарий
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="form-input w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            rows={3}
                            placeholder="Комментарий к работе..."
                        />
                    </div>

                    {isLubrication && (
                        <div>
                            <label className="form-label block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Тип смазки
                            </label>
                            {loadingLubricants ? (
                                <div className="text-gray-500">Загрузка...</div>
                            ) : (
                                <select
                                    value={lubricantTypeId}
                                    onChange={(e) => setLubricantTypeId(e.target.value ? Number(e.target.value) : '')}
                                    className="form-input w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                >
                                    <option value="">-- Выберите тип смазки --</option>
                                    {lubricants.map(l => (
                                        <option key={l.id} value={l.id}>{l.name}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                    )}

                    {isBearingReplacement && (
                        <div className="space-y-3">
                            <div>
                                <label className="form-label block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Тип подшипника (новый)
                                </label>
                                <input
                                    type="text"
                                    value={newBearingType}
                                    onChange={(e) => setNewBearingType(e.target.value)}
                                    className="form-input w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    required
                                />
                            </div>
                            <div>
                                <label className="form-label block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Производитель подшипника
                                </label>
                                <input
                                    type="text"
                                    value={newBearingManufacturer}
                                    onChange={(e) => setNewBearingManufacturer(e.target.value)}
                                    className="form-input w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    required
                                />
                            </div>
                            <div>
                                <label className="form-label block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Поставщик подшипника
                                </label>
                                <input
                                    type="text"
                                    value={newBearingSupplier}
                                    onChange={(e) => setNewBearingSupplier(e.target.value)}
                                    className="form-input w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    required
                                />
                            </div>
                            {log.oldBearing && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 pt-2 border-t border-gray-200 dark:border-slate-700">
                                    <div>Старый подшипник:</div>
                                    <div>Тип: {log.oldBearing.type}</div>
                                    <div>Производитель: {log.oldBearing.manufacturer}</div>
                                    <div>Поставщик: {log.oldBearing.supplier}</div>
                                </div>
                            )}
                            <p className="text-xs text-amber-600 dark:text-amber-400">
                                Изменение данных подшипника приведёт к созданию нового подшипника в базе.
                            </p>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center min-w-[100px]"
                        >
                            {loading ? 'Сохранение...' : 'Сохранить'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}