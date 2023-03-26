import React, {useState, useEffect} from 'react';

import Review from './Review';
import Story from './Story';

function StoryPage(props) {
  useEffect( () => {
    console.log(props.story_id)
      fetchItems();
  }, []);

  const [stories, setStories] = useState([]);
  const [reviews, setReviews] = useState([]);

  const fetchItems = async () => {
      const datas = await Promise.all(
        [fetch('/story'    +`?story_id=${props.story_id}`),
        fetch('/reviews'  +`?story_id=${props.story_id}`)]
      );
      const stories = await datas[0].json();
      const reviews = await datas[1].json();
      console.log(stories);
      console.log(reviews);
      setStories(stories);
      setReviews(reviews);
  };

    return(
        <section className="story-page">
            <div className="container-fluid">
                <section className="section--story">
                    <Story {...stories[0]} />
                </section>

                <section className="section--reviews">
                  <div className="reviews">
                  {
                    reviews.map((item) => (
                      <React.Fragment key={item.user_serial_no}>
                        <Review {...item} />
                      </React.Fragment>   
                    ))
                  }
                  </div>
                </section>
            </div>
        </section>
    );
}

export default StoryPage;
