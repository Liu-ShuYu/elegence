import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import MatchingRoom from './pages/MatchingRoom';
import LevelSelect from './pages/LevelSelect';
import Sidebar from './components/Sidebar';

function App() {
  return (
    <Router>
      <Sidebar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/level_select" element={<LevelSelect />} />
        <Route path="/matching_room" element={<MatchingRoom />} />
      </Routes>
    </Router>
  );
}

export default App;
