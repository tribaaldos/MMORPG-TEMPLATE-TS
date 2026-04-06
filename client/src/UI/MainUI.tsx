import './MainUI.css';
import DiabloUI from './diablo-ui/Diablo';
import ExpBar from './exp-bar/ExpBar';
import ShowStats from './components/data/ShowStats';
import Popups from './components/data/PopUps';
import BotonPantallaCompleta from './components/PantallaCompleta';
import UICharacter from './components/character/Character';
import PerfWidget from './PerfState';
import KShop from '../components/npc/Shop';
import ShopPanel from './components/npcs/Shop';
import Dialogue from './components/npcs/Dialogue';
import LootPopup from './components/loot/LootPopup';
import CharacterTopLeftUi from './components/character/CharacterTopLeftUi';
import Minimap from './minimap/Minimap';
import SkillsBar from './skillsBar/SkillsBar';
import MenuBar from './menuBar/MenuBar';
import Chat from './chat/Chat';
import SkillsPopup from './components/skills/SkillsPopup';
import { useAbilityStore } from '../character/skills/useAbilityStore';
import { useAuthStore } from '../store/useAuthStore'
import DayNightSlider from './components/DayNightSlider';

export default function MainUI({ isDebug }: { isDebug: boolean }) {
    const isSkillsOpen = useAbilityStore((s) => s.isSkillsOpen)
    const logout = useAuthStore((s) => s.logout)

    return (
        <>
            <div className="main-ui mmorpg-ui">
                {isDebug && (
                    <>
                        <ShowStats />
                        {/* <BotonPantallaCompleta /> */}
                        <PerfWidget />
                    </>

                )}

                <div className="ui-region ui-top-left">
                    <CharacterTopLeftUi />
                </div>
                <div style={{
                    position: 'absolute',
                    top: 12,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 100,
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                        onClick={() => window.dispatchEvent(new CustomEvent('reset-player-position'))}
                        style={{ padding: '5px 12px', background: '#2c3e50', color: '#fff', border: '1px solid #7f8c8d', borderRadius: 6, cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap' }}
                        title="Reset position"
                    >
                        ⟳ Reset Pos
                    </button>
                    <DayNightSlider />
                </div>
                </div>
                <div className="ui-region ui-top-right">
                    <button
                        onClick={() => { logout(); window.location.reload() }}
                        style={{ position: 'absolute', top: 8, right: 8, padding: '6px 14px', background: '#c0392b', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', zIndex: 9999 }}
                    >
                        Logout
                    </button>
                    <Minimap />
                    <ShopPanel />
                </div>
                <div className="ui-region ui-center">
                    <Popups />
                    {isSkillsOpen && <SkillsPopup />}
                </div>
                <div className="ui-region ui-bottom-left">
                    <Chat />
                </div>
                <div className="ui-region ui-bottom-center">
                    <SkillsBar />
                </div>
                <div className="ui-region ui-bottom-right">
                    <MenuBar />
                </div>
                <div className="ui-region ui-bottom-bar">
                    <ExpBar />
                </div>
                <Dialogue />
                <LootPopup />
                {/* <DiabloUI /> */}
            </div>
        </>
    );
}
