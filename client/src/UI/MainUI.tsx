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

export default function MainUI() {


    return (
        <div className="main-ui">
            {/* <ShowStats /> */}
            {/* <BotonPantallaCompleta /> */}
            {/* <UICharacter /> */}
            {/* <PerfWidget /> */}
            {/* <ShopPanel /> */}
            <Popups />
            {/* <ExpBar /> */}
            {/* <DiabloUI /> */}
        </div>
    );
}
