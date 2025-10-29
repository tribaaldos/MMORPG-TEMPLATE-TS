type Props = {
  size?: number | string;
  backgroundColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  className?: string;
  style?: React.CSSProperties;
};

export default function SwordImageSVG({
  size,
  backgroundColor = "#0a0018",
  strokeColor = "#4422aa",
  strokeWidth = 5,
  className,
  style,
}: Props) {
  const dim = size ? { width: size, height: size } : { width: "100%", height: "100%" };

  return (
    <svg
      viewBox="0 0 512 512"
      className={className}
      style={{ display: "block", ...dim, ...style }}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Fondo cuadrado */}
      <rect
        x="0"
        y="0"
        width="512"
        height="512"
        fill={backgroundColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        rx="20"
      />

      {/* Imagen de la espada */}
      <image
        href="/public/items/weapons/weapon.png"   // 👈 ruta a tu imagen
        x="0"
        y="0"
        width="512"
        height="512"
        preserveAspectRatio="xMidYMid meet"
      />
    </svg>
  );
}
