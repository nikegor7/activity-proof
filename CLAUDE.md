# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pharos Atlantic NFT Marketplace - A full-stack NFT marketplace built on the Pharos blockchain testnet. Combines Next.js frontend with Solidity smart contracts in a monorepo structure.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- **Smart Contracts**: Solidity 0.8.24, Hardhat 2.x
- **Storage**: Pinata/IPFS for NFT metadata and assets
- **Network**: Pharos Testnet (Chain ID: 688689)

## Commands

```bash
# Frontend
npm run dev          # Start Next.js dev server
npm run build        # Production build
npm run lint         # ESLint

# Smart Contracts
npm run compile      # Compile Solidity contracts
npm run test:contracts  # Run Hardhat tests
npm run deploy       # Deploy to Pharos testnet
```

## Project Structure

```
/src              # Next.js App Router frontend
/contracts        # Solidity smart contracts
/test             # Hardhat contract tests
/scripts          # Deployment scripts
/artifacts        # Compiled contract ABIs (generated)
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:
- `PRIVATE_KEY` - Wallet private key for deployments
- `PHAROS_RPC_URL` - RPC endpoint (default: testnet)
- `PINATA_API_KEY` / `PINATA_SECRET_KEY` - IPFS pinning
- `NEXT_PUBLIC_*` - Client-side contract addresses

## Key Architecture Decisions

1. **Monorepo**: Frontend and contracts live together for easier type sharing and deployment coordination
2. **App Router**: Using Next.js App Router with `/src` directory
3. **Contract ABIs**: Import from `/artifacts` after compilation for type-safe contract interactions
