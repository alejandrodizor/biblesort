import { useState, useEffect } from "react";

export const ScoreboardComponent = ({testament}) => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper para formatear segundos a MM:SS
  const formatTime = (totalSeconds) => {
    const mm = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const ss = String(totalSeconds % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  // Determina la medalla según el índice
  const getMedal = (idx) => {
    if (idx === 0) return "🥇";
    if (idx === 1) return "🥈";
    if (idx === 2) return "🥉";
    return "";
  };

  useEffect(() => {
    async function fetchScores() {
      try {
        const res = await fetch(`/api/leaderboard?testament=${testament}`);
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        setScores(data);
      } catch {
        setError("No se pudo cargar el leaderboard");
      } finally {
        setLoading(false);
      }
    }
    fetchScores();
  }, []);

  return (
  
      <div className={`flex flex-col md:min-h-80 items-center border-3 border-black p-4 md:p-10 ${testament === "ot" ? "bg-amber-100/20" : "bg-[#dfdfd8]"}`}>
        <h3 className="text-3xl lg:text-4xl tracking-tighter text-center font-bold">
          {testament === "ot" ? "Antiguo Testamento" : "Nuevo Testamento"}
        </h3>

        {loading && <p className="mt-4 text-xl">Cargando posiciones...</p>}
        {error && <p className="mt-4 text-xl">{error}</p>}

        {!loading && !error && (
          <table className="mt-6 w-full text-left table-auto text-xl md:text-2xl">
            <thead>
              <tr className="border-y-2 border-black">
                <th className="py-2 md:py-4">Jugador</th>
                <th className="py-2 text-center md:py-4">Fallos</th>
                <th className="py-2 text-center md:py-4">Tiempo</th>
              </tr>
            </thead>
            <tbody>
              {scores.length === 0 ? (
                <tr>
                  <td colSpan="3" className="py-2 italic text-center">
                    No hay registros aún.
                  </td>
                </tr>
              ) : (
                scores.map((entry, idx) => (
                  <tr
                    key={entry.id || idx}
                    className="border-b-1 border-gray-600 text-xl"
                  >
                    <td className="py-4 relative pl-8">
                      {/* Medalla en absolute */}
                      {getMedal(idx) ? (
                        <span className="absolute left-0 top-4">
                          {getMedal(idx)}
                        </span>
                      ) : (
                        <span className="absolute left-0 top-4">{idx + 1}</span>
                      )}
                      {entry.name}
                    </td>
                    <td className="py-2 text-center">{entry.mistakes}</td>
                    <td className="py-2 text-center">
                      {formatTime(entry.time)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
 
  );
};
