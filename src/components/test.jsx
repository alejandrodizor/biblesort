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
    const [mistakeCount, setMistakeCount] = useState(0);  // contador de errores
    const intervalRef = useRef(null);
  
    // Temporizador
    useEffect(() => {
      setElapsed(0);
      setErrorId(null);
      setMistakeCount(0);  // reset de errores al iniciar
      intervalRef.current = setInterval(() => {
        setElapsed(e => e + 1);
      }, 1000);
      return () => clearInterval(intervalRef.current);
    }, [gameKey]);
  
    const {
      selectedItems: selectedIds,
      addSelectedItem,
      removeSelectedItem
    } = useMultipleSelection({ initialSelectedItems: [] });
  
    const isComplete = selectedIds.length === booksData.length;
    const nextExpected = selectedIds.length + 1;
  
    // Detiene el temporizador al completar
    useEffect(() => {
      if (isComplete) clearInterval(intervalRef.current);
    }, [isComplete]);
  
    const toggleBook = (id) => {
      // Si ya hay un error activo, sólo dejamos corregirlo
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
        // Equivocación: marcamos error y contamos uno más
        setErrorId(id);
        setMistakeCount(c => c + 1);  // uso de función de actualización basada en el estado previo :contentReference[oaicite:0]{index=0}
      }
    };
  
    const resetGame = () => {
      selectedIds.forEach(id => removeSelectedItem(id));
      setErrorId(null);
      setDisplayBooks(sortedBooks);
      setGameKey(k => k + 1);
      // mistakeCount y elapsed se resetean en el efecto de gameKey
    };
  
    const isCorrect =
      isComplete && selectedIds.every((id, idx) => id === idx + 1);
    const mistakes = [];
    if (isComplete && !isCorrect) {
      selectedIds.forEach((id, idx) => {
        if (id !== idx + 1) {
          mistakes.push({
            pos: idx + 1,
            expected: booksData[idx].name,
            actual: booksData.find(b => b.id === id).name,
          });
        }
      });
    }
  
    // Formato mm:ss
    const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
    const ss = String(elapsed % 60).padStart(2, "0");
    const timeString = `${mm}:${ss}`;
  
    return (
      <div className="p-4">
        {/* Contadores */}
        <div className="mb-4 flex flex-col md:flex-row md:justify-between text-lg gap-2">
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
  
        {/* Grid en orden alfabético */}
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-2">
          {displayBooks.map((book) => {
            const idx = selectedIds.indexOf(book.id);
            const isError = errorId === book.id;
            const disableAll = isComplete || (errorId && book.id !== nextExpected);
            return (
              <button
                key={book.id}
                onClick={() => toggleBook(book.id)}
                disabled={disableAll}
                className={`
                  relative py-3 px-1 rounded-md border text-lg cursor-pointer
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${isError
                    ? "border-red-500 bg-red-100"
                    : idx !== -1
                      ? "border-2 border-black bg-gray-100"
                      : "border-gray-300 bg-white"}
                `}
              >
                {book.name}
                {idx !== -1 && (
                  <span className="
                    absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center
                    text-xs rounded-full bg-black text-white
                  ">
                    {idx + 1}
                  </span>
                )}
              </button>
            );
          })}
        </div>
  
        {/* Resultado final */}
        {isComplete && (
          <div className="mt-6">
            <div className={`mb-4 text-lg ${isCorrect ? "text-green-600" : "text-red-600"}`}>
              {isCorrect
                ? `¡Felicidades! Ordenaste todo correctamente en ${timeString}.`
                : `Te equivocaste. Tiempo final: ${timeString}.`}
            </div>
  
            {!isCorrect && (
              <div className="mb-4">
                <p className="mb-2">Revisa estas posiciones:</p>
                <ul className="list-disc list-inside">
                  {mistakes.map((m) => (
                    <li key={m.pos}>
                      Posición {m.pos}: seleccionaste "{m.actual}", debería ser "{m.expected}"
                    </li>
                  ))}
                </ul>
              </div>
            )}
  
            <button
              onClick={resetGame}
              className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
            >
              Reiniciar
            </button>
          </div>
        )}
      </div>
    );
  }