import { z } from 'zod';
import { MountingType } from '../../types/motor/motor';

/**
 * Препроцессор для необязательного положительного числа.
 * Пустые строки, null, undefined и NaN преобразуются в undefined (поле считается не заданным).
 */
const optionalPositiveNumber = z.preprocess(
    (v) => {
        if (v === '' || v === null || v === undefined) return undefined;
        if (typeof v === 'number' && Number.isNaN(v)) return undefined;
        return Number(v);
    },
    z.number().positive('Значение должно быть больше 0').optional()
);

/**
 * Схема валидации формы редактирования основных характеристик двигателя.
 * Статус не редактируется здесь – он меняется только при перемещении.
 * Диаметр вала необязателен.
 */
export const editMotorSchema = z.object({
    type: z.string().min(1, 'Тип обязателен'),
    shaftDiameter: optionalPositiveNumber,
    power: z.number().positive('Мощность > 0'),
    speed: z.number().positive('Обороты > 0'),
    mountingType: z.nativeEnum(MountingType),
});

/** Тип данных формы редактирования двигателя. */
export type EditMotorFormData = z.infer<typeof editMotorSchema>;