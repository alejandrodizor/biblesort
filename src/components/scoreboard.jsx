import React, { useState, useEffect } from 'react'

export const Scoreboard = () => {
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchScores() {
      try {
        const res = await fetch('/api/leaderboard?testament=ot')
        if (!res.ok) throw new Error(`Error ${res.status}`)
        const data = await res.json()
        setScores(data)
      } catch {
        setError('No se pudo cargar el leaderboard')
      } finally {
        setLoading(false)
      }
    }
    fetchScores()
  }, [])

  return (
    <div className="flex flex-col items-center border-3 border-black mt-12 p-10 bg-amber-100/20">
      <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl tracking-tighter text-center">
        Antiguo Testamento
      </h3>

      {loading && <p className="mt-4 text-lg">Cargando scores...</p>}
      {error   && <p className="mt-4 text-red-600">{error}</p>}

      {!loading && !error && (
        <ol className="mt-6 list-decimal list-inside space-y-2 text-lg">
          {scores.length === 0
            ? <li>No hay registros aún.</li>
            : scores.map((entry, idx) => (
                <li key={idx} className="flex gap-16 justify-between">
                  <span>{entry.name}</span>
                  <span>
                    {entry.time}s &nbsp;|&nbsp; {entry.mistakes} errores
                  </span>
                </li>
              ))
          }
        </ol>
      )}
    </div>
  )
}
