// EditMotorModal.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { motorApi } from '../services/api';
import { MotorStatus, MountingType, type MotorFullHistoryDto, type UpdateMotorRequest } from '../types';
import { motorStatusLabels, mountingTypeLabels } from '../utils/locales';

// Схема валидации – без статуса (статус меняется только через перемещение)
const schema = z.object({
    type: z.string().min(1, 'Тип обязателен'),
    shaftDiameter: z.number().positive('Диаметр вала > 0'),
    power: z.number().positive('Мощность > 0'),
    speed: z.number().positive('Обороты > 0'),
    mountingType: z.nativeEnum(MountingType),
});

type FormData = z.infer<typeof schema>;

interface Props {
    /** Полные данные двигателя (для предзаполнения) */
    motor: MotorFullHistoryDto;
    /** Флаг видимости окна */
    isOpen: boolean;
    /** Функция закрытия */
    onClose: () => void;
    /** Коллбэк после успешного обновления */
    onSuccess: () => void;
}

/**
 * Модальное окно редактирования основных характеристик двигателя.
 * Содержит поля для изменения типа, диаметра вала, мощности, оборотов,
 * типа монтажа. Подшипники отображаются информационно, так как
 * их замена выполняется через журнал обслуживания.
 * Для предотвращения излишней высоты добавлена прокрутка содержимого.
 * Инвентарный номер редактируется в отдельном модальном окне.
 * Статус отображается только для информации (изменить его можно через перемещение).
 */
export default function EditMotorModal({ motor, isOpen, onClose, onSuccess }: Props) {
    // Получаем текущее местоположение из истории перемещений
    const currentLocation = motor.locationHistory.find(loc => loc.endDate === null)?.location;

    // Формируем подзаголовок с инвентарным номером и местоположением
    const inventoryText = motor.inventoryNumber
        ? `Инв. номер: ${motor.inventoryNumber}`
        : 'без инв. номера';
    const locationText = currentLocation ? ` (Место: ${currentLocation})` : '';

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            type: motor.type,
            shaftDiameter: motor.shaftDiameter,
            power: motor.power,
            speed: motor.speed,
            mountingType: motor.mountingType,
        }
    });

    // Синхронизация формы с актуальными данными двигателя (после изменения через другие операции)
    useEffect(() => {
        reset({
            type: motor.type,
            shaftDiameter: motor.shaftDiameter,
            power: motor.power,
            speed: motor.speed,
            mountingType: motor.mountingType,
        });
    }, [motor, reset]);

    const onSubmit = async (data: FormData) => {
        try {
            // Отправляем все поля, включая статус (берём текущий из motor, так как он не редактируется в форме)
            const updateData: UpdateMotorRequest = {
                type: data.type,
                shaftDiameter: data.shaftDiameter,
                power: data.power,
                speed: data.speed,
                frontBearingType: motor.frontBearing.type,
                rearBearingType: motor.rearBearing.type,
                status: motor.status, // статус не меняется, передаём текущий
                mountingType: data.mountingType,
            };
            await motorApi.updateMotor(motor.id, updateData);
            toast.success('Данные двигателя обновлены');
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error('Ошибка обновления:', err);
            const message = err.response?.data?.error || 'Ошибка обновления двигателя';
            toast.error(message);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" onClick={onClose}>
                    <div className="absolute inset-0 bg-gray-500 opacity-75 dark:bg-gray-900 dark:opacity-80"></div>
                </div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                {/* Увеличена ширина (max-w-2xl) и добавлена прокрутка внутри окна */}
                <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                        <h3 className="text-lg font-semibold text-text-h">
                            Редактирование двигателя {inventoryText}{locationText}
                        </h3>
                        <div className="text-sm text-gray-500 mt-1 space-y-0.5">
                            <div>• Инвентарный номер можно изменить через кнопку рядом с номером.</div>
                            <div>• Замена подшипников выполняется через «Замену подшипника» в журнале обслуживания.</div>
                            <div>• Статус изменяется только при перемещении двигателя.</div>
                        </div>
                    </div>
                    {/* Добавлен overflow-y-auto и max-h-[80vh] для прокрутки содержимого */}
                    <div className="overflow-y-auto max-h-[80vh]">
                        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="form-label">Тип двигателя</label>
                                    <input {...register('type')} className="form-input" />
                                    {errors.type && <p className="text-danger text-xs mt-1">{errors.type.message}</p>}
                                </div>
                                <div>
                                    <label className="form-label">Диаметр вала (мм)</label>
                                    <input type="number" step="0.1" {...register('shaftDiameter', { valueAsNumber: true })} className="form-input" />
                                    {errors.shaftDiameter && <p className="text-danger text-xs mt-1">{errors.shaftDiameter.message}</p>}
                                </div>
                                <div>
                                    <label className="form-label">Мощность (кВт)</label>
                                    <input type="number" step="0.1" {...register('power', { valueAsNumber: true })} className="form-input" />
                                    {errors.power && <p className="text-danger text-xs mt-1">{errors.power.message}</p>}
                                </div>
                                <div>
                                    <label className="form-label">Обороты (об/мин)</label>
                                    <input type="number" {...register('speed', { valueAsNumber: true })} className="form-input" />
                                    {errors.speed && <p className="text-danger text-xs mt-1">{errors.speed.message}</p>}
                                </div>
                                <div>
                                    <label className="form-label">Тип монтажа</label>
                                    <select {...register('mountingType')} className="form-input">
                                        {Object.entries(mountingTypeLabels).map(([value, label]) => (
                                            <option key={value} value={value}>{label}</option>
                                        ))}
                                    </select>
                                    {errors.mountingType && <p className="text-danger text-xs mt-1">{errors.mountingType.message}</p>}
                                </div>
                                {/* Отображение статуса (только для информации) */}
                                <div>
                                    <label className="form-label">Статус (изменяется при перемещении)</label>
                                    <div className="mt-1">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`}>
                                            {motorStatusLabels[motor.status] || motor.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Информационные блоки о подшипниках – компактное отображение */}
                            <div className="border-t border-gray-200 dark:border-slate-700 pt-3 mt-2">
                                <h4 className="text-sm font-semibold text-text-h mb-2">Подшипники (информационно)</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                    <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-2">
                                        <div className="font-medium text-text-h mb-1">Передний</div>
                                        <div className="space-y-0.5 text-gray-600 dark:text-gray-400">
                                            <div>Тип: {motor.frontBearing.type}</div>
                                            <div>Производитель: {motor.frontBearing.manufacturer}</div>
                                            <div>Поставщик: {motor.frontBearing.supplier}</div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-2">
                                        <div className="font-medium text-text-h mb-1">Задний</div>
                                        <div className="space-y-0.5 text-gray-600 dark:text-gray-400">
                                            <div>Тип: {motor.rearBearing.type}</div>
                                            <div>Производитель: {motor.rearBearing.manufacturer}</div>
                                            <div>Поставщик: {motor.rearBearing.supplier}</div>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                                    Для изменения подшипника используйте операцию «Замена подшипника» в журнале обслуживания.
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={onClose} className="btn-secondary">
                                    Отмена
                                </button>
                                <button type="submit" disabled={isSubmitting} className="btn-primary">
                                    {isSubmitting ? 'Сохранение...' : 'Сохранить'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}