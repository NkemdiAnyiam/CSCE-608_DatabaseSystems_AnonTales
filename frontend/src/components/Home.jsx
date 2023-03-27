import React from 'react';
import { useHistory } from 'react-router-dom';

function Home() {
    const history = useHistory();

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const obj = {
            storyFields: {},
            genresArray: []
        };

        [...formData.entries()].forEach(([key, value]) => {
            if (key.startsWith('storyFields.')) {
                obj.storyFields[key.slice(key.indexOf('.')+1)] = value;
            }
            else {
                obj.genresArray.push({genre_name: value});
            }
        });

        fetch('/addStory', {method: 'POST', body: JSON.stringify(obj), headers:{'Content-Type':'application/json'}})
        .then(({ok}) => {
            ok && history.go(0);
        })
        .catch(err => {
            console.error(err);
        });
    }

    return(
        <section>
            <div className="container-fluid">
                <h1 className="mt-5">Anon Tales</h1>
                <p>This site was created using Node JS with React and MySQL.</p>
                <form method='POST' action='/addUser' onSubmit={(e) => e.preventDefault()}>
                    <button 
                        onClick={
                            () => fetch('/addUser', {method: 'POST'})
                                .then(({ok}) => ok && history.go(0))
                        }>
                        ADD SELF
                    </button>
                </form>
                <form onSubmit={handleSubmit}>
                    <div>
                        <div>
                            <input name="storyFields.title" type="text" />
                            <textarea name="storyFields.text_content" />
                            <fieldset>
                                <legend>Genres</legend>
                                <div>
                                    <label>
                                        Mystery
                                        <input type="checkbox" name="genre_names" value="mystery" />
                                    </label>
                                    <label>
                                        Horror
                                        <input type="checkbox" name="genre_names" value="horror" />
                                    </label>
                                </div>
                            </fieldset>
                            <button type="submit">Submit</button>
                        </div>
                    </div>
                </form>
            </div>
        </section>
    );
}

export default Home;