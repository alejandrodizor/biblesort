import React, { useState, useEffect } from 'react'

export default function TestForm() {
  const [testament, setTestament] = useState('ot')
  const [name, setName] = useState('')
  const [time, setTime] = useState('')
  const [mistakes, setMistakes] = useState('')
  const [board, setBoard] = useState([])
  const [responseMessage, setResponseMessage] = useState('')

  useEffect(() => {
    fetchBoard()
  }, [testament])

  async function fetchBoard() {
    try {
      const res = await fetch(`/api/leaderboard?testament=${testament}`)
      const data = await res.json()
      setBoard(data)
    } catch {
      setBoard([])
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const formData = new FormData(e.target)
    const res = await fetch(`/api/leaderboard?testament=${testament}`, {
      method: 'POST',
      body: formData
    })
    const data = await res.json()
    setResponseMessage(data.message)
    fetchBoard()
  }

  return (
    <div className="p-4 max-w-md mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="testament" className="block mb-1 font-semibold">
            Testamento:
          </label>
          <select
            id="testament"
            name="testament"
            value={testament}
            onChange={e => setTestament(e.target.value)}
            className="w-full border p-2 rounded"
            required
          >
            <option value="ot">Antiguo</option>
            <option value="nt">Nuevo</option>
          </select>
        </div>

        <div>
          <label htmlFor="name" className="block mb-1 font-semibold">
            Nombre:
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label htmlFor="time" className="block mb-1 font-semibold">
            Tiempo (segundos):
          </label>
          <input
            type="number"
            id="time"
            name="time"
            value={time}
            onChange={e => setTime(e.target.value)}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label htmlFor="mistakes" className="block mb-1 font-semibold">
            Equivocaciones:
          </label>
          <input
            type="number"
            id="mistakes"
            name="mistakes"
            value={mistakes}
            onChange={e => setMistakes(e.target.value)}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Enviar Score
        </button>

        {responseMessage && (
          <p className="mt-2 text-center text-green-700">{responseMessage}</p>
        )}
      </form>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">
          Top‑5 {testament === 'ot' ? 'Antiguo' : 'Nuevo'} Testamento
        </h2>
        <ol className="list-decimal list-inside space-y-1">
          {board.length === 0 && (
            <li className="italic">Aún no hay registros.</li>
          )}
          {board.map((entry, idx) => (
            <li key={idx} className="flex justify-between">
              <span>{entry.name}</span>
              <span>
                {entry.time}s &nbsp;|&nbsp; {entry.mistakes} errores
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
)
}
