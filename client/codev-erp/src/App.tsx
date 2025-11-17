import './App.css'
import { Route, Switch, Redirect } from "wouter";
import LoginPage from "./layouts/LoginPage.tsx";
import {useAuth} from "./providers/AuthProvider.tsx";
import ProfileView from "./layouts/ProfileSettings.tsx";
import AdminDashboard from "./layouts/AdminDashboard.tsx";
import CourseDetailPage from "./layouts/CourseDetailPage.tsx";
import {Header} from "./layouts/Header.tsx";
import {Footer} from "./layouts/Footer.tsx";
import {LeadPage} from "./layouts/LeadPage.tsx";
import Dashboard from "./layouts/Dashboard.tsx";
import {SalesPage} from "./layouts/SalesPage.tsx";



const App = () => {
    const { currentUser, isLoggedIn } = useAuth();

    return (


        <div className={"min-h-screen bg-gradient-to-b from-green-50 to-green-200 px-4 py-8 flex flex-col"}>
            <Header/>
                <Switch>
                    {/* Главная — страница логина */}
                    <Route path="/">
                        {!isLoggedIn || !currentUser ? (
                            <LoginPage />
                        ) : (
                            <Redirect to="/dashboard" />
                        )}
                    </Route>

                    <Route path="/login">
                        <LoginPage />
                    </Route>

                    <Route path="/dashboard">
                        {isLoggedIn && currentUser ? (
                            currentUser.role === "admin" ? <AdminDashboard/> :
                            currentUser.role === "teacher" ? <Dashboard/> :
                            currentUser.role === "student" ? <Dashboard/> :
                            currentUser.role === "lead" ? <LeadPage/> : <SalesPage/>
                        ) : (
                            <Redirect to="/" />
                        )}
                    </Route>

                    <Route path="/courses/:id">
                        {isLoggedIn && currentUser ? (
                            <CourseDetailPage/>
                        ) : (
                            <Redirect to="/" />
                        )}
                    </Route>

                    <Route path="/profile/:id" component={ProfileView} />
                    <Route path="/profile/" component={ProfileView} />

                    <Route>
                        <Redirect to={isLoggedIn ? "/dashboard" : "/"} />
                    </Route>
                </Switch>
            <Footer/>
        </div>

    );
};

export default App;
