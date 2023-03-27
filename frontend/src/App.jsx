import Nav from './components/Nav';
import Home from './components/Home';
import StoriesPage from './components/StoriesPage';
import StoryPage from './components/StoryPage';
import PromptsPage from './components/PromptsPage';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';

import './sass/main.scss';

function App() {
  return (
    <Router>
      <div className="app">
          <Nav />
          <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/stories" exact component={StoriesPage} />
            <Route path={`/story/:story_id`} render={({match: {params}}) => <StoryPage story_id={params.story_id}  />} />
            <Route path="/prompts" exact component={PromptsPage} />
          </Switch>
      </div>
    </Router>
  );
}

export default App;
