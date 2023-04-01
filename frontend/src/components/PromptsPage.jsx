import React, {useState, useEffect, useContext} from 'react';
import { Link } from 'react-router-dom';

import SerialNoContext from '../contexts/SerialNoContext';

import Prompt from './Prompt';
import LoadingIcon from './LoadingIcon';

function PromptsPage() {
  useEffect( () => {
      fetchItems();
  }, []);

  const [prompts, setPrompts] = useState([]);
  const [genres, setGenres] = useState([]);
  const [genreFilters, setGenreFilters] = useState([]);
  const [sortingMode, setSortingMode] = useState('Recent');
  const [dataLoaded, setDataLoaded] = useState(false);
  const mySerialNo = useContext(SerialNoContext);

  const fetchItems = async () => {
    const datas = await Promise.all(
        [fetch('/prompts'),
        fetch('/genres')]
    );
    const prompts = await datas[0].json();
    const genres = await datas[1].json();
    setPrompts(prompts);
    setGenres(genres);
    setDataLoaded(true);
  };

    const onDeletePrompt = async (prompt_id) => {
        let io = -1;
        prompts.find((prompt, index) => {
            if (prompt.prompt_id === prompt_id) { io = index; }
            return prompt.prompt_id === prompt_id;
        });
        const newArr = [...prompts.slice(0, io), ...prompts.slice(io+1)];
        setPrompts(newArr);
    }

  function getSortingFunc(sortMode) {
        switch(sortMode) {
            case 'Recent':
                return (promptA, promptB) => {
                    if (promptA.publish_date > promptB.publish_date) { return -1; }
                    else if (promptA.publish_date < promptB.publish_date) { return 1; }
                    else return promptA.text_content.toLowerCase() <= promptB.text_content.toLowerCase() ? -1 : 1;
                }
            case 'Oldest':
                return (promptA, promptB) => {
                    if (promptA.publish_date < promptB.publish_date) { return -1; }
                    else if (promptA.publish_date > promptB.publish_date) { return 1; }
                    else return promptA.text_content.toLowerCase() <= promptB.text_content.toLowerCase() ? -1 : 1;
                }
            default:
                throw new Error(`ERROR: Invalid sort mode ${sortMode}`);
        }
    }

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

    const handleSortByChange = (e) => {
        setSortingMode(e.target.value);
    }

    if (!dataLoaded) {
        return (
            <div className="page page--prompts prompts-page">
                <LoadingIcon message={'Loading prompts'} />
            </div>
        )
    }

    return(
        <div className="page page--prompts prompts-page">
            <h1 className="heading-primary">Prompts</h1>

            <section className="section section--filters">
                <div className="container-fluid container-fluid--white">
                    <form onChange={handleGenreFilterChange}>
                        <fieldset className="filters-fieldset">
                            <details className="filters-dropdown">
                                <summary>Genres</summary>
                                <div className="filters">
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

                    <form onChange={handleSortByChange}>
                        <fieldset className="filters-fieldset">
                            <details className="filters-dropdown">
                                <summary>Sort by</summary>
                                <div className="filters">
                                    <label>
                                        <input type="radio" name="sortPriority" value={'Recent'} defaultChecked />
                                        <span>Most recent</span>
                                    </label>
                                    <label>
                                        <input type="radio" name="sortPriority" value={'Oldest'} />
                                        <span>Oldest</span>
                                    </label>
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
                    .sort(getSortingFunc(sortingMode))
                    .map(item => (
                        <div className={`container-fluid ${item.user_serial_no === mySerialNo ? 'container-fluid--gold' : ''}`} key={item.prompt_id}>
                            <Prompt {...item} onDelete={onDeletePrompt} />
                        </div>
                    ))
                }
            </section>
        </div>
    );
}

export default PromptsPage;
