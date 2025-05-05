import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing";
import Form from "./pages/Form";

function App() {
  return (
    <>
      <div>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/form" element={<Form />} />
          </Routes>
        </Router>
      </div>
    </>
  );
}

export default App;
