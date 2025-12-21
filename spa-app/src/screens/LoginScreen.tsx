import { useState } from 'react';
import { useAppStateContext } from '../context/AppContext';
import './LoginScreen.css';

export const LoginScreen = () => {
    const { state, setAppState } = useAppStateContext();
    const [selectedMember, setSelectedMember] = useState<number>(-1);
    const [pin, setPin] = useState('');
    const [pinError, setPinError] = useState('');
    const [showPinInput, setShowPinInput] = useState(false);

    const handleMemberSelect = (index: number) => {
        setSelectedMember(index);
        setShowPinInput(true);
        setPinError('');
    };

    const handlePinChange = (value: string) => {
        // Разрешаем только 4 цифры
        if (value.length <= 4 && /^\d*$/.test(value)) {
            setPin(value);
            setPinError('');
        }
    };

    const handleLogin = () => {
        if (pin.length !== 4) {
            setPinError('ПИН-код должен содержать 4 цифры');
            return;
        }

        // Сохраняем профиль и пин в localStorage
        const authData = {
            familyIndex: selectedMember,
            pin: pin,
            timestamp: Date.now()
        };
        localStorage.setItem('thailand-trip-auth', JSON.stringify(authData));

        // Обновляем состояние приложения
        setAppState(prev => ({
            ...prev,
            currentFamily: selectedMember,
            isAuthenticated: true,
            userPin: pin
        }));
    };

    const handleBack = () => {
        setShowPinInput(false);
        setSelectedMember(-1);
        setPin('');
        setPinError('');
    };

    if (!showPinInput) {
        return (
            <div className="login-screen">
                <div className="login-container">
                    <div className="login-header">
                        <h1>🌴 Таиланд 2026</h1>
                        <p>Выберите свой профиль</p>
                    </div>

                    <div className="family-members-grid">
                        {state.familyMembers.map((member, index) => (
                            <button
                                key={index}
                                className="family-member-card"
                                onClick={() => handleMemberSelect(index)}
                            >
                                <div className="member-emoji">{member.emoji}</div>
                                <div className="member-name">{member.name}</div>
                                <div className="member-role">{member.role}</div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Экран ввода ПИН-кода
    const selectedUser = state.familyMembers[selectedMember];
    
    return (
        <div className="login-screen">
            <div className="login-container">
                <button className="back-button" onClick={handleBack}>
                    ← Назад
                </button>

                <div className="pin-header">
                    <div className="selected-member-emoji">{selectedUser.emoji}</div>
                    <h2>{selectedUser.name}</h2>
                    <p>Создайте 4-значный ПИН-код</p>
                </div>

                <div className="pin-input-container">
                    <input
                        type="password"
                        inputMode="numeric"
                        className="pin-input"
                        value={pin}
                        onChange={(e) => handlePinChange(e.target.value)}
                        placeholder="••••"
                        maxLength={4}
                        autoFocus
                    />
                    {pinError && <div className="pin-error">{pinError}</div>}
                </div>

                <button 
                    className="login-button"
                    onClick={handleLogin}
                    disabled={pin.length !== 4}
                >
                    Войти
                </button>

                <div className="pin-hint">
                    Этот ПИН-код будет использоваться для входа в приложение
                </div>
            </div>
        </div>
    );
};
