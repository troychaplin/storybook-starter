import { jsx as f } from "react/jsx-runtime";
/* empty css            */
function m({
  children: t,
  variant: o = "primary",
  size: n = "md",
  disabled: r = !1,
  type: e = "button",
  onClick: i,
  className: s = ""
}) {
  const u = [
    "prefix-button",
    `prefix-button--${o}`,
    `prefix-button--${n}`,
    s
  ].filter(Boolean).join(" ");
  return /* @__PURE__ */ f(
    "button",
    {
      className: u,
      disabled: r,
      type: e,
      onClick: i,
      children: t
    }
  );
}
export {
  m as Button
};
