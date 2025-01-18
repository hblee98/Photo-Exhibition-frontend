import "./Sidebar.css";

const Sidebar = ({ regions, setSelectedRegion }) => {
  return (
    <div className="sidebar">
      <h3>Regions</h3>
      <ul>
        {regions.map((region, index) => (
          <li
            key={index}
            onClick={() => setSelectedRegion(region)} 
            style={{ cursor: "pointer" }} 
          >
            {region}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
