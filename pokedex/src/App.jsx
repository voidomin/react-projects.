import Header from "./components/Header";
import PokeCard from "./components/PokeCard";
import SideNav from "./components/SideNav";
import { first151Pokemon } from "./utils";

import { useState } from "react";

function App() {
  const [selectedPokemon, setSelectedPokemon] = useState(0);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(true);
  const [pokemonList, setPokemonList] = useState(first151Pokemon);

  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("pokedex-favorites");
    return saved ? JSON.parse(saved) : [];
  });

  function handleToggleFavorite(id) {
    let newFavs;
    if (favorites.includes(id)) {
      newFavs = favorites.filter((f) => f !== id);
    } else {
      newFavs = [...favorites, id];
    }
    setFavorites(newFavs);
    localStorage.setItem("pokedex-favorites", JSON.stringify(newFavs));
  }

  function handleToggleMenu() {
    setIsSideMenuOpen(!isSideMenuOpen);
  }

  function handleCloseMenu() {
    setIsSideMenuOpen(false);
  }

  async function handleLoadGen2() {
      // prevent duplicates if already loaded
      if (pokemonList.length > 151) return;

      try {
          const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=100&offset=151");
          const data = await res.json();
          const newNames = data.results.map(p => {
              // capitalize
              return p.name.charAt(0).toUpperCase() + p.name.slice(1);
          });
          setPokemonList([...pokemonList, ...newNames]);
      } catch (err) {
          console.error(err);
      }
  }

  return (
    <>
      <Header handleToggleMenu={handleToggleMenu} />
      <SideNav
        isSideMenuOpen={isSideMenuOpen}
        selectedPokemon={selectedPokemon}
        setSelectedPokemon={setSelectedPokemon}
        handleCloseMenu={handleCloseMenu}
        pokemonList={pokemonList}
        handleLoadGen2={handleLoadGen2}
      />
      <PokeCard 
        selectedPokemon={selectedPokemon} 
        isFavorite={favorites.includes(selectedPokemon)}
        onToggleFavorite={() => handleToggleFavorite(selectedPokemon)}
        setSelectedPokemon={setSelectedPokemon} // For evolution chain nav
      />
    </>
  );
}

export default App;
