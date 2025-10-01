import React from 'react'
import type { Item } from '../../../store/useInventoryStore'
type IconProps = {
  className?: string
  style?: React.CSSProperties
  size?: number | string
  backgroundColor?: string
  strokeColor?: string
  strokeWidth?: number
  iconColor?: string
}

// renderItemIcon.tsx
export function renderItemIcon(item: Item, size = 32, className = 'item-icon') {
  const ImgOrComp = item.image as any
  if (typeof ImgOrComp === 'string') {
    return <img src={ImgOrComp} alt={item.name} className={className}
                style={{ width: size, height: size, objectFit: 'contain' }} />
  }
  const Icon: React.ComponentType<any> = ImgOrComp
  return <Icon className={className} size={size} {...(item as any).imageProps} />
}
