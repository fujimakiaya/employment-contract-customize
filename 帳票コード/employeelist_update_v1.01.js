(function () {
  "use strict";
  const LOCATED_URL = new URL(window.location.href);
  const PARAMS = LOCATED_URL.searchParams; //渡したパラメータを取得

  // レコード一覧から社員番号を特定し雇用契約書閲覧kVに遷移する
  kviewer.events.on("records.show", function (state) {
    const records = state.records;
    const emplist = [];

    console.log(records);

    records.forEach((record) => {
      const k = record.kintoneRecord;

      emplist.push({
        社員No: k.社員No?.value ?? "",
        契約締結日: k.契約締結日?.value ?? "",
        id: k.$id?.value ?? "",
        更新日時: k.更新日時?.value ?? "",
      });
    });

    const latestByEmp = {};

    emplist.forEach((item) => {
      const empNo = item.社員No;
      const updatedAt = item.更新日時;

      if (!empNo || !updatedAt) return;

      if (
        !latestByEmp[empNo] ||
        new Date(updatedAt) > new Date(latestByEmp[empNo].更新日時)
      ) {
        latestByEmp[empNo] = item;
      }
    });

    // 🔹 最新IDだけの配列
    const latestIds = Object.values(latestByEmp).map((obj) => obj.id);

    // latestIds は「表示したいID配列」
    const latestIdsSet = new Set(latestIds.map(String));

    // 一覧の全行取得
    document.querySelectorAll("tr.kv-list-record").forEach((row) => {
      // レコード番号セルを取得
      const recordCell = row.querySelector(
        '[data-field-code="レコード番号"] div',
      );

      if (!recordCell) return;

      const recordNumber = recordCell.textContent.trim();

      // latestIds に含まれていない場合は非表示
      if (!latestIdsSet.has(recordNumber)) {
        row.style.display = "none";
      }
    });

    return state;
  });
})();
