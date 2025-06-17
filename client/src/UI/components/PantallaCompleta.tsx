import { Link } from "react-router-dom";

export default function BotonPantallaCompleta() {
    const handleFullscreen = () => {
        const element = document.documentElement;
        element.requestFullscreen();
    };

    return (
        <div className="header">

            <button
                onClick={handleFullscreen}
                style={{
                    position: 'absolute',
                    top: 10,
                    left: 300,
                    zIndex: 9999,
                    padding: '8px 12px',
                    background: '#222',
                    color: 'white',
                    border: 'none',
                    borderRadius: 5,
                    cursor: 'pointer'
                }}
            >
                Pantalla completa
            </button>
            <Link to="/shader-visualizer">
                <button style={{
                    position: 'absolute',
                    top: 200,
                    left: 0,
                    zIndex: 58,
                }}>
                    shader visualizer
                </button>
            </Link>
            <Link to="/">
                <button style={{
                    position: 'absolute',
                    top: 300,
                    left: 0,
                    zIndex: 58,
                }}>
                    HOME
                </button>
            </Link>
    
        </div>
    );
}
