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
    if (e.target.checked)
        { setGenreFilters([...genreFilters, e.target.value].sort((a, b) => a <= b ? -1 : 1)) }
    else
        { setGenreFilters(genreFilters.filter((genre_name) => genre_name !== e.target.value)) }
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
                    prompts
                        .filter(prompt => genreFilters.length === 0 || prompt.genre_names?.split(',')?.some(genre_name => genreFilters.includes(genre_name)))
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
