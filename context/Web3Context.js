import { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import { UNISWAP_ROUTER_ABI } from "../constants/abis";
import { UNISWAP_ADDRESSES } from "../constants/addresses";

const Web3Context = createContext();

export function Web3Provider({ children }) {
  const [account, setAccount] = useState("");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [uniswapRouter, setUniswapRouter] = useState(null);
  const [network, setNetwork] = useState(null);

  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        // Request account access
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        const web3Signer = web3Provider.getSigner();

        // Initialize Uniswap Router with full ABI
        const router = new ethers.Contract(
          UNISWAP_ADDRESSES.V2_ROUTER,
          UNISWAP_ROUTER_ABI,
          web3Signer
        );

        setAccount(accounts[0]);
        setProvider(web3Provider);
        setSigner(web3Signer);
        setUniswapRouter(router);
        setNetwork(network);

        // Listen for account changes
        window.ethereum.on("accountsChanged", (accounts) => {
          setAccount(accounts[0]);
        });

        // Listen for chain changes
        window.ethereum.on("chainChanged", (chainId) => {
          window.location.reload();
        });
      } else {
        alert("Please install MetaMask!");
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  // Cleanup listeners on unmount
  useEffect(() => {
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", () => {});
        window.ethereum.removeListener("chainChanged", () => {});
      }
    };
  }, []);

  const value = {
    account,
    provider,
    signer,
    uniswapRouter,
    network,
    connectWallet,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}

export function useWeb3() {
  return useContext(Web3Context);
}
