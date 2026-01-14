import Header from "./components/Header";
import PokeCard from "./components/PokeCard";
import SideNav from "./components/SideNav";
import Modal from "./components/Modal";
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

  const [showTeamModal, setShowTeamModal] = useState(false)
  const [team, setTeam] = useState(() => {
    const saved = localStorage.getItem("pokedex-team");
    return saved ? JSON.parse(saved) : [];
  })

  function handleToggleTeam(id) {
    if (team.includes(id)) {
        // remove
        const newTeam = team.filter(t => t !== id)
        setTeam(newTeam)
        localStorage.setItem('pokedex-team', JSON.stringify(newTeam))
    } else {
        // add if < 6
        if (team.length >= 6) { return }
        const newTeam = [...team, id]
        setTeam(newTeam)
        localStorage.setItem('pokedex-team', JSON.stringify(newTeam))
    }
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
      <Header handleToggleMenu={handleToggleMenu} handleToggleTeamModal={() => setShowTeamModal(true)} />
      <SideNav
        isSideMenuOpen={isSideMenuOpen}
        selectedPokemon={selectedPokemon}
        setSelectedPokemon={setSelectedPokemon}
        handleCloseMenu={handleCloseMenu}
        pokemonList={pokemonList}
        handleLoadGen2={handleLoadGen2}
        handleToggleTeamModal={() => setShowTeamModal(true)}
      />
      <PokeCard 
        selectedPokemon={selectedPokemon} 
        isFavorite={favorites.includes(selectedPokemon)}
        onToggleFavorite={() => handleToggleFavorite(selectedPokemon)}
        onToggleTeam={() => handleToggleTeam(selectedPokemon)}
        isInTeam={team.includes(selectedPokemon)}
        teamSize={team.length}
        setSelectedPokemon={setSelectedPokemon} // For evolution chain nav
      />
      {showTeamModal && (
        <Modal handleCloseModal={() => setShowTeamModal(false)}>
            {/* Team Content */}
            <h2 className="text-gradient">My Team</h2>
            <div className="team-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', padding: '1rem 0' }}>
                {team.map((memberId, index) => (
                   <div key={index} onClick={() => { setSelectedPokemon(memberId); setShowTeamModal(false) }} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', border: '1px solid var(--border-primary)', borderRadius: '0.5rem' }}>
                        <p>#{memberId + 1}</p>
                        <p><strong>{pokemonList[memberId]}</strong></p>
                        <button onClick={(e) => {
                            e.stopPropagation()
                            handleToggleTeam(memberId)
                        }} style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', background: 'var(--color-error, red)', color: 'white', border: 'none', borderRadius: '4px' }}>Remove</button>
                   </div> 
                ))}
                {team.length === 0 && <p>No Pokemon in team yet!</p>}
            </div>
        </Modal>
      )}
    </>
  );
}

export default App;
