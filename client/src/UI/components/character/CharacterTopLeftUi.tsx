import { useCharacterStore } from "../../../store/useCharacterStore";
import './CharacterTopLeftUi.css'

export default function CharacterTopLeftUi() {
    const characterName = useCharacterStore((state) => state.name);
    const characterLevel = useCharacterStore((state) => state.level);
    const characterHp = useCharacterStore((state) => state.hp);
    const hpPercent = Math.max(0, Math.min(100, Math.round(characterHp || 0)));
    return (
        <>
            <div className="character-ui" style={{ ['--hp' as string]: `${hpPercent}%` }}>
                <div className="character-avatar" aria-hidden="true">
                    <img
                        src={'https://todcutler.com/cdn/shop/files/TCS812thCsinglehandedsword-crossswords.jpg?v=1734013797'}
                        alt="Character Portrait"
                    />
                    <div className="character-level-badge">{characterLevel}</div>
                </div>
                <div className="character-info">
                    <div className="character-name">{characterName}</div>
                    <div className="character-subtitle">Level {characterLevel} • Adventurer</div>
                    <div className="character-hp">
                        <div className="character-hp-fill" />
                        <div className="character-hp-text">HP {hpPercent}%</div>
                    </div>
                </div>
            </div>
        </>
    );
}