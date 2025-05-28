import { Button } from "../ui/button";
import FooterLinks from "./footer-links";

const Footer = () => {
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
        <div className="hidden min-[970px]:flex min-[970px]:gap-7 justify-between">
          <FooterLinks />
        </div>
        <div className="pl-4">
          <form
            action={`${import.meta.env.VITE_API_URL}/api/entries/exports/export`}
            method="GET"
          >
            <Button type="submit">Get Entries</Button>
          </form>
        </div>
      </div>
      <div className="flex gap-7 min-[970px]:hidden pt-5">
        <FooterLinks />
      </div>
    </footer>
  );
};

export default Footer;
