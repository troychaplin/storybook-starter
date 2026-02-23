import { jsxs as d, jsx as e } from "react/jsx-runtime";
/* empty css          */
function f({
  title: a,
  children: c,
  variant: r = "default",
  className: i = ""
}) {
  const s = [
    "prefix-card",
    r !== "default" && `prefix-card--${r}`,
    i
  ].filter(Boolean).join(" ");
  return /* @__PURE__ */ d("article", { className: s, children: [
    /* @__PURE__ */ e("header", { className: "prefix-card__header", children: /* @__PURE__ */ e("h3", { className: "prefix-card__title", children: a }) }),
    /* @__PURE__ */ e("div", { className: "prefix-card__content", children: c })
  ] });
}
export {
  f as Card
};
