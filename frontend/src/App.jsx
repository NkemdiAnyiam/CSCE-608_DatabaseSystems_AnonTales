import React, {useState, useEffect} from 'react';

import { SerialNoProvider } from './contexts/SerialNoContext';

import Nav from './components/Nav';
import HomePage from './components/HomePage';
import MyStoriesPage from './components/MyStoriesPage';
import StoriesPage from './components/StoriesPage';
import StoryPage from './components/StoryPage';
import MyPrompsPage from './components/MyPrompsPage';
import PromptsPage from './components/PromptsPage';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';

import './sass/main.scss';

function App() {
  useEffect(async () => {
    const {serial_no} = await(await fetch('/serialNo')).json();
    const userExists = await(await(fetch('/userExists'))).json();
    userExists && setMySerialNo(serial_no);
    setDataLoaded(true);
  }, []);

  const [mySerialNo, setMySerialNo] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  if (!dataLoaded) {
    return <div>Loading...</div>
  }

  return (
    <SerialNoProvider value={mySerialNo}>
      <Router>
        <div className="app">
            <Nav />
            <Switch>
              <Route path="/" exact component={HomePage} />
              <Route path="/my-stories" exact component={MyStoriesPage} />
              <Route path={`/stories/:story_id`} render={({match: {params}}) => <StoryPage story_id={params.story_id}  />} />
              <Route path="/stories" exact component={StoriesPage} />
              <Route path="/MY-prompts" exact component={MyPrompsPage} />
              <Route path="/prompts" exact component={PromptsPage} />
            </Switch>
        </div>
      </Router>
    </SerialNoProvider>
  );
}

export default App;
