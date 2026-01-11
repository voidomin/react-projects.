import { useEffect, useState } from "react";
import { getFullPokedexNumber, getPokedexNumber } from "../utils";
import TypeCard from "./TypeCard";
import Modal from "./Modal";

export default function PokeCard(props) {
  const { selectedPokemon, onToggleFavorite, isFavorite, setSelectedPokemon } =
    props;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [skill, setSkill] = useState(null);
  const [loadingSkill, setLoadingSkill] = useState(false);
  const [evolution, setEvolution] = useState(null);
  const [combatInfo, setCombatInfo] = useState(null);

  const { name, height, abilities, stats, types, moves, sprites, weight, cries } =
    data || {};

  const imgList = Object.keys(sprites || {}).filter((val) => {
    if (!sprites[val]) {
      return false;
    }
    if (["versions", "other"].includes(val)) {
      return false;
    }
    return true;
  });

  async function fetchMoveData(move, moveUrl) {
    if (loadingSkill || !localStorage || !moveUrl) {
      return;
    }

    // check cache for move
    let c = {};
    if (localStorage.getItem("pokemon-moves")) {
      c = JSON.parse(localStorage.getItem("pokemon-moves"));
    }

    if (move in c) {
      setSkill(c[move]);
      
      return;
    }

    try {
      setLoadingSkill(true);
      const res = await fetch(moveUrl);
      const moveData = await res.json();
      
      const description = moveData?.flavor_text_entries.filter((val) => {
        return val.version_group.name == "firered-leafgreen";
      })[0]?.flavor_text;

      const skillData = {
        name: move,
        description,
      };
      setSkill(skillData);
      c[move] = skillData;
      localStorage.setItem("pokemon-moves", JSON.stringify(c));
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingSkill(false);
    }
  }

  useEffect(() => {
    // if loading, exit logic
    if (loading || !localStorage) {
      return;
    }
    // check if the selected pokemon information is available in the cache
    // 1. define the cache
    let cache = {};
    if (localStorage.getItem("pokedex")) {
      cache = JSON.parse(localStorage.getItem("pokedex"));
    }

    // 2. check if the selected pokemon is in the cache, otherwise fetch from the API

    if (selectedPokemon in cache) {
      //read from cache
      setData(cache[selectedPokemon]);
      
      return;
    }

    // we passed all the cache stuff to no avail and now need to fetch the data from the api

    async function fetchPokemonData() {
      setLoading(true);
      try {
        const baseUrl = "https://pokeapi.co/api/v2/";
        const suffix = "pokemon/" + getPokedexNumber(selectedPokemon);
        const finalUrl = baseUrl + suffix;
        const res = await fetch(finalUrl);
        const pokemonData = await res.json();
        setData(pokemonData);
        
        cache[selectedPokemon] = pokemonData;
        localStorage.setItem("pokedex", JSON.stringify(cache));
      } catch (err) {
        console.log(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPokemonData();

    // if we fetch from the api, make sure to save the information to the cache for next time
  }, [selectedPokemon]);

  // Fetch Evolution and Types
  useEffect(() => {
    if (!data) return;

    // fetch evolution
    async function fetchEvolution() {
      try {
        const speciesRes = await fetch(data.species.url);
        const speciesData = await speciesRes.json();
        
        const evoRes = await fetch(speciesData.evolution_chain.url);
        const evoData = await evoRes.json();

        // flatten
        let evoChain = [];
        let curr = evoData.chain;
        
        function extractEvo(node) {
            const id = node.species.url.split("/").filter(Boolean).pop();
            evoChain.push({ name: node.species.name, id: parseInt(id) });
            if (node.evolves_to.length > 0) {
                node.evolves_to.forEach(child => extractEvo(child));
            }
        }
        extractEvo(curr);
        setEvolution(evoChain);
      } catch (err) {
        console.error(err);
      }
    }
    
    // fetch combat info (types)
    async function fetchCombat() {
        if (!types) return;
        
        let damageMap = {}; // type -> multiplier
        
        // Init all types or dynamic?
        // Let's just track multipliers.
        
        for (const t of types) {
            const typeUrl = t.type.url;
            const res = await fetch(typeUrl);
            const typeData = await res.json();
            
            // double_damage_from
            typeData.damage_relations.double_damage_from.forEach(obj => {
                damageMap[obj.name] = (damageMap[obj.name] || 1) * 2;
            });
             // half_damage_from
            typeData.damage_relations.half_damage_from.forEach(obj => {
                damageMap[obj.name] = (damageMap[obj.name] || 1) * 0.5;
            });
             // no_damage_from
            typeData.damage_relations.no_damage_from.forEach(obj => {
                damageMap[obj.name] = (damageMap[obj.name] || 1) * 0;
            });
        }
        
        let weak = [];
        let resistant = [];
        for (const [type, mult] of Object.entries(damageMap)) {
            if (mult > 1) weak.push(type);
            if (mult < 1) resistant.push(type);
        }
        setCombatInfo({ weak, resistant });
    }

    fetchEvolution();
    fetchCombat();
  }, [data]);

  function playCry() {
      if (cries?.latest || cries?.legacy) {
          const audio = new Audio(cries.latest || cries.legacy);
          audio.volume = 0.2; // Not too loud
          audio.play();
      }
  }

  if (loading || !data) {
    return (
      <div>
        <h4>Loading...</h4>
      </div>
    );
  }

  return (
    <div className="poke-card">
      {skill && (
        <Modal
          handleCloseModal={() => {
            setSkill(null);
          }}
        >
          <div>
            <h6>Name</h6>
            <h2 className="skill-name">{skill.name.replaceAll("-", " ")}</h2>
          </div>
          <div>
            <h6>Description</h6>
            <p>{skill.description}</p>
          </div>
        </Modal>
      )}
      <div className="pokecard-header">
        <div>
            <h4>#{getFullPokedexNumber(selectedPokemon)}</h4>
            <h2>{name}</h2>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
            <button key="cry" onClick={playCry} className="header-icon-button" title="Play Cry">
                <i className="fa-solid fa-volume-high"></i>
            </button>
            <button key="fav" onClick={onToggleFavorite} className="header-icon-button" title="Toggle Favorite">
                <i className={isFavorite ? "fa-solid fa-heart" : "fa-regular fa-heart"} style={{ color: isFavorite ? 'red' : 'inherit' }}></i>
            </button>
        </div>
      </div>
      <div className="type-container">
        {types.map((typeObj, typeIndex) => {
          return <TypeCard key={typeIndex} type={typeObj?.type?.name} />;
        })}
      </div>
      <img
        className="default-img"
        src={
          sprites?.other?.dream_world?.front_default ||
          sprites?.other?.["official-artwork"]?.front_default
        }
        alt={`${name}-large-img`}
      />
      
       {/* Evolution Chain */}
       {evolution && (
        <>
            <h3>Evolution Chain</h3>
            <div className="evolution-container" style={{ display: 'flex', gap: '1rem', alignItems: 'center', overflowX: 'auto', padding: '10px 0' }}>
                {evolution.map((pokeObj, idx) => {
                     return (
                         <div key={idx} className="evolution-item" onClick={() => {
                             setSelectedPokemon(pokeObj.id - 1);
                         }} style={{ textAlign: 'center' }}>
                             <p>{pokeObj.name.replaceAll('-', ' ')}</p>
                         </div>
                     )
                })}
            </div>
        </>
      )}

      <div className="img-container">
        {imgList.map((spriteUrl, spriteIndex) => {
          const imgUrl = sprites[spriteUrl];
          return (
            <img
              key={spriteIndex}
              src={imgUrl}
              alt={`${name}-img-${spriteUrl}`}
            />
          );
        })}
      </div>
      <h3>About</h3>
      <div className="pokemon-data-container">
        <p>
          <b>Height: </b>
          {height / 10} m
        </p>
        <p>
          <b>Weight: </b>
          {weight / 10} kg
        </p>
        <p>
          <b>Abilities: </b>
          {abilities
            ?.map((val) => val.ability.name.replaceAll("-", " "))
            .join(", ")}
        </p>
      </div>

       {/* Combat Info */}
       {combatInfo && (
          <div className="pokemon-data-container">
            <p>
                 <b>Weak To: </b> 
                 {combatInfo.weak.length ? combatInfo.weak.join(', ') : 'None'}
            </p>
            <p>
                 <b>Resistant To: </b>
                 {combatInfo.resistant.length ? combatInfo.resistant.join(', ') : 'None'}
            </p>
          </div>
       )}

      <h3>Stats</h3>
      <div className="stats-card">
        {stats.map((statObj, statIndex) => {
          const { stat, base_stat } = statObj;
          return (
            <div key={statIndex} className="stat-item">
              <p>{stat?.name.replaceAll("-", " ")}</p>
              <h4>{base_stat}</h4>
            </div>
          );
        })}
      </div>
      <h3>Moves</h3>
      <div className="pokemon-move-grid">
        {moves.map((moveObj, moveIndex) => {
          return (
            <button
              className="button-card pokemon-move"
              key={moveIndex}
              onClick={() => {
                fetchMoveData(moveObj?.move?.name, moveObj?.move?.url);
              }}
            >
              <p>{moveObj?.move?.name.replaceAll("-", " ")}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
