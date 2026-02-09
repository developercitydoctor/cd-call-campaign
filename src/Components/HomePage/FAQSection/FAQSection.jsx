import { useState } from "react";
import "./FAQSection.scss";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";

const faqs = [
  {
    id: 1,
    question: "How quickly can a doctor arrive?",
    answer: "Typically within 30–60 minutes from your request, depending on location."
  },
  {
    id: 2,
    question: "What does an at-home doctor consultation include?",
    answer: "Medical history review, vitals check, clinical examination, treatment plan, and a standard prescription for oral (non-controlled) medications when needed."
  },
  {
    id: 3,
    question: "Are your doctors equipped to treat at home?",
    answer: "Yes. Our doctors arrive with essential medical tools to assess and manage common conditions at home."
  },
  {
    id: 4,
    question: "Do you offer 24/7 home visits?",
    answer: "Yes. Doctor at Home is available 24/7 across Dubai, Abu Dhabi, Sharjah, and Ajman."
  },
  {
    id: 5,
    question: "Which areas do you cover?",
    answer: "We cover most areas across Dubai, Abu Dhabi, Sharjah, and Ajman."
  },
  {
    id: 6,
    question: "How do you ensure hygiene during home visits?",
    answer: "We follow strict infection-control and hygiene protocols for every visit."
  },
  {
    id: 7,
    question: "Can your team communicate in multiple languages?",
    answer: "Yes. Our medical team is multilingual."
  },
  {
    id: 8,
    question: "Are additional tests and treatments available?",
    answer: "Yes. If needed, doctors can recommend add-ons such as lab tests, ECG, and IV infusions."
  }
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="faq-section section-container">
      <div className="faq-wrapper">
        <h1 className="section-title">Frequently Asked Questions</h1>

        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div key={faq.id} className={`faq-item ${openIndex === index ? 'active' : ''}`}>
              <button 
                className="faq-question"
                onClick={() => toggleFAQ(index)}
                aria-expanded={openIndex === index}
              >
                <span className="question-text">{faq.question}</span>
                <span className="faq-icon">
                  {openIndex === index ? (
                    <IoChevronUp className="chevron-icon" />
                  ) : (
                    <IoChevronDown className="chevron-icon" />
                  )}
                </span>
              </button>
              <div className={`faq-answer ${openIndex === index ? 'open' : ''}`}>
                <div className="answer-content">
                  <p>{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;

