import React, { useState, useRef, useEffect } from "react";
import { useMultipleSelection } from "downshift";

const booksData = [
  { id: 1, name: "Génesis" },
  { id: 2, name: "Éxodo" },
  { id: 3, name: "Levítico" },
  { id: 4, name: "Números" },
  { id: 5, name: "Deuteronomio" },
  { id: 6, name: "Josué" },
  { id: 7, name: "Jueces" },
  { id: 8, name: "Rut" },
  { id: 9, name: "1 Samuel" },
  { id: 10, name: "2 Samuel" },
  { id: 11, name: "1 Reyes" },
  { id: 12, name: "2 Reyes" },
  { id: 13, name: "1 Crónicas" },
  { id: 14, name: "2 Crónicas" },
  { id: 15, name: "Esdras" },
  { id: 16, name: "Nehemías" },
  { id: 17, name: "Ester" },
  { id: 18, name: "Job" },
  { id: 19, name: "Salmos" },
  { id: 20, name: "Proverbios" },
  { id: 21, name: "Eclesiastés" },
  { id: 22, name: "Cantares" },
  { id: 23, name: "Isaías" },
  { id: 24, name: "Jeremías" },
  { id: 25, name: "Lamentaciones" },
  { id: 26, name: "Ezequiel" },
  { id: 27, name: "Daniel" },
  { id: 28, name: "Oseas" },
  { id: 29, name: "Joel" },
  { id: 30, name: "Amós" },
  { id: 31, name: "Abdías" },
  { id: 32, name: "Jonás" },
  { id: 33, name: "Miqueas" },
  { id: 34, name: "Nahúm" },
  { id: 35, name: "Habacuc" },
  { id: 36, name: "Sofonías" },
  { id: 37, name: "Hageo" },
  { id: 38, name: "Zacarías" },
  { id: 39, name: "Malaquías" },
];

// Orden alfabético
const sortedBooks = [...booksData].sort((a, b) =>
  a.name.localeCompare(b.name)
);

