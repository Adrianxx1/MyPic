import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage/HomePage";
import AuthPage from "./pages/AuthPage/AuthPage";
import PageLayout from "./Layouts/PageLayout/PageLayout";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import NotificationsPage from "./pages/NotificationsPage/NotificationsPage";
import MessagesPage from "./pages/MessagesPage/MessagesPage";
import FollowersPage from "./pages/FollowersPage/FollowersPage";
import PostPage from "./pages/PostPage/PostPage";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase/firebase";

function App() {
  const [authUser] = useAuthState(auth);

  return (
    <PageLayout>
      <Routes>
        <Route path='/' element={authUser ? <HomePage /> : <Navigate to='/auth' />} />
        <Route path='/auth' element={!authUser ? <AuthPage /> : <Navigate to='/' />} />
        <Route path='/notifications' element={authUser ? <NotificationsPage /> : <Navigate to='/auth' />} />
        <Route path='/messages' element={authUser ? <MessagesPage /> : <Navigate to='/auth' />} />
        <Route path='/posts/:postId' element={authUser ? <PostPage /> : <Navigate to='/auth' />} />
        <Route path='/:username' element={<ProfilePage />} />
        <Route path='/:username/followers' element={authUser ? <FollowersPage /> : <Navigate to='/auth' />} />
      </Routes>
    </PageLayout>
  );
}

export default App;