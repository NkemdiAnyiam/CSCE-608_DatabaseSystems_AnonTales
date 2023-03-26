import React, {useEffect, useState} from 'react';
// import {Link} from 'react-router-dom';

function Tweet() {
    useEffect( () => {
        fetchItems();
    }, []);

    const [items, setItems] = useState([]);

    const fetchItems = async () => {
        const data = await fetch('/tweets');
        const items = await data.json();
        setItems(items);
    };

    return(
        <section>
            
            <div className="container-fluid">
                <h1 className="mt-5">Tweets</h1>
                <form method="POST" action="/addTweet">
                    <div className="input-group justify-content-center">
                        <div className="input-group-prepend">
                            <input type="text" name="tweetInput" className="form-control" />
                            <input type="submit" value="Send" className="btn btn-primary mb-2" />
                        </div>
                    </div>
                </form>

                {
                items.map(item => (
                    <div className="row padding">
                        <div className="alert alert-info rounded-pill" role="alert">
                            <i className="fa fa-user mr-2"></i> <i>{item.fullname} ({item.username}): {item.tweet}</i>
                        </div>
                    </div>       
                ))
                }
            </div>
        </section>
    );
}

export default Tweet;