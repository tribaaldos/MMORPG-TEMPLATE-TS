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
import CharacterTopLeftUi from './components/character/CharacterTopLeftUi';
import Minimap from './minimap/Minimap';
import SkillsBar from './skillsBar/SkillsBar';
import MenuBar from './menuBar/MenuBar';
import Chat from './chat/Chat';
import SkillsPopup from './components/skills/SkillsPopup';
import { useAbilityStore } from '../character/skills/useAbilityStore';

export default function MainUI({ isDebug }: { isDebug: boolean }) {
    const isSkillsOpen = useAbilityStore((s) => s.isSkillsOpen)

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
                <div className="ui-region ui-top-right">
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
                {/* <DiabloUI /> */}
            </div>
        </>
    );
}
