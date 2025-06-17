import './Diablo.css'

export default function DiabloUI() {
    return (
        <div className="diablo-ui">
            <div className="orb hp-orb">
                <div className="fill" />
                <span className="label">HP</span>
            </div>

            <div className="orb mana-orb">
                <div className="fill" />
                <span className="label">Mana</span>
            </div>
        </div>
    )
}