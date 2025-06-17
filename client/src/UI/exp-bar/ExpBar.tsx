import { useCharacterStore } from '../../store/Character';
import './ExpBar.css';
export default function ExpBar() {

    const exp = useCharacterStore(state => state.exp)
    const level = useCharacterStore(state => state.level)
    const getExpToLevel = useCharacterStore(state => state.getExpToLevel)
    const expRequired = getExpToLevel(level)
    const progressPercent = (exp / expRequired) * 100

    return (
        <div className="exp-bar">
            <div className="exp-fill" style={{ width: `${progressPercent}%` }} />
            <div className="exp-text">{exp} / {expRequired}</div>
        </div>
    )
}