// Suggested categories for Rental House items, in display order.
// Admins can still type any other category; unknown ones are listed after these.
export const RENTAL_CATEGORIES = [
  "Body",
  "Lens",
  "Đèn",
  "Phụ kiện đèn",
  "Gimbal",
  "Monitor",
  "Wireless",
  "Audio",
  "Phụ kiện",
];

export const UNCATEGORIZED = "Khác";

export const sortCategories = (categories: string[]) =>
  [...categories].sort((a, b) => {
    const ia = RENTAL_CATEGORIES.indexOf(a);
    const ib = RENTAL_CATEGORIES.indexOf(b);
    if (a === UNCATEGORIZED) return 1;
    if (b === UNCATEGORIZED) return -1;
    if (ia === -1 && ib === -1) return a.localeCompare(b, "vi");
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
