import { Link, useLocation } from 'react-router-dom';

export const BottomNav = () => {
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <div style={{ position: 'fixed', bottom: 0, width: '100%', background: '#fff', borderTop: '1px solid #ddd', padding: '10px 0', display: 'flex', justifyContent: 'space-around', boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)', zIndex: 1000, maxWidth: '428px', left: '50%', transform: 'translateX(-50%)' }}>
            <Link to="/" style={{ color: isActive('/') ? '#FF6B35' : '#888', fontWeight: isActive('/') ? '600' : 'normal', textAlign: 'center', textDecoration: 'none' }}>🏠<br/>Главная</Link>
            <Link to="/plan" style={{ color: isActive('/plan') ? '#FF6B35' : '#888', fontWeight: isActive('/plan') ? '600' : 'normal', textAlign: 'center', textDecoration: 'none' }}>🗓️<br/>План</Link>
            <Link to="/quiz" style={{ color: isActive('/quiz') ? '#FF6B35' : '#888', fontWeight: isActive('/quiz') ? '600' : 'normal', textAlign: 'center', textDecoration: 'none' }}>🧩<br/>Квиз</Link>
            <Link to="/diary" style={{ color: isActive('/diary') ? '#FF6B35' : '#888', fontWeight: isActive('/diary') ? '600' : 'normal', textAlign: 'center', textDecoration: 'none' }}>📔<br/>Дневник</Link>
            <Link to="/dictionary" style={{ color: isActive('/dictionary') ? '#FF6B35' : '#888', fontWeight: isActive('/dictionary') ? '600' : 'normal', textAlign: 'center', textDecoration: 'none' }}>📚<br/>Словарь</Link>
        </div>
    );
};