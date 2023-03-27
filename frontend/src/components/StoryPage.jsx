import React, {useState, useEffect} from 'react';

import Review from './Review';
import Story from './Story';

function StoryPage(props) {
  useEffect( () => {
      fetchItems();
  }, []);

  const [story, setStory] = useState([]);
  const [reviews, setReviews] = useState([]);

  const fetchItems = async () => {
      const datas = await Promise.all(
        [fetch('/story'    +`?story_id=${props.story_id}`),
        fetch('/reviews'  +`?story_id=${props.story_id}`)]
      );
      const story = (await datas[0].json())[0];
      const reviews = await datas[1].json();
      setStory(story);
      setReviews(reviews);
  };

    return(
        <section className="story-page">
            <div className="container-fluid">
                <section className="section--story">
                    {story && <Story {...story} />}
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
