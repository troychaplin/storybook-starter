import { jsx as r, jsxs as l } from "react/jsx-runtime";
function d({
  children: t,
  variant: a = "primary",
  size: e = "md",
  disabled: n = !1,
  type: s = "button",
  onClick: c,
  className: i = ""
}) {
  const o = [
    "prefix-button",
    `prefix-button--${a}`,
    `prefix-button--${e}`,
    i
  ].filter(Boolean).join(" ");
  return /* @__PURE__ */ r(
    "button",
    {
      className: o,
      disabled: n,
      type: s,
      onClick: c,
      children: t
    }
  );
}
function u({
  title: t,
  children: a,
  variant: e = "default",
  className: n = ""
}) {
  const s = [
    "prefix-card",
    e !== "default" && `prefix-card--${e}`,
    n
  ].filter(Boolean).join(" ");
  return /* @__PURE__ */ l("article", { className: s, children: [
    /* @__PURE__ */ r("header", { className: "prefix-card__header", children: /* @__PURE__ */ r("h3", { className: "prefix-card__title", children: t }) }),
    /* @__PURE__ */ r("div", { className: "prefix-card__content", children: a })
  ] });
}
export {
  d as Button,
  u as Card
};
