import { useState, useRef, useEffect } from "react";
import { useMultipleSelection } from "downshift";
import booksJson from "../assets/books.json";

export function BibleOrderGame({ testament = "ot" }) {
  // Carga los libros según el parámetro "testament"
  const booksData = booksJson[testament] || booksJson["ot"];
  const sortedBooks = [...booksData].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const [displayBooks, setDisplayBooks] = useState(sortedBooks);
  const [gameKey, setGameKey] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [errorId, setErrorId] = useState(null);
  const [mistakeCount, setMistakeCount] = useState(0);

  // Countdown inicial
  const [countdown, setCountdown] = useState(3);
  const [showCountdown, setShowCountdown] = useState(true);

  // Leaderboard / top‑10
  const [leaderboard, setLeaderboard] = useState([]);
  const [isTop10, setIsTop10] = useState(false);
  const [rank, setRank] = useState(null);
  const [showNameInput, setShowNameInput] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [playerId, setPlayerId] = useState("");

  const intervalRef = useRef(null);
  const COMPOSITE_FACTOR = 100000;

  // Carga ID y nombre desde localStorage en cliente
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedId = localStorage.getItem("leaderId");
      const savedName = localStorage.getItem("leaderName");
      if (savedId) setPlayerId(savedId);
      if (savedName) setPlayerName(savedName);
    }
  }, []);

  // Conteo regresivo inicial
  useEffect(() => {
    if (!showCountdown) return;
    if (countdown > 0) {
      const cd = setInterval(() => setCountdown((c) => c - 1), 1000);
      return () => clearInterval(cd);
    } else {
      setShowCountdown(false);
    }
  }, [countdown, showCountdown]);

  // Temporizador del juego
  useEffect(() => {
    if (!showCountdown) {
      setElapsed(0);
      intervalRef.current = setInterval(() => {
        setElapsed((e) => e + 1);
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [gameKey, showCountdown]);

  const {
    selectedItems: selectedIds,
    addSelectedItem,
    removeSelectedItem,
  } = useMultipleSelection({ initialSelectedItems: [] });

  const isComplete = selectedIds.length === booksData.length;
  const nextExpected = selectedIds.length + 1;

  // Detiene el timer al completar
  useEffect(() => {
    if (isComplete) clearInterval(intervalRef.current);
  }, [isComplete]);

  // Al completar, chequeamos top‑10
  useEffect(() => {
    if (!isComplete) return;
    const composite = mistakeCount * COMPOSITE_FACTOR + elapsed;
    fetch(`/api/leaderboard?testament=${testament}`)
      .then((res) => res.json())
      .then((data) => {
        const comps = data.map((e) => ({
          ...e,
          composite: e.mistakes * COMPOSITE_FACTOR + e.time,
        }));
        let idx = comps.findIndex((e) => composite <= e.composite);
        if (idx === -1 && comps.length < 10) idx = comps.length;
        setLeaderboard(comps.slice(0, 10));
        if (idx !== -1 && idx < 10) {
          setIsTop10(true);
          setRank(idx + 1);
          // Si no tengo ID guardado, muestro input
          if (!playerId) {
            setShowNameInput(true);
          } else {
            // Ya tengo ID y nombre: guardo el score si es mejor
            saveScore(playerId, playerName);
          }
        }
      });
  }, [isComplete, playerId, playerName]);

  const toggleBook = (id) => {
    if (selectedIds.includes(id)) return;
    if (errorId) {
      if (id === nextExpected) {
        addSelectedItem(id);
        setErrorId(null);
      }
      return;
    }
    if (id === nextExpected) addSelectedItem(id);
    else {
      setErrorId(id);
      setMistakeCount((c) => c + 1);
    }
  };

  const resetGame = () => {
    selectedIds.forEach((id) => removeSelectedItem(id));
    setErrorId(null);
    setDisplayBooks(sortedBooks);
    setGameKey((k) => k + 1);
    setLeaderboard([]);
    setIsTop10(false);
    setRank(null);
    setShowNameInput(false);
  };

  // Función para enviar score a la API
  const saveScore = async (id, name) => {
    const form = new FormData();
    form.append("testament", testament);
    form.append("id", id);
    form.append("name", name);
    form.append("time", elapsed);
    form.append("mistakes", mistakeCount);
    await fetch(`/api/leaderboard?testament=${testament}`, {
      method: "POST",
      body: form,
    });
  };

  // Guardar nombre e ID nuevos
  const handleSaveName = () => {
    const id = crypto.randomUUID();
    setPlayerId(id);
    localStorage.setItem("leaderId", id);
    localStorage.setItem("leaderName", playerName);
    setShowNameInput(false);
    saveScore(id, playerName);
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
            />
            <h2 className="text-4xl font-semibold mb-2">
              {testament === "nt" ? "Nuevo Testamento" : "Antiguo Testamento"}
            </h2>
            <h3 className="text-2xl font-semibold mb-4 text-gold">Prepárate</h3>
            <p className="text-6xl font-bold">{countdown}</p>
          </div>
        </div>
      )}

      {!showCountdown && (
        <>
          {/* Contadores */}
          <div className="hidden sm:flex mb-4 flex-row justify-center sm:justify-between text-xl gap-1 xl:gap-2">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                width="24"
                height="24"
                viewBox="0 0 50 50"
              >
                <path d="M 7 2 C 4.199219 2 2 4.199219 2 7 L 2 34 C 2 36.800781 4.199219 39 7 39 L 34 39 C 36.800781 39 39 36.800781 39 34 L 39 7 C 39 6.5 38.914063 6 38.8125 5.5 L 19.09375 27.40625 L 9.40625 18.6875 L 10.6875 17.1875 L 19 24.5 L 37.6875 3.6875 C 36.789063 2.6875 35.5 2 34 2 Z M 41 11 L 41 35 C 41 38.300781 38.300781 41 35 41 L 11 41 L 11 43 C 11 45.800781 13.199219 48 16 48 L 43 48 C 45.800781 48 48 45.800781 48 43 L 48 16 C 48 13.199219 45.800781 11 43 11 Z"></path>
              </svg>
              <span className="font-semibold">Seleccionados:</span>{" "}
              {selectedIds.length} / {booksData.length}
            </div>
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                width="24"
                height="24"
                viewBox="0 0 50 50"
              >
                <path d="M25,2C12.319,2,2,12.319,2,25s10.319,23,23,23s23-10.319,23-23S37.681,2,25,2z M33.71,32.29c0.39,0.39,0.39,1.03,0,1.42	C33.51,33.9,33.26,34,33,34s-0.51-0.1-0.71-0.29L25,26.42l-7.29,7.29C17.51,33.9,17.26,34,17,34s-0.51-0.1-0.71-0.29	c-0.39-0.39-0.39-1.03,0-1.42L23.58,25l-7.29-7.29c-0.39-0.39-0.39-1.03,0-1.42c0.39-0.39,1.03-0.39,1.42,0L25,23.58l7.29-7.29	c0.39-0.39,1.03-0.39,1.42,0c0.39,0.39,0.39,1.03,0,1.42L26.42,25L33.71,32.29z"></path>
              </svg>
              <span className="font-semibold">Fallos:</span>{" "}
              {mistakeCount}
            </div>
            <div className="flex items-center gap-2">
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  width="24"
                  height="24"
                  viewBox="0 0 50 50"
                >
                  <path d="M 21 2 L 21 5 L 23 5 L 23 6.0976562 C 12.355663 7.1082736 4 16.095631 4 27 C 4 38.579 13.421 48 25 48 C 36.579 48 46 38.579 46 27 C 46 16.095631 37.644337 7.1082736 27 6.0976562 L 27 5 L 29 5 L 29 2 L 21 2 z M 40.236328 5.1464844 L 38.230469 7.1523438 L 42.845703 11.767578 L 44.851562 9.7617188 L 40.236328 5.1464844 z M 15 16 C 15.25575 16 15.511531 16.097469 15.707031 16.292969 L 24.488281 25.074219 C 24.653281 25.031219 24.822 25 25 25 C 26.105 25 27 25.895 27 27 C 27 27.178 26.968781 27.346719 26.925781 27.511719 L 28.707031 29.292969 C 29.098031 29.683969 29.098031 30.316031 28.707031 30.707031 C 28.512031 30.902031 28.256 31 28 31 C 27.744 31 27.487969 30.902031 27.292969 30.707031 L 25.511719 28.925781 C 25.346719 28.968781 25.178 29 25 29 C 23.895 29 23 28.105 23 27 C 23 26.822 23.031219 26.653281 23.074219 26.488281 L 14.292969 17.707031 C 13.901969 17.316031 13.901969 16.683969 14.292969 16.292969 C 14.488469 16.097469 14.74425 16 15 16 z"></path>
                </svg>
              </span>
              <span className="font-semibold">Tiempo:</span>{" "}
              {timeString}
            </div>
          </div>

          <div className="block sm:hidden">
            <div className="text-xl mb-4 flex justify-center">
              <div className="flex items-center justify-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  width="24"
                  height="24"
                  viewBox="0 0 50 50"
                >
                  <path d="M 7 2 C 4.199219 2 2 4.199219 2 7 L 2 34 C 2 36.800781 4.199219 39 7 39 L 34 39 C 36.800781 39 39 36.800781 39 34 L 39 7 C 39 6.5 38.914063 6 38.8125 5.5 L 19.09375 27.40625 L 9.40625 18.6875 L 10.6875 17.1875 L 19 24.5 L 37.6875 3.6875 C 36.789063 2.6875 35.5 2 34 2 Z M 41 11 L 41 35 C 41 38.300781 38.300781 41 35 41 L 11 41 L 11 43 C 11 45.800781 13.199219 48 16 48 L 43 48 C 45.800781 48 48 45.800781 48 43 L 48 16 C 48 13.199219 45.800781 11 43 11 Z"></path>
                </svg>
                <span className="font-semibold">Seleccionados:</span>
                {selectedIds.length} / {booksData.length}
              </div>
            </div>
            <div className="mb-4 flex flex-row justify-between text-xl gap-1 xl:gap-2">
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  width="24"
                  height="24"
                  viewBox="0 0 50 50"
                >
                  <path d="M25,2C12.319,2,2,12.319,2,25s10.319,23,23,23s23-10.319,23-23S37.681,2,25,2z M33.71,32.29c0.39,0.39,0.39,1.03,0,1.42	C33.51,33.9,33.26,34,33,34s-0.51-0.1-0.71-0.29L25,26.42l-7.29,7.29C17.51,33.9,17.26,34,17,34s-0.51-0.1-0.71-0.29	c-0.39-0.39-0.39-1.03,0-1.42L23.58,25l-7.29-7.29c-0.39-0.39-0.39-1.03,0-1.42c0.39-0.39,1.03-0.39,1.42,0L25,23.58l7.29-7.29	c0.39-0.39,1.03-0.39,1.42,0c0.39,0.39,0.39,1.03,0,1.42L26.42,25L33.71,32.29z"></path>
                </svg>
                <span className="font-semibold">Fallos:</span>{" "}
                {mistakeCount}
              </div>
              <div className="flex items-center gap-2">
                <span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    x="0px"
                    y="0px"
                    width="24"
                    height="24"
                    viewBox="0 0 50 50"
                  >
                    <path d="M 21 2 L 21 5 L 23 5 L 23 6.0976562 C 12.355663 7.1082736 4 16.095631 4 27 C 4 38.579 13.421 48 25 48 C 36.579 48 46 38.579 46 27 C 46 16.095631 37.644337 7.1082736 27 6.0976562 L 27 5 L 29 5 L 29 2 L 21 2 z M 40.236328 5.1464844 L 38.230469 7.1523438 L 42.845703 11.767578 L 44.851562 9.7617188 L 40.236328 5.1464844 z M 15 16 C 15.25575 16 15.511531 16.097469 15.707031 16.292969 L 24.488281 25.074219 C 24.653281 25.031219 24.822 25 25 25 C 26.105 25 27 25.895 27 27 C 27 27.178 26.968781 27.346719 26.925781 27.511719 L 28.707031 29.292969 C 29.098031 29.683969 29.098031 30.316031 28.707031 30.707031 C 28.512031 30.902031 28.256 31 28 31 C 27.744 31 27.487969 30.902031 27.292969 30.707031 L 25.511719 28.925781 C 25.346719 28.968781 25.178 29 25 29 C 23.895 29 23 28.105 23 27 C 23 26.822 23.031219 26.653281 23.074219 26.488281 L 14.292969 17.707031 C 13.901969 17.316031 13.901969 16.683969 14.292969 16.292969 C 14.488469 16.097469 14.74425 16 15 16 z"></path>
                  </svg>
                </span>
                <span className="font-semibold">Tiempo:</span>{" "}
                {timeString}
              </div>
            </div>
          </div>

          {/* Grid de libros */}
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-2">
            {displayBooks.map((book) => {
              const idx = selectedIds.indexOf(book.id);
              const isError = errorId === book.id;
              const disableAll =
                isComplete ||
                (errorId && book.id !== nextExpected) ||
                selectedIds.includes(book.id);

              return (
                <button
                  key={book.id}
                  onClick={() => toggleBook(book.id)}
                  disabled={disableAll}
                  className={`
                    relative py-1 sm:py-2 px-1 lg:py-3 lg:px-2 rounded-md border text-lg md:text-xl lg:text-2xl cursor-pointer
                    disabled:opacity-30 disabled:cursor-not-allowed
                    ${
                      isError
                        ? "border-black bg-red-300"
                        : idx !== -1
                        ? "border-green-700 bg-green-200"
                        : "border-black bg-white"
                    }
                  `}
                >
                  {book.name}
                  {idx !== -1 && (
                    <span
                      className="
                      absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center
                      text-xs sm:text-sm font-bold rounded-full bg-green-700 text-white
                    "
                    >
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
                  className="w-24 md:w-32 mx-auto mb-4"
                  loop
                  autoplay
                />
                <h2 className="text-3xl font-semibold mb-2">
                  {isTop10
                    ? "¡Nuevo Record!"
                    : mistakeCount > 0
                    ? "¡Buen trabajo!"
                    : "¡Perfecto!"}
                </h2>

                {isTop10 && (
                  <p className="mb-2 text-xl">
                    Felicidades, quedaste en la tabla de posiciones en el puesto{" "}
                    <strong>{rank}</strong>
                  </p>
                )}

                <p className="text-xl">
                  Tiempo: <br />
                  <span className="font-medium text-2xl">{timeString}</span>
                </p>
                {mistakeCount > 0 && (
                  <p className="mb-4 text-xl">
                    Equivocaciones:<br />
                    <span className="font-medium text-2xl">{mistakeCount}</span>
                  </p>
                )}

                {showNameInput && (
                  <div className="mb-8 mt-4">
                    <input
                      type="text"
                      placeholder="Ingresa tu nombre"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      className="w-full text-xl border-2 border-black p-2 rounded mb-2 text-center bg-amber-300/20"
                    />
                    <button
                      onClick={handleSaveName}
                      className="w-full text-xl border-2 border-black bg-green-600 text-white py-2 rounded hover:bg-green-700"
                    >
                      Guardar nombre
                    </button>
                  </div>
                )}

                {!showNameInput && (
                  <div className="mt-4">
                    <a
                      href={"/game-" + testament}
                      className="mt-4 text-xl border-2 border-black flex gap-2 items-center justify-center w-full py-2 rounded-md text-black bg-amber-400/30 hover:opacity-80 duration-200 focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        x="0px"
                        y="0px"
                        width="20"
                        height="20"
                        viewBox="0 0 64 64"
                      >
                        <path d="M 47.470703 5.3046875 L 44.990234 9.4980469 C 42.576586 8.1511075 39.978843 7.1659643 37.273438 6.6171875 C 34.314438 6.0391875 31.268875 5.9602031 28.296875 6.4082031 C 22.376875 7.2792031 16.773922 10.271656 12.794922 14.722656 C 8.7899219 19.149656 6.4055313 24.975062 6.1445312 30.914062 C 5.8935312 36.851062 7.7163438 42.820687 11.277344 47.554688 C 14.809344 52.295688 20.018422 55.711469 25.732422 57.105469 C 28.595422 57.806469 31.572375 57.991453 34.484375 57.689453 C 37.401375 57.365453 40.256484 56.564109 42.896484 55.287109 C 48.192484 52.760109 52.513266 48.327438 54.947266 43.023438 C 56.155266 40.378437 56.918641 37.522094 57.181641 34.621094 C 57.282641 33.525094 57.306234 32.405922 57.240234 31.294922 L 53.203125 31.460938 C 53.316125 34.822937 52.61725 38.216906 51.15625 41.253906 C 49.04725 45.648906 45.414672 49.288453 41.013672 51.314453 C 38.820672 52.340453 36.440156 52.967172 34.035156 53.201172 C 31.628156 53.425172 29.200328 53.224 26.861328 52.625 C 22.192328 51.425 17.973969 48.572734 15.167969 44.677734 C 12.328969 40.820734 10.931609 35.924781 11.224609 31.175781 C 11.517609 26.426781 13.518719 21.808469 16.761719 18.355469 C 19.986719 14.865469 24.420891 12.617812 29.087891 12.007812 C 31.426891 11.705813 33.802891 11.806922 36.087891 12.294922 C 38.157895 12.75432 40.137742 13.547112 41.96875 14.607422 L 39.40625 18.939453 L 54.625 18.740234 L 47.470703 5.3046875 z"></path>
                      </svg>
                      Reiniciar Juego
                    </a>

                    <a
                      href="/scoreboard"
                      className="mt-2 px-2 flex items-center gap-2 justify-center text-xl border-2 border-black w-full py-2 rounded-md bg-green-600 text-white hover:opacity-80 duration-200 focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        x="0px"
                        y="0px"
                        width="20"
                        height="20"
                        viewBox="0 0 48 48"
                      >
                        <path
                          fill="none"
                          stroke="#c48c00"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-miterlimit="10"
                          stroke-width="2"
                          d="M32,28	c2.271-3.243,11-4.572,11-10c0-2.209-1.791-4-4-4s-4,1.791-4,4"
                        ></path>
                        <path
                          fill="none"
                          stroke="#c48c00"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-miterlimit="10"
                          stroke-width="2"
                          d="M16,28	c-2.271-3.243-11-4.572-11-10c0-2.209,1.791-4,4-4s4,1.791,4,4"
                        ></path>
                        <path
                          fill="#edbe00"
                          d="M31.1,39.8l-1.5-2C29.222,37.296,28.63,37,28,37h-8c-0.63,0-1.222,0.296-1.6,0.8l-1.5,2	c-0.567,0.755-1.456,1.2-2.4,1.2h19C32.556,41,31.667,40.555,31.1,39.8z"
                        ></path>
                        <path
                          fill="#edbe00"
                          d="M7,7c6,8,1,23,13,28h8c12-4,7-20,13-28H7z"
                        ></path>
                        <linearGradient
                          id="50wh1SoqJZDjVsT9NX8XQa_kPENNmiEJv3b_gr1"
                          x1="13"
                          x2="35"
                          y1="42"
                          y2="42"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop offset="0" stop-color="#fede00"></stop>
                          <stop offset="1" stop-color="#ffd000"></stop>
                        </linearGradient>
                        <path
                          fill="url(#50wh1SoqJZDjVsT9NX8XQa_kPENNmiEJv3b_gr1)"
                          d="M34,41H14c-0.552,0-1,0.448-1,1c0,0.552,0.448,1,1,1h20c0.552,0,1-0.448,1-1	C35,41.448,34.552,41,34,41z"
                        ></path>
                        <linearGradient
                          id="50wh1SoqJZDjVsT9NX8XQb_kPENNmiEJv3b_gr2"
                          x1="5"
                          x2="43"
                          y1="6"
                          y2="6"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop offset="0" stop-color="#fede00"></stop>
                          <stop offset="1" stop-color="#ffd000"></stop>
                        </linearGradient>
                        <path
                          fill="url(#50wh1SoqJZDjVsT9NX8XQb_kPENNmiEJv3b_gr2)"
                          d="M42,5H6C5.448,5,5,5.448,5,6c0,0.552,0.448,1,1,1h36c0.552,0,1-0.448,1-1	C43,5.448,42.552,5,42,5z"
                        ></path>
                        <rect width="8" height="2" x="20" y="35" fill="#e3a600"></rect>
                        <radialGradient
                          id="50wh1SoqJZDjVsT9NX8XQc_kPENNmiEJv3b_gr3"
                          cx="24"
                          cy="19"
                          r="7"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop offset="0" stop-color="#1c1600"></stop>
                          <stop offset=".07" stop-color="#3b2f00"></stop>
                          <stop offset=".19" stop-color="#6a5500"></stop>
                          <stop offset=".313" stop-color="#927500"></stop>
                          <stop offset=".439" stop-color="#b39000"></stop>
                          <stop offset=".568" stop-color="#cda400"></stop>
                          <stop offset=".701" stop-color="#dfb300"></stop>
                          <stop offset=".841" stop-color="#eabb00"></stop>
                          <stop offset="1" stop-color="#edbe00"></stop>
                        </radialGradient>
                        <circle
                          cx="24"
                          cy="19"
                          r="7"
                          fill="url(#50wh1SoqJZDjVsT9NX8XQc_kPENNmiEJv3b_gr3)"
                        ></circle>
                        <circle cx="24" cy="19" r="5" fill="#fad500"></circle>
                      </svg>
                      Tabla de Posiciones
                    </a>

                    <a
                      href="/"
                      className="mt-2 text-xl block w-full border-2 border-black py-2 rounded-md bg-black text-white hover:opacity-80 duration-200 focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      Volver
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
