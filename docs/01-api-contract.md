# API Contract (base: `/api`)

Auth: `Authorization: Bearer <jwt>`. Roles: ADMIN, STAFF, CUSTOMER.
"A" = admin only, "A/S" = admin + staff, "C" = customer only, "Any" = any logged in, "Public" = no auth.

## Auth (BE-1)
| Method | Path | Role | Body / Notes |
|---|---|---|---|
| POST | /auth/signup | Public | `{name,email,password}` -> creates USER(role CUSTOMER) + Customer. 409 if email exists. Password: 9+ chars, upper, lower, special |
| POST | /auth/login | Public | `{email,password}` -> `{token,user:{id,name,email,role,customerId?}}` |
| POST | /auth/forgot-password | Public | `{email}` -> always 200 (don't reveal if email exists). Sends link `FRONTEND_URL/reset-password?token=...` |
| POST | /auth/reset-password | Public | `{token,password}` |
| GET | /auth/me | Any | current user |

## Users / Staff (BE-1)
| POST | /users/staff | A | `{name,email,password}` -> role STAFF |
| GET | /users/staff | A | list (paginated) |
| PATCH | /users/staff/:id | A | `{name?,isActive?}` |

## Customers (BE-1)
| GET | /customers | A/S | `?search=&page=&limit=` |
| POST | /customers | A/S | `{name,email,phone?,company?,address?}` |
| GET | /customers/:id | A/S | |
| PATCH | /customers/:id | A/S | |

## Products + Variants (BE-1)
| GET | /products | A/S | `?search=&type=` |
| POST | /products | A | `{name,type,salesPrice,costPrice,notes?,variants:[{attribute,value,extraPrice}]}` (e.g. attribute "Brand", value "Odoo", extraPrice 560) |
| GET | /products/:id | A/S | includes variants |
| PUT | /products/:id | A | replace fields + variants |
| DELETE | /products/:id | A | soft delete (isActive=false) |

## Taxes (BE-1)
| GET | /taxes | A/S | |
| POST | /taxes | A | `{name,type:"PERCENT"|"FIXED",value,isActive}` |
| PUT | /taxes/:id | A | |
| DELETE | /taxes/:id | A | |

## Plans (BE-1)
| GET | /plans | A/S | `?active=true` |
| POST | /plans | A | `{name,price,period:"DAILY"|"WEEKLY"|"MONTHLY"|"YEARLY",minQuantity,availableFrom,availableTo,autoCloseAtEnd,closableEarly,pausable,renewable}` |
| GET | /plans/:id | A/S | |
| PUT | /plans/:id | A | |
| DELETE | /plans/:id | A | |

## Discounts (BE-1)
| GET | /discounts | A | |
| POST | /discounts | A | `{name,type:"FIXED"|"PERCENT",value,minPurchase?,minQuantity?,startDate,endDate,usageLimit,appliesTo:"PRODUCTS"|"SUBSCRIPTION",productIds?:[]}` |
| PUT | /discounts/:id | A | |
| DELETE | /discounts/:id | A | |

## Quotation templates (BE-2)
| GET | /quotation-templates | A/S | |
| POST | /quotation-templates | A/S | `{name,planId,validityDays,lines:[{productId,variantId?,quantity}]}` |
| GET | /quotation-templates/:id | A/S | |
| PUT | /quotation-templates/:id | A/S | |
| DELETE | /quotation-templates/:id | A/S | |

## Subscriptions (BE-2)
| GET | /subscriptions | A/S | `?status=&customerId=&search=&page=&limit=` |
| POST | /subscriptions | A/S | `{customerId,planId,templateId?,startDate,expiryDate,paymentTerms,lines:[{productId,variantId?,quantity,taxId?}]}` -> status DRAFT, auto number SUB-00001. If templateId given and lines omitted, copy lines from template |
| GET | /subscriptions/:id | A/S | includes lines, history |
| PUT | /subscriptions/:id | A/S | only while DRAFT or QUOTATION |
| POST | /subscriptions/:id/transition | A/S | `{to:"QUOTATION"|"CONFIRMED"|"ACTIVE"|"CLOSED"}` 400 on illegal move |
| POST | /subscriptions/:id/pause | A/S | only if plan.pausable |
| POST | /subscriptions/:id/resume | A/S | |
| POST | /subscriptions/:id/renew | A/S | only if plan.renewable |
| POST | /subscriptions/:id/close | A/S | closable early only if plan.closableEarly |

## Invoices (BE-2)
| GET | /invoices | A/S | `?status=&customerId=&overdue=true&from=&to=&page=` |
| GET | /invoices/:id | A/S | lines, payments, balance |
| POST | /invoices/:id/confirm | A/S | DRAFT -> CONFIRMED |
| POST | /invoices/:id/cancel | A/S | DRAFT or CONFIRMED (no payments) -> CANCELLED |
| POST | /invoices/:id/send | A/S | emails invoice (needs CONFIRMED) |
| GET | /invoices/:id/print | A/S | PDF stream |

## Billing (BE-2)
| POST | /billing/run | A | `{asOfDate?}` -> `{created, skippedExisting, errors, total}` |

## Payments (BE-2)
| GET | /payments | A/S | `?invoiceId=&method=&from=&to=` |
| POST | /payments | A/S | `{invoiceId,method:"CASH"|"CARD"|"BANK_TRANSFER"|"UPI"|"CHEQUE",amount,paymentDate,note?}` |

## Dashboard (BE-2)
| GET | /dashboard/summary | A/S | `?from=&to=&customerId=&planId=` -> `{activeSubscriptions,revenueReceived,amountOutstanding,overdueCount,overdueAmount,invoiceCounts:{draft,confirmed,paid},paymentsByMethod:[...]}` |
| GET | /dashboard/overdue | A/S | paginated overdue invoices with `daysOverdue` |
| GET | /dashboard/subscriptions-by-status | A/S | counts per status |

## Portal (BE-2) - role CUSTOMER, always filtered by logged-in customerId
| GET | /portal/subscriptions | C | own only |
| GET | /portal/subscriptions/:id | C | 404 if not own |
| GET | /portal/invoices | C | own only |
| GET | /portal/invoices/:id | C | 404 if not own |
| GET | /portal/invoices/:id/print | C | PDF |

## Standard errors
400 validation, 401 not logged in, 403 wrong role, 404 not found, 409 conflict (duplicate email / duplicate billing period).
