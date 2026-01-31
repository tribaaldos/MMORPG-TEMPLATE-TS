import { useState } from 'react'

import { renderItemIcon } from './renderItemIcon' // the helper we made earlier
import { useInventoryStore } from '../../../store/useInventoryStore'
import { useShopStore } from '../../../store/npcs/useShop'
import { useCharacterStore } from '../../../store/useCharacterStore'
import { getBuyPrice, getSellPrice } from './Pricing'
import { currencyToString, currencyToStringFull } from './Currency'
import { socket } from '../../../socket/SocketManager'
import './Shop.css'

export default function ShopPanel() {
    const { isOpen, vendorName, items, closeShop } = useShopStore()
    const playerId = socket.id ?? 'local-player'
    const getInventory = useInventoryStore(s => s.getInventory)
    const addItem = useInventoryStore(s => s.addItem)
    const removeItem = useInventoryStore(s => s.removeItem)
    const inventory = getInventory(playerId)

    const gold = useCharacterStore(s => s.gold)
    const addGold = useCharacterStore(s => s.addGold)
    const spendGold = useCharacterStore(s => s.spendGold)

    const [tab, setTab] = useState<'buy' | 'sell'>('buy')

    if (!isOpen) return null

    return (
        <div className="shop-panel">
            <div className="shop-header">
                <strong>{vendorName ?? 'Shop'}</strong>
                <div className="shop-header-right">
                    <span className="shop-gold" title="Gold"> {currencyToStringFull(gold)}</span>
                    <button onClick={closeShop} className="shop-close">×</button>
                </div>
            </div>

            <div className="shop-tabs">
                <button
                    className={`shop-tab ${tab === 'buy' ? 'shop-tab-active' : ''}`}
                    onClick={() => setTab('buy')}
                >Buy</button>
                <button
                    className={`shop-tab ${tab === 'sell' ? 'shop-tab-active' : ''}`}
                    onClick={() => setTab('sell')}
                >Sell</button>
            </div>

            {tab === 'buy' && (

                <div className="shop-list">
                    {items.map((it) => {
                        const price = getBuyPrice(it as any)
                        const can = gold >= price
                        return (
                            <div key={(it as any).id} className="shop-row">
                                <div className="shop-left">
                                    {renderItemIcon(it as any, 32)}
                                    <div>
                                        <div className={`shop-name ${it.rarity || 'common'}`}>{it.name}</div>
                                        <div className="shop-substats">
                                            {it.attack && <>⚔ {it.attack} </>}
                                            {it.defense && <>· 🛡 {it.defense}</>}
                                        </div>
                                    </div>
                                </div>
                                <div className="shop-right">
                                    <span>{currencyToString(price)}</span>
                                    <button
                                        disabled={!can}
                                        onClick={() => {
                                            if (!spendGold(price)) return
                                            addItem(playerId, it as any)
                                        }}
                                    >
                                        Buy
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {tab === 'sell' && (
                <div className="shop-list">
                    {!inventory || inventory.length === 0 ? (
                        <div className="shop-empty">
                            No items to sell
                        </div>
                    ) : (
                        inventory.map((it, idx) => {
                            if (!it) return null
                            const price = getSellPrice(it as any)
                            return (
                                <div key={idx} className="shop-row">
                                    <div className="shop-left">
                                        {renderItemIcon(it as any, 32)}
                                        <div>
                                            <div className={`shop-name ${it.rarity || 'common'}`}>{it.name}</div>
                                            <div className="shop-substats">
                                                {it.attack && <>⚔ {it.attack} </>}
                                                {it.defense && <>· 🛡 {it.defense}</>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="shop-right">
                                        <span>{currencyToString(price)}</span>
                                        <button
                                            onClick={() => {
                                                addGold(price)
                                                removeItem(playerId, idx)
                                            }}
                                        >
                                            Sell
                                        </button>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            )}
        </div>
    )
}
