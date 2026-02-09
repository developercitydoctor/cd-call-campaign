import { useState, useRef, useEffect } from "react";
import "./TestimonialSection.scss";
import { FaQuoteLeft } from "react-icons/fa";
import { IoIosStar } from "react-icons/io";
import googleReviewsImage from "../../../assets/Common/google-icon.png";
import icon9 from "../../../assets/Icons/icon-9.png";
import icon10 from "../../../assets/Icons/icon-10.png";

const testimonials = [
  {
    id: 1,
    name: "Adnan Latheef",
    avatar: "https://i.pravatar.cc/150?img=68",
    rating: 5,
    review: "Booking a doctor at home was simple and the response was quick. The doctor was skilled, polite, and attentive to every detail. The treatment was as good as a hospital consultation. Highly recommend City Doctor."
  },
  {
    id: 2,
    name: "Dr. Anjhula Mya Singh Bais",
    avatar: "https://i.pravatar.cc/150?img=12",
    rating: 5,
    review: "Great patient service. On time, knowledgeable, efficient and flexible. The team provided excellent care and made the entire experience smooth and professional."
  },
  {
    id: 3,
    name: "May Al-Dabbagh",
    avatar: "https://i.pravatar.cc/150?img=47",
    rating: 5,
    review: "This is my second time using their services and they are excellent! I'm grateful for the professionalism and thoroughness of nurse Mahira. The service was punctual and high quality. Definitely deserves five stars!"
  },
  {
    id: 4,
    name: "Emma Robbins",
    avatar: "https://i.pravatar.cc/150?img=5",
    rating: 5,
    review: "Doctor & Nurse arrived after 40 mins of booking. Amazing service. Had flu and cold so received flu IV treatment. Feeling much better and would highly recommend."
  },
  {
    id: 5,
    name: "DharNa Ashar",
    avatar: "https://i.pravatar.cc/150?img=33",
    rating: 5,
    review: "Extremely professional and courteous. Fantastic service, on time. Didn't feel the needle at all. Very happy and will definitely rebook them."
  }
];

const userAvatars = [
  "https://i.pravatar.cc/150?img=68",
  "https://i.pravatar.cc/150?img=12",
  "https://i.pravatar.cc/150?img=33",
  "https://i.pravatar.cc/150?img=5",
  "https://i.pravatar.cc/150?img=47"
];

const TestimonialSection = () => {
  const [currentIndex, setCurrentIndex] = useState(1);
  const carouselRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const isScrollingProgrammatically = useRef(false);

  useEffect(() => {
    if (carouselRef.current) {
      scrollToActiveCard();
    }
  }, [currentIndex]);

  useEffect(() => {
    // Initial scroll to center on mount
    setTimeout(() => {
      scrollToActiveCard();
    }, 100);
  }, []);

  const scrollToActiveCard = () => {
    if (carouselRef.current) {
      isScrollingProgrammatically.current = true;
      const containerWidth = carouselRef.current.offsetWidth;
      const cardElement = carouselRef.current.children[currentIndex];
      if (cardElement) {
        const cardLeft = cardElement.offsetLeft;
        const cardWidth = cardElement.offsetWidth;
        const scrollPosition = cardLeft - (containerWidth / 2) + (cardWidth / 2);
        
        carouselRef.current.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        });
        
        // Reset the flag after scroll animation completes
        setTimeout(() => {
          isScrollingProgrammatically.current = false;
        }, 500);
      } else {
        isScrollingProgrammatically.current = false;
      }
    }
  };

  const goToSlide = (index) => {
    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    updateActiveCard();
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    updateActiveCard();
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    updateActiveCard();
  };

  const updateActiveCard = () => {
    if (carouselRef.current) {
      const containerWidth = carouselRef.current.offsetWidth;
      const scrollPosition = carouselRef.current.scrollLeft;
      const centerPosition = scrollPosition + (containerWidth / 2);
      
      let closestIndex = 0;
      let closestDistance = Infinity;
      
      Array.from(carouselRef.current.children).forEach((card, index) => {
        const cardLeft = card.offsetLeft;
        const cardWidth = card.offsetWidth;
        const cardCenter = cardLeft + (cardWidth / 2);
        const distance = Math.abs(centerPosition - cardCenter);
        
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });
      
      setCurrentIndex(closestIndex);
    }
  };

  const handleScroll = () => {
    if (!isDragging && !isScrollingProgrammatically.current) {
      updateActiveCard();
    }
  };

  return (
    <section id="testimonials" className="testimonial-section">
      <div className="testimonial-wrapper">
        <h1 className="section-title">Served 50,000+ Across Uae's Top Hotels & Communities</h1>

        <div className="testimonial-header-section">
          <div className="google-reviews-section">
            <div className="google-header">
              <img src={googleReviewsImage} alt="Google Reviews" className="google-logo" />
            </div>

            <div className="rating-section">
              <img src={icon10} alt="Rating icon" className="rating-icon-left" />
              <div className="rating-number">4.9</div>
              <img src={icon9} alt="Rating icon" className="rating-icon-right" />
            </div>

            <a 
              href="https://www.google.com/search?q=city+doctor+reviews" 
              target="_blank" 
              rel="noopener noreferrer"
              className="reviews-button"
            >
              +1200 Reviews
            </a>

            <div className="avatars-row">
              {userAvatars.map((avatar, index) => (
                <img 
                  key={index} 
                  src={avatar} 
                  alt={`Customer ${index + 1}`} 
                  className="user-avatar"
                  style={{ marginLeft: index > 0 ? '-10px' : '0' }}
                />
              ))}
            </div>
          </div>

          <div className="testimonial-cards-container">
            <div 
              className="testimonial-carousel"
              ref={carouselRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onScroll={handleScroll}
            >
              {testimonials.map((testimonial, index) => (
                <div 
                  key={testimonial.id} 
                  className={`testimonial-card ${currentIndex === index ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                >
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name} 
                    className="testimonial-avatar"
                  />
                  <div className="testimonial-stars">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <IoIosStar key={i} className="star-icon" />
                    ))}
                  </div>
                  <div className="testimonial-name">{testimonial.name}</div>
                  <FaQuoteLeft className="quote-icon" />
                  <p className="testimonial-text">{testimonial.review}</p>
                </div>
              ))}
            </div>

            <div className="pagination-dots">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`pagination-dot ${currentIndex === index ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;