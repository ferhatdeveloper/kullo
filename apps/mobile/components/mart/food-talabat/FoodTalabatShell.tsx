/**
 * Food Ana shell — Hub / List / Search views (Talabat IA).
 */
import { useState } from "react";

import { FoodTalabatHome } from "./FoodTalabatHome";
import { FoodTalabatList } from "./FoodTalabatList";
import { FoodTalabatSearch } from "./FoodTalabatSearch";

type View = "hub" | "list" | "search";

type Props = {
  onGoMarket?: () => void;
  onGoCart?: () => void;
};

export function FoodTalabatShell({ onGoMarket, onGoCart }: Props) {
  const [view, setView] = useState<View>("hub");
  const [searchFrom, setSearchFrom] = useState<View>("hub");

  const openSearch = (from: View) => {
    setSearchFrom(from);
    setView("search");
  };

  if (view === "search") {
    return (
      <FoodTalabatSearch
        onBack={() => setView(searchFrom === "search" ? "hub" : searchFrom)}
        onGoCart={onGoCart}
      />
    );
  }

  if (view === "list") {
    return (
      <FoodTalabatList
        onBack={() => setView("hub")}
        onGoCart={onGoCart}
        onOpenSearch={() => openSearch("list")}
      />
    );
  }

  return (
    <FoodTalabatHome
      onGoMarket={onGoMarket}
      onGoCart={onGoCart}
      onOpenFood={() => setView("list")}
      onOpenSearch={() => openSearch("hub")}
    />
  );
}
