// EditMotorModal.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { motorApi } from '../../services/motor/api';
import { type MotorStatus, MountingType, type MotorFullHistoryDto, type UpdateMotorRequest } from '../../types/motor/motor';
import { motorStatusLabels, mountingTypeLabels } from '../../utils/motor/locales';

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
 * Полностью поддерживает светлую и тёмную тему.
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

    // Синхронизация формы с актуальными данными двигателя
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
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Затемняющий фон (overlay) */}
            <div className="fixed inset-0 transition-opacity" onClick={onClose}>
                <div className="absolute inset-0 bg-gray-500 opacity-75 dark:bg-gray-900 dark:opacity-80"></div>
            </div>

            {/* Вспомогательный элемент для вертикального выравнивания */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            {/* Контент модального окна */}
            <div className="relative z-10 inline-block align-bottom bg-white dark:bg-slate-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Редактирование двигателя {inventoryText}{locationText}
                    </h3>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 space-y-0.5">
                        <div>• Инвентарный номер можно изменить через кнопку рядом с номером.</div>
                        <div>• Замена подшипников выполняется через «Замену подшипника» в журнале обслуживания.</div>
                        <div>• Статус изменяется только при перемещении двигателя.</div>
                    </div>
                </div>

                {/* Прокручиваемая область */}
                <div className="overflow-y-auto max-h-[80vh]">
                    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Тип двигателя
                                </label>
                                <input
                                    {...register('type')}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                />
                                {errors.type && (
                                    <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.type.message}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Диаметр вала (мм)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    {...register('shaftDiameter', { valueAsNumber: true })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                />
                                {errors.shaftDiameter && (
                                    <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.shaftDiameter.message}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Мощность (кВт)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    {...register('power', { valueAsNumber: true })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                />
                                {errors.power && (
                                    <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.power.message}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Обороты (об/мин)
                                </label>
                                <input
                                    type="number"
                                    {...register('speed', { valueAsNumber: true })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                />
                                {errors.speed && (
                                    <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.speed.message}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Тип монтажа
                                </label>
                                <select
                                    {...register('mountingType')}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                >
                                    {Object.entries(mountingTypeLabels).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                                {errors.mountingType && (
                                    <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.mountingType.message}</p>
                                )}
                            </div>
                            {/* Отображение статуса (только для информации) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Статус (изменяется при перемещении)
                                </label>
                                <div className="mt-1">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                                        ${motor.status === 'InOperation' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                            motor.status === 'InRepair' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
                                        {motorStatusLabels[motor.status] || motor.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Информационные блоки о подшипниках */}
                        <div className="border-t border-gray-200 dark:border-slate-700 pt-3 mt-2">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                Подшипники (информационно)
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-2">
                                    <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">Передний</div>
                                    <div className="space-y-0.5 text-gray-600 dark:text-gray-400">
                                        <div>Тип: {motor.frontBearing.type}</div>
                                        <div>Производитель: {motor.frontBearing.manufacturer}</div>
                                        <div>Поставщик: {motor.frontBearing.supplier}</div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-2">
                                    <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">Задний</div>
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
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
                            >
                                Отмена
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 min-w-[160px] flex items-center justify-center"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Сохранение...
                                    </span>
                                ) : 'Сохранить'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}