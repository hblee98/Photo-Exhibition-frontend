import "./Sidebar.css";

const Sidebar = ({ regions , setSelectedRegion }) => {
  return (
    <div className="sidebar">
      <ul>
        <li
          onClick={() => setSelectedRegion(null)}
          style={{ cursor: "pointer", fontWeight: "bold" }}
        >
          All Regions
        </li>
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