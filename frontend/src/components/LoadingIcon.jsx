import React from 'react';
import Logo from './Logo';



function LoadingIcon({message, dark}) {
  return (
    <div className={`loading-icon ${dark ? 'loading-icon--dark' : ''}`}>
      <Logo /> {message}...
    </div>
  )
}

export default LoadingIcon;
