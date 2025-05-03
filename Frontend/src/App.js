import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';  // Asegúrate de importar tu componente HomePage
import WaitingRoom from './pages/WaitingRoom';
import Questionnaire from './pages/Questionnaire';
import ResultsPage from './pages/ResultsPage';  // Asegúrate de importar tu componente ResultsPage

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} /> {/* Ruta para el Home */}
        <Route path="/waiting-room/:roomId" element={<WaitingRoom />} />
        <Route path="/quiz/:roomId" element={<Questionnaire />} />
        <Route path="/results" element={<ResultsPage />} />  {/* Ruta para los resultados */}
        {/* Otras rutas */}
      </Routes>
    </Router>
  );
};

export default App;
