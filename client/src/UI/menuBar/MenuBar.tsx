import { useEffect, useState } from "react";
import UICharacter from "../components/character/Character";
import { is } from "@react-three/fiber/dist/declarations/src/core/utils";
import { usePopup } from "react-hook-popup";
import './MenuBar.css'
import Inventory from "../components/inventory/Inventory";
import { useAbilityStore } from "../../character/skills/useAbilityStore";

export default function MenuBar() {
    const [showCharacter, hideCharacter] = usePopup('character', () => <UICharacter />);
    const [showInventory, hideInventory] = usePopup('inventory', () => <Inventory />);

    const [isCharacterOpen, setIsCharacterOpen] = useState(false);
    const [isInventoryOpen, setIsInventoryOpen] = useState(false);
    const toggleSkillsOpen = useAbilityStore((s) => s.toggleSkillsOpen);

    const toggleCharacterPopup = () => {
        if (isCharacterOpen) {
            hideCharacter();
            setIsCharacterOpen(false);
        } else {
            showCharacter();
            setIsCharacterOpen(true);
        }
    };

    const toggleInventoryPopup = () => {
        if (isInventoryOpen) {
            hideInventory();
            setIsInventoryOpen(false);
        } else {
            showInventory();
            setIsInventoryOpen(true);
        }
    }
    return (

        <>
            <div className="menuu-bar">
                    <button onClick={toggleInventoryPopup}>
                        <img className="imagen" src="/imagesUI/inventarioo.png" />
                    </button>
                    <button onClick={toggleCharacterPopup}>
                        <img className="imagen" src="/imagesUI/character.png" />
                    </button>
                    <button onClick={toggleSkillsOpen}>
                        <img className="imagen" src="/imagesUI/skills.png" />
                    </button>

            </div>

        </>
    )
}