export function BibleOrderGame() {
  const [displayBooks, setDisplayBooks] = useState(sortedBooks);
  const [gameKey, setGameKey] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [errorId, setErrorId] = useState(null);
  const [mistakeCount, setMistakeCount] = useState(0);

  // Countdown inicial
  const [countdown, setCountdown] = useState(3);
  const [showCountdown, setShowCountdown] = useState(true);

  const intervalRef = useRef(null);

  // Conteo regresivo inicial
  useEffect(() => {
    if (!showCountdown) return;
    if (countdown > 0) {
      const cd = setInterval(() => setCountdown(c => c - 1), 1000);
      return () => clearInterval(cd);
    } else {
      setShowCountdown(false);
    }
  }, [countdown, showCountdown]); // :contentReference[oaicite:0]{index=0}

  // Temporizador del juego
  useEffect(() => {
    if (!showCountdown) {
      setElapsed(0);
      intervalRef.current = setInterval(() => {
        setElapsed(e => e + 1);
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [gameKey, showCountdown]);

  const {
    selectedItems: selectedIds,
    addSelectedItem,
    removeSelectedItem
  } = useMultipleSelection({ initialSelectedItems: [] });

  const isComplete = selectedIds.length === booksData.length;
  const nextExpected = selectedIds.length + 1;

  // Detiene el timer al completar
  useEffect(() => {
    if (isComplete) clearInterval(intervalRef.current);
  }, [isComplete]);

  const toggleBook = (id) => {
    // Early return: ignora clics sobre libros ya seleccionados
    if (selectedIds.includes(id)) return;  // :contentReference[oaicite:1]{index=1}

    if (errorId) {
      if (id === nextExpected) {
        addSelectedItem(id);
        setErrorId(null);
      }
      return;
    }

    if (id === nextExpected) {
      addSelectedItem(id);
    } else {
      setErrorId(id);
      setMistakeCount(c => c + 1);
    }
  };

  const resetGame = () => {
    selectedIds.forEach(id => removeSelectedItem(id));
    setErrorId(null);
    setDisplayBooks(sortedBooks);
    setGameKey(k => k + 1);
    // Nota: el countdown sólo corre al montar por primera vez
  };

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");
  const timeString = `${mm}:${ss}`;

  return (
    <div>
      {/* Modal inicial */}
      {showCountdown && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur z-50">
          <div className="bg-white rounded-lg p-8 text-center shadow-lg">
            <lottie-player
              src="/postard-icon.json"
              background="transparent"
              speed="1"
              className="w-32 mx-auto mb-4"
              loop
              autoplay
            ></lottie-player>
            <h2 className="text-4xl font-semibold mb-2">Antiguo Testamento</h2>
            <h3 className="text-2xl font-semibold mb-4 text-gold">Prepárate</h3>
            <p className="text-6xl font-bold">{countdown}</p>
          </div>
        </div>
      )}

      {!showCountdown && (
        <>
          {/* Contadores */}
          <div className="hidden sm:flex mb-4 flex-row justify-center sm:justify-between text-xl gap-1 xl:gap-2">
            <div>
              <span className="font-semibold">Seleccionados:</span>{" "}
              {selectedIds.length} / {booksData.length}
            </div>
            <div>
              <span className="font-semibold">Equivocaciones:</span>{" "}
              {mistakeCount}
            </div>
            <div>
              <span className="font-semibold">Tiempo:</span> {timeString}
            </div>
          </div>

          <div className="block sm:hidden">
            <div className="text-xl text-center mb-4">
              <span className="font-semibold ">Seleccionados:</span>
              <br />
              {selectedIds.length} / {booksData.length}
            </div>
            <div className="mb-4 flex flex-row justify-between text-xl gap-1 xl:gap-2">
              <div>
                <span className="font-semibold">Equivocaciones:</span>{" "}
                {mistakeCount}
              </div>
              <div>
                <span className="font-semibold">Tiempo:</span> {timeString}
              </div>
            </div>
          </div>

          {/* Grid de libros */}
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-2">
            {displayBooks.map(book => {
              const idx = selectedIds.indexOf(book.id);
              const isError = errorId === book.id;
              // Deshabilita libros ya seleccionados, o durante un error (solo permite corregir el esperado)
              const disableAll = 
                isComplete ||
                (errorId && book.id !== nextExpected) ||
                selectedIds.includes(book.id);  // :contentReference[oaicite:2]{index=2}

              return (
                <button
                  key={book.id}
                  onClick={() => toggleBook(book.id)}
                  disabled={disableAll}
                  className={`
                    relative  py-1 sm:py-2 px-1 lg:py-3 lg:px-2 rounded-md border text-lg md:text-xl lg:text-2xl cursor-pointer
                    disabled:opacity-30 disabled:cursor-not-allowed
                    ${isError
                      ? "error-button border-black border-[1.5px] md:border-2 bg-red-300"
                      : idx !== -1
                        ? "border-[1.5px] md:border-2 border-green-700 bg-green-200 disabled:opacity-50"
                        : "border-[1.5px] md:border-2 border-black bg-white "}
                  `}
                >
                  {book.name}
                  {idx !== -1 && (
                    <span className="
                      absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center
                      text-xs sm:text-sm font-bold rounded-full bg-green-700 text-white
                    ">
                      {idx + 1}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Modal final */}
          {isComplete && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur z-40">
              <div className="bg-white rounded-lg p-8 text-center shadow-lg w-80 mx-4">
                <lottie-player
                  src="/postard-icon.json"
                  background="transparent"
                  speed="1"
                  className="w-32 mx-auto mb-4"
                  loop
                  autoplay
                ></lottie-player>
                <h2 className="text-3xl font-semibold mb-4">
                  {mistakeCount > 0 ? "¡Buen trabajo!" : "¡Perfecto!"}
                </h2>
                <p className="mb-2 text-xl">
                  Completaste en <span className="font-medium">{timeString}</span>
                </p>
                {mistakeCount > 0 && (
                  <p className="mb-4 text-xl">
                    Equivocaciones:{" "}
                    <span className="font-medium">{mistakeCount}</span>
                  </p>
                )}
                <button
                  onClick={resetGame}
                  className="
                    mt-4 w-full py-2 rounded-md bg-black text-white
                    hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black
                  "
                >
                  Reiniciar Juego
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
