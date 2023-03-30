import React, {useState, useEffect} from 'react';
import { Link } from 'react-router-dom';

import Story from '../components/Story';
import StarRatings from './StarRatings';

function StoriesPage() {
    useEffect( () => {
        fetchItems();
    }, []);

    const [stories, setStories] = useState([]);
    const [genres, setGenres] = useState([]);
    const [genreFilters, setGenreFilters] = useState([]);
    const [ratingFilter, setRatingFilter] = useState([]);
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

    const handleRatingFilterChange = (e) => {
        const target_rating = Number.parseInt(e.target.value);
        setRatingFilter([target_rating])
    }
    
    const renderRatingFilter = (rating, showAndUp) => {
        return (
            <label key={rating}>
                <input type="radio" name="ratings" value={rating} />
                <StarRatings
                    disabled
                    rating={rating}
                />
                {showAndUp && <span>& up</span>}
            </label>
        )
    }

    if (!dataLoaded) {
    return <div>Loading stories...</div>
    }

    return(
        <div className="page page--stories stories-page">
            <h1 className="heading-primary">Stories</h1>

            <section className="section section--genre-filters">
                <div className="container-fluid">
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

                    <form onChange={handleRatingFilterChange}>
                        <fieldset className="filters-fieldset">
                            <details className="filters-dropdown">
                                <summary>Ratings</summary>
                                <div className="filters">
                                    <label key={0}>
                                        <input type="radio" name="ratings" value={0} />
                                        <span>All</span>
                                    </label>
                                    {renderRatingFilter(5)}
                                    {[4, 3, 2, 1].map((genre_name) => (
                                        renderRatingFilter(genre_name, true)
                                    ))}
                                </div>
                            </details>
                            
                        </fieldset>
                    </form>
                </div>
            </section>

            <section className="section section--stories">
                {
                    (
                        (
                        stories.filter(story => {
                            return (
                                genreFilters.length === 0
                                || story.genre_names && genreFilters.some(genre_name => story.genre_names.includes(genre_name))
                            ) && (
                                ratingFilter.length === 0
                                || story.avg_rating && story.avg_rating >= ratingFilter[0]
                            )
                        })
                        )
                    )
                    .map(item => (
                        <Link className="stories-page__story-link-wrapper" to={`/stories/${item.story_id}`}>
                            <div className="container-fluid" key={item.story_id}>
                                <Story {...item} />
                            </div>
                        </Link>
                    ))
                }
            </section>
        </div>
    );
}

export default StoriesPage;
