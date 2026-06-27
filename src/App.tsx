import { useEffect } from 'react';
import { HomePage } from './pages/HomePage';

export default function App() {
  useEffect(() => {
    console.info('[LiftAI] App mounted successfully.');
  }, []);

  console.info('[LiftAI] App render invoked.');
  return <HomePage />;
}
