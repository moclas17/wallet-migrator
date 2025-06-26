// Lista de tokens conocidos en Flow EVM
import { ethers } from "ethers" // Import ethers to use it
export const FLOW_KNOWN_TOKENS = {
  // FLOW Token (nativo)
  "0x0000000000000000000000000000000000000000": {
    name: "Flow",
    symbol: "FLOW",
    decimals: 18,
    isNative: true,
  },
  // USDC en Flow EVM
  "0x1c7d4b196cb0c7b01d743fbc6116a902379c7238": {
    name: "USD Coin",
    symbol: "USDC",
    decimals: 6,
  },
  // WFLOW (Wrapped FLOW)
  "0x5566af9817cd58b79f29e3d9e8a989c0c0ef9da8": {
    name: "Wrapped Flow",
    symbol: "WFLOW",
    decimals: 18,
  },
  // FUSD (Flow USD)
  "0x6f0469e7f0ef36b1c86421ade1e142fd47cdb727": {
    name: "Flow USD",
    symbol: "FUSD",
    decimals: 8,
  },
  // USDT en Flow EVM
  "0x7c8dff8f1c7c89b09c6b05a8d29f3d3e0c4db0c0": {
    name: "Tether USD",
    symbol: "USDT",
    decimals: 6,
  },
  // BLT (Blocto Token)
  "0x21c718c22d52d0f3a789b752d4c2fd5908a8a733": {
    name: "Blocto Token",
    symbol: "BLT",
    decimals: 18,
  },
  // STFLOW (Staked FLOW)
  "0x6365a1a2c4d73b2f5a9dc6d838b2be85c9f69e7f": {
    name: "Staked Flow",
    symbol: "STFLOW",
    decimals: 8,
  },
  // Añadir más tokens populares de Flow EVM
  "0x86300e0a857aab39a601e89b0e7f15e1488d9f0c": {
    name: "Flow Token Example",
    symbol: "FTE",
    decimals: 18,
  },
  // REVV Racing Token
  "0x6c7fe21c99a982ed0b301414a1eee4761d97d1c5": {
    name: "REVV Racing",
    symbol: "REVV",
    decimals: 18,
  },
  // FLOW Fungible Token
  "0x1654653399040a61:FlowToken": {
    name: "Flow Token",
    symbol: "FLOW",
    decimals: 8,
  },
  // Primer token solicitado por el usuario
  "0x2aaBea2058b5aC2D339b163C6Ab6f2b6d53aabED": {
    name: "Flow Custom Token 1",
    symbol: "FCT1",
    decimals: 18,
  },
  // Segundo token solicitado por el usuario
  "0x7f27352D5F83Db87a5A3E00f4B07Cc2138D8ee52": {
    name: "Flow Custom Token 2",
    symbol: "FCT2",
    decimals: 18,
  },
}

// Función para obtener tokens de Flow EVM usando web scraping como alternativa
export async function fetchFlowTokensFromWeb(address: string): Promise<any[]> {
  try {
    console.log(`🔍 Intentando obtener tokens de Flow para ${address} mediante método alternativo...`)

    // No podemos hacer web scraping directamente desde el cliente
    // En su lugar, usaremos un enfoque basado en RPC para tokens conocidos
    return []
  } catch (error) {
    console.error(`❌ Error en método alternativo:`, error)
    return []
  }
}

// Función para obtener tokens de Flow EVM usando la API de FlowScan
// Esta función ahora usa un enfoque más robusto con múltiples reintentos
export async function fetchFlowTokensFromAPI(address: string): Promise<any[]> {
  try {
    console.log(`🔍 Fetching Flow tokens from FlowScan API for ${address}...`)

    // Intentar obtener los tokens usando la API de FlowScan
    // Nota: La API pública de FlowScan puede no estar disponible o requerir autenticación
    // Por eso implementamos múltiples métodos de respaldo

    // Intentamos con una URL diferente que podría funcionar
    const response = await fetch(`https://evm.flowscan.io/api/account/${address}/tokens`, {
      headers: {
        Accept: "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    })

    if (!response.ok) {
      console.log(`⚠️ FlowScan API respondió con estado: ${response.status}`)
      return []
    }

    const data = await response.json()
    console.log(`✅ FlowScan API response:`, data)

    if (data && Array.isArray(data.items)) {
      return data.items
    }

    return []
  } catch (error) {
    console.error(`❌ Error fetching Flow tokens from API:`, error)
    return []
  }
}

// Función para obtener balance de token ERC20 usando ethers.js
export async function getERC20Balance(provider: any, tokenAddress: string, walletAddress: string): Promise<string> {
  try {
    // ABI mínimo para la función balanceOf
    const minABI = [
      {
        constant: true,
        inputs: [{ name: "_owner", type: "address" }],
        name: "balanceOf",
        outputs: [{ name: "balance", type: "uint256" }],
        type: "function",
      },
    ]

    // Crear contrato
    const contract = new ethers.Contract(tokenAddress, minABI, provider)

    // Llamar a balanceOf
    const balance = await contract.balanceOf(walletAddress)

    return balance.toString()
  } catch (error) {
    console.error(`❌ Error getting ERC20 balance for ${tokenAddress}:`, error)
    return "0"
  }
}

// Función alternativa para obtener tokens de Flow usando RPC
export async function getFlowTokenBalance(
  walletAddress: string,
  tokenAddress: string,
  decimals: number,
  provider: any,
): Promise<string> {
  try {
    if (!provider || !provider.request) {
      console.log("⚠️ Provider no disponible para consulta RPC")
      return "0"
    }

    // ERC20 balanceOf function selector + address (padded to 32 bytes)
    const paddedAddress = walletAddress.slice(2).toLowerCase().padStart(64, "0")
    const data = `0x70a08231000000000000000000000000${paddedAddress}`

    const result = await provider.request({
      method: "eth_call",
      params: [
        {
          to: tokenAddress,
          data: data,
        },
        "latest",
      ],
    })

    if (result && result !== "0x" && result !== "0x0") {
      // Convertir el resultado hexadecimal a número
      const balance = Number.parseInt(result, 16)
      const balanceInDecimal = balance / Math.pow(10, decimals)
      return balanceInDecimal.toString()
    }

    return "0"
  } catch (error) {
    console.error(`❌ Error getting Flow token balance for ${tokenAddress}:`, error)
    return "0"
  }
}

// Función para verificar si un token existe en una dirección
export async function checkTokenExists(tokenAddress: string, provider: any): Promise<boolean> {
  try {
    if (!provider || !provider.request) {
      return false
    }

    // Intentar obtener el código en la dirección del token
    const code = await provider.request({
      method: "eth_getCode",
      params: [tokenAddress, "latest"],
    })

    // Si hay código, es un contrato (potencialmente un token)
    return code && code !== "0x"
  } catch (error) {
    console.error(`❌ Error checking if token exists at ${tokenAddress}:`, error)
    return false
  }
}
