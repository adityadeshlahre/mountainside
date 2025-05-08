import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing";
import Form from "./pages/Form";
import Data from "./pages/Data";
import DataFiles from "./pages/DataFiles";

function App() {
  return (
    <>
      <div>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/data" element={<Data />} />
            <Route path="/data/:sessionId" element={<DataFiles />} />
            <Route path="/form" element={<Form />} />
          </Routes>
        </Router>
      </div>
    </>
  );
}

export default App;
