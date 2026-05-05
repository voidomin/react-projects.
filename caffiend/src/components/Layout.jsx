import { useState } from "react";
import Authentication from "./Authentication";
import Modal from "./Modal";
import { useAuth } from "../context/auth";
import PropTypes from "prop-types";

export default function Layout({ children }) {
  const [showModal, setShowModal] = useState(false);

  const { globalUser, logout } = useAuth();

  const header = (
    <header>
      <div>
        <h1 className="text-gradient">CAFFIEND</h1>
        <p>For Coffee Insatiates</p>
      </div>
      {globalUser ? (
        <button onClick={logout}>
          <p>Logout</p>
        </button>
      ) : (
        <button
          onClick={() => {
            setShowModal(true);
          }}
        >
          <p>Sign up free</p>
          <i className="fa-solid fa-mug-hot"></i>
        </button>
      )}
    </header>
  );

  const footer = (
    <footer>
      <p>
        <span className="text-gradient">Caffiend</span> was made by{" "}
        <a target="_blank" href="https://voidomin.github.io/resume-website/">
          Akash
        </a>{" "}
        <br />
        using the{" "}
        <a href="https://www.fantacss.smoljames.com" target="_blank">
          FantaCSS
        </a>{" "}
        design library.
        <br />
        Check out the project on{" "}
        <a
          target="_blank"
          rel="noreferrer"
          href="https://github.com/voidomin/react-projects."
        >
          GitHub
        </a>
        !
      </p>
    </footer>
  );

  function handleCloseModal() {
    setShowModal(false);
  }

  return (
    <>
      {showModal && (
        <Modal handleCloseModal={handleCloseModal}>
          <Authentication handleCloseModal={handleCloseModal} />
        </Modal>
      )}
      {header}
      <main>{children}</main>
      {footer}
    </>
  );
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};
