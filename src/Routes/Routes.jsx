import Thankyou from "../Components/ThankYouPage/Thankyou";
import HomePage from "../Pages/HomePage";

const routes = [
  {
    path: "/",
    element: <HomePage/>,
    isProtected: false,
  },
  {
    path: "/thank-you",
    element: <Thankyou/>,
    isProtected: false,
  },
];

export default routes;