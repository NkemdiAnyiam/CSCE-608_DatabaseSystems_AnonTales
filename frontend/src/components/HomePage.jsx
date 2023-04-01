import React, { useContext, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import SerialNoContext from '../contexts/SerialNoContext';

function HomePage() {
    const history = useHistory();
    const mySerialNo = useContext(SerialNoContext);
    const [genres, setGenres] = useState(null);
    const [dataLoaded, setDataLoaded] = useState(false);

    useEffect(async () => {
        await fetchItems();
        setDataLoaded(true);
    }, []);

    const fetchItems = async () => {
        const data = await fetch('/genres');
        const genres = await data.json();
        setGenres(genres);
    }

    const handleSubmit = (e, fieldPrefix, route) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const obj = {
            [fieldPrefix]: {},
            genresArray: []
        };

        [...formData.entries()].forEach(([key, value]) => {
            if (key.startsWith(fieldPrefix+'.')) {
                obj[fieldPrefix][key.slice(key.indexOf('.')+1)] = value;
            }
            else {
                obj.genresArray.push({genre_name: value});
            }
        });

        fetch(route, {method: 'POST', body: JSON.stringify(obj), headers:{'Content-Type':'application/json'}})
        .then(({ok}) => {
            ok && history.go(0);
        })
        .catch(err => {
            console.error(err);
        });
    }

    const renderStoryForm = () => {
        return (
            <form onSubmit={(e) => {handleSubmit(e, 'storyFields', '/addStory')}} className="form form--add-story">
                <div className="form-container form-container--story">
                    <h2>Tell a story</h2>
                    <label>
                        <span>Title</span>
                        <input name="storyFields.title" type="text" maxLength={100} required />
                    </label>
                    <label>
                        <span>Story</span>
                        <textarea name="storyFields.text_content" maxLength={5000} required />
                    </label>
                    <fieldset className="genres-fieldset">
                        <details>
                        <summary>Genres</summary>
                        <div className="genres">
                            {genres.map(({genre_name}) => (
                                <label key={genre_name} className='checkbox'>
                                    <input type="checkbox" name="genre_names" value={genre_name} />
                                    <span>{genre_name}</span>
                                </label>
                            ))}
                        </div>
                        </details>
                    </fieldset>
                    <button className={`button button--green`} type="submit">Publish    </button>
                </div>
            </form>
        );
    }

    const renderPromptForm = () => {
        return (
            <form onSubmit={(e) => handleSubmit(e, 'promptFields', '/addPrompt')} className="form form--add-prompt">
                <div className='form-container form-container--prompt'>
                <h2>Submit a prompt</h2>
                    <label>
                        <span>Entry</span>
                        <textarea name="promptFields.text_content" maxLength={5000} required />
                    </label>
                    <fieldset className="genres-fieldset">
                        <details>
                            <summary>Genres</summary>
                            <div className="genres">
                                {genres.map(({genre_name}) => (
                                    <label key={genre_name}>
                                        <input type="checkbox" name="genre_names" value={genre_name} />
                                        {genre_name}
                                    </label>
                                ))}
                            </div>
                        </details>
                    </fieldset>
                    <button className="button button--green" type="submit">Submit</button>
                </div>
            </form>
        );
    }

    return (
        <div className="page page--home home-page">
            <h1 className="heading-primary">Anon Tales</h1>
            <p className="subheading">Anonymous tales from the internet</p>
            {
                mySerialNo ?
                <>
                    <section className="section section--story-form">
                        <div className="container-fluid">
                        {
                            genres ?
                            renderStoryForm() :
                            <p>Loading story form...</p>
                        }
                        </div>
                    </section>

                    <section className="section section--prompt-form">
                        <div className="container-fluid">
                            {
                                genres ?
                                renderPromptForm() :
                                <p>Loading prompt form...</p>
                            }
                        </div>
                    </section>
                </> :
                <div className="cta"><span>Join Anon Tales to contribute.</span> <span>It's completely anonymous!</span></div>
            }
        </div>
    );
}

export default HomePage;