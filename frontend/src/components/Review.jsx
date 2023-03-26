import React, {useState, useEffect} from 'react';
import { Link } from 'react-router-dom';

function Review({user_serial_number, text_content, publish_date, num_thumbs_up, num_thumbs_down}) {
  return(
    <div className="review">
        <div>{new Date(publish_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        <div>{text_content}</div>
        <div><span>{num_thumbs_up}</span> <span>{num_thumbs_down}</span></div>
    </div>
  );
}

export default Review;
