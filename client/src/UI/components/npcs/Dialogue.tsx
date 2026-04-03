import './Dialogue.css'
import { useDialogueStore } from '../../../store/npcs/useDialogueStore'

export default function Dialogue() {
  const { isOpen, npcName, tree, currentNodeId, closeDialogue, choose } = useDialogueStore()

  if (!isOpen) return null
  const node = tree[currentNodeId]
  if (!node) return null

  return (
    <div className="dialogue-overlay">
      <div className="dialogue-box">
        <div className="dialogue-header">
          <span className="dialogue-avatar">⚒️</span>
          <span className="dialogue-npc-name">{npcName}</span>
        </div>
        <div className="dialogue-text">{node.text}</div>
        <div className="dialogue-choices">
          {node.choices.map((choice, i) => (
            <button
              key={i}
              className="dialogue-choice"
              onClick={() => choose(choice.next)}
            >
              {choice.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
