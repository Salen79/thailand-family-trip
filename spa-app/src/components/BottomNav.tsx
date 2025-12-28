import { Link, useLocation } from 'react-router-dom';

export const BottomNav = () => {
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    const navStyle: React.CSSProperties = {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        background: '#fff',
        borderTop: '1px solid #e0e0e0',
        padding: '8px 0',
        paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'flex-start',
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.08)',
        zIndex: 1000,
    };

    const linkStyle = (active: boolean): React.CSSProperties => ({
        color: active ? '#FF6B35' : '#666',
        fontWeight: active ? '600' : 'normal',
        textAlign: 'center',
        textDecoration: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2px',
        fontSize: '11px',
        flex: 1,
        padding: '4px 0',
        minHeight: '44px',
        justifyContent: 'center',
        WebkitTapHighlightColor: 'transparent',
        transition: 'all 0.2s ease',
    });

    const iconStyle: React.CSSProperties = {
        fontSize: '20px',
        marginBottom: '2px',
    };

    return (
        <nav style={navStyle}>
            <Link to="/" style={linkStyle(isActive('/'))}>
                <span style={iconStyle}>🏠</span>
                <span>Главная</span>
            </Link>
            <Link to="/plan" style={linkStyle(isActive('/plan'))}>
                <span style={iconStyle}>🗓️</span>
                <span>План</span>
            </Link>
            <Link to="/quiz" style={linkStyle(isActive('/quiz'))}>
                <span style={iconStyle}>🧩</span>
                <span>Квиз</span>
            </Link>
            <Link to="/diary" style={linkStyle(isActive('/diary'))}>
                <span style={iconStyle}>📔</span>
                <span>Дневник</span>
            </Link>
            <Link to="/dictionary" style={linkStyle(isActive('/dictionary'))}>
                <span style={iconStyle}>📚</span>
                <span>Словарь</span>
            </Link>
        </nav>
    );
};