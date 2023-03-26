import React, {useState, useEffect} from 'react';

function Story({story_id, title, text_content, publish_date}) {
    return(
      <div className="story">
          <span>{title}; {new Date(publish_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          <div>{text_content}</div>
      </div> 
    );
}

export default Story;
