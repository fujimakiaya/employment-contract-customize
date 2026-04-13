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
    //    console.log("records.show in");
    let url;
    document.getElementById("__next").style.display = "none";
    const nameParam = `&name=${PARAMS.get("name")}`;

    const records = state.records;
    const emplist = [];
    records.forEach((record) => {
      emplist.push(record.kintoneRecord.社員No.value);
    });
    console.log(emplist);

    // url =
    //   "https://5ea2a167.viewer.kintoneapp.com/public/nkrsv2-8-newkv-koyou-agreement-3565-999";
    // const param = `?additionalFilters=[{"field":"社員No","sign":"in","value":[${emplist}],"with":"and"}]`;
    // url = url + param + nameParam;
    //    window.location.href = url;
    return state;
  });
})();
