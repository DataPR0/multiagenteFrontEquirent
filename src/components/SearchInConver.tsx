import  {useState } from 'react';
import '../styles/SearchInCover.css';

interface Props {
  setSearchConver: React.Dispatch<React.SetStateAction<string>>;
}

const SearchInConver: React.FC<Props> = ({setSearchConver}) => {

  const [inputSearch,setInputSearch] = useState('');

  const validateInput = (e: any) => {
    const inputSearchInput= e.target.value;
    setInputSearch(inputSearchInput);
    setSearchConver(inputSearchInput);
  }

  return (
    <div className='containerInput'>
      <input
        type="text"
        value={inputSearch}
        onChange={validateInput} 
        placeholder="Buscar palabra"
        className='searchInCover'
      />
    </div>
  );
};

export default SearchInConver;