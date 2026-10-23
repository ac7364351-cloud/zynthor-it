/**
 * Universal navigation helper for "Get a Quote" and "Discuss Your Project" actions.
 * Ensures the viewport scrolls precisely to the contact form, positioning it
 * cleanly below the fixed header without scrolling past or stopping short.
 */
export const scrollToContactForm = () => {
  const formElem = document.getElementById("contact-form") || document.getElementById("contact");
  if (formElem) {
    formElem.scrollIntoView({ behavior: "smooth", block: "start" });
    return true;
  }
  return false;
};
