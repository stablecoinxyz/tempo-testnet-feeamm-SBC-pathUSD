import { parseUnits } from 'viem'
import { client, account } from './viem.config.js'

const userToken = '0x20c000000000000000000000ccbf1e4901196743' // your stablecoin
const pathUSD = '0x20c0000000000000000000000000000000000000'   // pathUSD (testnet)

async function main() {
  const { liquidity, receipt } = await client.amm.mintSync({
    userTokenAddress: userToken,
    validatorTokenAddress: pathUSD,
    validatorTokenAmount: parseUnits('100', 6),
    to: account.address,
    // optional since chain has default feeToken, but explicit is fine:
    feeToken: pathUSD,
  })

  console.log('Liquidity minted to SBC/pathUSD FeeAMM pool')
  console.log('Tx hash:', receipt.transactionHash)
}

main().catch(console.error)
