import { Link } from "react-router";
import { GithubIcon } from "../icons";

const FooterLinks = () => {
  return (
    <>
      <Link
        to="/privacy-policy"
        className="text-sm text-white hover:underline hover:text-primary transition-colors duration-300"
      >
        Privacy Policy
      </Link>
      <Link
        to="/terms-of-service"
        className="text-sm text-white hover:underline hover:text-primary transition-colors duration-300"
      >
        Terms of Service
      </Link>
      <Link
        to="/contact"
        className="text-sm text-white hover:underline hover:text-primary transition-colors duration-300"
      >
        Contact Us
      </Link>
      <Link
        to={"https://github.com/prenaissance/omni-index"}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-primary transition-colors duration-300"
      >
        <GithubIcon size={6} />
      </Link>
    </>
  );
};

export default FooterLinks;
