import CreateMotorForm from '../components/CreateMotorForm';
import MotorList from '../components/MotorList';

export default function Dashboard() {
    return (
        <div className="space-y-8">
            <div className="animate-slide-down">
                <CreateMotorForm />
            </div>
            <div className="animate-fade-in">
                <MotorList />
            </div>
        </div>
    );
}