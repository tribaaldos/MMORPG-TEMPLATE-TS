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
import SkillsBar from './skillsBar/SkillsBar';
import MenuBar from './menuBar/MenuBar';
import Chat from './chat/Chat';

export default function MainUI() {


    return (
        <>
        <div className="main-ui">
            {/* <ShowStats /> */}
            {/* <BotonPantallaCompleta /> */}
            {/* <PerfWidget /> */}
            <CharacterTopLeftUi />
            <ShopPanel />
            <Popups />
            <ExpBar />
            <SkillsBar />
            {/* <DiabloUI /> */}
            <MenuBar />
            <Chat />
        </div>
        </>
    );
}
