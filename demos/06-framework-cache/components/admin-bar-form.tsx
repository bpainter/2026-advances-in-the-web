"use client";

import { useState } from "react";
import { saveCopyForm } from "@/lib/admin-actions";

const USERS = ["agent-1", "agent-2"];
const REGIONS = [
  ["us", "US"],
  ["eu", "EU"],
];

declare global {
  interface Window {
    demoHooks?: Record<string, (...args: unknown[]) => unknown>;
  }
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; SameSite=Lax`;
}

/**
 * Controls are plain; the keyboard fallback in the notes is "switch, then reload" and
 * "edit the copy, press Save, then reload". The form posts to the shown Server Action through
 * lib/admin-actions.ts; `invalidateProduct` submits it natively (public/presenter.js).
 */
export function AdminBarForm({
  id,
  user,
  region,
  copy,
}: {
  id: string;
  user: string;
  region: string;
  copy: string;
}) {
  const [currentUser, setUser] = useState(user);
  const [currentRegion, setRegion] = useState(region);

  return (
    <div className="admin" data-presenter-chrome="">
      <label className="admin__field">
        <span>User</span>
        <select
          name="user"
          value={currentUser}
          onChange={(e) => {
            setUser(e.target.value);
            setCookie("user", e.target.value);
          }}
        >
          {USERS.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </label>
      <label className="admin__field">
        <span>Region</span>
        <select
          name="region"
          value={currentRegion}
          onChange={(e) => {
            setRegion(e.target.value);
            setCookie("region", e.target.value);
          }}
        >
          {REGIONS.map(([code, label]) => (
            <option key={code} value={code}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <form className="admin__form" action={saveCopyForm} data-demo-save="">
        <input type="hidden" name="id" value={id} />
        <label className="admin__field admin__field--grow">
          <span>Copy</span>
          <input type="text" name="copy" defaultValue={copy} aria-label="Product copy" />
        </label>
        <button type="submit">Save</button>
      </form>
      <button type="button" onClick={() => void window.demoHooks?.requestPage?.()}>
        Reload
      </button>
      <button type="button" onClick={() => void window.demoHooks?.reset?.()}>
        Reset
      </button>
    </div>
  );
}
