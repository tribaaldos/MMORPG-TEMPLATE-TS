import './MainUI.css';
import DiabloUI from './diablo-ui/Diablo';
import ExpBar from './exp-bar/ExpBar';
import ShowStats from './components/data/ShowStats';
import Popups from './components/data/PopUps';
import BotonPantallaCompleta from './components/PantallaCompleta';

export default function MainUI() {


    return (
        <div className="main-ui">

            <ShowStats />
            <BotonPantallaCompleta />
            
            <Popups />
            <ExpBar />
            {/* <DiabloUI /> */}
        </div>
    );
}
