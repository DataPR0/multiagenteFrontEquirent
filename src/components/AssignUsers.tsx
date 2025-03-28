import { useState } from 'react'; 


export const AssignUsers = () => {

  const agents = [{name:"Pablo"}, {name:"Samuel"}, {name:"Camila"}];

  const [allAdvisors] = useState<{name:string}[]>(agents);
  const [selectedAdvisors, setSelectedAdvisors] = useState<string[]>([]); 
  const [showDropdown, setShowDropdown] = useState(false);

  const handleAdvisorCheck = (e: any) => {
    const advisorName:string = e.target.value;
    if (e.target.checked) {
      setSelectedAdvisors([...selectedAdvisors, advisorName]);
    } else {
      setSelectedAdvisors(selectedAdvisors.filter((name) => name !== advisorName));
    }
  }

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <>
    <div>
      <h1> Asignar Asesores.</h1>
        <div>
            <button onClick={toggleDropdown}>Seleccionar asesor </button>
            {showDropdown && (
              allAdvisors.map((advisor) => (
                <div >
                  <input
                  type="checkbox"
                  value={advisor.name}
                  checked={selectedAdvisors.includes(advisor.name)}
                  onChange={handleAdvisorCheck}
                  />
                  <label>{advisor.name}</label>
                </div>
              ))
            )}
        </div>
    </div>  
    </>
  )
}
