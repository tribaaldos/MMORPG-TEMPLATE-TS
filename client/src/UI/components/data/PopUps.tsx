

import { useEffect, useState } from 'react';
import { usePopup } from 'react-hook-popup';
import UICharacter from '../character/Character';
import Inventory from '../inventory/Inventory';
import '../../MainUI.css';

export default function Popups() {
    const [showCharacter, hideCharacter] = usePopup('character', () => <UICharacter />);
    const [showInventory, hideInventory] = usePopup('inventory', () => <Inventory />);
    const [isCharacterOpen, setIsCharacterOpen] = useState(false);
    const [isInventoryOpen, setIsInventoryOpen] = useState(false);

    // Alterna la apertura/cierre del popup de DiabloUI
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
    };

    // Escucha la tecla 'c' para alternar el popup
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === 'c') toggleCharacterPopup();
            if (e.key.toLowerCase() === 'b') toggleInventoryPopup();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isCharacterOpen, isInventoryOpen]);
    return (
        <div className="popups">
        </div>
    );
}