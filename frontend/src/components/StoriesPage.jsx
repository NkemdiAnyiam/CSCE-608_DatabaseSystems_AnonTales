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

  const fetchItems = async () => {
    const datas = await Promise.all(
        [fetch('/stories'),
        fetch('/genres')]
    );
    const stories = await datas[0].json();
    // console.log(stories)
    const genres = await datas[1].json();
    setStories(stories);
    setGenres(genres);
  };

  const handleGenreFilterChange = (e) => {
    if (e.target.checked)
        { setGenreFilters([...genreFilters, e.target.value].sort((a, b) => a <= b)) }
    else
        { setGenreFilters(genreFilters.filter((genre_name) => genre_name !== e.target.value)) }
  }

    return(
        <section className="stories-page">
            <div className="container-fluid">
                <h1 className="mt-5">Stories</h1>
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

                <div className="stories">
                    {
                    stories
                        .filter(story => genreFilters.length === 0 || story.genre_names?.split(',')?.some(genre_name => genreFilters.includes(genre_name)))
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
