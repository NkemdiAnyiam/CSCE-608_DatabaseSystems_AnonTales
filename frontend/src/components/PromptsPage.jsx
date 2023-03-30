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
        <div className="page page--prompts prompts-page">
            <h1 className="heading-primary">Prompts</h1>

            <section className="section section--genre-filters">
                <div className="container-fluid">
                    <form onChange={handleGenreFilterChange}>
                        <fieldset className="genres-fieldset">
                            <details className="genres-dropdown">
                                <summary>Genres</summary>
                                <div className="genres">
                                    {genres.map(({genre_name}) => (
                                    <label key={genre_name}>
                                        <input type="checkbox" name="genre_names" value={genre_name} />
                                        <span>{genre_name}</span>
                                    </label>
                                    ))}
                                </div>
                            </details>
                            
                        </fieldset>
                    </form>
                </div>
            </section>

            <section className="section section--prompts">
                {
                    (
                        genreFilters.length === 0 ?
                        prompts :
                        prompts.filter(prompt => prompt.genre_names && genreFilters.some(genre_name => prompt.genre_names.includes(genre_name)))
                    )
                    .map(item => (
                        <div className="container-fluid" key={item.prompt_id}>
                            <Prompt {...item} />
                        </div>
                    ))
                }
            </section>
        </div>
    );
}

export default PromptsPage;
