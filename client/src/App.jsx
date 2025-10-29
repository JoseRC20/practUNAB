import Navbar from '../src/components/Navbar';
import Footer from '../src/components/Footer';
import AppRoutes from './routes';

function App() {
  return (
    <div className="App">
      <Navbar />
      <AppRoutes />
      <Footer />
    </div>
  );
}

export default App;
