import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import routes from './routes'
import './index.css'

const router = createBrowserRouter(routes)

const root = createRoot(document.getElementById('root'))
root.render(<RouterProvider router={router} />)