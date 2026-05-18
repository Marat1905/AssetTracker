// components/EditMaintenanceModal.tsx
import { useState, useEffect } from 'react';
import { motorApi, lubricantApi } from '../services/api';
import type { MaintenanceLogDto, LubricantType, UpdateMaintenanceLogDto, CreateBearingDto } from '../types';
import toast from 'react-hot-toast';

interface Props {
    isOpen: boolean;
    motorId: number;
    log: MaintenanceLogDto;
    onClose: () => void;
    onSuccess: () => void;
}

export default function EditMaintenanceModal({ isOpen, motorId, log, onClose, onSuccess }: Props) {
    const [comment, setComment] = useState(log.comment || '');
    const [lubricantTypeId, setLubricantTypeId] = useState<number | ''>(log.lubricantTypeId ?? '');
    // Поля для нового подшипника при замене
    const [newBearingType, setNewBearingType] = useState(log.newBearingType || '');
    const [newBearingManufacturer, setNewBearingManufacturer] = useState(log.newBearingManufacturer || '');
    const [newBearingSupplier, setNewBearingSupplier] = useState(log.newBearingSupplier || '');
    const [lubricants, setLubricants] = useState<LubricantType[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingLubricants, setLoadingLubricants] = useState(false);

    // Загружаем список типов смазки, только если работа – смазка
    useEffect(() => {
        if (isOpen && log.workType === 'Lubrication') {
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
    }, [isOpen, log.workType]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload: UpdateMaintenanceLogDto = {};

            // Комментарий – если изменился
            if (comment !== log.comment) {
                payload.comment = comment;
            }

            // В зависимости от типа работ добавляем специфичные поля
            if (log.workType === 'Lubrication') {
                if (lubricantTypeId !== log.lubricantTypeId) {
                    payload.lubricantTypeId = lubricantTypeId === '' ? undefined : Number(lubricantTypeId);
                }
            } else if (log.workType === 'BearingReplacement') {
                // Проверяем, изменился ли новый подшипник
                const bearingChanged =
                    newBearingType.trim() !== (log.newBearingType || '') ||
                    newBearingManufacturer.trim() !== (log.newBearingManufacturer || '') ||
                    newBearingSupplier.trim() !== (log.newBearingSupplier || '');
                if (bearingChanged) {
                    if (!newBearingType.trim()) {
                        toast.error('Тип подшипника не может быть пустым');
                        setLoading(false);
                        return;
                    }
                    if (!newBearingManufacturer.trim()) {
                        toast.error('Производитель подшипника не может быть пустым');
                        setLoading(false);
                        return;
                    }
                    if (!newBearingSupplier.trim()) {
                        toast.error('Поставщик подшипника не может быть пустым');
                        setLoading(false);
                        return;
                    }
                    const newBearingDto: CreateBearingDto = {
                        type: newBearingType.trim(),
                        manufacturer: newBearingManufacturer.trim(),
                        supplier: newBearingSupplier.trim(),
                    };
                    payload.newBearing = newBearingDto;
                }
            }

            // Если ничего не изменилось – уведомляем и выходим
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

    const isLubrication = log.workType === 'Lubrication';
    const isBearingReplacement = log.workType === 'BearingReplacement';

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" onClick={onClose}>
                    <div className="absolute inset-0 bg-gray-500 opacity-75 dark:bg-gray-900 dark:opacity-80"></div>
                </div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
                    <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-700">
                        <h3 className="text-lg font-semibold text-text-h">
                            Редактирование записи обслуживания
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Тип работ: {log.workType === 'Lubrication' ? 'Смазка' :
                                log.workType === 'BearingReplacement' ? 'Замена подшипника' :
                                    log.workType === 'StatorRewinding' ? 'Перемотка статора' :
                                        log.workType === 'ShaftRepair' ? 'Ремонт вала' : log.workType}
                        </p>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {/* Поле комментария доступно всегда */}
                        <div>
                            <label className="form-label">Комментарий</label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="form-input"
                                rows={3}
                                placeholder="Комментарий к работе..."
                            />
                        </div>

                        {/* Для смазки – поле выбора типа смазки */}
                        {isLubrication && (
                            <div>
                                <label className="form-label">Тип смазки</label>
                                {loadingLubricants ? (
                                    <div className="text-gray-500">Загрузка...</div>
                                ) : (
                                    <select
                                        value={lubricantTypeId}
                                        onChange={(e) => setLubricantTypeId(e.target.value ? Number(e.target.value) : '')}
                                        className="form-input"
                                    >
                                        <option value="">-- Выберите тип смазки --</option>
                                        {lubricants.map(l => (
                                            <option key={l.id} value={l.id}>{l.name}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        )}

                        {/* Для замены подшипника – отображение текущих данных и поля для редактирования */}
                        {isBearingReplacement && (
                            <div className="space-y-4">
                                {/* Блок с текущим (старым) подшипником, который был до замены */}
                                {log.oldBearingType && (
                                    <div className="p-3 bg-gray-100 dark:bg-slate-700 rounded-lg">
                                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Старый подшипник (был заменён):
                                        </div>
                                        <div className="text-sm space-y-1">
                                            <div><span className="text-gray-500">Тип:</span> {log.oldBearingType}</div>
                                            {log.oldBearingManufacturer && (
                                                <div><span className="text-gray-500">Производитель:</span> {log.oldBearingManufacturer}</div>
                                            )}
                                            {log.oldBearingSupplier && (
                                                <div><span className="text-gray-500">Поставщик:</span> {log.oldBearingSupplier}</div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Блок с текущим новым подшипником (тот, который установлен сейчас в двигателе) */}
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                                        Текущий подшипник (установлен):
                                    </div>
                                    <div className="text-sm space-y-1">
                                        <div><span className="text-gray-500">Тип:</span> {log.newBearingType || '—'}</div>
                                        <div><span className="text-gray-500">Производитель:</span> {log.newBearingManufacturer || '—'}</div>
                                        <div><span className="text-gray-500">Поставщик:</span> {log.newBearingSupplier || '—'}</div>
                                    </div>
                                </div>

                                {/* Поля для редактирования – новые данные подшипника */}
                                <div className="border-t border-gray-200 dark:border-slate-600 pt-3 mt-2">
                                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                        Новые данные (при изменении подшипника):
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="form-label">Тип подшипника</label>
                                            <input
                                                type="text"
                                                value={newBearingType}
                                                onChange={(e) => setNewBearingType(e.target.value)}
                                                className="form-input"
                                                placeholder="например: 6310"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">Производитель</label>
                                            <input
                                                type="text"
                                                value={newBearingManufacturer}
                                                onChange={(e) => setNewBearingManufacturer(e.target.value)}
                                                className="form-input"
                                                placeholder="SKF, FAG, ..."
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">Поставщик</label>
                                            <input
                                                type="text"
                                                value={newBearingSupplier}
                                                onChange={(e) => setNewBearingSupplier(e.target.value)}
                                                className="form-input"
                                                placeholder="ООО «ТехСнаб»"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <p className="text-xs text-amber-600 dark:text-amber-400">
                                    Если вы измените данные подшипника, они обновят соответствующий подшипник в паспортных данных двигателя.
                                </p>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={onClose} className="btn-secondary">
                                Отмена
                            </button>
                            <button type="submit" disabled={loading} className="btn-primary">
                                {loading ? 'Сохранение...' : 'Сохранить'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}