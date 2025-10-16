import App from "./App.jsx";
import FullSchemaGenerator from "./components/RelationshipGenerator.jsx";

const routes = [
  { path: "/", element: <App />, 
    children: [
      {index: true, element: <FullSchemaGenerator /> },
    ] 
  },
];

export default routes;
