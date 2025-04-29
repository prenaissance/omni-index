import { NavLink, useLocation } from "react-router";
import { useEffect, useRef } from "react";
import { AdjustmentsIcon, HomeIcon, LogOutIcon, SettingsIcon } from "../icons";
import type { paths } from "~/lib/api-types";

type ProfileType =
  paths["/api/profile"]["get"]["responses"]["200"]["content"]["application/json"];

type ProfileProps = {
  user: ProfileType;
};

export const Profile = ({ user }: ProfileProps) => {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const location = useLocation();

  useEffect(() => {
    if (detailsRef.current?.open) {
      detailsRef.current.removeAttribute("open");
    }
  }, [location]);

  return (
    <details className="relative group" ref={detailsRef}>
      <summary className="list-none cursor-pointer flex justify-end items-center gap-4 pl-10">
        <img
          src={
            user.avatarUrl === undefined
              ? user.avatarUrl
              : "/avatar-placeholder.png"
          }
          alt="avatar"
          className="w-10 h-10 rounded-full"
        />
        <h6 className="text-sm font-medium text-foreground">
          {user.displayName}
        </h6>
      </summary>
      <div className="absolute w-full left-0 right-5 z-10 mt-2 max-w-full origin-top-right rounded-md shadow-lg bg-card-secondary">
        <ul className="py-2 font-medium text-sm">
          <li>
            <NavLink
              to="/"
              className="px-3 py-2 hover:bg-popover flex items-center gap-2"
            >
              <HomeIcon size={4} />
              <p>Home</p>
            </NavLink>
          </li>
          {(user.role === "admin" || user.role === "owner") && (
            <li>
              <NavLink
                to="/admin/nodes-config"
                className="px-3 py-2 hover:bg-popover flex items-center gap-2"
              >
                <AdjustmentsIcon size={4} />
                <p>Nodes Config</p>
              </NavLink>
            </li>
          )}
          <li>
            <NavLink
              to="/"
              className="px-3 py-2 hover:bg-popover flex items-center gap-2"
            >
              <SettingsIcon size={4} />
              <p>Settings</p>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/"
              className="px-3 py-2 hover:bg-popover flex items-center gap-2"
            >
              <LogOutIcon size={4} />
              <p>Logout</p>
            </NavLink>
          </li>
        </ul>
      </div>
    </details>
  );
};
