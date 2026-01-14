import {
  first151Pokemon,
  getFullPokedexNumber,
  getPokedexNumber,
  pokemonTypeColors
} from "../utils";

import { useState, useEffect } from "react";

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
  const [selectedType, setSelectedType] = useState('all')
  const [typeCache, setTypeCache] = useState({})
  const [isLoadingType, setIsLoadingType] = useState(false)

  useEffect(() => {
    if (selectedType === 'all' || typeCache[selectedType]) { return }
    async function fetchTypeData() {
        setIsLoadingType(true)
        try {
            const res = await fetch(`https://pokeapi.co/api/v2/type/${selectedType}`)
            const data = await res.json()
            const names = data.pokemon.map(p => p.pokemon.name)
            setTypeCache(prev => ({...prev, [selectedType]: names}))
        } catch (err) {
            console.log(err.message)
        } finally {
            setIsLoadingType(false)
        }
    }
    fetchTypeData()
  }, [selectedType])

  const filteredPokemon = pokemonList.filter((ele, eleIndex) => {
    const searchMatch = getFullPokedexNumber(eleIndex).includes(searchValue) || ele.toLowerCase().includes(searchValue.toLowerCase())
    
    if (!searchMatch) return false

    if (selectedType !== 'all') {
        if (isLoadingType) return false
        if (!typeCache[selectedType]) return false
        return typeCache[selectedType].includes(ele.toLowerCase())
    }
    return true
  });

  return (
    <nav className={" " + (isSideMenuOpen ? " open" : "")}>
      <div className={"header " + (isSideMenuOpen ? " open" : "")}>
        <button onClick={handleCloseMenu} className="open-nav-button only-mobile">
          <i className="fa-solid fa-arrow-left-long"></i>
        </button>
        <h1 className="text-gradient">Pokédex</h1>
        <button onClick={props.handleToggleTeamModal} className="open-nav-button" style={{ marginLeft: 'auto' }}>
            <i className="fa-solid fa-users"></i>
        </button>
      </div>
      <input
        placeholder="E.g. 001 or Bulba..."
        value={searchValue}
        onChange={(e) => {
          setSearchValue(e.target.value);
        }}
      />
      <div style={{ padding: '0.5rem 0' }}>
          <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #ccc' }}>
              <option value="all">All Types</option>
              {Object.keys(pokemonTypeColors).map(type => (
                  <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
              ))}
          </select>
      </div>
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
