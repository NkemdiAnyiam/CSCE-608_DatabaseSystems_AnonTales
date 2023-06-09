import React, { useContext, useState, useEffect } from 'react';

import SerialNoContext from '../contexts/SerialNoContext';

import Logo from './Logo';
import LoadingIcon from './LoadingIcon';

function HomePage() {
    const mySerialNo = useContext(SerialNoContext);
    const [genres, setGenres] = useState(null);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [submittingStory, setSubmittingStory] = useState(false);
    const [submittingPrompt, setSubmittingPrompt] = useState(false);

    useEffect(() => {
        (async () => {
            await fetchItems();
            setDataLoaded(true);
        })();
    }, []);

    const fetchItems = async () => {
        const data = await fetch('/genres');
        if (!data.ok) {
            const err = await data.json();
            alert(err);
            return;
        }
        
        const genres = await data.json();
        setGenres(genres);
    }

    const handleSubmit = (e, fieldPrefix, route) => {
        e.preventDefault();
        const hookFunc = fieldPrefix === 'storyFields' ? setSubmittingStory : setSubmittingPrompt;
        hookFunc(true);
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
        .then(async (res) => {
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err);
            }
        })
        .catch(err => {
            alert(err);
        })
        .finally(() => {
            hookFunc(false);
        });
    }

    const renderStoryForm = () => {
        return (
            <form onSubmit={(e) => {handleSubmit(e, 'storyFields', '/addStory')}} className="form form--add-story">
                <div className="form-container form-container--story">
                    <h2>Tell a story</h2>
                    {
                        submittingStory ?
                        <LoadingIcon message={'Publishing story'} dark /> :
                        <>
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
                            <button className={`button button--green`} type="submit">Publish</button>
                        </>
                    }
                </div>
            </form>
        );
    }

    const renderPromptForm = () => {
        return (
            <form onSubmit={(e) => handleSubmit(e, 'promptFields', '/addPrompt')} className="form form--add-prompt">
                <div className='form-container form-container--prompt'>
                <h2>Submit a prompt</h2>
                {
                    submittingPrompt ?
                    <LoadingIcon message={'Submitting prompt'} dark /> :
                    <>
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
                                            <input type="checkbox" name="genre_names" value={genre_name} maxLength={300} />
                                            {genre_name}
                                        </label>
                                    ))}
                                </div>
                            </details>
                        </fieldset>
                        <button className="button button--green" type="submit">Submit</button>
                    </>
                }
                </div>
            </form>
        );
    }

    if (!dataLoaded) {
        return (
            <div className="page page--home home-page">
                <LoadingIcon message={'Loading forms'} />
            </div>
        )
    }

    return (
        <div className="page page--home home-page">
            <header className="header">
                <h1 className="heading-primary">Anon Tales</h1>
                <Logo />
            </header>
            <p className="subheading">Anonymous tales from the internet</p>
            {
                mySerialNo ?
                <>
                    <section className="section section--story-form">
                        <div className="container-fluid">
                        {
                            genres ?
                            renderStoryForm() :
                            <LoadingIcon message={'Loading story form'} dark />
                        }
                        </div>
                    </section>

                    <section className="section section--prompt-form">
                        <div className="container-fluid">
                            {
                                genres ?
                                renderPromptForm() :
                            <LoadingIcon message={'Loading prompt form'} dark />
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