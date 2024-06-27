import {Tooltip, Dropdown} from "bootstrap";

const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
tooltipTriggerList.forEach(function (tooltipTriggerEl) {
  new Tooltip(tooltipTriggerEl);
});

const tocToggle = document.querySelector('.toc-toggle');
if (tocToggle) {
  // Close the dropdown toc when the window is resized
  addEventListener('resize', () => {
    if (tocToggle.classList.contains('show')) {
      /** @type {Dropdown|null} */
      const dropdown = Dropdown.getInstance(tocToggle);
      if (dropdown) {
        dropdown.hide();
      }
    }
  });
}