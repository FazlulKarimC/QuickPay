import React from "react";

type AppbarUser = {
  name?: string | null;
};

type AppbarProps = {
  user?: AppbarUser;
  onSignin: () => void | Promise<void>;
  onSignout: () => void | Promise<void>;
};

export const Appbar = ({ user, onSignin, onSignout }: AppbarProps) => {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
      <div className="text-lg font-semibold text-slate-900">QuickPay</div>
      <div className="flex items-center gap-3">
        {user?.name ? (
          <span className="text-sm text-slate-600">{user.name}</span>
        ) : null}
        <button
          type="button"
          onClick={() => {
            if (user) {
              void onSignout();
              return;
            }
            void onSignin();
          }}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          {user ? "Logout" : "Login"}
        </button>
      </div>
    </div>
  );
};
