import "./AboutUsSection.scss";
import img1 from "../../../assets/Images/img-1.webp";

const AboutUsSection = () => {
    return (
        <section id="about-us" className="about-us-section section-container">
            <div className="about-us-wrapper">
                {/* Image - Left Side */}
                <div className="about-image">
                    <img src={img1} alt="City Doctor" />
                </div>

                {/* Content - Right Side */}
                <div className="about-content">
                    <h2 className="section-tagline">About Us</h2>
                    <h1 className="section-title">
                        City Doctor
                    </h1>
                    <div className="content-wrapper">
                        <p className="section-description">
                            City Doctor delivers DHA-licensed medical care at your home, hotel, or office across Dubai, Abu Dhabi, and Sharjah. From doctor visits to IV therapy, lab tests, and physiotherapy, we make care fast, safe, and simple, so you don't have to leave your place.
                        </p>
                        <p className="section-description">
                            Our team of experienced, DHA-licensed medical professionals brings healthcare directly to you. Whether you need a doctor's consultation, nursing care, lab tests, or IV therapy, we provide comprehensive medical services in the comfort of your location.
                        </p>
                        <p className="section-description">
                            With transparent pricing, quick response times (30-45 minutes), and flexible payment options including Apple Pay, Google Pay, and Tabby 4-Pay, we make quality healthcare accessible and convenient. Available 24/7 across Dubai, Abu Dhabi, and Sharjah.
                        </p>
                    </div>
                    <a href="#contact-us" className="btn primary-btn about-cta-btn">
                        Contact Us
                    </a>
                </div>
            </div>
        </section>
    );
};

export default AboutUsSection;
