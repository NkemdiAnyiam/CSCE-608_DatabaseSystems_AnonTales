import React, {useState, useEffect} from 'react';
import { Link } from 'react-router-dom';

import Story from '../components/Story';

function StoriesPage() {
    useEffect( () => {
        fetchItems();
    }, []);

    const [stories, setStories] = useState([]);
    const [genres, setGenres] = useState([]);
    const [genreFilters, setGenreFilters] = useState([]);
    const [dataLoaded, setDataLoaded] = useState(false);

    const fetchItems = async () => {
    const datas = await Promise.all(
        [fetch('/stories'),
        fetch('/genres')]
    );
    const stories = await datas[0].json();
    const genres = await datas[1].json();
    setStories(stories);
    setGenres(genres);
    setDataLoaded(true);
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

    if (!dataLoaded) {
    return <div>Loading stories...</div>
    }

    return(
        <section className="stories-page">
            <div className="container-fluid">
                <h1 className="mt-5">Stories</h1>
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

                <div className="stories">
                    {
                        (
                            genreFilters.length === 0 ?
                            stories :
                            stories.filter(story => story.genre_names && genreFilters.some(genre_name => story.genre_names.includes(genre_name)))
                        )
                        .map(item => (
                            <div key={item.story_id}>
                                <Link to={`/story/${item.story_id}`}>
                                    <Story {...item} />
                                </Link>
                            </div>
                        ))
                    }
                </div>
            </div>
        </section>
    );
}

export default StoriesPage;
