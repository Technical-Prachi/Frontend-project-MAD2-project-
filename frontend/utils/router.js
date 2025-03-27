const Home = {
  template: `
    <div class="container text-center mt-4">
      <h1>🌟 Welcome to Online Quiz Portal 🌟</h1>
      <p>This platform helps users learn and practice for various exams.</p>
      <p>To get started, please create an account or log in using your existing credentials.</p>
    </div>
  `
};


import AddChapter from "../pages/AddChapter.js"; 
import AddQues from "../pages/AddQues.js";
import AddQuiz from "../pages/AddQuiz.js";
import AddSubject from "../pages/AddSubject.js";
import AdminDashboardPage from "../pages/AdminDashboardPage.js";
import CheckChapter from "../pages/CheckChapter.js";
import CheckQues from "../pages/CheckQues.js";
import CheckQuiz from "../pages/CheckQuiz.js";
import EditChapter from "../pages/EditChapter.js";
import EditQues from "../pages/EditQues.js";
import EditQuiz from "../pages/EditQuiz.js";
import EditSubject from "../pages/EditSubject.js";
import QuizResult from "../pages/QuizResult.js";
import SelectChapter from "../pages/SelectChapter.js";
import SelectQuiz from "../pages/SelectQuiz.js";
import StartQuiz from "../pages/StartQuiz.js";
import UserDashboard from "../pages/UserDashboard.js";
import LoginPage from "../pages/LoginPage.js";
import RegisterPage from "../pages/RegisterPage.js";
import Summary from "../pages/Summary.js";  

import store from "./store.js";


const routes = [
  { path: "/", component: Home },
  { path: "/login", component: LoginPage },
  { path: "/register", component: RegisterPage },
  { path: "/admin-dashboard", component: AdminDashboardPage, meta: { requiresLogin: true, role: "admin" } },
  { path: "/user-dashboard", component: UserDashboard, meta: { requiresLogin: true, role: "user" } },
  
  // Subject Routes
  { path: "/subjects/add", component: AddSubject, meta: { requiresLogin: true } },
  { path: "/subjects/:subjectId/edit", component: EditSubject, meta: { requiresLogin: true } },

  // Chapter Routes (now nested under subjects)
  { path: "/subjects/:subjectId/chapters", component: CheckChapter, meta: { requiresLogin: true } },
  { path: "/subjects/:subjectId/chapters/add", component: AddChapter, meta: { requiresLogin: true } },
  { path: "/subjects/:subjectId/chapters/:chapterId/edit", component: EditChapter, meta: { requiresLogin: true } },

  // Quiz Routes (now nested under subjects and chapters)
  { path: "/subjects/:subjectId/chapters/:chapterId/quizzes", component: CheckQuiz, meta: { requiresLogin: true } },
  { path: "/subjects/:subjectId/chapters/:chapterId/quizzes/add", component: AddQuiz, meta: { requiresLogin: true } },
  { path: "/subjects/:subjectId/chapters/:chapterId/quizzes/:quizId/edit", component: EditQuiz, meta: { requiresLogin: true } },

  // Question Routes (now nested under quizzes)
  { path: "/subjects/:subjectId/chapters/:chapterId/quizzes/:quizId/questions", component: CheckQues, meta: { requiresLogin: true } },
  { path: "/subjects/:subjectId/chapters/:chapterId/quizzes/:quizId/questions/add", component: AddQues, meta: { requiresLogin: true } },
  { path: "/subjects/:subjectId/chapters/:chapterId/quizzes/:quizId/questions/:questionId/edit", component: EditQues, meta: { requiresLogin: true } },

  // Quiz Flow
  { path: "/subjects/:subjectId/chapters/select", component: SelectChapter, meta: { requiresLogin: true } },
  { path: "/subjects/:subjectId/chapters/:chapterId/quizzes/select", component: SelectQuiz, meta: { requiresLogin: true } },
  { path: "/subjects/:subjectId/chapters/:chapterId/quizzes/:quizId/start", component: StartQuiz, meta: { requiresLogin: true } },
  { path: "/subjects/:subjectId/chapters/:chapterId/quizzes/:quizId/result", component: QuizResult, meta: { requiresLogin: true } },

  {path:"/summary"  , component:Summary, meta: { requiresLogin: true } },
];


const router = new VueRouter({ 
  routes
})

// navigation guards
router.beforeEach((to, from, next) => {
  console.log("Navigation Guard Triggered: ", to.path);  //  Debugging

  const user = JSON.parse(localStorage.getItem("user"));
  
  if (!user && (to.path === "/login" || to.path === "/register")) {
    return next();  //  Allow navigating to /register & /login
}

if (!user && to.path !== "/login") {
    console.log("User not logged in, redirecting to login...");
    return next("/login");  //  Redirect to login if not authenticated
}

if (user && to.path === "/login") {
    console.log("Already logged in, redirecting...");
    return next(user.role === "admin" ? "/admin-dashboard" : "/user-dashboard");
}

next();  // Allow navigation
});



export default router;