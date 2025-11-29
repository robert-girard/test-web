import { NavLink } from 'react-router-dom'
import './Navigation.css'

function Navigation() {
  return (
    <nav className="navigation">
      <div className="nav-container">
        <h2 className="nav-title">CAN Analysis Tool</h2>
        <div className="nav-tabs">
          <NavLink
            to="/"
            className={({ isActive }) => isActive ? 'nav-tab active' : 'nav-tab'}
            end
          >
            Input
          </NavLink>
          <NavLink
            to="/table"
            className={({ isActive }) => isActive ? 'nav-tab active' : 'nav-tab'}
          >
            Table View
          </NavLink>
          <NavLink
            to="/plots"
            className={({ isActive }) => isActive ? 'nav-tab active' : 'nav-tab'}
          >
            Plots
          </NavLink>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
