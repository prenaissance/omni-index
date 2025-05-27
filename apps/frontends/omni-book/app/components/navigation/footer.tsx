import { Link, useFetcher } from "react-router";
import { useEffect, useState } from "react";
import { GithubIcon } from "../icons";
import { Button } from "../ui/button";
import { env } from "~/lib/env";

const Footer = () => {
  const fetcher = useFetcher();
  const [loaderData, setLoaderData] = useState({});
  useEffect(() => {
    setLoaderData(fetcher.data || {});
    console.log("Loader data:", loaderData);
  }, [fetcher.data]);

  return (
    <footer className="bg-card text-white py-8 px-14">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm">
            &copy; {new Date().getFullYear()}{" "}
            <span className="text-primary">Omni Book</span>. All rights
            reserved.
          </p>
          <p className="text-xs">
            Built with ❤️ by the{" "}
            <span className="text-primary">Omni-index</span> team.
          </p>
        </div>
        <div className="flex gap-7">
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
        </div>
        <div>
          <form
            action={`${env.API_URL}/api/entries/exports/export`}
            method="GET"
          >
            <Button type="submit">Get Entries</Button>
          </form>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
