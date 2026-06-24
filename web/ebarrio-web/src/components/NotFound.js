import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AppLogo from "../assets/applogo-lightbg.png";

const NotFound = () => {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState(window.location.hash || "home");

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

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
      {/* Navbar */}
      <header
        className={`w-full fixed top-0 left-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/80 backdrop-blur-md shadow" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6">
          <div className="flex items-center gap-2">
            <img src={AppLogo} alt="App Logo" className="h-20 w-20" />
          </div>

          <nav className="hidden md:flex gap-8 font-medium text-gray-700">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`relative font-subTitle font-semibold transition 
                hover:text-[#0E94D3] after:content-[''] after:block after:w-0 after:h-[2px] 
                after:bg-[#0E94D3] after:transition-all after:duration-300 hover:after:w-full
                ${
                  active === link.href
                    ? "text-[#0E94D3] after:w-full"
                    : "text-gray-700"
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <Link
            to="/login"
            className="px-5 py-2 rounded-lg shadow font-bold font-subTitle transition bg-[#0E94D3] text-white hover:bg-[#0A70A0]"
          >
            Login
          </Link>
        </div>
      </header>

      {/* 404 Content */}
      <main className="flex-grow flex flex-col justify-center items-center text-center px-6 pt-32">
        <h1 className="text-7xl md:text-9xl font-extrabold text-[#0E94D3]">
          404
        </h1>
        <p className="mt-6 text-lg md:text-xl text-gray-700 font-subTitle max-w-xl">
          Oops! The page you are looking for doesn’t exist.
        </p>
        <Link
          to="/"
          className="mt-8 inline-block px-6 py-3 bg-[#0E94D3] text-white rounded-xl font-semibold shadow hover:bg-[#0A70A0] transition"
        >
          Go Back Home
        </Link>
      </main>

      {/* Footer */}
      <footer className="bg-[#0E94D3] text-white py-6 text-center font-subTitle font-medium">
        <p>© {new Date().getFullYear()} eBarrio. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default NotFound;
