(function () {
  "use strict";
  const LOCATED_URL = new URL(window.location.href);
  const PARAMS = LOCATED_URL.searchParams; //渡したパラメータを取得

  // // レコード一覧ビューの表示を消す
  // kviewer.events.on('view.index.show', function (state) {
  //     document.getElementById("__next").style.display="none";
  // //    console.log("view.indexl.show in");
  // //    setTimeout(()=>{}, 5000);
  //     return state;
  // });

  // レコード一覧から社員番号を特定し雇用契約書閲覧kVに遷移する
  kviewer.events.on("records.show", function (state) {
    const pButton1 = make_iconButton(
      "printer",
      "雇用契約書閲覧",
      "nkrfs-button1",
    );
    pButton1.addEventListener("click", function () {
      let url;
      const nameParam = `&name=${PARAMS.get("name")}`;
      const records = state.records;

      // 社員Noを文字列として取得
      const emplist = records
        .map((record) => record.kintoneRecord.社員No.value)
        .filter((v) => v !== undefined && v !== null && v !== "");

      // additionalFiltersをオブジェクトで作る
      const filters = [
        {
          field: "社員No",
          sign: "in",
          value: emplist, // ← 文字列配列
          with: "and",
        },
      ];

      // URLエンコード
      const param =
        "?additionalFilters=" + encodeURIComponent(JSON.stringify(filters));
      url =
        "https://5ea2a167.viewer.kintoneapp.com/public/nkrsv2-8-newkv-koyou-agreement-print-3565-999";
      url = url + param + nameParam;
      window.open(url, "_blank");
      console.log(emplist);
    });
    return state;
  });
})();
