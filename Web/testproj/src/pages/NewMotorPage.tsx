import CreateMotorForm from '../components/CreateMotorForm';

export default function NewMotorPage() {
    return (
        <div className="max-w-3xl mx-auto">
            <CreateMotorForm onSuccess={() => window.history.back()} />
        </div>
    );
}