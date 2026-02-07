import 'dotenv/config'
import { createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { tempoModerato } from 'viem/chains'
import { tempoActions } from 'viem/tempo'

export const account = privateKeyToAccount(process.env.PRIVATE_KEY)

export const chain = tempoModerato.extend({
  // default fee token (pathUSD) for all txs unless overridden
  feeToken: '0x20c0000000000000000000000000000000000000',
})

export const client = createWalletClient({
  account,
  chain,
  transport: http('https://rpc.moderato.tempo.xyz'),
}).extend(tempoActions())
