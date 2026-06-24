import React, { useState } from "react";
import AppLogo from "../assets/applogo-lightbg.png";
import loginUI from "../assets/mobile-ui/mobile_login.png";
import preview1UI from "../assets/mobile-ui/mobile_preview1.png";
import preview2UI from "../assets/mobile-ui/mobile_preview2.png";
import preview3UI from "../assets/mobile-ui/mobile_preview3.png";
import signupUI from "../assets/mobile-ui/mobile_signup.png";

import { ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import {
  FileText,
  ClipboardList,
  CalendarCheck,
  Megaphone,
  Siren,
  Waves,
} from "lucide-react";
import { useEffect } from "react";

const Landing = () => {
  const [openFAQ, setOpenFAQ] = useState(null);
  const [active, setActive] = useState(window.location.hash || "home");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      setActive(window.location.hash || "home");
    };

    const handleScroll = () => {
      if (window.scrollY > 80) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const links = [
    { href: "/home", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/services", label: "Services" },
    { href: "/download", label: "Download" },
    { href: "/faqs", label: "FAQs" },
  ];

  const faqs = [
    {
      question: "What is eBarrio?",
      answer:
        "eBarrio is a mobile and web application to provide efficient and accessible digital services for barangay residents, including certificate requests, announcements, and disaster alerts.",
    },
    {
      question: "Who is eBarrio for?",
      answer:
        "eBarrio is designed for barangay staffs, personnel, and residents of barangay aniban 2.",
    },
    {
      question: "What features does eBarrio offer?",
      answer:
        "eBarrio offers digital services such as certificate requests, viewing announcements, and disaster preparedness tools.",
    },
  ];

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navbar */}
      <header
        className={`w-full fixed top-0 left-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/80 backdrop-blur-md shadow" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src={AppLogo} alt="App Logo" className="h-20 w-20" />
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex gap-8 font-medium text-gray-700">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`relative font-subTitle font-semibold transition 
        hover:text-[#0E94D3] after:content-[''] after:block after:w-0 after:h-[2px] 
        after:bg-[#0E94D3] after:transition-all after:duration-300 hover:after:w-full
        ${
          active === link.href ? "text-[#0E94D3] after:w-full" : "text-gray-700"
        }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Sign In */}
          <Link
            to="/login"
            className="px-5 py-2 rounded-lg shadow font-bold font-subTitle transition bg-[#0E94D3] text-white hover:bg-[#0A70A0]"
          >
            Login
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section
        id="home"
        className="relative flex flex-col md:flex-row items-center justify-center text-center md:text-left px-6 pt-32 pb-24 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200"
      >
        <div className="max-w-3xl md:w-1/2">
          <h1 className="text-4xl md:text-6xl font-extrabold font-title mb-6 text-[#04384E] leading-tight">
            Empower your <span className="text-[#0E94D3]">Barangay</span>.{" "}
            <br />
            Level up with <span className="text-[#0E94D3]">eBarrio</span>.
          </h1>

          <p className="text-lg md:text-xl text-gray-700 mb-8 font-subTitle max-w-2xl">
            Accessible services. Real-time updates. A smarter, stronger
            community — all in one app designed to connect and protect your
            barangay.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start items-center">
            <a
              href="#download"
              className="font-subTitle px-8 py-3 bg-[#0E94D3] text-white rounded-xl font-semibold shadow hover:bg-[#0A70A0] transition"
            >
              Get Started
            </a>
            <a
              href="#services"
              className="font-subTitle px-8 py-3 border-2 border-[#0E94D3] text-[#0E94D3] rounded-xl font-semibold shadow hover:bg-blue-50 transition"
            >
              Explore Features
            </a>
          </div>
        </div>

        <div className="relative mt-12 md:mt-0 md:w-1/2 flex justify-center perspective-[1200px]">
          <div className="relative w-[320px] h-[460px] flex justify-center items-center">
            {/* Screenshot 1 */}
            <img
              src={signupUI}
              alt="Login UI"
              className="absolute top-0 left-0 w-52 md:w-64 rounded-2xl shadow-2xl 
         transform -rotate-[15deg] -translate-x-12 translate-y-8 
         transition duration-500 hover:scale-110 hover:rotate-[-10deg]"
            />
            {/* Screenshot 2 */}
            <img
              src={loginUI}
              alt="App Preview"
              className="absolute bottom-0 right-0 w-52 md:w-64 rounded-2xl shadow-2xl 
         transform rotate-[15deg] translate-x-12 -translate-y-8 
         transition duration-500 hover:scale-110 hover:rotate-[10deg]"
            />
          </div>
        </div>

        <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-200 rounded-full opacity-40 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-56 h-56 bg-yellow-200 rounded-full opacity-40 blur-3xl"></div>
      </section>

      {/* About */}
      <section id="about" className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h3 className="text-3xl font-bold mb-4 text-[#0E94D3] font-title">
          About eBarrio
        </h3>
        <p className="text-gray-700 max-w-3xl mx-auto text-[24px] font-subTitle">
          <span className="font-semibold text-[#04384E] text-[30px]">
            Where service meets convenience.
          </span>{" "}
        </p>
        <p className="text-gray-700 max-w-3xl mx-auto text-[24px] font-subTitle">
          eBarrio is a modern digital platform for barangay aniban 2 to make the
          services easier to access, updates quicker to receive, and communities
          safer and more connected.
        </p>
      </section>

      {/* Services */}
      <section id="services" className="bg-gray-50 py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-12 text-[#0E94D3] font-title">
            Our Services
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <FileText className="w-12 h-12 text-[#0E94D3] mb-4 mx-auto" />
                ),
                title: "Request Document",
                desc: "Easily request barangay documents online without long queues.",
              },
              {
                icon: (
                  <ClipboardList className="w-12 h-12 text-[#0E94D3] mb-4 mx-auto" />
                ),
                title: "File Blotter",
                desc: "Report incidents or complaints digitally for faster action and transparency.",
              },
              {
                icon: (
                  <CalendarCheck className="w-12 h-12 text-[#0E94D3] mb-4 mx-auto" />
                ),
                title: "Court Reservation",
                desc: "Book and reserve the barangay court",
              },
              {
                icon: (
                  <Megaphone className="w-12 h-12 text-[#0E94D3] mb-4 mx-auto" />
                ),
                title: "Announcements",
                desc: "Stay informed with the latest barangay updates, and events.",
              },
              {
                icon: (
                  <Siren className="w-12 h-12 text-[#0E94D3] mb-4 mx-auto" />
                ),
                title: "SOS Report",
                desc: "Send instant SOS alerts to barangay personnel during emergencies.",
              },
              {
                icon: (
                  <Waves className="w-12 h-12 text-[#0E94D3] mb-4 mx-auto" />
                ),
                title: "River Monitoring",
                desc: "Track river levels and get notified about possible flooding risks.",
              },
            ].map((service, index) => (
              <div
                className="bg-white p-6 rounded-2xl shadow-md hover:shadow-2xl 
  transition transform hover:-translate-y-3 hover:scale-105 duration-300"
              >
                {service.icon}
                <h4 className="text-xl font-semibold mb-2 font-subTitle">
                  {service.title}
                </h4>
                <p className="text-gray-800 font-medium font-subTitle">
                  {service.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Download */}
      <section
        id="download"
        className="max-w-6xl mx-auto px-6 py-20 text-center"
      >
        <h3 className="text-3xl font-bold mb-4 text-[#0E94D3] font-title">
          Download eBarrio
        </h3>
        <p className="text-gray-700 mb-10 text-[20px] font-subTitle font-medium">
          Get eBarrio today and experience seamless digital services in your
          community.
        </p>

        {/* App Preview + Download Section */}
        <div className="flex flex-col items-center gap-6">
          <div className="flex gap-6 items-end">
            <img
              src={preview1UI}
              alt="App Preview"
              className="w-36 md:w-44 rounded-2xl shadow-lg transform -rotate-12 translate-y-6 hover:scale-105 transition"
            />

            <img
              src={preview2UI}
              alt="App Preview"
              className="w-40 md:w-48 rounded-2xl shadow-xl z-10 transform hover:scale-110 transition"
            />

            <img
              src={preview3UI}
              alt="App Preview"
              className="w-36 md:w-44 rounded-2xl shadow-lg transform rotate-12 translate-y-6 hover:scale-105 transition"
            />
          </div>

          <div className="flex flex-col items-center gap-3 mt-4">
            <a
              href="https://drive.google.com/uc?export=download&id=1J0sAVhIhzo_qMP7h2zAFml4JSjYe9ks6"
              download
              className="bg-[#0E94D3] hover:bg-[#0A70A0] text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-700 transition font-subTitle font-semibold"
            >
              Download APK
            </a>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section id="faqs" className="max-w-6xl mx-auto px-6 py-20">
        <h3 className="text-3xl font-bold mb-6 text-center text-[#0E94D3] font-title">
          Frequently Asked Questions
        </h3>
        <div className="space-y-4 max-w-3xl mx-auto text-left">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`border rounded-xl overflow-hidden shadow-sm transition 
  ${openFAQ === index ? "border-[#0E94D3] shadow-lg" : ""}`}
            >
              {/* Question Button */}
              <button
                className={`w-full flex justify-between items-center px-5 py-5 transition
            ${
              openFAQ === index
                ? "bg-[#0E94D3] text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-800"
            }`}
                onClick={() => toggleFAQ(index)}
              >
                <span className="font-subTitle font-semibold">
                  {faq.question}
                </span>
                {openFAQ === index ? (
                  <ChevronUp
                    className={`h-5 w-5 ${
                      openFAQ === index ? "text-white" : "text-gray-600"
                    }`}
                  />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-600" />
                )}
              </button>

              {/* Answer */}
              <div
                className={`px-4 overflow-hidden transition-all duration-300 ${
                  openFAQ === index ? "max-h-40 py-3" : "max-h-0"
                }`}
              >
                <p className="text-gray-600 font-medium font-subTitle">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0E94D3] text-white py-6 text-center font-subTitle font-medium">
        <p>© {new Date().getFullYear()} eBarrio. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;
