export const DEMO_ACCOUNTS = Object.freeze({
  admin: Object.freeze({
    name: "Demo Administrator",
    email: "demo.admin@mamaautoparts.test",
    password: "MamaPartsAdmin2026!",
    role: "admin"
  }),
  customer: Object.freeze({
    name: "Demo Customer",
    email: "demo.customer@mamaautoparts.test",
    password: "MamaPartsCustomer2026!",
    role: "customer"
  })
});

export const DEMO_ACCOUNT_EMAILS = Object.freeze(
  Object.values(DEMO_ACCOUNTS).map(({ email }) => email)
);
