//import logo from './logo.svg';
import './App.css';
import Nav from './components/Nav';
import Home from './components/Home';
import StoriesPage from './components/StoriesPage';
import StoryPage from './components/StoryPage';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="App">
          <Nav />
          <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/stories" exact component={StoriesPage} />
            <Route path={`/story/:story_id`} render={({match: {params}}) => <StoryPage story_id={params.story_id}  />} />
          </Switch>
      </div>
    </Router>
  );
}

export default App;
