import { useState, useMemo } from "react";
import { TOKENS } from "../constants/addresses";

const TOKEN_CATEGORIES = {
  POPULAR: ["WETH", "USDT", "USDC", "DAI"],
  STABLECOINS: ["USDT", "USDC", "DAI", "BUSD"],
  DEFI: ["UNI", "AAVE", "LINK", "CRV", "COMP"],
  LAYER2: ["MATIC", "ARB", "OP"],
  GAMING: ["SAND", "MANA"],
  MEME: ["SHIB", "PEPE"],
  OTHER: ["MKR", "SNX", "GRT", "LDO", "RPL", "FXS"],
};

export default function TokenModal({
  isOpen,
  onClose,
  onSelect,
  excludeToken,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("POPULAR");

  // Filter tokens based on search and selected category
  const filteredTokens = useMemo(() => {
    const tokens = searchQuery
      ? Object.values(TOKENS).filter(
          (token) =>
            token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : TOKEN_CATEGORIES[activeCategory].map((symbol) => TOKENS[symbol]);

    // Exclude the token that's already selected in the other input
    return excludeToken
      ? tokens.filter((token) => token.address !== excludeToken.address)
      : tokens;
  }, [searchQuery, activeCategory, excludeToken]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#191B1F] rounded-3xl max-w-lg w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Select a token</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Search input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or paste address"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#212429] text-white p-4 pr-12 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#8A2BE2]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Categories */}
        {!searchQuery && (
          <div className="flex overflow-x-auto p-2 border-b border-gray-800 hide-scrollbar">
            {Object.keys(TOKEN_CATEGORIES).map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-xl whitespace-nowrap mr-2 ${
                  activeCategory === category
                    ? "bg-[#8A2BE2] text-white"
                    : "text-gray-400 hover:text-white hover:bg-[#212429]"
                }`}
              >
                {category.replace("_", " ")}
              </button>
            ))}
          </div>
        )}

        {/* Token list */}
        <div className="overflow-y-auto max-h-[400px] p-2">
          {filteredTokens.map((token) => (
            <button
              key={token.address}
              onClick={() => onSelect(token)}
              className="w-full flex items-center p-3 hover:bg-[#212429] rounded-2xl transition-colors"
            >
              <img
                src={`/tokens/${token.symbol.toLowerCase()}.svg`}
                alt={token.symbol}
                className="w-8 h-8 rounded-full mr-3"
                onError={(e) => {
                  e.target.src = "/tokens/theblockchaincoders.jpg";
                  e.target.onerror = null;
                }}
              />
              <div className="flex-1 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">{token.symbol}</span>
                  <span className="text-gray-400 text-sm">{token.name}</span>
                </div>
                <div className="text-sm text-gray-400">
                  {token.address.slice(0, 6)}...{token.address.slice(-4)}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
