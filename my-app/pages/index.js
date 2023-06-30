import {
  NFT_CONTRACT_ABI,
  NFT_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ABI,
  TOKEN_CONTRACT_ADDRESS,
} from "../constants";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Head from "next/head";
import { useEffect, useState } from "react";
import { formatEther } from "viem/utils";
import { useAccount, useBalance, useContractRead } from "wagmi";
import { readContract, waitForTransaction, writeContract } from "wagmi/actions";
import styles from "../styles/Home.module.css";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export default function Home() {
  // Check if the user's wallet is connected, and it's address using Wagmi's hooks.
  const { address, isConnected } = useAccount();

  // State variable to know if the component has been mounted yet or not
  const [isMounted, setIsMounted] = useState(false);

  // State variable to show loading state when waiting for a transaction to go through
  const [loading, setLoading] = useState(false);

  // tokensToBeClaimed keeps track of the number of tokens that can be claimed
  // based on the Crypto Dev NFT's held by the user for which they havent claimed the tokens
  const [tokensToBeClaimed, setTokensToBeClaimed] = useState(0);

  // balanceOfCryptoDevTokens keeps track of number of Crypto Dev tokens owned by an address
  const [balanceOfCryptoDevTokens, setBalanceOfCryptoDevTokens] = useState(0);
  // amount of the tokens that the user wants to mint
  const [tokenAmount, setTokenAmount] = useState(0);
  // tokensMinted is the total number of tokens that have been minted till now out of 10000(max total supply)
  const [tokensMinted, setTokensMinted] = useState(0);

  // Fetch the owner of the DAO
  const owner = useContractRead({
    abi: TOKEN_CONTRACT_ABI,
    address: TOKEN_CONTRACT_ADDRESS,
    functionName: "owner",
  });

  const nftBalanceOfUser = useContractRead({
    abi: NFT_CONTRACT_ABI,
    address: NFT_CONTRACT_ADDRESS,
    functionName: "balanceOf",
    args: [address],
  });

  // Function to fetch a token ...
  async function fetchtokenIdOfOwnerByIndex(i) {
    try {
      const tokenId = await readContract({
        address: CryptoDevsDAOAddress,
        abi: CryptoDevsDAOABI,
        functionName: "tokenOfOwnerByIndex",
        args: [address, i],
      });

      return tokenId;
    } catch (error) {
      console.error(error);
      window.alert(error);
    }
  }

  async function fetchtAllTokenIds() {
    try {
      const tokenId = await readContract({
        address: CryptoDevsDAOAddress,
        abi: CryptoDevsDAOABI,
        functionName: "tokenOfOwnerByIndex",
        args: [address, i],
      });

      return tokenId;
    } catch (error) {
      console.error(error);
      window.alert(error);
    }
  }

  /**
   * getTokensToBeClaimed: checks the balance of tokens that can be claimed by the user
   */
  // Fetch the CryptoDevs NFT balance of the user
  async function getTokensToBeClaimed() {
    nftBalanceOfUser === 0
      ? setTokensToBeClaimed(0)
      : fetchtokenIdOfOwnerByIndex();
  }

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  if (!isConnected)
    return (
      <div>
        <ConnectButton />
      </div>
    );

  return (
    <div className={inter.className}>
      <Head>
        <title>CryptoDevs DAO</title>
        <meta name="description" content="CryptoDevs DAO" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.main}>
        <div className={styles.flex}>
          <div>owner: {owner && owner.data ? owner.data.toString() : ""}</div>
          <div>Address of user: {address ? address : ""}</div>
          <div>NFT balance of user: {nftBalanceOfUser && nftBalanceOfUser.data ? nftBalanceOfUser.data.toString() : ""}</div>
        </div>
      </div>
    </div>
  );
}
