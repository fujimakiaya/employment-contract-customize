(function () {
  "use strict";
  const Params = new URLSearchParams(window.location.search);
  const companyName = Params.get("companyName") || "";
  const companyId = Params.get("companyId") || "";
  fb.events.form.mounted.push(function (state) {
    state.record.会社名.value = companyName;
    state.record.会社レコード番号.value = companyId;
    return state;
  });
})();
