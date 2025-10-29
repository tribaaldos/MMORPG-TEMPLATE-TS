import { useCharacterStore } from "../../../store/useCharacterStore";
import './CharacterTopLeftUi.css'

export default function CharacterTopLeftUi() {
    const characterName = useCharacterStore((state) => state.name);
    const characterLevel = useCharacterStore((state) => state.level);
    const characterHp = useCharacterStore((state) => state.hp);
    return (
        <>
            <div className="character-ui">
                <div className="character-info">
                    <div className="character-name">{characterName}</div>
                    <div className="character-level">Level {characterLevel}</div>
                </div>
            <div className="character-photo">
                <img className="character-photo" src={'https://todcutler.com/cdn/shop/files/TCS812thCsinglehandedsword-crossswords.jpg?v=1734013797'} alt="Character Portrait" />
            </div>
            </div>
        </>
    );
}