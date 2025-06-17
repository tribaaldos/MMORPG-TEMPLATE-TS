import { useNavigate } from "react-router-dom";

interface ShaderCardProps {
  id: number;
  title: string;
  imageSrc: string;
}

export default function ShaderCard({ id, title, imageSrc }: ShaderCardProps) {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "#111",
        padding: "0.5rem",
        margin: "0.5rem 0",
        borderRadius: "8px",
        border: "1px solid #444",
        width: "150px",
        cursor: "pointer",
      }}
      onClick={() => navigate(`/shader-visualizer/${id}`)}
    >
      <img
        src={imageSrc}
        style={{
          width: "100%",
          height: "auto",
          borderRadius: "4px",
          marginBottom: "0.5rem",
          objectFit: "cover",
        }}
        alt={`${title} Preview`}
      />
      <button
        style={{
          backgroundColor: "#222",
          color: "white",
          border: "1px solid #555",
          borderRadius: "4px",
          padding: "0.3rem 0.6rem",
          fontSize: "0.8rem",
        }}
      >
        {title}
      </button>
    </div>
  );
}