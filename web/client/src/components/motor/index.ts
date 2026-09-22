// Формы
export { CreateMotorForm, MaintenanceForm, MoveMotorForm } from './forms';

// Модальные окна
export {
    EditInventoryModal,
    EditLocationModal,
    EditMaintenanceModal,
    EditMotorModal,
    ManageLubricantsModal,
} from './modals';

// Отображение (остаются в корне)
export { default as MotorDiagram } from './MotorDiagram';
export { default as MotorHistory } from './MotorHistory';

// Основные компоненты со своими подпапками
export { default as MotorList } from './MotorList';
export { default as MaintenanceReport } from './MaintenanceReport';