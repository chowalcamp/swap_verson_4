import { useState } from "react";
import { useWeb3 } from "../context/Web3Context";
import { ethers } from "ethers";
import { ERC20_ABI } from "../constants/abis";
import SwapCard from "../components/SwapCard";
import { TOKENS } from "../constants/addresses";

export default function Home() {
  const { provider, account, uniswapRouter, connectWallet, signer, network } =
    useWeb3();
  const [sellAmount, setSellAmount] = useState("0");
  const [buyAmount, setBuyAmount] = useState("0");
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); // 'in' or 'out'
  const [selectedTokenIn, setSelectedTokenIn] = useState(TOKENS.WETH);
  const [selectedTokenOut, setSelectedTokenOut] = useState(null);

  console.log(account);

  const handleTokenSelect = (token) => {
    if (modalType === "in") {
      setSelectedTokenIn(token);
    } else {
      setSelectedTokenOut(token);
    }
  };

  const openTokenModal = (type) => {
    setModalType(type);
    setIsTokenModalOpen(true);
  };

  const handleSwap = async () => {
    if (!account) {
      connectWallet();
      return;
    }

    if (!selectedTokenOut) {
      alert("Please select a token to swap to");
      return;
    }

    if (!sellAmount || parseFloat(sellAmount) <= 0) {
      alert("Please enter an amount to swap");
      return;
    }

    setIsLoading(true);

    try {
      // Convert amount to Wei
      const amountIn = ethers.utils.parseEther(sellAmount);
      const amountOutMin = ethers.utils.parseEther(buyAmount || "0");

      // Create the token path for the swap
      const path = [
        selectedTokenIn.address || WETH_ADDRESS,
        selectedTokenOut.address,
      ];

      // Get expected output amount
      const expectedOutput = await getSwapQuote(amountIn, path);

      // If input token is not ETH, check and approve if necessary
      if (selectedTokenIn.address) {
        const hasAllowance = await checkAllowance(
          selectedTokenIn.address,
          amountIn
        );
        if (!hasAllowance) {
          const approved = await approveToken(
            selectedTokenIn.address,
            amountIn
          );
          if (!approved) {
            throw new Error("Token approval failed");
          }
        }
      }

      // Execute the swap
      let tx;
      if (!selectedTokenIn.address) {
        // Swapping ETH for tokens
        tx = await uniswapRouter.swapExactETHForTokens(
          amountOutMin,
          path,
          account,
          Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes deadline
          { value: amountIn }
        );
      } else {
        // Swapping tokens for tokens
        tx = await uniswapRouter.swapExactTokensForTokens(
          amountIn,
          amountOutMin,
          path,
          account,
          Math.floor(Date.now() / 1000) + 60 * 20 // 20 minutes deadline
        );
      }

      await tx.wait();

      // Show success message
      const successMessage = document.createElement("div");
      successMessage.className =
        "fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg";
      successMessage.textContent = "Swap completed successfully!";
      document.body.appendChild(successMessage);
      setTimeout(() => successMessage.remove(), 5000);

      // Reset form
      setSellAmount("0");
      setBuyAmount("0");
      setIsLoading(false);
    } catch (error) {
      console.error("Error during swap:", error);

      // Show error message
      const errorMessage = document.createElement("div");
      errorMessage.className =
        "fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg";
      errorMessage.textContent =
        error.reason || "Swap failed. Please try again.";
      document.body.appendChild(errorMessage);
      setTimeout(() => errorMessage.remove(), 5000);

      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#191B1F] text-white">
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-6">
          <div className="flex items-center">
            <img src="/swap.jpg" alt="Uniswap Logo" className="h-8 w-8" />
            <span className="ml-2 text-xl font-medium">Swap</span>
          </div>
          <div className="flex space-x-6 text-gray-400">
            <button className="hover:text-white">Trade</button>
            <button className="hover:text-white hidden md:block lg:block">
              Explore
            </button>
            <button className="hover:text-white hidden md:block lg:block">
              Pool
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 rounded-full bg-[#191B1F] border border-gray-600 hover:border-gray-400">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 10h.01M15 10h.01M9 14h6"
              />
            </svg>
          </button>

          {!account ? (
            <button
              onClick={connectWallet}
              className="px-4 py-2 bg-[#8A2BE2] rounded-full hover:bg-opacity-90 transition-colors"
            >
              Connect
            </button>
          ) : (
            <button className="px-4 py-2 bg-[#212429] rounded-full">
              {account.slice(0, 6)}...{account.slice(-4)}
            </button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-[480px] mx-auto mt-20">
        {/* <h1 className="text-6xl font-bold text-center mb-8">
          Swap anytime,
          <br />
          anywhere.
        </h1> */}
        <div className="bg-[#212429] rounded-3xl p-4 shadow-lg">
          {/* Swap Card */}
          <div className=" bg-[#191B1F] p-4 ">
            <SwapCard
              provider={provider}
              account={account}
              uniswapRouter={uniswapRouter}
              signer={signer}
              network={network}
            />
          </div>
        </div>

        {/* Bottom Text */}
        <p className="text-center text-gray-400 mt-6">
          The largest onchain marketplace. Buy and sell crypto
          <br />
          on Ethereum and 11+ other chains.
        </p>
      </main>
    </div>
  );
}
