import {
  first151Pokemon,
  getFullPokedexNumber,
  getPokedexNumber,
} from "../utils";

import { useState } from "react";

export default function SideNav(props) {
  const {
    selectedPokemon,
    setSelectedPokemon,
    handleCloseMenu,
    isSideMenuOpen,
    pokemonList,
    handleLoadGen2,
  } = props;

  const [searchValue, setSearchValue] = useState("");

  const filteredPokemon = pokemonList.filter((ele, eleIndex) => {
    // if full pokedex number includes the current search value, return true
    if (getFullPokedexNumber(eleIndex).includes(searchValue)) {
      return true;
    }

    // if the pokemon name includes the current search value, return true
    if (ele.toLowerCase().includes(searchValue.toLowerCase())) {
      return true;
    }

    // otherwise, exclude value from the array
    return false;
  });

  return (
    <nav className={" " + (isSideMenuOpen ? " open" : "")}>
      <div className={"header " + (isSideMenuOpen ? " open" : "")}>
        <button onClick={handleCloseMenu} className="open-nav-button">
          <i className="fa-solid fa-arrow-left-long"></i>
        </button>
        <h1 className="text-gradient">Pokédex</h1>
      </div>
      <input
        placeholder="E.g. 001 or Bulba..."
        value={searchValue}
        onChange={(e) => {
          setSearchValue(e.target.value);
        }}
      />
      {filteredPokemon.map((pokemon, pokemonIndex) => {
        const truePokedexNumber = pokemonList.indexOf(pokemon);
        return (
          <button
            onClick={() => {
              setSelectedPokemon(truePokedexNumber);
              handleCloseMenu();
            }}
            key={pokemonIndex}
            className={
              "nav-card " +
              (truePokedexNumber === selectedPokemon ? " nav-card-selected" : " ")
            }
          >
            <p className="pokedex-card-name">
              {getFullPokedexNumber(truePokedexNumber)}
            </p>
            <p>{pokemon}</p>
          </button>
        );
      })}

      {pokemonList.length <= 151 && !searchValue && (
          <button 
            className="nav-card" 
            onClick={handleLoadGen2} 
            style={{justifyContent: 'center', margin: '1rem 0', fontWeight: 'bold', cursor: 'pointer', background: 'var(--background-secondary, #eee)'}}
          >
              Load Gen 2 (+100)
          </button>
      )}
    </nav>
  );
}
