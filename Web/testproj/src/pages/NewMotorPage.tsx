import CreateMotorForm from '../components/CreateMotorForm';

/**
 * Страница создания нового двигателя (не модальное окно, а отдельная страница).
 * Используется, если переход выполнен по маршруту /motors/new.
 */
export default function NewMotorPage() {
    return (
        <div className="max-w-3xl mx-auto">
            <CreateMotorForm onSuccess={() => window.history.back()} />
        </div>
    );
}