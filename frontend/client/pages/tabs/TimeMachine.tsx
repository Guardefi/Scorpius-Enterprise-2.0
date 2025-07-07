import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Clock,
  Database,
  History,
  Play,
  Pause,
  X,
  Calendar as CalendarIcon,
} from "lucide-react";

interface HistoricalQuery {
  id: string;
  blockNumber: number;
  timestamp: string;
  query: string;
  results: any[];
  status: "loading" | "completed" | "error";
}

interface ExploitTransaction {
  hash: string;
  blockNumber: number;
  timestamp: string;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
  method: string;
  description: string;
  impact: string;
  terminalInput?: string;
  terminalOutput?: string;
}

interface FamousExploit {
  id: string;
  name: string;
  date: string;
  description: string;
  totalLoss: string;
  exploitType:
    | "reentrancy"
    | "flash_loan"
    | "oracle_manipulation"
    | "governance"
    | "bridge"
    | "other";
  attackerAddress: string;
  targetContract: string;
  transactions: ExploitTransaction[];
  timeline: string[];
  status: "completed" | "replaying" | "paused";
  currentStep: number;
}

interface ReplayState {
  isReplaying: boolean;
  currentExploit: FamousExploit | null;
  replaySpeed: number;
  currentTransaction: number;
}

export default function TimeMachine() {
  // Time Machine State
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [blockNumber, setBlockNumber] = useState("");
  const [historicalQueries, setHistoricalQueries] = useState<HistoricalQuery[]>(
    [],
  );

  // Famous Exploits Replay State
  const [replayState, setReplayState] = useState<ReplayState>({
    isReplaying: false,
    currentExploit: null,
    replaySpeed: 1,
    currentTransaction: 0,
  });

  // Use ref to track current replay state for async functions
  const replayStateRef = useRef(replayState);
  useEffect(() => {
    replayStateRef.current = replayState;
  }, [replayState]);

  const [famousExploits] = useState<FamousExploit[]>([
    {
      id: "ronin-2022",
      name: "Ronin Network Hack",
      date: "March 23, 2022",
      description:
        "Largest DeFi hack ever. Attacker compromised 5/9 validator keys to drain Ronin bridge of 173,600 ETH and 25.5M USDC.",
      totalLoss: "173,600 ETH + 25.5M USDC (~$625M)",
      exploitType: "bridge",
      attackerAddress: "0x098B716B8Aaf21512996dC57EB0615e2383E2f96",
      targetContract: "0x1A2a1c938CE3eC39b6D47113c7955bAa9DD454F2",
      transactions: [
        {
          hash: "0xc28fad5e8d5e0ce6a2eaf67b6687be5d58e2727e",
          blockNumber: 14442753,
          timestamp: "2022-03-23 00:31:35",
          from: "0x098B716B8Aaf21512996dC57EB0615e2383E2f96",
          to: "0x1A2a1c938CE3eC39b6D47113c7955bAa9DD454F2",
          value: "0 ETH",
          gasUsed: "185,000",
          gasPrice: "42 Gwei",
          method: "withdrawETH(173600000000000000000000)",
          description:
            "Massive ETH withdrawal using compromised validator signatures",
          impact: "Drained 173,600 ETH in single transaction",
          terminalInput:
            "$ cast call 0x1A2a --data 0xa21a9508...173600000000000000000000",
          terminalOutput:
            "SUCCESS: 173600000000000000000000 ETH transferred to 0x098B716...",
        },
        {
          hash: "0xed2c72ef1a552ddaec6dd1f5cddf0b59a8f37f82",
          blockNumber: 14442754,
          timestamp: "2022-03-23 00:32:12",
          from: "0x098B716B8Aaf21512996dC57EB0615e2383E2f96",
          to: "0x1A2a1c938CE3eC39b6D47113c7955bAa9DD454F2",
          value: "0 ETH",
          gasUsed: "165,000",
          gasPrice: "42 Gwei",
          method: "withdrawERC20(USDC, 25500000000000)",
          description: "USDC withdrawal using same compromised keys",
          impact: "Drained 25.5M USDC tokens",
          terminalInput:
            "$ cast call 0x1A2a --data 0xb9e93f53...25500000000000",
          terminalOutput:
            "SUCCESS: 25500000000000 USDC transferred to 0x098B716...",
        },
      ],
      timeline: [
        "00:31:35 - Validator keys compromised via social engineering",
        "00:31:35 - First ETH withdrawal: 173,600 ETH",
        "00:32:12 - USDC withdrawal: 25.5M tokens",
        "00:33:45 - Bridge drained completely",
        "06 days later - Hack discovered by community",
      ],
      status: "completed",
      currentStep: 0,
    },
    {
      id: "dao-hack-2016",
      name: "The DAO Hack",
      date: "June 17, 2016",
      description:
        "Historic reentrancy attack that drained 3.6M ETH from The DAO, leading to Ethereum's controversial hard fork.",
      totalLoss: "3,600,000 ETH (~$50M)",
      exploitType: "reentrancy",
      attackerAddress: "0x969837498944ae1dc0dcac2d0c65634c88729b2d",
      targetContract: "0xBB9bc244D798123fDe783fCc1C72d3Bb8C189413",
      transactions: [
        {
          hash: "0xaa262afdf199bb32b0df72e48ca9e9d9fa4e61ec7",
          blockNumber: 1718497,
          timestamp: "2016-06-17 13:34:07",
          from: "0x969837498944ae1dc0dcac2d0c65634c88729b2d",
          to: "0xBB9bc244D798123fDe783fCc1C72d3Bb8C189413",
          value: "0 ETH",
          gasUsed: "2,300,000",
          gasPrice: "20 Gwei",
          method: "splitDAO(uint256,address)",
          description:
            "Initial reentrancy attack vector via recursive splitting",
          impact: "Triggered recursive withdrawal vulnerability",
          terminalInput:
            '$ geth attach ipc:$HOME/.ethereum/geth.ipc --exec \'eth.sendTransaction({from: eth.accounts[0], to: "0xBB9bc244", data: "0x4ee58366000000..." })\'',
          terminalOutput:
            "Transaction submitted: 0xaa262afdf199bb32b0df72e48ca9e9d9fa4e61ec7\nStatus: PENDING\nRecursive call detected...\nSplitDAO executed successfully",
        },
      ],
      timeline: [
        "13:34:07 - First splitDAO call initiates reentrancy",
        "13:45:23 - Major withdrawRewardFor exploit",
        "14:22:47 - Attack pattern continues for hours",
        "16:45:00 - 3.6M ETH drained, community in panic",
        "July 20 - Ethereum hard fork reverses the hack",
      ],
      status: "completed",
      currentStep: 0,
    },
    {
      id: "poly-network-2021",
      name: "Poly Network Hack",
      date: "August 10, 2021",
      description:
        "Cross-chain DeFi protocol exploit that stole $611M across Ethereum, BSC, and Polygon through signature manipulation.",
      totalLoss: "$611M (ETH, BNB, MATIC tokens)",
      exploitType: "bridge",
      attackerAddress: "0xC8a65Fadf0e0dDAf421F28FEAb69Bf6E2E589963",
      targetContract: "0x250e76987d838a75310c34bf422ea9f1AC4Cc906",
      transactions: [
        {
          hash: "0xb1f70464bd95b774c6ce60fc706eb5f9e35cb5f06e6dd3f3a23f1f6b8c5cd4e3",
          blockNumber: 13005830,
          timestamp: "2021-08-10 12:43:51",
          from: "0xC8a65Fadf0e0dDAf421F28FEAb69Bf6E2E589963",
          to: "0x250e76987d838a75310c34bf422ea9f1AC4Cc906",
          value: "0 ETH",
          gasUsed: "215,000",
          gasPrice: "65 Gwei",
          method: "verifyHeaderAndExecuteTx(bytes,bytes,bytes)",
          description:
            "Exploited cross-chain signature verification to forge transactions",
          impact: "Manipulated keeper role to authorize massive withdrawals",
          terminalInput:
            "$ cast send 0x250e76 'verifyHeaderAndExecuteTx(bytes,bytes,bytes)' 0x... --private-key $HACKER_KEY",
          terminalOutput:
            "SUCCESS: Cross-chain verification bypassed\nRole KEEPER assigned to attacker\nUnlocking $611M across 3 chains...",
        },
        {
          hash: "0xad7c84b7b8d9f7b8c9d10f9e74a8e9c5d6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1",
          blockNumber: 13005831,
          timestamp: "2021-08-10 12:44:23",
          from: "0xC8a65Fadf0e0dDAf421F28FEAb69Bf6E2E589963",
          to: "0x250e76987d838a75310c34bf422ea9f1AC4Cc906",
          value: "0 ETH",
          gasUsed: "195,000",
          gasPrice: "65 Gwei",
          method: "unlock(address,uint256,bytes)",
          description:
            "Mass withdrawal of locked assets across multiple chains",
          impact: "Drained entire liquidity pools on Ethereum mainnet",
          terminalInput:
            "$ python3 multi_chain_drain.py --target poly --amount 273000000",
          terminalOutput:
            "DRAINING ETHEREUM: $273M transferred\nDRAINING BSC: $253M transferred\nDRAINING POLYGON: $85M transferred\nTOTAL STOLEN: $611,000,000",
        },
      ],
      timeline: [
        "12:43:51 - Cross-chain signature verification bypassed",
        "12:44:23 - Mass withdrawal initiated across 3 chains",
        "12:45:00 - $273M drained from Ethereum",
        "12:46:15 - $253M drained from BSC",
        "12:47:30 - $85M drained from Polygon",
        "Later - Hacker returns funds after negotiation",
      ],
      status: "completed",
      currentStep: 0,
    },
    {
      id: "ftx-alameda-2022",
      name: "FTX / Alameda Collapse",
      date: "November 11, 2022",
      description:
        "Massive misappropriation of customer funds between FTX exchange and Alameda Research trading firm, leading to $8B+ losses.",
      totalLoss: "$8B+ customer funds",
      exploitType: "governance",
      attackerAddress: "0x59AB5A5b5d617E478a2479B0cAD80DA7e2831492",
      targetContract: "0x2FAF487A4414Fe77e2327F0bf4AE2a264a776AD2",
      transactions: [
        {
          hash: "0x3fab457e84f87e48d0c1d2c4c57d9b47e8a924c7d8e5f6a7b8c9d0e1f2a3b4c5",
          blockNumber: 15967845,
          timestamp: "2022-11-11 04:32:17",
          from: "0x59AB5A5b5d617E478a2479B0cAD80DA7e2831492",
          to: "0x2FAF487A4414Fe77e2327F0bf4AE2a264a776AD2",
          value: "100000 ETH",
          gasUsed: "21,000",
          gasPrice: "12 Gwei",
          method: "transfer(address,uint256)",
          description:
            "Unauthorized transfer of customer funds to Alameda wallets",
          impact: "Moved billions in customer deposits without authorization",
          terminalInput:
            "$ node ftx_drain.js --amount 100000 --destination alameda_hot_wallet",
          terminalOutput:
            "TRANSFERRING: 100,000 ETH to Alameda Research\nCUSTOMER FUNDS: Misappropriated\nCOMPLIANCE: BYPASSED\nSTATUS: Funds moved illegally",
        },
        {
          hash: "0x7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8",
          blockNumber: 15967850,
          timestamp: "2022-11-11 04:35:42",
          from: "0x59AB5A5b5d617E478a2479B0cAD80DA7e2831492",
          to: "0x2FAF487A4414Fe77e2327F0bf4AE2a264a776AD2",
          value: "0 ETH",
          gasUsed: "150,000",
          gasPrice: "12 Gwei",
          method: "withdrawUSDC(uint256)",
          description: "Mass USDC withdrawal from customer deposits",
          impact: "Drained $3.2B in stablecoin reserves",
          terminalInput:
            "$ ./extract_stable.sh --type USDC --amount 3200000000",
          terminalOutput:
            "EXTRACTING: $3.2B USDC from customer accounts\nDESTINATION: Alameda trading positions\nCUSTOMER ACCOUNT STATUS: FROZEN\nLIQUIDITY CRISIS: INITIATED",
        },
      ],
      timeline: [
        "04:32:17 - First unauthorized ETH transfer to Alameda",
        "04:35:42 - Mass USDC withdrawal begins",
        "05:00:00 - $8B+ in customer funds misappropriated",
        "Nov 11 - Trading halted, withdrawals frozen",
        "Nov 11 - Bankruptcy filed, scandal revealed",
      ],
      status: "completed",
      currentStep: 0,
    },
    {
      id: "wormhole-2022",
      name: "Wormhole Bridge Hack",
      date: "February 2, 2022",
      description:
        "Attacker exploited signature verification in Wormhole bridge to mint 120,000 ETH on Ethereum without backing.",
      totalLoss: "120,000 ETH (~$325M)",
      exploitType: "bridge",
      attackerAddress: "0x629e7Da20197a5429d30da36E77d06CdF796b71A",
      targetContract: "0xf890982f9310df57d00f659cf4fd87e65adEd8d7",
      transactions: [
        {
          hash: "0x08b2da654ee2e7e53935e5e89dd3ebd0db0d2bbfa4fe1d0cc8b4ce1e6b5f1a5e",
          blockNumber: 14245308,
          timestamp: "2022-02-02 18:24:11",
          from: "0x629e7Da20197a5429d30da36E77d06CdF796b71A",
          to: "0xf890982f9310df57d00f659cf4fd87e65adEd8d7",
          value: "0 ETH",
          gasUsed: "185,000",
          gasPrice: "85 Gwei",
          method: "submitVAA(bytes)",
          description:
            "Submitted fake guardian signature to authorize ETH minting",
          impact: "Bypassed guardian verification system",
          terminalInput:
            "$ python3 wormhole_exploit.py --forge-vaa --amount 120000",
          terminalOutput:
            "FORGING VAA: Guardian signatures bypassed\nMINTING: 120,000 ETH on Ethereum\nGUARDIAN CHECK: FAILED (exploited)\nCROSS-CHAIN MINT: UNAUTHORIZED SUCCESS",
        },
        {
          hash: "0x2e62f5b5e7d3a8e9c5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8",
          blockNumber: 14245309,
          timestamp: "2022-02-02 18:24:47",
          from: "0x629e7Da20197a5429d30da36E77d06CdF796b71A",
          to: "0xf890982f9310df57d00f659cf4fd87e65adEd8d7",
          value: "0 ETH",
          gasUsed: "120,000",
          gasPrice: "85 Gwei",
          method: "mint(address,uint256)",
          description: "Minted 120,000 ETH without Solana backing",
          impact: "Created unbacked ETH worth $325M",
          terminalInput:
            "$ cast send 0xf890982 'mint(address,uint256)' 0x629e... 120000000000000000000000",
          terminalOutput:
            "MINTING: 120,000 ETH to attacker wallet\nBACKING: NONE (Solana SOL not locked)\nRESULT: $325M in unbacked ETH created\nBRIDGE STATE: CRITICALLY COMPROMISED",
        },
      ],
      timeline: [
        "18:24:11 - Fake VAA submitted with forged guardian signatures",
        "18:24:47 - 120,000 ETH minted without backing",
        "18:30:00 - Attacker swaps ETH for various tokens",
        "19:00:00 - Community discovers the exploit",
        "Feb 3 - Jump Crypto replaces stolen funds",
      ],
      status: "completed",
      currentStep: 0,
    },
    {
      id: "beanstalk-2022",
      name: "Beanstalk Governance Attack",
      date: "April 17, 2022",
      description:
        "Flash loan governance attack that stole $182M by taking malicious governance proposal and executing immediately.",
      totalLoss: "$182M in various tokens",
      exploitType: "governance",
      attackerAddress: "0x1c5dCdd006EA78a7E4783f9e6021C32935a10fb4",
      targetContract: "0xDC59ac4FeFa32293A95889Dc396682858d52e5Db",
      transactions: [
        {
          hash: "0x3d13f242c6f8a2f8e2b0a9c5b7e3d5f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4",
          blockNumber: 14602790,
          timestamp: "2022-04-17 12:24:37",
          from: "0x1c5dCdd006EA78a7E4783f9e6021C32935a10fb4",
          to: "0xDC59ac4FeFa32293A95889Dc396682858d52e5Db",
          value: "0 ETH",
          gasUsed: "2,500,000",
          gasPrice: "45 Gwei",
          method: "flashLoan(address,uint256,bytes)",
          description: "Massive flash loan to gain governance tokens instantly",
          impact: "Acquired 79% voting power in single transaction",
          terminalInput:
            "$ cast send 0xDC59ac 'flashLoan(address,uint256,bytes)' 0x... 1000000000000000000000000 0x...",
          terminalOutput:
            "FLASH LOAN: $1B borrowed across multiple protocols\nSTAKING: Converting loan to governance power\nVOTING POWER: 79% achieved\nGOVERNANCE: Ready for malicious proposal",
        },
        {
          hash: "0xe7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8",
          blockNumber: 14602790,
          timestamp: "2022-04-17 12:24:37",
          from: "0x1c5dCdd006EA78a7E4783f9e6021C32935a10fb4",
          to: "0xDC59ac4FeFa32293A95889Dc396682858d52e5Db",
          value: "0 ETH",
          gasUsed: "1,800,000",
          gasPrice: "45 Gwei",
          method: "propose(address[],uint256[],string[],bytes[],string)",
          description: "Malicious governance proposal to drain treasury",
          impact: "Proposed and passed treasury drain in same transaction",
          terminalInput: "$ ./beanstalk_drain.py --execute-governance-attack",
          terminalOutput:
            "PROPOSAL CREATED: Drain all funds to attacker\nVOTING: 79% power approves malicious proposal\nEXECUTION: Immediate treasury transfer\nSTOLEN: $182M in ETH, BEAN, 3CRV tokens\nFLASH LOAN: Repaid from stolen funds",
        },
      ],
      timeline: [
        "12:24:37 - Flash loan executed for governance tokens",
        "12:24:37 - Malicious proposal created and voted",
        "12:24:37 - Treasury drained in same transaction",
        "12:24:37 - Flash loan repaid from stolen funds",
        "12:30:00 - $182M theft completed in 13 seconds",
      ],
      status: "completed",
      currentStep: 0,
    },
    {
      id: "nomad-bridge-2022",
      name: "Nomad Bridge Hack",
      date: "August 1, 2022",
      description:
        "Copy-paste exploit where hundreds of users replicated the initial attack, draining $190M from bridge in feeding frenzy.",
      totalLoss: "$190M across 300+ transactions",
      exploitType: "bridge",
      attackerAddress: "0x56D8b635A7C88Fd1104D23d632AF40c1C3Aac4e3",
      targetContract: "0x88A69B4E698A4B090DF6CF5Bd7B2D47325Ad30A3",
      transactions: [
        {
          hash: "0xa8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7",
          blockNumber: 15257697,
          timestamp: "2022-08-01 21:32:18",
          from: "0x56D8b635A7C88Fd1104D23d632AF40c1C3Aac4e3",
          to: "0x88A69B4E698A4B090DF6CF5Bd7B2D47325Ad30A3",
          value: "0 ETH",
          gasUsed: "195,000",
          gasPrice: "12 Gwei",
          method: "prove(bytes32[32],uint256,bytes32)",
          description: "First transaction exploiting trusted root merkle proof",
          impact: "Withdrew $100 WETH using invalid proof",
          terminalInput:
            "$ cast send 0x88A69B 'prove(bytes32[32],uint256,bytes32)' [...] 100 0x...",
          terminalOutput:
            "PROOF VALIDATION: BYPASSED (trusted root = 0x00)\nWITHDRAWAL: 100 WETH approved\nBRIDGE STATE: Compromised merkle tree\nCOPY-PASTE: Attack vector now public",
        },
        {
          hash: "0xc7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8",
          blockNumber: 15257698,
          timestamp: "2022-08-01 21:33:45",
          from: "0x24EE7F4dD3E87E6F0Ca6B8E1a9B2c3D4e5F6a7B8",
          to: "0x88A69B4E698A4B090DF6CF5Bd7B2D47325Ad30A3",
          value: "0 ETH",
          gasUsed: "195,000",
          gasPrice: "20 Gwei",
          method: "prove(bytes32[32],uint256,bytes32)",
          description: "Copy-cat attack #1 - same method, different amount",
          impact: "Another user copies attack for 1000 WETH",
          terminalInput:
            "$ # Copy-pasting successful attack transaction\n$ cast send 0x88A69B 'prove(bytes32[32],uint256,bytes32)' [...] 1000 0x...",
          terminalOutput:
            "COPYCAT ATTACK: User copies original exploit\nWITHDRAWAL: 1000 WETH stolen\nFEEDING FRENZY: Hundreds join the attack\nBRIDGE: Rapidly draining across 300+ attackers",
        },
      ],
      timeline: [
        "21:32:18 - First attacker discovers trusted root exploit",
        "21:33:45 - Copy-cat attacks begin spreading",
        "21:45:00 - 50+ attackers copying the transaction",
        "22:00:00 - 200+ attackers in feeding frenzy",
        "23:30:00 - Bridge completely drained by crowd",
      ],
      status: "completed",
      currentStep: 0,
    },
    {
      id: "harmony-bridge-2022",
      name: "Harmony Horizon Bridge",
      date: "June 23, 2022",
      description:
        "Compromised validator keys allowed attacker to steal $100M from Harmony's cross-chain bridge to Ethereum.",
      totalLoss: "$100M (ETH, USDC, WBTC)",
      exploitType: "bridge",
      attackerAddress: "0x0d043128146654C7683Fbf30ac98D7B2285DeD00",
      targetContract: "0xF9fB1c508fF49F78b60d3A96dea99Fa5d7F3A8A6",
      transactions: [
        {
          hash: "0xb1e2d3c4a5f6e7d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2",
          blockNumber: 15017482,
          timestamp: "2022-06-23 20:08:15",
          from: "0x0d043128146654C7683Fbf30ac98D7B2285DeD00",
          to: "0xF9fB1c508fF49F78b60d3A96dea99Fa5d7F3A8A6",
          value: "0 ETH",
          gasUsed: "225,000",
          gasPrice: "25 Gwei",
          method: "withdraw(bytes,bytes)",
          description: "Withdrew ETH using compromised validator signatures",
          impact: "Drained 85,837 ETH using malicious multisig",
          terminalInput:
            "$ python3 harmony_drain.py --validators 2-of-5 --amount 85837",
          terminalOutput:
            "VALIDATOR KEYS: 2 of 5 compromised\nMULTISIG: Malicious signatures validated\nWITHDRAWING: 85,837 ETH\nCROSS-CHAIN: Harmony -> Ethereum bridge exploited",
        },
        {
          hash: "0xf3e4d5c6b7a8f9e0d1c2b3a4f5e6d7c8b9a0f1e2d3c4b5a6f7e8d9c0b1a2f3e4",
          blockNumber: 15017485,
          timestamp: "2022-06-23 20:09:32",
          from: "0x0d043128146654C7683Fbf30ac98D7B2285DeD00",
          to: "0xF9fB1c508fF49F78b60d3A96dea99Fa5d7F3A8A6",
          value: "0 ETH",
          gasUsed: "185,000",
          gasPrice: "25 Gwei",
          method: "withdraw(bytes,bytes)",
          description: "Multiple token withdrawals using same exploit",
          impact: "Drained USDC, WBTC, and other bridged assets",
          terminalInput: "$ ./multi_token_drain.sh --tokens USDC,WBTC,BUSD",
          terminalOutput:
            "DRAINING USDC: $13.1M transferred\nDRAINING WBTC: 640 BTC transferred\nDRAINING OTHER: $5M+ in various tokens\nTOTAL STOLEN: $100M+ from Harmony bridge",
        },
      ],
      timeline: [
        "20:08:15 - First ETH withdrawal using compromised keys",
        "20:09:32 - Multiple token types drained",
        "20:15:00 - 85,837 ETH + tokens stolen",
        "21:00:00 - Community notices bridge anomalies",
        "June 24 - Harmony confirms $100M theft",
      ],
      status: "completed",
      currentStep: 0,
    },
    {
      id: "cream-finance-2021",
      name: "Cream Finance Flash Loan",
      date: "October 27, 2021",
      description:
        "Sophisticated flash loan attack exploiting price oracle manipulation to steal $130M from lending protocol.",
      totalLoss: "$130M in various tokens",
      exploitType: "flash_loan",
      attackerAddress: "0x24354D31bC9D90F62FE5f2454709C32049cf866b",
      targetContract: "0x892B14321a4FCba80669aE30Bd0cd99a7ECF6aC0",
      transactions: [
        {
          hash: "0xd6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7",
          blockNumber: 13706307,
          timestamp: "2021-10-27 14:52:31",
          from: "0x24354D31bC9D90F62FE5f2454709C32049cf866b",
          to: "0x892B14321a4FCba80669aE30Bd0cd99a7ECF6aC0",
          value: "0 ETH",
          gasUsed: "3,200,000",
          gasPrice: "110 Gwei",
          method: "flashLoan(address,uint256,bytes)",
          description: "Massive flash loan to manipulate yUSD price oracle",
          impact: "Borrowed $2B to manipulate collateral pricing",
          terminalInput:
            "$ cast send 0x892B14 'flashLoan(address,uint256,bytes)' 0x... 2000000000000000000000000000 0x...",
          terminalOutput:
            "FLASH LOAN: $2B borrowed from multiple DEXs\nORACLE MANIPULATION: yUSD price artificially inflated\nCOLLATERAL: Over-valued by 300%\nBORROWING: $130M against manipulated collateral",
        },
        {
          hash: "0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
          blockNumber: 13706307,
          timestamp: "2021-10-27 14:52:31",
          from: "0x24354D31bC9D90F62FE5f2454709C32049cf866b",
          to: "0x892B14321a4FCba80669aE30Bd0cd99a7ECF6aC0",
          value: "0 ETH",
          gasUsed: "1,800,000",
          gasPrice: "110 Gwei",
          method: "borrow(uint256)",
          description: "Borrowed $130M against over-valued collateral",
          impact: "Drained lending pools using manipulated prices",
          terminalInput:
            "$ ./cream_exploit.py --oracle-manipulation --borrow-max",
          terminalOutput:
            "ORACLE: yUSD price manipulated to $3.00 (real: $1.00)\nCOLLATERAL: $400M fake value deposited\nBORROWING: $130M in ETH, USDC borrowed\nFLASH LOAN: Repaid with stolen funds\nPROFIT: $130M stolen from protocol",
        },
      ],
      timeline: [
        "14:52:31 - Flash loan executed for oracle manipulation",
        "14:52:31 - yUSD price inflated through large trades",
        "14:52:31 - Over-valued collateral deposited",
        "14:52:31 - $130M borrowed against fake collateral",
        "14:52:31 - Flash loan repaid, profit extracted",
      ],
      status: "completed",
      currentStep: 0,
    },
    {
      id: "euler-finance-2023",
      name: "Euler Finance Hack",
      date: "March 13, 2023",
      description:
        "Sophisticated attack using donation and liquidation mechanics to steal $197M from lending protocol.",
      totalLoss: "$197M (USDC, DAI, WBTC, stETH)",
      exploitType: "flash_loan",
      attackerAddress: "0xb66cd966670d962C227B3EABA30a872DbFa5da00",
      targetContract: "0x27182842E098f60e3D576794A5bFFb0777E025d3",
      transactions: [
        {
          hash: "0x71ef7e3ceef4e1e6f2f9d8b7a5c3e9f0d1c2b3a4f5e6d7c8b9a0f1e2d3c4b5a6",
          blockNumber: 16817996,
          timestamp: "2023-03-13 08:56:35",
          from: "0xb66cd966670d962C227B3EABA30a872DbFa5da00",
          to: "0x27182842E098f60e3D576794A5bFFb0777E025d3",
          value: "0 ETH",
          gasUsed: "2,800,000",
          gasPrice: "25 Gwei",
          method: "flashLoan(uint256,bytes)",
          description: "Flash loan to exploit donation/liquidation mechanism",
          impact: "Manipulated internal accounting through self-liquidation",
          terminalInput:
            "$ cast send 0x27182842 'flashLoan(uint256,bytes)' 30000000000000000000000000 0x...",
          terminalOutput:
            "FLASH LOAN: 30M DAI borrowed\nDONATION: Large amount donated to inflate eToken value\nSELF-LIQUIDATION: Exploiting accounting error\nPROFIT: Internal debt/collateral manipulation",
        },
        {
          hash: "0xe9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0",
          blockNumber: 16817996,
          timestamp: "2023-03-13 08:56:35",
          from: "0xb66cd966670d962C227B3EABA30a872DbFa5da00",
          to: "0x27182842E098f60e3D576794A5bFFb0777E025d3",
          value: "0 ETH",
          gasUsed: "3,500,000",
          gasPrice: "25 Gwei",
          method: "liquidate(address,address,uint256,uint256)",
          description: "Self-liquidation to extract inflated collateral value",
          impact: "Drained $197M through accounting manipulation",
          terminalInput:
            "$ python3 euler_exploit.py --self-liquidate --extract-all",
          terminalOutput:
            "SELF-LIQUIDATION: Extracting inflated collateral\nSTOLEN: $8.7M USDC, $18.5M WBTC, $33.8M stETH\nSTOLEN: $135.8M USDC total\nFLASH LOAN: Repaid from stolen funds\nTOTAL PROFIT: $197,000,000 stolen",
        },
      ],
      timeline: [
        "08:56:35 - Flash loan initiated for donation attack",
        "08:56:35 - Large donation inflates eToken exchange rate",
        "08:56:35 - Self-liquidation extracts inflated value",
        "08:56:35 - $197M stolen in single transaction",
        "09:30:00 - Community notices massive drain",
      ],
      status: "completed",
      currentStep: 0,
    },
    {
      id: "badger-dao-2021",
      name: "Badger DAO Frontend Attack",
      date: "December 2, 2021",
      description:
        "Sophisticated social engineering attack that injected malicious approval requests into frontend for weeks.",
      totalLoss: "$120M in BTC-related tokens",
      exploitType: "other",
      attackerAddress: "0x1fcdb04d0c5364fbd92c73ca8af9baa72c269107",
      targetContract: "0x19D97D8fA813EE2f51aD4C4e04EA9026ccf25Dbe",
      transactions: [
        {
          hash: "0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4",
          blockNumber: 13716304,
          timestamp: "2021-12-02 03:45:23",
          from: "0x1fcdb04d0c5364fbd92c73ca8af9baa72c269107",
          to: "0x19D97D8fA813EE2f51aD4C4e04EA9026ccf25Dbe",
          value: "0 ETH",
          gasUsed: "85,000",
          gasPrice: "125 Gwei",
          method: "transferFrom(address,address,uint256)",
          description: "Mass withdrawal using pre-approved tokens from users",
          impact: "Drained wallets that approved malicious contract",
          terminalInput:
            "$ node drain_approved_tokens.js --contract 0x19D97D8 --users ./victim_list.json",
          terminalOutput:
            "VICTIMS IDENTIFIED: 426 users with approvals\nDRAINING: User 1 - 50 WBTC stolen\nDRAINING: User 2 - 1200 badgerBTC stolen\nDRAINING: User 3 - 800 bDIGG stolen\nTOTAL DRAINED: $120M from 426 victims",
        },
        {
          hash: "0x7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8",
          blockNumber: 13716305,
          timestamp: "2021-12-02 03:46:15",
          from: "0x1fcdb04d0c5364fbd92c73ca8af9baa72c269107",
          to: "0x19D97D8fA813EE2f51aD4C4e04EA9026ccf25Dbe",
          value: "0 ETH",
          gasUsed: "125,000",
          gasPrice: "125 Gwei",
          method: "batchTransferFrom(address[],uint256[])",
          description: "Batch transfer from multiple victim wallets",
          impact: "Automated draining of hundreds of approved wallets",
          terminalInput:
            "$ ./batch_steal.py --victims 426 --tokens WBTC,badgerBTC,bDIGG",
          terminalOutput:
            "BATCH PROCESSING: 426 victims in parallel\nFRONTEND ATTACK: 3 weeks of malicious approvals\nSOCIAL ENGINEERING: Users tricked into approvals\nFINAL HAUL: $120M stolen from community trust",
        },
      ],
      timeline: [
        "Nov 10 - Malicious code injected into frontend",
        "Nov 10-Dec 2 - Users unknowingly approve attacker",
        "03:45:23 - Mass draining begins",
        "03:46:15 - Batch transfers drain 426 wallets",
        "04:00:00 - $120M stolen, attack discovered",
      ],
      status: "completed",
      currentStep: 0,
    },
  ]);

  const startExploitReplay = (exploit: FamousExploit) => {
    console.log("=== STARTING EXPLOIT REPLAY ===", exploit.name);
    console.log("Exploit has", exploit.transactions.length, "transactions");

    // Set initial state
    setReplayState({
      isReplaying: true,
      currentExploit: exploit,
      replaySpeed: 1,
      currentTransaction: 0,
    });

    // Start simple replay
    let currentTx = 0;
    const playNextTransaction = () => {
      console.log(
        `Playing transaction ${currentTx + 1}/${exploit.transactions.length}`,
      );

      setReplayState((prev) => ({
        ...prev,
        currentTransaction: currentTx,
      }));

      currentTx++;

      if (currentTx < exploit.transactions.length) {
        setTimeout(playNextTransaction, 3000); // 3 seconds between transactions
      } else {
        console.log("Replay completed!");
        setReplayState((prev) => ({ ...prev, isReplaying: false }));
      }
    };

    // Start first transaction after 1 second
    setTimeout(playNextTransaction, 1000);
  };

  // Simplified pause/resume functions
  const pauseReplay = () => {
    console.log("Pause clicked");
    setReplayState((prev) => ({ ...prev, isReplaying: false }));
  };

  const resumeReplay = () => {
    console.log("Resume clicked");
    setReplayState((prev) => ({ ...prev, isReplaying: true }));
  };

  const stopReplay = () => {
    setReplayState({
      isReplaying: false,
      currentExploit: null,
      replaySpeed: 1,
      currentTransaction: 0,
    });
  };

  const changeReplaySpeed = (speed: number) => {
    console.log("Speed changed to:", speed);
    setReplayState((prev) => ({ ...prev, replaySpeed: speed }));
  };

  return (
    <div className="space-y-8">
      {/* Original Time Machine Functionality */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Travel Interface */}
        <Card className="cyber-card-enhanced group">
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-2 cyber-glow">
              <Clock className="w-5 h-5 text-cyber-cyan group-hover:animate-cyber-pulse" />
              BLOCKCHAIN TIME MACHINE
            </CardTitle>
            <CardDescription>
              Query historical blockchain state at any point in time
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-cyber-cyan">
                Select Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-black/70 border-cyber-cyan/30 text-white hover:bg-cyber-cyan/10"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? selectedDate.toDateString() : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-cyber-cyan">
                Block Number (Optional)
              </label>
              <Input
                type="number"
                placeholder="18500000"
                value={blockNumber}
                onChange={(e) => setBlockNumber(e.target.value)}
                className="bg-black/70 border-cyber-cyan/30 text-white font-mono focus:border-cyber-cyan focus:ring-cyber-cyan/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-cyber-cyan">
                Query Type
              </label>
              <Select defaultValue="balance">
                <SelectTrigger className="bg-black/70 border-cyber-cyan/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="balance">Account Balance</SelectItem>
                  <SelectItem value="contract">Contract State</SelectItem>
                  <SelectItem value="transaction">Transaction Data</SelectItem>
                  <SelectItem value="block">Block Information</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => {
                const query: HistoricalQuery = {
                  id: `query_${Date.now()}`,
                  blockNumber:
                    parseInt(blockNumber) ||
                    Math.floor(Math.random() * 1000000) + 18000000,
                  timestamp:
                    selectedDate?.toLocaleString() ||
                    new Date().toLocaleString(),
                  query: "Account Balance Query",
                  results: [
                    {
                      address: "0x...",
                      balance: "12.456 ETH",
                      tokens: ["USDT: 1000", "USDC: 500"],
                    },
                  ],
                  status: "completed",
                };
                setHistoricalQueries((prev) => [query, ...prev]);
              }}
              className="w-full btn-primary font-mono uppercase tracking-wide"
            >
              <History className="w-4 h-4 mr-2" />
              Execute Time Query
            </Button>
          </CardContent>
        </Card>

        {/* Query Results */}
        <Card className="cyber-card-enhanced group">
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-2 cyber-glow">
              <Database className="w-5 h-5 text-cyber-cyan group-hover:animate-cyber-pulse" />
              HISTORICAL DATA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {historicalQueries.map((query) => (
                  <div
                    key={query.id}
                    className="border border-cyber-cyan/20 rounded-lg p-3 space-y-2 bg-cyber-cyan/5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-cyber-cyan">
                        {query.query}
                      </span>
                      <Badge
                        variant="secondary"
                        className="bg-cyber-cyan/20 text-cyber-cyan"
                      >
                        Block {query.blockNumber.toLocaleString()}
                      </Badge>
                    </div>
                    <div className="text-xs text-cyber-cyan/60">
                      {query.timestamp}
                    </div>
                    <div className="space-y-1 text-sm">
                      {query.results.map((result, i) => (
                        <div
                          key={i}
                          className="bg-black/30 p-2 rounded border border-cyber-cyan/20"
                        >
                          <div className="font-mono text-xs text-cyber-cyan">
                            {result.address}
                          </div>
                          <div className="text-white">{result.balance}</div>
                          {result.tokens && (
                            <div className="text-xs text-cyber-cyan/60">
                              {result.tokens.join(", ")}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {historicalQueries.length === 0 && (
                  <div className="text-center py-8 text-cyber-cyan/60">
                    No queries yet. Travel back in time to explore historical
                    blockchain data.
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Famous Exploits Section */}
      <div className="border-t border-cyber-cyan/20 pt-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-cyber-cyan mb-2 font-mono uppercase tracking-wide">
            Famous Blockchain Exploits
          </h2>
          <p className="text-cyber-cyan/60 text-sm">
            Study the most infamous attacks in blockchain history through
            real-time transaction replay
          </p>
        </div>

        {/* Exploit Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {famousExploits.map((exploit) => (
            <Card
              key={exploit.id}
              className={`cyber-card-enhanced group cursor-pointer transition-all duration-300 ${
                replayState.currentExploit?.id === exploit.id
                  ? "ring-2 ring-cyber-cyan bg-cyber-cyan/10 scale-105"
                  : "hover:scale-105"
              } ${
                replayState.isReplaying &&
                replayState.currentExploit?.id !== exploit.id
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              onClick={() => {
                if (
                  replayState.isReplaying &&
                  replayState.currentExploit?.id !== exploit.id
                ) {
                  return; // Don't allow clicking other exploits while one is replaying
                }
                console.log("Exploit card clicked:", exploit.name);
                startExploitReplay(exploit);
              }}
            >
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`px-2 py-1 rounded text-xs font-mono uppercase ${
                      exploit.exploitType === "reentrancy"
                        ? "bg-red-500/20 text-red-400"
                        : exploit.exploitType === "bridge"
                          ? "bg-purple-500/20 text-purple-400"
                          : exploit.exploitType === "flash_loan"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-gray-500/20 text-gray-400"
                    }`}
                  >
                    {exploit.exploitType.replace("_", " ")}
                  </div>
                  <div className="text-xs text-cyber-cyan/60">
                    {exploit.date}
                  </div>
                </div>
                <CardTitle className="text-lg text-cyber-cyan group-hover:text-white transition-colors">
                  {exploit.name}
                </CardTitle>
                <CardDescription className="text-sm text-cyber-cyan/60">
                  {exploit.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground">Total Loss:</span>
                    <div className="font-mono text-red-400 font-bold">
                      {exploit.totalLoss}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Transactions:</span>
                    <div className="font-mono text-cyber-cyan">
                      {exploit.transactions.length}
                    </div>
                  </div>
                </div>
                <div className="text-xs">
                  <span className="text-muted-foreground">Target:</span>
                  <div className="font-mono text-cyber-cyan/80 text-xs">
                    {exploit.targetContract.slice(0, 20)}...
                  </div>
                </div>

                {replayState.currentExploit?.id === exploit.id && (
                  <div className="border-t pt-3 mt-3">
                    <div className="flex items-center gap-2 text-xs text-cyber-cyan">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          replayState.isReplaying
                            ? "bg-cyber-cyan animate-pulse"
                            : "bg-yellow-500"
                        }`}
                      ></div>
                      <span>
                        {replayState.isReplaying
                          ? "REPLAYING LIVE"
                          : "SELECTED"}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Transaction {replayState.currentTransaction + 1} of{" "}
                      {exploit.transactions.length}
                    </div>
                    <div className="text-xs text-gray-400 mt-1 font-mono">
                      State: isReplaying={replayState.isReplaying.toString()}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Replay Control Panel */}
        {replayState.currentExploit && (
          <Card className="cyber-card-enhanced">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-cyber-cyan">
                  <Play className="w-5 h-5" />
                  EXPLOIT REPLAY - {replayState.currentExploit.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => changeReplaySpeed(0.5)}
                    className={
                      replayState.replaySpeed === 0.5 ? "bg-cyber-cyan/20" : ""
                    }
                  >
                    0.5x
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => changeReplaySpeed(1)}
                    className={
                      replayState.replaySpeed === 1 ? "bg-cyber-cyan/20" : ""
                    }
                  >
                    1x
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => changeReplaySpeed(2)}
                    className={
                      replayState.replaySpeed === 2 ? "bg-cyber-cyan/20" : ""
                    }
                  >
                    2x
                  </Button>
                  <Button size="sm" variant="ghost" onClick={stopReplay}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress Timeline */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Attack Progress</span>
                  <span className="font-mono">
                    {replayState.currentTransaction}/
                    {replayState.currentExploit.transactions.length}{" "}
                    transactions
                  </span>
                </div>
                <div className="w-full bg-black/50 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-red-500 to-cyber-cyan h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${(replayState.currentTransaction / replayState.currentExploit.transactions.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center gap-3">
                {replayState.isReplaying ? (
                  <Button onClick={pauseReplay} className="btn-secondary">
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </Button>
                ) : (
                  <Button onClick={resumeReplay} className="btn-primary">
                    <Play className="w-4 h-4 mr-2" />
                    Resume
                  </Button>
                )}
                <div className="text-sm text-cyber-cyan/60">
                  Speed: {replayState.replaySpeed}x
                </div>
              </div>

              {/* Current Transaction Display */}
              {replayState.currentExploit.transactions &&
                replayState.currentTransaction <
                  replayState.currentExploit.transactions.length &&
                replayState.currentExploit.transactions[
                  replayState.currentTransaction
                ] && (
                  <div className="space-y-4">
                    {/* Transaction Details */}
                    <div className="border border-cyber-cyan/30 rounded-lg p-4 bg-cyber-cyan/5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-cyber-cyan">
                          LIVE TRANSACTION
                        </span>
                      </div>
                      {(() => {
                        const tx =
                          replayState.currentExploit.transactions[
                            replayState.currentTransaction
                          ];
                        return (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">
                                  Hash:
                                </span>
                                <div className="font-mono text-xs text-cyber-cyan">
                                  {tx.hash}
                                </div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">
                                  Block:
                                </span>
                                <div className="font-mono text-xs">
                                  {tx.blockNumber.toLocaleString()}
                                </div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">
                                  Method:
                                </span>
                                <div className="font-mono text-xs text-red-400">
                                  {tx.method}
                                </div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">
                                  Value:
                                </span>
                                <div className="font-mono text-xs text-green-400">
                                  {tx.value}
                                </div>
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground text-sm">
                                Description:
                              </span>
                              <div className="text-sm mt-1">
                                {tx.description}
                              </div>
                            </div>
                            <div className="border-t border-cyber-cyan/20 pt-2">
                              <span className="text-muted-foreground text-sm">
                                Impact:
                              </span>
                              <div className="text-sm text-red-400 mt-1">
                                {tx.impact}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Terminal Simulation */}
                    {(() => {
                      const tx =
                        replayState.currentExploit.transactions[
                          replayState.currentTransaction
                        ];
                      return (
                        tx.terminalInput && (
                          <div className="border border-cyber-cyan/30 rounded-lg bg-black/90 overflow-hidden">
                            <div className="flex items-center gap-2 px-3 py-2 bg-cyber-cyan/10 border-b border-cyber-cyan/20">
                              <div className="flex gap-1">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                              </div>
                              <span className="text-xs font-mono text-cyber-cyan">
                                ATTACKER TERMINAL - {tx.timestamp}
                              </span>
                            </div>
                            <div className="p-4 font-mono text-sm space-y-2">
                              {/* Terminal Input */}
                              <div className="flex items-start gap-2">
                                <span className="text-green-400 flex-shrink-0">
                                  attacker@exploit:~$
                                </span>
                                <div className="text-white break-all">
                                  {tx.terminalInput}
                                </div>
                              </div>

                              {/* Terminal Output */}
                              {tx.terminalOutput && (
                                <div className="text-cyber-cyan/80 whitespace-pre-wrap pl-6 border-l-2 border-cyber-cyan/20">
                                  {tx.terminalOutput}
                                </div>
                              )}

                              {/* Blinking cursor */}
                              <div className="flex items-center gap-2 mt-3">
                                <span className="text-green-400">
                                  attacker@exploit:~$
                                </span>
                                <div className="w-2 h-4 bg-cyber-cyan animate-pulse"></div>
                              </div>
                            </div>
                          </div>
                        )
                      );
                    })()}
                  </div>
                )}

              {/* Attack Timeline */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-cyber-cyan">
                  Attack Timeline
                </h4>
                <div className="space-y-2 max-h-32 overflow-y-auto scrollbar-thin">
                  {replayState.currentExploit.timeline.map((event, index) => (
                    <div
                      key={index}
                      className={`text-xs p-2 rounded border-l-2 ${
                        index <= replayState.currentTransaction
                          ? "border-cyber-cyan bg-cyber-cyan/10 text-cyber-cyan"
                          : "border-gray-600 bg-gray-800/50 text-gray-400"
                      }`}
                    >
                      {event}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
