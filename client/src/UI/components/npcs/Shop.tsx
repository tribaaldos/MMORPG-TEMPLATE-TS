import { useState } from 'react'

import { renderItemIcon } from './renderItemIcon' // the helper we made earlier
import { useInventoryStore } from '../../../store/useInventoryStore'
import { useShopStore } from '../../../store/npcs/useShop'
import { useCharacterStore } from '../../../store/useCharacterStore'
import { getBuyPrice, getSellPrice } from './Pricing'
import { currencyToString, currencyToStringFull } from './Currency'
import { socket } from '../../../socket/SocketManager'

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
        <div style={panel}>
            <div style={header}>
                <strong>{vendorName ?? 'Shop'}</strong>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span title="Gold"> {currencyToStringFull(gold)}</span>
                    <button onClick={closeShop} style={closeBtn}>×</button>
                </div>
            </div>

            <div style={tabs}>
                <button
                    style={{ ...tabBtn, ...(tab === 'buy' ? tabBtnActive : null) }}
                    onClick={() => setTab('buy')}
                >Buy</button>
                <button
                    style={{ ...tabBtn, ...(tab === 'sell' ? tabBtnActive : null) }}
                    onClick={() => setTab('sell')}
                >Sell</button>
            </div>

            {tab === 'buy' && (

                <div style={list}>
                    {items.map((it) => {
                        const price = getBuyPrice(it as any)
                        const can = gold >= price
                        return (
                            <div key={(it as any).id} style={row}>
                                <div style={left}>
                                    {renderItemIcon(it as any, 32)}
                                    <div>
                                        <div className={`shop-name ${it.rarity || 'common'}`}>{it.name}</div>
                                        <div style={subStats}>
                                            {it.attack && <>⚔ {it.attack} </>}
                                            {it.defense && <>· 🛡 {it.defense}</>}
                                        </div>
                                    </div>
                                </div>
                                <div style={right}>
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
                <div style={list}>
                    {!inventory || inventory.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                            No items to sell
                        </div>
                    ) : (
                        inventory.map((it, idx) => {
                            if (!it) return null
                            const price = getSellPrice(it as any)
                            return (
                                <div key={idx} style={row}>
                                    <div style={left}>
                                        {renderItemIcon(it as any, 32)}
                                        <div>
                                            <div className={`shop-name ${it.rarity || 'common'}`}>{it.name}</div>
                                            <div style={subStats}>
                                                {it.attack && <>⚔ {it.attack} </>}
                                                {it.defense && <>· 🛡 {it.defense}</>}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={right}>
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

const panel: React.CSSProperties = { position: 'fixed', right: 564, bottom: 544, width: 360, background: 'rgba(18,18,28,0.96)', border: '1px solid #3a3a4a', borderRadius: 10, color: '#eee', padding: 12, zIndex: 1000, boxShadow: '0 10px 24px rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }
const header: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }
const closeBtn: React.CSSProperties = { background: 'transparent', color: '#aaa', border: 'none', fontSize: 20, cursor: 'pointer' }
const tabs: React.CSSProperties = { display: 'flex', gap: 6, margin: '6px 0 10px' }
const tabBtn: React.CSSProperties = {
    flex: 1,
    padding: '6px 8px',
    background: 'rgba(255,255,255,0.06)',
    color: '#eee',
    borderWidth: 1,          // 👈 longhand
    borderStyle: 'solid',    // 👈 longhand
    borderColor: '#3a3a4a',  // 👈 longhand
    borderRadius: 6,
    cursor: 'pointer',
}
const tabBtnActive: React.CSSProperties = {
    background: '#00e5ff',
    color: '#071018',
    borderColor: '#00e5ff',  // 👈 cambiamos solo color, sin shorthand
}
const list: React.CSSProperties = { display: 'grid', gap: 8, maxHeight: 320, overflowY: 'auto' }
const row: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', background: 'rgba(255,255,255,0.04)', borderRadius: 8 }
const left: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 10 }
const right: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 8 }
const subStats: React.CSSProperties = { fontSize: 12, opacity: .85 }
