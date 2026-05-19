import { useState, useEffect } from 'react';
import { MaintenanceType, BearingPosition, type LubricantType, type MotorFullHistoryDto } from '../types';
import { motorApi, lubricantApi } from '../services/api';
import toast from 'react-hot-toast';

const workTypes = [
    { value: MaintenanceType.Lubrication, label: 'Смазка', icon: '🛢️' },
    { value: MaintenanceType.BearingReplacement, label: 'Замена подшипника', icon: '⚙️' },
    { value: MaintenanceType.StatorRewinding, label: 'Перемотка статора', icon: '🔌' },
    { value: MaintenanceType.ShaftRepair, label: 'Ремонт вала', icon: '🔧' },
];

interface Props {
    motorId: number;
    motorData?: MotorFullHistoryDto | null;
    onAdded?: () => void;
    onCancel?: () => void;
    isModal?: boolean;
}

export default function MaintenanceForm({ motorId, motorData, onAdded, onCancel }: Props) {
    const [workType, setWorkType] = useState<MaintenanceType>(MaintenanceType.Lubrication);
    const [comment, setComment] = useState('');
    const [performedBy, setPerformedBy] = useState('');      // новое поле
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
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка добавления записи');
        } finally {
            setLoading(false);
        }
    };

    const isLubrication = workType === MaintenanceType.Lubrication;
    const isBearingReplacement = workType === MaintenanceType.BearingReplacement;

    return (
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
                <label className="form-label">Тип работ</label>
                <select
                    value={workType}
                    onChange={(e) => handleWorkTypeChange(e.target.value as MaintenanceType)}
                    className="form-input"
                >
                    {workTypes.map(wt => (
                        <option key={wt.value} value={wt.value}>
                            {wt.icon} {wt.label}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="form-label">Кто выполнил *</label>
                <input
                    type="text"
                    value={performedBy}
                    onChange={(e) => setPerformedBy(e.target.value)}
                    className="form-input"
                    placeholder="ФИО или должность"
                    required
                />
            </div>

            {(isLubrication || isBearingReplacement) && (
                <div>
                    <label className="form-label">Позиция подшипника</label>
                    <select
                        value={bearingPosition}
                        onChange={(e) => setBearingPosition(e.target.value as BearingPosition)}
                        className="form-input"
                    >
                        <option value={BearingPosition.Front}>Передний</option>
                        <option value={BearingPosition.Rear}>Задний</option>
                    </select>
                </div>
            )}

            {isLubrication && (
                <div>
                    <label className="form-label">Тип смазки</label>
                    <select
                        value={lubricantTypeId}
                        onChange={(e) => setLubricantTypeId(Number(e.target.value))}
                        className="form-input"
                        required
                    >
                        {lubricants.map(l => (
                            <option key={l.id} value={l.id}>{l.name}</option>
                        ))}
                    </select>
                    {lubricants.length === 0 && (
                        <p className="text-xs text-danger mt-1">Нет доступных типов смазки. Добавьте через справочник.</p>
                    )}
                </div>
            )}

            {isBearingReplacement && (
                <div className="space-y-3 border-t border-gray-200 dark:border-slate-700 pt-3">
                    <div>
                        <label className="form-label">Тип нового подшипника</label>
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
                        <label className="form-label">Производитель нового подшипника</label>
                        <input
                            type="text"
                            value={newBearingManufacturer}
                            onChange={(e) => setNewBearingManufacturer(e.target.value)}
                            className="form-input"
                            placeholder="SKF, FAG, NSK, ..."
                            required
                        />
                    </div>
                    <div>
                        <label className="form-label">Поставщик нового подшипника</label>
                        <input
                            type="text"
                            value={newBearingSupplier}
                            onChange={(e) => setNewBearingSupplier(e.target.value)}
                            className="form-input"
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
                <label className="form-label">Комментарий</label>
                <textarea
                    placeholder="Опишите выполненные работы, замененные детали и т.д."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="form-input"
                    rows={3}
                />
            </div>

            <div className="flex justify-end gap-3">
                {onCancel && (
                    <button type="button" onClick={onCancel} className="btn-secondary">
                        Отмена
                    </button>
                )}
                <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? 'Добавление...' : 'Добавить запись'}
                </button>
            </div>
        </form>
    );
}