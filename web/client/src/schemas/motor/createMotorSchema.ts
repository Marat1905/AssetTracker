import { z } from 'zod';
import { MotorStatus, MountingType } from '../../types/motor/motor';

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
 * Схема валидации формы создания нового электродвигателя.
 * Диаметр вала и подшипники (передний и задний) необязательны.
 * Если хотя бы одно поле подшипника заполнено, все три поля становятся обязательными.
 */
export const createMotorSchema = z.object({
    inventoryNumber: z.string().optional().nullable(),
    type: z.string().min(1, 'Тип обязателен'),
    shaftDiameter: optionalPositiveNumber,
    power: z.number().positive('Мощность > 0'),
    speed: z.number().positive('Обороты > 0'),
    // Передний подшипник — все поля необязательны
    frontBearingType: z.string().optional(),
    frontBearingManufacturer: z.string().optional(),
    frontBearingSupplier: z.string().optional(),
    // Задний подшипник — все поля необязательны
    rearBearingType: z.string().optional(),
    rearBearingManufacturer: z.string().optional(),
    rearBearingSupplier: z.string().optional(),
    status: z.nativeEnum(MotorStatus),
    initialLocation: z.string().min(1, 'Начальное местоположение обязательно'),
    mountingType: z.nativeEnum(MountingType),
}).superRefine((data, ctx) => {
    // Проверка переднего подшипника: если хотя бы одно поле заполнено — обязательны все три
    const frontType = data.frontBearingType?.trim() ?? '';
    const frontManufacturer = data.frontBearingManufacturer?.trim() ?? '';
    const frontSupplier = data.frontBearingSupplier?.trim() ?? '';
    const frontAny = !!(frontType || frontManufacturer || frontSupplier);
    if (frontAny) {
        if (!frontType) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['frontBearingType'],
                message: 'Тип переднего подшипника обязателен, если указан хотя бы один параметр',
            });
        }
        if (!frontManufacturer) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['frontBearingManufacturer'],
                message: 'Производитель переднего подшипника обязателен, если указан хотя бы один параметр',
            });
        }
        if (!frontSupplier) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['frontBearingSupplier'],
                message: 'Поставщик переднего подшипника обязателен, если указан хотя бы один параметр',
            });
        }
    }

    // Проверка заднего подшипника: если хотя бы одно поле заполнено — обязательны все три
    const rearType = data.rearBearingType?.trim() ?? '';
    const rearManufacturer = data.rearBearingManufacturer?.trim() ?? '';
    const rearSupplier = data.rearBearingSupplier?.trim() ?? '';
    const rearAny = !!(rearType || rearManufacturer || rearSupplier);
    if (rearAny) {
        if (!rearType) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['rearBearingType'],
                message: 'Тип заднего подшипника обязателен, если указан хотя бы один параметр',
            });
        }
        if (!rearManufacturer) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['rearBearingManufacturer'],
                message: 'Производитель заднего подшипника обязателен, если указан хотя бы один параметр',
            });
        }
        if (!rearSupplier) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['rearBearingSupplier'],
                message: 'Поставщик заднего подшипника обязателен, если указан хотя бы один параметр',
            });
        }
    }
});

/** Тип данных формы создания двигателя. */
export type CreateMotorFormData = z.infer<typeof createMotorSchema>;