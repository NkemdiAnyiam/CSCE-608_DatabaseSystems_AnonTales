import React, {useState, useEffect} from 'react';
import { Link } from 'react-router-dom';

import Story from './Story';

function StoriesPage() {
  useEffect( () => {
      fetchItems();
  }, []);

  const [items, setItems] = useState([]);

  const fetchItems = async () => {
      const data = await fetch('/stories');
      const items = await data.json();
      console.log(items);
      setItems(items);
  };

    return(
        <section>
            <div className="container-fluid">
                <h1 className="mt-5">Stories</h1>
                <form method="POST" action="/addStory">
                    <div className="input-group justify-content-center">
                        <div className="input-group-prepend">
                            <input type="text" name="tweetInput" className="form-control" />
                            <input type="submit" value="Send" className="btn btn-primary mb-2" />
                        </div>
                    </div>
                </form>

                <div className="stories">
                    {
                    items.map(item => (
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
