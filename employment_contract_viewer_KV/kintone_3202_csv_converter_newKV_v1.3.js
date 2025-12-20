// The MIT License (MIT)

// Copyright (c) 2015 Matthew Holt

// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
// the Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
// FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
// IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
// CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// MIT License

// Copyright (c) 2012 polygonplanet

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

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
    const companyId = params.get("companyId")
      ? params.get("companyId")
      : sessionStorage.getItem("companyId");

    if (!companyId) {
      window.alert("会社レコード番号が無効です");
      window.close();
    }
    loadPapaParse(); // 読み込み
    loadEncodingJapaneseScript();

    sessionStorage.setItem("companyId", companyId);
    if (window.location.href.includes("detail")) return;

    const headers = document.getElementsByClassName(
      "flex h-full items-center"
    )[0];
    // const downloadButton = create_button("名簿ダウンロード ↓", "現在表示されている名簿がダウンロードされます");
    // downloadButton.addEventListener("click", () => downloadCsv(companyId));
    // headers.insertBefore(downloadButton, headers.firstChild);

    const nkrDropdown = create_nkr_dropdown();
    headers.insertBefore(nkrDropdown, headers.firstChild);
    const dropdown = document.getElementById("nkr-dropdown");
    // applyDisplay(dropdown); // 初期表示設定
    sessionStorage.setItem("filters", JSON.stringify(MAP[dropdown.value]));
    dropdown.addEventListener("change", () => {
      // applyFilter(MAP[dropdown.value]);
      sessionStorage.setItem("filters", JSON.stringify(MAP[dropdown.value]));
    });
  });
})();

function applyDisplay(dropdown) {
  const params = new URLSearchParams(window.location.search);
  const additionalFilters = params.get("additionalFilters");
  if (
    additionalFilters &&
    JSON.parse(additionalFilters)[0].field == "在籍状況"
  ) {
    let initValue = null;
    for (const [key, value] of Object.entries(MAP)) {
      if (
        JSON.stringify(value) ===
        JSON.stringify(JSON.parse(params.get("additionalFilters"))[0].value)
      ) {
        initValue = key;
      }
    }
    if (initValue) dropdown.value = initValue;
  } else if (additionalFilters) {
    dropdown.value = "";
  } else {
    dropdown.selectedIndex = 0;
  }
}

function create_button(text, tipText = null) {
  let tipDom = "";
  if (tipText) {
    tipDom = `<div class="nkr-tooltip-text">${tipText}</div>`;
  }
  const button = document.createElement("div");
  button.className = "ml-4 nkr-tooltip-target";
  button.innerHTML = `
    ${tipDom}
    <div class="relative" data-headlessui-state="">
      <div
        aria-haspopup="menu"
        aria-expanded="false"
        data-headlessui-state=""
      >
        <button
          type="button"
          class="flex flex-col items-center md:flex-row md:gap-2 md:rounded-full md:p-2 md:hover:bg-role-hover"
        >
          <span class="text-m font-bold">${text}</span>
        </button>
      </div>
    </div>
    `;

  return button;
}

function create_nkr_dropdown() {
  const nkrDropdown = document.createElement("div");
  nkrDropdown.classList.add("text-m", "font-bold");
  nkrDropdown.innerHTML = `
    <select id="nkr-dropdown">
      <option value='active_retired'>在籍者 + 退職者</option>
      <option value='active'>在籍者のみ</option>
      <option value='retired'>退職者のみ</option>
    </select>
  `;

  return nkrDropdown;
}

function applyFilter(value) {
  console.log(value);
  // const paramArr = [
  //   {
  //     field: "在籍状況",
  //     sign: "in",
  //     value: value,
  //     with: "and",
  //   },
  // ];
  // const url = new URL(window.location.href); // 現在のURLを取得
  // url.searchParams.set("additionalFilters", JSON.stringify(paramArr)); // クエリ追加（既にあれば上書き）
  // window.location.href = url.href; // ページをそのURLに遷移
}

