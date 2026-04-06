const MAP = {
  active: ["在籍中", "管理ユーザー"],
  active_retired: ["在籍中", "管理ユーザー", "退職済"],
  retired: ["退職済"],
};

(function () {
  "use strict";

  // pushState/replaceStateをフック（urlの変更を検知）
  (function (history) {
    const pushState = history.pushState;
    history.pushState = function () {
      const result = pushState.apply(history, arguments);

      // 遷移後にDOM操作したい場合は、1フレーム遅らせてから実行
      setTimeout(() => {
        const dropdown = document.getElementById("nkr-dropdown");
        if (dropdown) applyDisplay(dropdown);
      }, 0);

      return result;
    };

    const replaceState = history.replaceState;
    history.replaceState = function () {
      const result = replaceState.apply(history, arguments);

      setTimeout(() => {
        const dropdown = document.getElementById("nkr-dropdown");
        if (dropdown) applyDisplay(dropdown);
      }, 0);

      return result;
    };
  })(window.history);

  kviewer.events.on("view.show", function () {
    if (document.getElementById("nkr-dropdown")) return; // domが2重で生成されないように
    const params = new URLSearchParams(window.location.search);
    const companyId = params.get("companyId") ? params.get("companyId") : sessionStorage.getItem("companyId");

    if (!companyId) {
      window.alert("会社レコード番号が無効です");
      window.close();
    }

    sessionStorage.setItem("companyId", companyId);
    if (window.location.href.includes("/detail")) return;

    const headers = document.getElementsByClassName("flex h-full items-center")[0];

    const nkrDropdown = create_nkr_dropdown();
    headers.insertBefore(nkrDropdown, headers.firstChild);
    const dropdown = document.getElementById("nkr-dropdown");
    applyDisplay(dropdown); // 初期表示設定
    dropdown.addEventListener("change", () => {
      applyFilter(MAP[dropdown.value]);
    });
  });
})();

function applyDisplay(dropdown) {
  const params = new URLSearchParams(window.location.search);
  const additionalFilters = params.get("additionalFilters");
  if (additionalFilters && JSON.parse(additionalFilters)[0].field == "在籍状況") {
    let initValue = null;
    for (const [key, value] of Object.entries(MAP)) {
      if (JSON.stringify(value) === JSON.stringify(JSON.parse(params.get("additionalFilters"))[0].value)) {
        initValue = key;
      }
    }
    if (initValue) dropdown.value = initValue;
  } else if (additionalFilters) {
    dropdown.value = "";
  } else {
    // 初期状態に遷移
    const paramKey = "additionalFilters";
    const paramValue = '[{"field":"在籍状況","sign":"in","value":["在籍中","管理ユーザー"],"with":"and"}]';
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set(paramKey, paramValue);
    window.location.href = currentUrl.toString();
  }
}

function create_nkr_dropdown() {
  const nkrDropdown = document.createElement("div");
  nkrDropdown.classList.add("text-m", "font-bold");
  // 2025.12.01 リスト表示順修正 Start editBySasa
  // nkrDropdown.innerHTML = `
  //   <select id="nkr-dropdown">
  //     <option value='active_retired'>在籍者 + 退職者</option>
  //     <option value='active'>在籍者のみ</option>
  //     <option value='retired'>退職者のみ</option>
  //   </select>
  // `;
  nkrDropdown.innerHTML = `
    <select id="nkr-dropdown">
      <option value='active'>在籍者のみ</option>
      <option value='active_retired'>在籍者 + 退職者</option>
      <option value='retired'>退職者のみ</option>
    </select>
  `;
  // 2025.12.01 リスト表示順修正 End
  return nkrDropdown;
}

function applyFilter(value) {
  const paramArr = [
    {
      field: "在籍状況",
      sign: "in",
      value: value,
      with: "and",
    },
  ];

  const url = new URL(window.location.href); // 現在のURLを取得
  url.searchParams.set("additionalFilters", JSON.stringify(paramArr)); // クエリ追加（既にあれば上書き）
  window.location.href = url.href; // ページをそのURLに遷移
}
