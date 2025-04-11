import { Redis } from '@upstash/redis'

export const db = new Redis({
  url: 'https://aware-albacore-17096.upstash.io',
  token: 'AULIAAIjcDFiMWYzOTJlYzAzMGM0ZjU3ODJjMDMwMjQ5MDkxNzFlMHAxMA',
})