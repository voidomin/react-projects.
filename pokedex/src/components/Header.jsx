export default function Header(props) {
  const { handleToggleMenu, handleToggleTeamModal } = props;
  return (
    <header>
      <button onClick={handleToggleMenu} className="open-nav-button">
        <i className="fa-solid fa-bars"></i>
      </button>
      <h1 className="text-gradient">Pokédex</h1>
      <button onClick={handleToggleTeamModal} className="open-nav-button" style={{ marginLeft: 'auto' }}>
          <i className="fa-solid fa-users"></i>
      </button>
    </header>
  );
}
