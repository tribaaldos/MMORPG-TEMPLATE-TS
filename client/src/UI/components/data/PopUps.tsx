

import { useEffect, useRef, useState } from 'react';
import { usePopup } from 'react-hook-popup';
import UICharacter from '../character/Character';
import Inventory from '../inventory/Inventory';
import Shop from '../../../components/npc/Shop';
import '../../MainUI.css';
import TargetPopup from '../monsters/TargetPopUp';
import { useTargetStore } from '../../../store/useTargetStore';
import { useAbilityStore } from '../../../character/skills/useAbilityStore';
import { useUIStore } from '../../../store/useUIStore';

export default function Popups() {
    const [showCharacter, hideCharacter] = usePopup('character', () => <UICharacter />);
    const [showInventory, hideInventory] = usePopup('inventory', () => <Inventory />);
    const [showShop, hideShop] = usePopup('shop', () => <Inventory />);
    const [showTarget, hideTarget] = usePopup('target', () => <TargetPopup />);

    const [isCharacterOpen, setIsCharacterOpen] = useState(false);
    const [isInventoryOpen, setIsInventoryOpen] = useState(false);
    const [isShopOpen, setIsShopOpen] = useState(false);
    const [isTargetOpen, setIsTargetOpen] = useState(false);
    const toggleSkillsOpen = useAbilityStore((s) => s.toggleSkillsOpen);
    const selectedTarget = useTargetStore((s) => s.selectedTarget);

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
            console.log('doing something ')
        } else {
            showInventory();
            setIsInventoryOpen(true);
        }
    };
    const toggleShopPopup = () => {
        if (isShopOpen) {
            hideShop();
            setIsShopOpen(false);
            console.log('doing something ')
        } else {
            showShop();
            setIsShopOpen(true);
            console.log('doing something else ')
        }
    };

    useEffect(() => {
        if (selectedTarget) {
            showTarget()
        } else {
            hideTarget()
        }
    }, [selectedTarget])
    const popupRef = useRef<{ show: () => void; hide: () => void } | null>(null);
    if (!popupRef.current) popupRef.current = { show: showTarget, hide: hideTarget };

    // Track if the popup has been shown at least once
    const isShownRef = useRef(false);

    useEffect(() => {
        const hasTarget = !!selectedTarget;
        if (hasTarget && !isShownRef.current) {
            popupRef.current!.show();
            isShownRef.current = true;
        }
        // IMPORTANT: do NOT hide on deselect, just let TargetPopup render null.
        // If you really need to hide on unmount of Popups:
        return () => {
            if (isShownRef.current) popupRef.current!.hide();
        };
    }, [!!selectedTarget]); // only boolean, no function deps


    // Escucha la tecla 'c' para alternar el popup
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (useUIStore.getState().isTextInputActive) return
            if (e.repeat) return
            if (e.code === 'KeyC') toggleCharacterPopup()
            if (e.code === 'KeyB') toggleInventoryPopup()
            if (e.code === 'KeyK') {
                e.preventDefault()
                toggleSkillsOpen()
            }
            // if (e.code === 'KeyK') toggleShopPopup();
            if (e.key === 'Escape') {
                const { setSelectedTarget } = useTargetStore.getState()
                setSelectedTarget(null)
            }

        };
        window.addEventListener('keydown', handleKeyDown, true);
        return () => window.removeEventListener('keydown', handleKeyDown, true);
    }, [isCharacterOpen, isInventoryOpen, toggleSkillsOpen]);
    return null
    // (
    //     <div className="popups">
    //     </div>
    // );
}