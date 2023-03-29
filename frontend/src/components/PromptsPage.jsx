import React, {useState, useEffect} from 'react';
import { Link } from 'react-router-dom';

import Prompt from './Prompt';

function PromptsPage() {
  useEffect( () => {
      fetchItems();
  }, []);

  const [prompts, setPrompts] = useState([]);
  const [genres, setGenres] = useState([]);
  const [genreFilters, setGenreFilters] = useState([]);

  const fetchItems = async () => {
    const datas = await Promise.all(
        [fetch('/prompts'),
        fetch('/genres')]
    );
    const prompts = await datas[0].json();
    console.log(prompts)
    const genres = await datas[1].json();
    setPrompts(prompts);
    setGenres(genres);
  };

  const handleGenreFilterChange = (e) => {
    const target_genre_name = e.target.value;
    if (e.target.checked)
        { setGenreFilters([...genreFilters, target_genre_name]) }
    else
        {
            const io = genreFilters.indexOf(target_genre_name);
            const newArr = [...genreFilters.slice(0, io), ...genreFilters.slice(io+1)];
            setGenreFilters(newArr);
        }
  }

    return(
        <section className="prompts-page">
            <div className="container-fluid">
                <h1 className="heading-primary">Prompts</h1>
                <form onChange={handleGenreFilterChange}>
                    <fieldset>
                        <legend>Genres</legend>
                        <details className="genres-dropdown">
                            <summary></summary>
                            <div className="genres">
                                {genres.map(({genre_name}) => (
                                <label key={genre_name}>
                                    {genre_name}
                                    <input type="checkbox" name="genre_names" value={genre_name} />
                                </label>
                                ))}
                            </div>
                        </details>
                        
                    </fieldset>
                </form>

                <div className="prompts">
                    {
                        (
                            genreFilters.length === 0 ?
                            prompts :
                            prompts.filter(prompt => prompt.genre_names && genreFilters.some(genre_name => prompt.genre_names.includes(genre_name)))
                        )
                        .map(item => (
                            <div key={item.prompt_id}>
                                <Prompt {...item} />
                            </div>
                        ))
                    }
                </div>
            </div>
        </section>
    );
}

export default PromptsPage;
