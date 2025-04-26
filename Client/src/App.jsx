import { Container, CssBaseline } from "@mui/material";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import ChatRoom from "./pages/ChatRoom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PrivateRoute from "./routes/PrivateRoute";

function App() {
  return (
    <Router>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Routes>
          <Route
            path="/"
            element={
              <PrivateRoute>
                <ChatRoom />
              </PrivateRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/chat" element={<ChatRoom />} />
          <Route path="/chat/:roomId" element={<PrivateRoute> <ChatRoom /> </PrivateRoute>} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
