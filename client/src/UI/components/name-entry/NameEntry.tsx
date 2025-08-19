import { useState, useEffect } from "react";
import "./NameEntry.css";
import { useCharacterStore } from "../../../store/useCharacterStore";
export default function NameEntryScreen() {
  const setName = useCharacterStore((s) => s.setName);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("username");
    if (saved) setInput(saved);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();

    if (!trimmed) {
      setError("El nombre no puede estar vacío.");
      return;
    }

    if (trimmed.length > 16) {
      setError("Máximo 16 caracteres.");
      return;
    }

    setName(trimmed);
    localStorage.setItem("username", trimmed);
  };

  return (
    <div className="name-entry-screen">
      <form onSubmit={handleSubmit} className="name-entry-form">
        <h2>Elige tu nombre</h2>
        <input
          type="text"
          value={input}
          maxLength={16}
          onChange={(e) => {
            setInput(e.target.value);
            setError("");
          }}
          placeholder="Escribe tu nombre..."
          autoFocus
        />
        {error && <p className="error">{error}</p>}
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}
