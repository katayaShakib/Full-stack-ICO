import {
  NFT_CONTRACT_ABI,
  NFT_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ABI,
  TOKEN_CONTRACT_ADDRESS,
} from "../constants";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Head from "next/head";
import { useEffect, useState } from "react";
import { formatEther, parseEther } from "viem/utils";
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
  const [loading, setLoading] = useState("");

  // tokensToBeClaimed keeps track of the number of tokens that can be claimed
  // based on the Crypto Dev NFT's held by the user for which they havent claimed the tokens
  const [tokensToBeClaimed, setTokensToBeClaimed] = useState(0);

  // amount of the tokens that the user wants to mint
  const [tokenAmount, setTokenAmount] = useState(0);

  // Fetch the owner of the DAO
  const owner = useContractRead({
    abi: TOKEN_CONTRACT_ABI,
    address: TOKEN_CONTRACT_ADDRESS,
    functionName: "owner",
  });

  // Fetch the balance of crypto devs token contract
  const CryptoDevTokenBalance = useBalance({
    address: TOKEN_CONTRACT_ADDRESS,
  });

  // Fetch the number of minted tokens
  const tokenTotalSupply = useContractRead({
    abi: TOKEN_CONTRACT_ABI,
    address: TOKEN_CONTRACT_ADDRESS,
    functionName: "totalSupply",
  });

  // Fetch the NFT balance of the user
  const nftBalanceOfUser = useContractRead({
    abi: NFT_CONTRACT_ABI,
    address: NFT_CONTRACT_ADDRESS,
    functionName: "balanceOf",
    args: [address],
  });

  // Fetch the token balance of the user
  const tokenBalanceOfUser = useContractRead({
    abi: TOKEN_CONTRACT_ABI,
    address: TOKEN_CONTRACT_ADDRESS,
    functionName: "balanceOf",
    args: [address],
  });

  // Function to fetch a token id of owner by index
  async function fetchTokenIdOfOwnerByIndex(i) {
    try {
      const tokenId = await readContract({
        address: NFT_CONTRACT_ADDRESS,
        abi: NFT_CONTRACT_ABI,
        functionName: "tokenOfOwnerByIndex",
        args: [address, i],
      });

      return tokenId;
    } catch (error) {
      console.error(error);
      window.alert(error);
    }
  }

  // Function to check wether a tokenId have been claimed
  async function isTokenClaimed(tokenId) {
    try {
      const cliamed = await readContract({
        address: TOKEN_CONTRACT_ADDRESS,
        abi: TOKEN_CONTRACT_ABI,
        functionName: "tokenIdsClaimed",
        args: [tokenId],
      });

      return cliamed;
    } catch (error) {
      console.error(error);
      window.alert(error);
    }
  }

  // Function to fetch all tokens to be claimed of owner
  async function fetchAllTokensToBeClaimed() {
    try {
      if (nftBalanceOfUser === 0) {
        setTokensToBeClaimed(0);
      } else {
        let tokensToBeClaimed = 0;

        for (let i = 0; i < nftBalanceOfUser.data; i++) {
          const tokenId = await fetchTokenIdOfOwnerByIndex(i);
          const claimed = await isTokenClaimed(tokenId);
          if (!claimed) {
            tokensToBeClaimed++;
          }
        }

        setTokensToBeClaimed(tokensToBeClaimed);
      }
    } catch (error) {
      console.error(error);
      window.alert(error);
    }
  }

  // Function to mint `amount` number of tokens to a given address
  async function mintCryptoDevToken(amount) {
    setLoading("mint");

    try {
      const value = 0.001 * amount;
      const tx = await writeContract({
        address: TOKEN_CONTRACT_ADDRESS,
        abi: TOKEN_CONTRACT_ABI,
        functionName: "mint",
        args: [amount],
        value: parseEther(value.toString()),
      });

      await waitForTransaction(tx);
    } catch (error) {
      console.error(error);
      window.alert(error);
    }
    setLoading("");
  }

  // Function for NFT holders to claim their free tokens
  async function claimCryptoDevToken(amount) {
    setLoading("claim");

    try {
      const tx = await writeContract({
        address: TOKEN_CONTRACT_ADDRESS,
        abi: TOKEN_CONTRACT_ABI,
        functionName: "claim",
        args: [],
      });

      await waitForTransaction(tx);
    } catch (error) {
      console.error(error);
      window.alert(error);
    }
    setLoading("");
  }

  // Function to withdraw all Ether from Crypto Dev Token contract
  async function withdrawEther() {
    setLoading("withdraw");
    try {
      const tx = await writeContract({
        address: TOKEN_CONTRACT_ADDRESS,
        abi: TOKEN_CONTRACT_ABI,
        functionName: "withdraw",
        args: [],
      });

      await waitForTransaction(tx);
    } catch (error) {
      console.error(error);
      window.alert(error);
    }
    setLoading("");
  }

  useEffect(() => {
    fetchAllTokensToBeClaimed();
  }, [address]);

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
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs ICO!</h1>
          <h2 className={styles.description}>
            You can claim or mint Crypto Dev tokens here
          </h2>
          <div>
            Overall{" "}
            {tokenTotalSupply && tokenTotalSupply.data
              ? formatEther(tokenTotalSupply.data).toString()
              : ""}
            /10000 have been minted!!!
          </div>
          <div className={styles.overflow}>
            Address of user {address ? address : ""}
          </div>
          <div>
            You have minted{" "}
            {tokenBalanceOfUser && tokenBalanceOfUser.data
              ? formatEther(tokenBalanceOfUser.data)
              : "0"}{" "}
            Crypto Dev Tokens
          </div>
          <div>
            NFT balance of user{" "}
            {nftBalanceOfUser && nftBalanceOfUser.data
              ? nftBalanceOfUser.data.toString()
              : "0"}
          </div>
          <div>
            Tokens to be claimed of user {tokensToBeClaimed * 10}{" "}
            {tokensToBeClaimed && tokensToBeClaimed > 0 ? (
              <div className={styles.inlineBlock}>
                {loading === "claim" ? (
                  <button className={styles.button}>Loading...</button>
                ) : (
                  <button
                    className={styles.button}
                    disabled={!(tokensToBeClaimed > 0)}
                    onClick={() => claimCryptoDevToken()}
                  >
                    Claim {tokensToBeClaimed * 10} Tokens
                  </button>
                )}
              </div>
            ) : (
              ""
            )}
          </div>
          <div>
            <input
              type="number"
              placeholder="Amount of Tokens"
              onChange={(e) => setTokenAmount(e.target.value)}
              className={styles.input}
            />{" "}
            {loading === "mint" ? (
              <button className={styles.button}>Loading...</button>
            ) : (
              <button
                className={styles.button}
                disabled={!(tokenAmount > 0)}
                onClick={() => mintCryptoDevToken(tokenAmount)}
              >
                Mint Tokens
              </button>
            )}
          </div>

          {/* Display the contract's balance and withdraw button if connected wallet is the owner */}
          {address && address.toLowerCase() === owner.data.toLowerCase() ? (
            <div>
              {loading === "withdraw" ? (
                <button className={styles.button}>Loading...</button>
              ) : (
                <div>
                  Crypto Devs Token contract balance{" "}
                  {CryptoDevTokenBalance && CryptoDevTokenBalance.data
                    ? formatEther(CryptoDevTokenBalance.data.value)
                    : "0"}
                  {" ETH "}
                  <button
                    className={styles.button}
                    disabled={
                      address.toLowerCase() != owner.data.toLowerCase() ||
                      !CryptoDevTokenBalance ||
                      !(formatEther(CryptoDevTokenBalance.data.value) > 0)
                    }
                    onClick={() => withdrawEther()}
                  >
                    Withdraw All Ether
                  </button>
                </div>
              )}
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
    </div>
  );
}