async function downloadCsv(companyId) {
  showSpinner(); // スピナー表示

  let condition = []; // 会社レコード番号の絞り込みはcsvを取得してから
  let ope = "and";
  let order = [];

  let url = new URL(window.location.href);
  let params = url.searchParams;
  let entries = params.entries();
  for (let entry of entries) {
    try {
      const value = JSON.parse(entry[1]); // ← ここでJSONとして扱う

      // 配列として中身を確認する
      if (Array.isArray(value)) {
        value.forEach((item) => {
          if (item.with) {
            // 絞り込み条件
            const conditionObj = {
              key: item.field,
              operator: item.sign,
              value: item.value,
            };
            condition.push(conditionObj);
            ope = item.with;
          } else {
            // 並び替え条件
            const orderObj = {
              fieldCode: item.field,
              sort: item.order,
            };
            order.push(orderObj);
          }
        });
      }
      if (order.length == 0) {
        order.push({
          fieldCode: "社員No",
          sort: "asc",
        });
      }
    } catch (e) {
      console.warn("JSONパース失敗:", entry[1]);
    }
  }

  try {
    const response = await fetch(
      "https://cli-kintone-881840726050.asia-northeast1.run.app/export",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appId: "3202",
          fileName: "employee_list",
          fields: [
            "レコード番号",
            "社員No",
            "姓戸籍",
            "名戸籍",
            "セイ戸籍カナ",
            "メイ戸籍カナ",
            "性別戸籍",
            "生年月日",
            "郵便番号",
            "住所1",
            "住所2",
            "住所2カナ",
            "住所3",
            "住所3カナ",
            "住所4",
            "住所4カナ",
            "携帯番号",
            "入社年月日",
            "社会保険取得年月日",
            "基礎年金番号",
            "社保喪失年月日",
            "被保険者整理番号",
            "雇用保険取得年月日",
            "雇保喪失年月日",
            "週所定労働時間",
            "職種",
            "所属事業所",
            "契約期間",
            "契約開始日",
            "契約終了日",
            "退職年月日",
            "離職理由",
            "姓ビジネス",
            "名ビジネス",
            "セイビジネスカナ",
            "メイビジネスカナ",
            "個人メールアドレス",
            "緊急連絡先", // テーブル. 以下項目を含む　のちに削除
            // "緊急連絡先姓",
            // "緊急連絡先名",
            // "緊急連絡先姓カナ",
            // "緊急連絡先名カナ",
            // "続柄",
            // "電話番号",
            // "電話番号予備",
            // "住所",
            // "通勤経路情報", // テーブル. 以下項目を含む　のちに削除 // 要望により削除2025.05.03
            // "通勤手段",
            // "乗車駅",
            // "降車駅",
            // "片道運賃",
            // "定期代",
            // "定期券期間",
            // "片道距離",
            // "所要時間",
            "給与振込口座情報", // テーブル　のちに削除
            "在留カード所有",
            "ローマ字",
            "在留カードナンバー",
            "国籍",
            "在留資格",
            "在留期間",
            "資格外活動の許可",
            "派遣・請負の区分",
            "就労制限の有無",
            "障害者区分",
            "基礎年金番号有無",
            "雇用保険番号",
            "前職名",
            "前職退職日",
            "雇用保険番号有無",
            "雇用形態",
            "給与形態",
            "役職",
            "契約更新条項の有無",
            "離職票交付",
            "離職票送り先",
            "離職後の住所",
            "具体的な離職理由",
            "健康保険任意継続",
            "一回の契約期間",
            "通算の契約期間",
            "前回の契約更新時に次回の更新について",
            "契約の更新回数",
            "労働者の意思表示",
            "_401k加入有無",
            "本人マイナンバー結果",
            "会社レコード番号",
          ],
          condition: condition,
          conditionOpe: ope,
          orderBy: order,
        }),
      }
    );

    if (!response.ok) {
      alert("ダウンロードに失敗しました");
      throw new Error("Network response was not ok");
    }
    const contentDisposition = response.headers.get("Content-Disposition");
    const fileNameFromHeader =
      contentDisposition?.split("filename=")[1]?.replace(/"/g, "") ||
      "download.csv";

    // Shift_JISで送られてきたCSVデータをArrayBufferで読み取り
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const decoder = new TextDecoder("shift_jis");
    const text = decoder.decode(arrayBuffer);

    // CSVをオブジェクト形式に変換
    const parsed = Papa.parse(text, { header: true });

    // "会社レコード番号"が"327"である行のみを抽出
    const filteredByRecordNumber = parsed.data.filter(
      (row) => row["会社レコード番号"] === companyId
    );

    // 削除したい列名
    const columnsToRemove = [
      "緊急連絡先",
      "給与振込口座情報",
      "会社レコード番号",
    ];

    // 該当列を削除
    const filteredData = filteredByRecordNumber.map((row) => {
      columnsToRemove.forEach((col) => delete row[col]);
      return row;
    });

    // CSV文字列に戻す
    const newCsv = Papa.unparse(filteredData);

    // UTF-16 → Shift_JIS（エンコード）
    const sjisArray = Encoding.convert(Encoding.stringToCode(newCsv), {
      to: "SJIS",
      type: "array",
    });
    const sjisBlob = new Blob([new Uint8Array(sjisArray)], {
      type: "text/csv",
    });

    // ダウンロード処理
    const url = URL.createObjectURL(sjisBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileNameFromHeader;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    hideSpinner(); // スピナー非表示
  }
}

function loadPapaParse() {
  const script = document.createElement("script");
  script.src =
    "https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js";
  document.head.appendChild(script);
}

function loadEncodingJapaneseScript() {
  const script = document.createElement("script");
  script.src =
    "https://cdn.jsdelivr.net/npm/encoding-japanese@2.0.0/encoding.min.js";
  document.head.appendChild(script);
}
