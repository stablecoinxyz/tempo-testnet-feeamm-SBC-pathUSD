import { formatUnits } from 'viem'
import { client } from './viem.config.js'

const USER_TOKEN = '0x20c000000000000000000000ccbf1e4901196743' // your stablecoin
const PATH_USD   = '0x20c0000000000000000000000000000000000000' // pathUSD testnet

async function main() {
  const pool = await client.amm.getPool({
    userToken: USER_TOKEN,
    validatorToken: PATH_USD,
  })

  // These are the correct field names per Viem Tempo docs:
  const reserveUser = pool.reserveUserToken
  const reserveValidator = pool.reserveValidatorToken

  console.log('Fee AMM pool reserves (raw):')
  console.log('  reserveUserToken     :', reserveUser.toString())
  console.log('  reserveValidatorToken:', reserveValidator.toString())

  // Optional: both tokens are 6 decimals in your setup (USD stablecoins)
  console.log('\nFee AMM pool reserves (formatted, 6 decimals):')
  console.log('  user token     :', formatUnits(reserveUser, 6))
  console.log('  validator token:', formatUnits(reserveValidator, 6))
}

main().catch(console.error)
