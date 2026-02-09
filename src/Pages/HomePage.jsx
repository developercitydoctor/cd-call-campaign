import { Fragment } from "react";
import Helmet from "../General/Helmet";
import HomeHero from "../Components/HomePage/HomeHero/HomeHero";
import ServicesSection from "../Components/HomePage/ServicesSection/ServicesSection";
import WhyChooseUsSection from "../Components/HomePage/WhyChooseUsSection/WhyChooseUsSection";
import ProcessSection from "../Components/HomePage/ProcessSection/ProcessSection";
import TestimonialSection from "../Components/HomePage/TestimonialSection/TestimonialSection";
import FAQSection from "../Components/HomePage/FAQSection/FAQSection";
export default function HomePage() {
  return (
    <Fragment>
        <Helmet title="City Doctor | Home" />
        <HomeHero />
        <div className="content-wrapper">
          <ServicesSection />
          <WhyChooseUsSection />
          <ProcessSection />
          <TestimonialSection />
          <FAQSection />
        </div>
    </Fragment>
  );
}