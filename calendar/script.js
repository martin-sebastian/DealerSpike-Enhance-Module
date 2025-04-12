let ec = new EventCalendar(document.getElementById("ec"), {
  view: "timeGridWeek",
  events: [
    // your list of events
  ],
});

ec.render();
