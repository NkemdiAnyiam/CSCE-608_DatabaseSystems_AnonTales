import React, {useState, useEffect} from 'react';
import { useHistory } from 'react-router-dom';

import Review from './Review';
import Story from './Story';

function StoryPage(props) {
  useEffect( () => {
      fetchItems();
  }, []);

  const [story, setStory] = useState([]);
  const [reviews, setReviews] = useState([]);
  const history = useHistory();

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

  const handleWriteReview = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const obj = {
        reviewFields: {story_id: props.story_id},
    };

    [...formData.entries()].forEach(([key, value]) => {
        if (key.startsWith('reviewFields.')) {
            obj.reviewFields[key.slice(key.indexOf('.')+1)] = value;
        }
    });

    fetch('/addReview', {method: 'POST', body: JSON.stringify(obj), headers:{'Content-Type':'application/json'}})
    .then(({ok}) => {
        ok && history.go(0);
    })
    .catch(err => {
        console.error(err);
    });
}

    return(
        <section className="story-page">
            <div className="container-fluid">
                <section className="section--story">
                    {story && <Story {...story} />}
                </section>

                <section className="section--write-review">
                  <form onSubmit={handleWriteReview}>
                    <div className="form-container">
                        <h2>Write a review</h2>
                        <textarea name="reviewFields.text_content" />
                        <button type="submit">Submit</button>
                    </div>
                  </form>
                </section>

                <section className="section--reviews">
                  <div className="reviews">
                  {
                    reviews.map((item) => (
                      <React.Fragment key={item.user_serial_no}>
                        <Review {...item} story_id={story.story_id} />
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
