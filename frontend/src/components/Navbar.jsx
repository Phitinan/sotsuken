import { Link } from "react-router-dom";
import { useState } from "react"; // ⬅️ IMPORT useState

const Navbar = ({ isAuthenticated, setIsAuthenticated }) => {
  // State to manage the open/close state of the burger menu
  const [isOpen, setIsOpen] = useState(false); // ⬅️ NEW STATE

  const handleClick = (e) => {
    localStorage.removeItem("user");
    setIsAuthenticated(false);
  };

  // Function to toggle the menu state
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Helper function to render the links, keeps JSX clean
  const renderLinks = () => {
    // Attempt to safely get user email
    const user = JSON.parse(localStorage.getItem("user"));
    const username = user ? user.name : "";

    if (isAuthenticated) {
      return (
        <div className="auth-info">
          <button onClick={handleClick}>ログアウト</button>
          <span>{username}</span>
        </div>
      );
    } else {
      return (
        <div>
          <Link to="/login">ログイン</Link>
          <Link to="/signup">メンバー登録</Link>
        </div>
      );
    }
  };

  return (
    <nav className="navbar">
      <Link to="/" onClick={() => setIsOpen(false)}>
        <h1>写真スポット</h1>
      </Link>

      {/* ⬅️ BURGER ICON BUTTON - Visible only on small screens */}
      <button className="menu-toggle" onClick={toggleMenu} aria-expanded={isOpen}>
        ☰ {/* Burger icon (or use an actual icon library) */}
      </button>

      {/* ⬅️ LINKS CONTAINER - Toggled by CSS or state for mobile */}
      <div className={`links ${isOpen ? 'active' : ''}`}>
        {renderLinks()}
      </div>
    </nav>
  );
};

export default Navbar;