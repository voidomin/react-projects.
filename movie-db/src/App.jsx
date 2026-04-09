import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import MovieDetailPage from './pages/MovieDetailPage'
import FavoritesPage from './pages/FavoritesPage'
import { FavoritesProvider } from './context/FavoritesContext'

function App() {
  return (
    <FavoritesProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="movie/:id" element={<MovieDetailPage />} />
          <Route path="favorites" element={<FavoritesPage />} />
        </Route>
      </Routes>
    </FavoritesProvider>
  )
}

export default App
