import { jsxs as d, jsx as e } from "react/jsx-runtime";
/* empty css          */
function i({
  title: l,
  children: r,
  variant: a = "default",
  className: c = ""
}) {
  const s = [
    "example-card",
    a !== "default" && `example-card--${a}`,
    c
  ].filter(Boolean).join(" ");
  return /* @__PURE__ */ d("article", { className: s, children: [
    /* @__PURE__ */ e("header", { className: "example-card__header", children: /* @__PURE__ */ e("h2", { className: "example-card__title", children: l }) }),
    /* @__PURE__ */ e("div", { className: "example-card__content", children: r })
  ] });
}
export {
  i as Card
};
