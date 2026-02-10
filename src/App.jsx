import { Fragment, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import AppLoader from './Components/AppLoader/AppLoader';
import AppRouter from './Components/AppRouter/AppRouter';
import routes from './Routes/Routes';
import Header from './Components/Common/Header/Header';
import Footer from './Components/Common/Footer/Footer';
import PopupForm from './Components/Common/PopupForm/PopupForm';
import BookingModal from './Components/Common/BookingModal/BookingModal';
import { useBookingModal } from './Context/BookingModalContext';
import { useChatbot } from './Context/ChatbotContext';
import { initAttributionCapture } from './Utils/attribution';
import { initRecaptchaOnLanding } from './Utils/recaptcha';
import MobileFixedButtons from './Components/Common/MobileFixedButtons/MobileFixedButtons';

// New Changes - CallBack Request Campaign

export default function App() {
  const location = useLocation();
  const [ pageLoading, setPageLoading ] = useState(true);
  const { isOpen, closeModal } = useBookingModal();
  const { isPopupFormOpen, closePopupForm } = useChatbot();

  // Initialize attribution capture and reCAPTCHA v3 (once on landing)
  useEffect(() => {
    initAttributionCapture();
    initRecaptchaOnLanding();
  }, []);

  useEffect(() => {
    setPageLoading(true);

    const timeout = setTimeout(() => {
      setPageLoading(false);
    }, 1500); // Adjust loader duration

    return () => clearTimeout(timeout);
  }, [location.pathname]);

  return (
    <>
      <AppLoader isVisible={pageLoading} />
      {!pageLoading && (
        <Fragment>
          <Header />
          <AppRouter routes={routes} />
          <Footer />
          <MobileFixedButtons />
          <BookingModal isOpen={isOpen} onClose={closeModal} />
          {isPopupFormOpen && <PopupForm handleClose={closePopupForm} />}
        </Fragment>
      )}
    </>
  );
}