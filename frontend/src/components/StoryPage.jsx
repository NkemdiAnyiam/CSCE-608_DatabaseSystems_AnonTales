import React, {useState, useEffect, useContext} from 'react';
import { useHistory } from 'react-router-dom';

import SerialNoContext from '../contexts/SerialNoContext';

import Review from './Review';
import StarRatings from './StarRatings';
import Story from './Story';
import LoadingIcon from './LoadingIcon';

function StoryPage(props) {
  const [story, setStory] = useState(null);
  const [myRating, setMyRating] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [loadingRating, setLoadingRating] = useState(false);
  const [reviewValue, setReviewValue] = useState('');
  const [uploadingReview, setUploadingReview] = useState(false);
  const [iHaveReview, setIHaveReview] = useState(false);
  const [storyIsMine, setStoryIsMine] = useState(true);
  const history = useHistory();
  const mySerialNo = useContext(SerialNoContext);

  useEffect( () => {
    fetchItems();
  }, []);

  useEffect( () => {
    if (story) {
      setMyRating(story.my_rating);
      setStoryIsMine(story.user_serial_no === mySerialNo);
    }
  }, [story]);

  const fetchItems = async () => {
      const datas = await Promise.all(
        [fetch('/story'    +`?story_id=${props.story_id}`),
        fetch('/reviews'  +`?story_id=${props.story_id}`)]
      );
      if (!datas[0].ok) {
        const err = await datas[0].json();
        alert(err);
        return;
      }
      if (!datas[1].ok) {
        const err = await datas[1].json();
        alert(err);
        return;
      }
      const story = (await datas[0].json())[0];
      const reviews = await datas[1].json();
      setStory(story);
      setReviews(reviews);
      setDataLoaded(true);
  };

  const handleWriteReview = (e) => {
    setUploadingReview(true);
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
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err);
        }

        const newReview = await res.json();
        setReviews([...reviews, newReview].sort((a,b) => a.publish_date >= b.publish_date ? -1 : 1));
        setIHaveReview(true);
      })
      .catch(err => {
          alert(err);
      })
      .finally(() => {
        setUploadingReview(false);
      });
  }

  const onDeleteStory = async () => {
    history.push('/my-stories');
  }

  const onDeleteReview = async () => {
    fetch('/deleteReview', {
      method: 'DELETE',
      body: JSON.stringify({
          reviewFields: {story_id: story.story_id}
      }),
      headers:{'Content-Type':'application/json'}
    })
    .then(async (res) => {
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err);
      }

      setReviews(reviews.filter(review => review.user_serial_no !== mySerialNo));
      setIHaveReview(false);
    })
    .catch(err => alert(err));
  }

  const handleChangeRating = (rating) => {
    setLoadingRating(true);

    const obj = {
      ratingFields: {
        story_id: story.story_id,
        rating
      }
    }
    
    const fetchWrapper = (fetchResult => {
      fetchResult.then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err);
        }

        const ratingData = await res.json();
        setStory({...story, ...ratingData});
        setLoadingRating(false);
      })
      .catch(err => {
        alert(err);
      });
    });

    if (!myRating) {
      fetchWrapper(fetch('/addRating', {method: 'POST', body: JSON.stringify(obj), headers:{'Content-Type':'application/json'}}));
    }
    else if (rating === myRating) {
      fetchWrapper(fetch('/deleteRating', {method: 'DELETE', body: JSON.stringify(obj), headers:{'Content-Type':'application/json'}}));
    }
    else {
      fetchWrapper(fetch('/updateRating', {method: 'PUT', body: JSON.stringify(obj), headers:{'Content-Type':'application/json'}}));
    }
  }

  if (!dataLoaded) {
    return (
      <div className="page page--story story-page">
        <LoadingIcon message={'Loading story'} />
      </div>
    )
  }

  return (
    <div className="page page--story story-page">
      <section className="section section--story">
        <div className={`container-fluid ${story.user_serial_no === mySerialNo ? 'container-fluid--gold' : ''}`}>
            <div className="story-container">
                <Story {...story} onDelete={onDeleteStory} expanded />
            </div>
            {
              !storyIsMine &&
              <div className="story-page__rate-story">
                  {
                    loadingRating ?
                    <p>Processing...</p> :
                    <>
                      <p>{myRating ? 'Your rating' : 'Rate story?'}</p>
                      <div className="story-page__star-ratings-container">
                            <StarRatings rating={myRating ?? 0} name="user-star-rating" onChangeRating={handleChangeRating} />
                      </div>
                    </>
                  }
              </div>
            }
        </div>
      </section>
      
      {
        !storyIsMine &&
        <section className="section section--write-review">
          <div className="container-fluid">
            {
              uploadingReview ?
              <LoadingIcon message={'Uploading review'} dark /> :
              <form className="write-review-form" onSubmit={handleWriteReview}>
                <div className="form-container">
                    <h2>Write a review</h2>
                    <textarea
                      name="reviewFields.text_content"
                      disabled={iHaveReview}
                      readOnly={iHaveReview}
                      value={reviewValue}
                      maxLength={500}
                      onChange={e => setReviewValue(e.target.value)}
                      required
                    />
                    {
                      iHaveReview ?
                      <button className="button button--red" type="button" onClick={() => onDeleteReview()}>Delete</button> :
                      <button className="button button--green" type="submit">Submit</button>
                    }
                </div>
              </form>
            }
            
          </div>
        </section>
      }

        
      <section className="section section--reviews">
        <div className="container-fluid">
          <h2>All reviews</h2>
          <div className="reviews">
          {
            reviews.length > 0 ?
            reviews.map((item) => (
              <React.Fragment key={item.user_serial_no}>
                <Review
                  {...item}
                  story_id={story.story_id}
                  deleteReview={onDeleteReview}
                  setIHaveReview={setIHaveReview}
                  setReviewValue={setReviewValue}
                />
              </React.Fragment>
            )) :
            'No reviews yet'
          }
          </div>
        </div>
      </section>
    </div>
  );
}

export default StoryPage;
