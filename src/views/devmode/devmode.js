import {Tooltip} from "bootstrap";

const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
tooltipTriggerList.forEach(function (tooltipTriggerEl) {
  new Tooltip(tooltipTriggerEl);
});