(function () {
  ("use strict");

  let title;
  let confirmBack = false;
  let replace = undefined;
  let ledgerNames = [];
  let mode;

  const Params = new URLSearchParams(window.location.search);
  const paper = Params.get("__kViewerViewCode__");
  const paper_new = Params.get("帳票種別");
  if (paper !== null) {
    if (paper.includes("enrollment")) {
      title = "在職証明書";
    } else if (paper.includes("worker")) {
      title = "労働者名簿";
    } else if (paper.includes("retirement")) {
      title = "退職証明書";
    } else if (paper.includes("dismissal")) {
      title = "解雇理由証明書";
    } else if (paper.includes("appointment")) {
      title = "辞令";
    }
  } else if (paper_new !== null) {
    title = paper_new;
  }
  console.log(title);
  if (title == "労働者名簿") {
    document.getElementsByTagName("main")[0].style.visibility = "hidden";
  }

  if (ledgerNames.length == 0) {
    ledgerNames.push(title);
  }
  if (ledgerNames[0] == "退職証明書") {
    ledgerNames.push("退職解雇理由");
  }

  const actions = {
    在職証明書: {
      func1: zaisyoku1,
      table_name: "在職証明書履歴テーブル",
      number: 3,
    },
    労働者名簿: {
      func1: meibo1,
      table_name: "労働者名簿テーブル",
      number: 4,
    },
    辞令: { func1: jirei1, table_name: "辞令履歴テーブル", number: 2 },
    退職証明書: {
      func1: taisyoku1,
      table_name: "退職証明書テーブル",
      number: 5,
    },
    解雇理由証明書: {
      func1: kaiko1,
      table_name: "解雇理由証明書テーブル",
      number: 6,
    },
  };

  const field_content1 = {
    //      雇用契約書: "雇用契約書公開承認日",
    //      労働条件通知書: "雇用契約書公開承認日",
    辞令: "文書確定辞令",
    在職証明書: "文書確定在職証明書",
    労働者名簿: "文書確定労働者名簿",
    退職証明書: "文書確定退職証明書",
    解雇理由証明書: "文書確定解雇理由証明書",
  };

  const field_content2 = {
    //      雇用契約書: "雇用契約書公開承認日",
    //      労働条件通知書: "雇用契約書公開承認日",
    辞令: "辞令公開承認日",
    在職証明書: "在職証明書公開承認日",
    労働者名簿: "労働者名簿公開承認日",
    退職証明書: "退職証明書公開承認日",
    解雇理由証明書: "解雇理由証明書公開承認日",
  };

  const field_content4 = {
    辞令: "サブ辞令文書番号",
    在職証明書: "サブ在職証明書文書番号",
    労働者名簿: "サブ労働者名簿文書番号",
    退職証明書: "サブ退職証明書文書番号",
    解雇理由証明書: "サブ解雇理由証明書文書番号",
  };

  const field_content3 = {
    辞令: "辞令文書番号",
    在職証明書: "在職証明書文書番号",
    労働者名簿: "労働者名簿文書番号",
    退職証明書: "退職証明書文書番号",
    解雇理由証明書: "解雇理由証明書文書番号",
  };

  // *** formbridge event - confirm.mounted ***
  fb.events.confirm.mounted = [
    function (state) {
      let displayValue = state.record;

      if (replace.replaceDateToString(displayValue)) {
        alert("no action since there is table with Date Object");
        return state;
      }

      showSpinner(); // スピナー表示
      let i = 1;
      while (replace.replaceGetStatus() != 1 && i < 10) {
        setTimeout(() => {}, 200);
        i = i + 1;
      }
      if (replace.replaceGetStatus() != 1) {
        alert(
          "帳票フィールド管理データが取得できません。\n時間をおいて再試行してください"
        );
        //      window.close();
        hideSpinner(); // スピナー非表示
        return state;
      }

      let elem = document.getElementsByClassName("ui header fb-title")[0];
      elem.children[0].innerText = title;
      elem = elem.parentElement.children[1];
      elem.children[0].style.display = "none";
      console.log("next step");

      let displayHtml = new Map();
      for (let ledgerName of ledgerNames) {
        replace.replaceGetValue(ledgerName, displayValue);
        const display_html = replace.replaceValueProcess(ledgerName);
        displayHtml.set(ledgerName, display_html);
      }

      let newDiv = document.createElement("div");
      newDiv.classList.value = "nkrfs grow";
      newDiv.setAttribute("id", "nkrfs-print");
      elem.prepend(newDiv);

      const newHTML1 = document.createElement("html");
      newHTML1.setAttribute("id", "print-area");

      let DoubleLineflag = false;
      if (ledgerNames[0] == "退職証明書") {
        if (
          displayValue["離職理由_書面"].value == "解雇" &&
          displayValue["労働者が解雇理由を請求するか_退職証明"].value ==
            "解雇理由を請求しない"
        ) {
          DoubleLineflag = true;
        }
      }
      for (const ledgerName of ledgerNames) {
        const inText1 = displayHtml.get(ledgerName);
        if (inText1) {
          const newHTML1 = document.createElement("div");
          newHTML1.innerHTML = inText1;
          newDiv.append(newHTML1);
        }
        if (ledgerNames[0] == "退職証明書") {
          if (
            displayValue["離職理由_書面"].value !== "解雇" ||
            displayValue["労働者が解雇理由を請求するか_退職証明"].value ==
              "解雇理由を請求しない"
          ) {
            break;
          }
        }
      }
      if (ledgerNames[0] == "退職証明書" && DoubleLineflag == true) {
        let element = document.getElementById("cssstyle");
        element.style.textDecoration = "line-through";
        element.style.textDecorationColor = "black";
        element.style.textDecorationStyle = "double";
      }

      if (ledgerNames[0] == "労働者名簿") {
        let companyId = state.record.会社レコード番号.value;
        const empId = record.社員No.value;
        const lastName = record.姓戸籍.value;
        const firstName = record.名戸籍.value;
        if (companyId === "") companyId = Params.get("companyId");

        document
          .querySelector(".ui.teal.labeled.icon.button.fb-submit")
          ?.click();

        setTimeout(() => {
          const url = `https://5ea2a167.viewer.kintoneapp.com/public/nkrfsv2-8-newkv-print-workerinfo-3218-999`;
          const param = `?additionalFilters=[{"field":"社員No","sign":"=","value":"${empId}","with":"and"}]&employeeId=${empId}&familyName=${lastName}&givenName=${firstName}&companyId=${companyId}`;
          window.location.href = url + param;
        }, 500);
      }

      //  if (displayValue.文書確定.value.length === 0) {
      let dateOnPaper = displayValue[field_content2[ledgerNames[0]]].value;
      dateOnPaper = dateOnPaper.slice(0, dateOnPaper.indexOf("T"));
      const chkDate = new Date(dateOnPaper);
      if (isNaN(chkDate.getDate())) {
        addWatermarkInNewTab();
      } else {
        removeWatermarkInNewTab();
      }

      hideSpinner(); // スピナー非表示

      const key = ledgerNames[0];
      if (
        state.record[field_content3[key]].value == "" &&
        (mode == "作成" || mode == "更新")
      ) {
        state.record[field_content4[key]].value = "000";
        const dateStr = new Date()
          .toLocaleDateString("ja-JP", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })
          .replaceAll("/", "");
        state.record[field_content3[key]].value =
          dateStr +
          "-" +
          state.record.会社レコード番号.value +
          "-" +
          state.record.社員No.value;
      }

      return state;
    },
  ];

  // *** formbridge event - form.mounted ***
  fb.events.form.mounted.push(function (state) {
    document.querySelectorAll('input[type="radio"]').forEach((radio) => {
      radio.removeAttribute("aria-hidden");
    });
    console.log("form.mounted");
    if (title == "労働者名簿") {
      showSpinner();
    }
    let companyId = state.record.会社レコード番号.value;
    if (companyId === "") companyId = Params.get("companyId");

    if (confirmBack === false) {
      const dismissalDate = state.record.解雇理由証明書公開承認日.value;
      const enrollmentDate = state.record.在職証明書公開承認日.value;
      const workerDate = state.record.労働者名簿公開承認日.value;
      const retirementDate = state.record.退職証明書公開承認日.value;
      const appointmentDate = state.record.辞令公開承認日.value;

      mode = "作成";
      if (paper !== null && !paper.includes("transition")) {
        mode = "修正";
      }

      const key = title;
      if (mode == "更新" && confirmBack === false) {
        state.record[field_content1[key]].value = [];
        state.record[field_content2[key]].value = "";
      } else if (mode != "作成" && confirmBack === false) {
        state.record[field_content1[key]].value = [];
        state.record[field_content2[key]].value = "";
      }

      fb.events.fields[field_content1[key]].changed = [
        function (state) {
          const checkboxValues = state.record[field_content1[key]].value;
          if (checkboxValues && checkboxValues.includes("はい")) {
            const date1 = new Date().toLocaleDateString().replaceAll("/", "-");
            const time1 = new Date().toLocaleTimeString();
            const value1 = date1 + "T" + time1 + "+09:00";

            state.record[field_content2[key]].value = value1;
          } else {
            state.record[field_content2[key]].value = "";
          }
          return state;
        },
      ];

      switch (title) {
        case "解雇理由証明書":
          if (typeof dismissalDate === "object") {
            mode = "再発行";
            state.record.解雇理由証明書公開承認日.value = "";
            state.record.解雇理由証明書作成日.value =
              moment().format("YYYY-MM-DD");
          }
          break;

        case "在職証明書":
          if (typeof enrollmentDate === "object") {
            mode = "再発行";
            state.record.在職証明書公開承認日.value = "";
            state.record.在職証明書作成日.value = moment().format("YYYY-MM-DD");
          }
          break;

        case "労働者名簿":
          if (typeof workerDate === "object") {
            mode = "再発行";
            state.record.労働者名簿公開承認日.value = "";
            state.record.労働者名簿作成日.value = moment().format("YYYY-MM-DD");
          }
          break;

        case "退職証明書":
          if (typeof retirementDate === "object") {
            mode = "再発行";
            state.record.退職証明書公開承認日.value = "";
            state.record.退職証明書作成日.value = moment().format("YYYY-MM-DD");
          }
          break;

        case "辞令":
          if (typeof appointmentDate === "object") {
            mode = "再発行";
            state.record.辞令公開承認日.value = "";
            state.record.辞令作成日.value = moment().format("YYYY-MM-DD");
          }
          break;
      }
      title = title + mode;
    }

    let elem = document.getElementsByClassName("ui header fb-title")[0];
    elem.children[0].innerText = title;

    if (replace === undefined) {
      replace = new ReplaceValue(companyId, "form");
      replace.replaceInitProcess(ledgerNames);
    }

    return state;
  });

  //tableに追加 藤巻変更
  fb.events.confirm.created.push(function (state) {
    const field_object = state.record;
    const recordType = field_object.帳票種別.value;
    tableAddRow(actions, recordType, field_object, mode);
    if (
      field_object.帳票種別.value == "退職証明書" &&
      field_object.離職理由_書面.value == "解雇" &&
      field_object.労働者が解雇理由を請求するか_退職証明.value ==
        "解雇理由を請求する"
    ) {
      tableAddRow_Fire(actions, recordType, field_object, mode);
      console.log("success");
    }
    return state;
  });

  fb.events.confirm.submit.push(function (state) {
    console.log("confirm.submit");
    if (document.getElementById("nkrfs-print") !== null) {
      document.getElementById("nkrfs-print").remove();
    }
    return state;
  });

  fb.events.confirm.back.push(function (state) {
    console.log("confirm.submit");
    //tableから削除　藤巻変更
    const field_object = state.record;
    const recordType = field_object.帳票種別.value;
    if (mode !== "修正") {
      tableRemoveRow(actions, recordType, field_object);
      if (
        field_object.帳票種別.value == "退職証明書" &&
        field_object.離職理由_書面.value == "解雇" &&
        field_object.労働者が解雇理由を請求するか_退職証明.value ==
          "解雇理由を請求する"
      ) {
        tableRemoveRow_Fire(actions, recordType, field_object, mode);
      }
    }
    if (document.getElementById("nkrfs-print") !== null) {
      document.getElementById("nkrfs-print").remove();
    }
    confirmBack = true;
    removeWatermarkInNewTab();
    return state;
  });

  fb.events.kviewer.record.mapped.push(function (state) {
    console.log("record.mapped");
    if (title === "雇用契約書") return state;
    state.record.employeeId.value = state.record.社員No.value;
    state.record.companyId.value = state.record.会社レコード番号.value;
    state.record.帳票種別.value = title;
    return state;
  });
})();

function loadKanaConverter() {
  if (typeof KanaConverter === "undefined") {
    const url =
      "https://cdn.jsdelivr.net/gh/kento-nkr/kana_converter/KanaConverter.js";
    return new Promise((resolve, reject) => {
      let script = document.createElement("script");
      script.onload = resolve;
      script.onerror = reject;
      script.src = url;
      document.head.appendChild(script);
    });
  } else {
    return Promise.resolve();
  }
}

loadKanaConverter()
  .then(() => {
    const largeFields = [
      "証明者所在地_在職",
      "在職証明書に記載する事項_在職",
      "代表者氏名_在職",
      "住所_労働者名簿",
      "退職または死亡事由_労働者名簿",
      "辞令の内容_辞令",
      "代表者氏名_辞令",
      "使用者職氏名_退職証明",
      "具体的な理由_退職証明",
      "具体的な理由_ア",
      "具体的な理由_イ",
      "具体的な理由_ウ",
      "具体的な理由_エ",
      "具体的な理由_オ",
      "具体的な理由_カ",
      "使用者職氏名_解雇理由",
    ];

    largeFields.forEach((field) => {
      //        fb.events.fields[field].changed = [                        /*20240615  change = to push
      fb.events.fields[field].changed.push(
        function (state) {
          if (state.record[field].value) {
            console.log(`Original value: ${state.record[field].value}`); // 元の値をログ出力
            state.record[field].value = KanaConverter.halfToFull(
              state.record[field].value
            ); // フィールドの値を変換
            console.log(`Converted value: ${state.record[field].value}`); // 変換後の値をログ出力
          }
          //           state.event.stopImmediatePropagation();
          return state;
        }
        //        ];
      );
    });
  })
  .catch((err) => {
    console.error("KanaConverter could not be loaded", err);
  });

///////function///////////////////////////////////////////////////////////////////

//tableに行を追加し、値を入れる
function tableAddRow(actions, recordType, field_object, mode) {
  const action = actions[recordType];
  if (field_object.帳票種別.value) {
  }
  if (action) {
    action.func1(field_object, mode);
  }
  // console.warn(`未定義の帳票種別: ${recordType}`);
  return null;
}

//戻るボタンを押した際にtableを１行削減
function tableRemoveRow(actions, recordType, field_object) {
  const table_name1 = actions[recordType].table_name;
  const table = field_object[table_name1].value;
  table.length -= 1;
}

//tableに行を追加し、値を入れる
function tableAddRow_Fire(actions, recordType, field_object, mode) {
  recordType = "解雇理由証明書";
  const action = actions[recordType];
  if (field_object.帳票種別.value) {
  }
  if (action) {
    action.func1(field_object, mode);
  }
  // console.warn(`未定義の帳票種別: ${recordType}`);
  return null;
}

//戻るボタンを押した際にtableを１行削減
function tableRemoveRow_Fire(actions, recordType, field_object) {
  recordType = "解雇理由証明書";
  const table_name1 = actions[recordType].table_name;
  const table = field_object[table_name1].value;
  table.length -= 1;
}

//各帳票におけるテーブルへの代入
function zaisyoku1(field_object, mode) {
  let table_object = field_object.在職証明書履歴テーブル;
  let last_row = table_object.value.length - 1;
  if (
    (last_row != 0 ||
      table_object.value[last_row].value.送信日_在職証明テーブル.value != "") &&
    mode !== "修正"
  ) {
    document
      .querySelectorAll('div[data-vv-name="在職証明書履歴テーブル"]')[0]
      .getElementsByClassName("ui circular blue icon button")[0]
      .click(); //テーブルに一行追
    last_row = last_row + 1;
  }
  table_object.value[last_row].value.送信日_在職証明テーブル.value =
    moment().format("YYYY-MM-DD HH:mm");
  table_object.value[last_row].value.在職証明書作成日_在職テーブル.value =
    field_object.在職証明書作成日.value;
  table_object.value[last_row].value.在職証明書作成者_在職テーブル.value =
    field_object.在職証明書作成者.value;
  table_object.value[last_row].value.在職証明書公開承認日_在職テーブル.value =
    field_object.在職証明書公開承認日.value;
  table_object.value[last_row].value.在職証明書公開承認者_在職テーブル.value =
    field_object.在職証明書公開承認者.value;
  table_object.value[last_row].value.労働者氏_在職証明テーブル.value =
    field_object.労働者氏_在職.value;
  table_object.value[last_row].value.労働者名_在職証明テーブル.value =
    field_object.労働者名_在職.value;
  table_object.value[last_row].value.住所_在職証明テーブル.value =
    field_object.住所_在職.value;
  table_object.value[last_row].value.生年月日_在職証明テーブル.value =
    field_object.生年月日_在職.value;
  table_object.value[last_row].value.入社年月日_在職証明テーブル.value =
    field_object.入社年月日_在職.value;
  table_object.value[last_row].value.業務内容_在職証明テーブル.value =
    field_object.業務内容_在職.value;
  table_object.value[last_row].value.備考_在職証明テーブル.value =
    field_object.在職証明書に記載する事項_在職.value;
  table_object.value[last_row].value.証明書所在地_在職証明テーブル.value =
    field_object.証明者所在地_在職.value;
  table_object.value[last_row].value.事業所の名称_在職証明テーブル.value =
    field_object.事業場の名称_在職.value;
  table_object.value[last_row].value.代表者名_在職証明テーブル.value =
    field_object.代表者氏名_在職.value;
}

function meibo1(field_object, mode) {
  let table_object = field_object.労働者名簿テーブル;
  let last_row = table_object.value.length - 1;
  if (
    (last_row != 0 ||
      table_object.value[last_row].value.送信日_労働者名簿テーブル.value !=
        "") &&
    mode !== "修正"
  ) {
    document
      .querySelectorAll('div[data-vv-name="労働者名簿テーブル"]')[0]
      .getElementsByClassName("ui circular blue icon button")[0]
      .click(); //テーブルに一行追
    last_row = last_row + 1;
  }
  table_object.value[last_row].value.送信日_労働者名簿テーブル.value =
    moment().format("YYYY-MM-DD HH:mm");
  //table_object.value[last_row].value.承認の有無_労働者名簿テーブル.value = field_object.承認の有無_労働者名簿.value;
  table_object.value[last_row].value.労働者氏_労働者名簿テーブル.value =
    field_object.労働者氏_労働者名簿.value;
  table_object.value[last_row].value.労働者名_労働者名簿テーブル.value =
    field_object.労働者名_労働者名簿.value;
  table_object.value[last_row].value.労働者セイ_労働者名簿テーブル.value =
    field_object.労働者セイ_労働者名簿.value;
  table_object.value[last_row].value.労働者メイ_労働者名簿テーブル.value =
    field_object.労働者メイ_労働者名簿.value;
  table_object.value[last_row].value.性別_労働者名簿テーブル.value =
    field_object.性別_労働者名簿.value;
  table_object.value[last_row].value.生年月日_労働者名簿テーブル.value =
    field_object.生年月日_労働者名簿.value;
  table_object.value[last_row].value.入社年月日_労働者名簿テーブル.value =
    field_object.入社年月日_労働者名簿.value;
  table_object.value[
    last_row
  ].value.退職または死亡年月日_労働者名簿テーブル.value =
    field_object.退職又は死亡年月日_労働者名簿.value;
  table_object.value[last_row].value.郵便番号_労働者名簿テーブル.value =
    field_object.郵便番号_労働者名簿.value;
  table_object.value[last_row].value.住所フリガナ_労働者名簿テーブル.value =
    field_object.住所フリガナ_労働者名簿.value;
  table_object.value[last_row].value.住所_労働者名簿テーブル.value =
    field_object.住所_労働者名簿.value;
  table_object.value[last_row].value.電話番号_労働者名簿テーブル.value =
    field_object.電話番号_労働者名簿.value;
  table_object.value[last_row].value.所属_労働者名簿テーブル.value =
    field_object.所属_労働者名簿.value;
  table_object.value[last_row].value.職種_労働者名簿テーブル.value =
    field_object.職種_労働者名簿.value;
  table_object.value[last_row].value.退職又は死亡事由_労働者名簿テーブル.value =
    field_object.退職または死亡事由_労働者名簿.value;
  // table_object.value[last_row].value.備考_労働者名簿テーブル.value =
  //   field_object.備考_労働者名簿.value;
  table_object.value[last_row].value.労働者名簿作成日_労働者名簿テーブル.value =
    field_object.労働者名簿作成日.value;
  table_object.value[last_row].value.労働者名簿作成者_労働者名簿テーブル.value =
    field_object.労働者名簿作成者.value;
  table_object.value[
    last_row
  ].value.労働者名簿公開承認日_労働者名簿テーブル.value =
    field_object.労働者名簿公開承認日.value;
  table_object.value[
    last_row
  ].value.労働者名簿公開承認者_労働者名簿テーブル.value =
    field_object.労働者名簿公開承認者.value;
}

function jirei1(field_object, mode) {
  let table_object = field_object.辞令履歴テーブル;
  let last_row = table_object.value.length - 1;
  if (
    (last_row != 0 ||
      table_object.value[last_row].value.送信日_辞令テーブル.value != "") &&
    mode !== "修正"
  ) {
    document
      .querySelectorAll('div[data-vv-name="辞令履歴テーブル"]')[0]
      .getElementsByClassName("ui circular blue icon button")[0]
      .click(); //テーブルに一行追
    last_row = last_row + 1;
  }
  table_object.value[last_row].value.送信日_辞令テーブル.value =
    moment().format("YYYY-MM-DD HH:mm");
  table_object.value[last_row].value.労働者氏_辞令テーブル.value =
    field_object.労働者氏_辞令.value;
  table_object.value[last_row].value.労働者名_辞令テーブル.value =
    field_object.労働者名_辞令.value;
  table_object.value[last_row].value.辞令日付_辞令テーブル.value =
    field_object.辞令日付_辞令.value;
  table_object.value[last_row].value.辞令の内容_辞令テーブル.value =
    field_object.辞令の内容_辞令.value;
  table_object.value[last_row].value.会社名_辞令テーブル.value =
    field_object.会社名_辞令.value;
  table_object.value[last_row].value.代表者名_辞令テーブル.value =
    field_object.代表者氏名_辞令.value;
  table_object.value[last_row].value.辞令作成日_辞令テーブル.value =
    field_object.辞令作成日.value;
  table_object.value[last_row].value.辞令作成者_辞令テーブル.value =
    field_object.辞令作成者.value;
  table_object.value[last_row].value.辞令公開承認日_辞令テーブル.value =
    field_object.辞令公開承認日.value;
  table_object.value[last_row].value.辞令公開承認者_辞令テーブル.value =
    field_object.辞令公開承認者.value;
  if (field_object.辞令公開承認日.value) {
    table_object.value[last_row].value.有効無効フラグ_辞令.value = "有効";
    if (mode === "再発行") {
      table_object.value[last_row - 1].value.有効無効フラグ_辞令.value = "無効";
    }
  } else {
    table_object.value[last_row].value.有効無効フラグ_辞令.value = "無効";
  }
}

function taisyoku1(field_object, mode) {
  let table_object = field_object.退職証明書テーブル;
  let last_row = table_object.value.length - 1;
  if (
    (last_row != 0 ||
      table_object.value[last_row].value.送信日_退職証明テーブル.value != "") &&
    mode !== "修正"
  ) {
    document
      .querySelectorAll('div[data-vv-name="退職証明書テーブル"]')[0]
      .getElementsByClassName("ui circular blue icon button")[0]
      .click(); //テーブルに一行追
    last_row = last_row + 1;
  }
  table_object.value[last_row].value.送信日_退職証明テーブル.value =
    moment().format("YYYY-MM-DD HH:mm");
  table_object.value[last_row].value.労働者氏_退職証明テーブル.value =
    field_object.労働者氏_退職証明.value;
  table_object.value[last_row].value.労働者名_退職証明テーブル.value =
    field_object.労働者名_退職証明.value;
  table_object.value[last_row].value.退職日_退職証明テーブル.value =
    field_object.退職日_退職証明.value;
  table_object.value[last_row].value.証明日_退職証明テーブル.value =
    field_object.退職証明日_退職証明.value;
  table_object.value[last_row].value.事業主氏名又は名称_退職証明テーブル.value =
    field_object.事業主氏名又は名称_退職証明.value;
  table_object.value[last_row].value.使用者職氏名_退職証明テーブル.value =
    field_object.使用者職氏名_退職証明.value;
  table_object.value[last_row].value.退職理由_退職証明テーブル.value =
    field_object.離職理由_書面.value;
  table_object.value[last_row].value.その他の理由_退職証明テーブル.value =
    field_object.具体的な理由_退職証明.value;
  table_object.value[
    last_row
  ].value.労働者が解雇理由を請求_退職証明テーブル.value =
    field_object.労働者が解雇理由を請求するか_退職証明.value;
  table_object.value[last_row].value.退職証明書作成日_退職テーブル.value =
    field_object.退職証明書作成日.value;
  table_object.value[last_row].value.退職証明書作成者_退職テーブル.value =
    field_object.退職証明書作成者.value;
  table_object.value[last_row].value.退職証明書公開承認日_退職テーブル.value =
    field_object.退職証明書公開承認日.value;
  table_object.value[last_row].value.退職証明書公開承認者_退職テーブル.value =
    field_object.退職証明書公開承認者.value;

  let name2 = field_object.離職理由_書面.value;
  if (name2 == "あなたの自己都合による退職") {
    field_object.離職理由_転記用.value = "ア";
  } else if (name2 == "当社の勧奨による退職") {
    field_object.離職理由_転記用.value = "イ";
  } else if (name2 == "定年による退職") {
    field_object.離職理由_転記用.value = "ウ";
  } else if (name2 == "契約期間の満了による退職") {
    field_object.離職理由_転記用.value = "エ";
  } else if (name2 == "移籍出向による退職") {
    field_object.離職理由_転記用.value = "オ";
  } else if (name2 == "その他") {
    field_object.離職理由_転記用.value = "カ";
  } else if (name2 == "解雇") {
    field_object.離職理由_転記用.value = "キ";
  }
  let first_name = field_object.解雇理由_解雇理由.value.charAt(0);
  field_object.解雇理由_転記用.value = first_name;
  if (first_name == "ア") {
    field_object.具体的な理由_解雇理由.value =
      "具体的には、" +
      field_object["具体的な理由_" + first_name].value +
      "によって当社の事業の継続が不可能になったこと。";
  } else if (first_name == "イ") {
    field_object.具体的な理由_解雇理由.value =
      "具体的には、当社が" +
      field_object["具体的な理由_" + first_name].value +
      "となったこと。";
  } else if (first_name == "ウ") {
    field_object.具体的な理由_解雇理由.value =
      "具体的には、あなたが" +
      field_object["具体的な理由_" + first_name].value +
      "したこと。";
  } else if (first_name == "エ") {
    field_object.具体的な理由_解雇理由.value =
      "具体的には、あなたが" +
      field_object["具体的な理由_" + first_name].value +
      "したこと。";
  } else if (first_name == "オ") {
    field_object.具体的な理由_解雇理由.value =
      "具体的には、あなたが" +
      field_object["具体的な理由_" + first_name].value +
      "したこと。";
  } else if (first_name == "カ") {
    field_object.具体的な理由_解雇理由.value =
      "具体的には、" +
      field_object["具体的な理由_" + first_name].value +
      "による解雇。";
  }
  field_object.具体的な理由_転記用.value =
    field_object["具体的な理由_" + first_name].value;
  table_object.value[last_row].value.解雇具体的な理由_退職証明テーブル.value =
    field_object.具体的な理由_解雇理由.value;
  table_object.value[last_row].value.解雇理由_退職証明テーブル.value =
    field_object.解雇理由_解雇理由.value;
}

function kaiko1(field_object, mode) {
  let table_object = field_object.解雇理由証明書テーブル;
  let last_row = table_object.value.length - 1;
  if (
    (last_row != 0 ||
      table_object.value[last_row].value.送信日_解雇理由証明テーブル.value !=
        "") &&
    mode !== "修正"
  ) {
    document
      .querySelectorAll('div[data-vv-name="解雇理由証明書テーブル"]')[0]
      .getElementsByClassName("ui circular blue icon button")[0]
      .click(); //テーブルに一行追
    last_row = last_row + 1;
  }
  table_object.value[last_row].value.送信日_解雇理由証明テーブル.value =
    moment().format("YYYY-MM-DD HH:mm");
  table_object.value[last_row].value.労働者氏_解雇理由証明テーブル.value =
    field_object.労働者氏_解雇理由.value;
  table_object.value[last_row].value.労働者名_解雇理由証明テーブル.value =
    field_object.労働者名_解雇理由.value;
  table_object.value[last_row].value.解雇日_解雇理由証明テーブル.value =
    field_object.解雇日_解雇理由.value;
  table_object.value[last_row].value.証明日_解雇理由証明テーブル.value =
    field_object.証明日_解雇理由.value;
  table_object.value[
    last_row
  ].value.事業主氏名又は名称_解雇理由証明テーブル.value =
    field_object.事業主氏名又は名称_解雇理由.value;
  table_object.value[last_row].value.使用者職氏名_解雇理由証明テーブル.value =
    field_object.使用者職氏名_解雇理由.value;
  table_object.value[last_row].value.解雇理由_解雇理由証明テーブル.value =
    field_object.解雇理由_解雇理由.value;
  table_object.value[
    last_row
  ].value.解雇理由証明書作成日_解雇理由証明テーブル.value =
    field_object.解雇理由証明書作成日.value;
  table_object.value[
    last_row
  ].value.解雇理由証明書作成者_解雇理由証明テーブル.value =
    field_object.解雇理由証明書作成者.value;
  table_object.value[
    last_row
  ].value.解雇理由証明書公開承認日_解雇理由証明テーブル.value =
    field_object.解雇理由証明書公開承認日.value;
  table_object.value[
    last_row
  ].value.解雇理由証明書公開承認者_解雇理由証明テーブル.value =
    field_object.解雇理由証明書公開承認者.value;
  let first_name = field_object.解雇理由_解雇理由.value.charAt(0);
  field_object.解雇理由_転記用.value = first_name;
  // console.log(first_name);
  if (first_name == "ア") {
    field_object.具体的な理由_解雇理由.value =
      "具体的には、" +
      field_object["具体的な理由_" + first_name].value +
      "によって当社の事業の継続が不可能になったこと。";
  } else if (first_name == "イ") {
    field_object.具体的な理由_解雇理由.value =
      "具体的には、当社が" +
      field_object["具体的な理由_" + first_name].value +
      "となったこと。";
  } else if (first_name == "ウ") {
    field_object.具体的な理由_解雇理由.value =
      "具体的には、あなたが" +
      field_object["具体的な理由_" + first_name].value +
      "したこと。";
  } else if (first_name == "エ") {
    field_object.具体的な理由_解雇理由.value =
      "具体的には、あなたが" +
      field_object["具体的な理由_" + first_name].value +
      "したこと。";
  } else if (first_name == "オ") {
    field_object.具体的な理由_解雇理由.value =
      "具体的には、あなたが" +
      field_object["具体的な理由_" + first_name].value +
      "したこと。";
  } else if (first_name == "カ") {
    field_object.具体的な理由_解雇理由.value =
      "具体的には、" +
      field_object["具体的な理由_" + first_name].value +
      "による解雇。";
  }
  table_object.value[last_row].value.具体的な理由_解雇理由証明テーブル.value =
    field_object.具体的な理由_解雇理由.value;
  field_object.具体的な理由_転記用.value =
    field_object["具体的な理由_" + first_name].value;
}

//透かし実装
function addWatermarkInNewTab() {
  // 1. スタイル作成
  const style = document.createElement("style");
  style.id = "draft-watermark-style"; // 削除用にIDを付ける
  style.innerHTML = `
    .draft-watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 10em;
      color: rgba(169, 169, 169, 0.2);
      pointer-events: none;
      user-select: none;
      z-index: 9999;
      white-space: nowrap;
      width: 100%;
      text-align: center;
      opacity: 1.0;
    }
  `;
  document.head.appendChild(style);

  // 2. 透かし div 作成
  const watermark = document.createElement("div");
  watermark.classList.add("draft-watermark");
  watermark.id = "draft-watermark"; // 削除用にIDを付ける
  watermark.textContent = "DRAFT";

  // 3. body に追加
  document.body.appendChild(watermark);
}

function removeWatermarkInNewTab() {
  // スタイルを削除
  const style = document.getElementById("draft-watermark-style");
  if (style) {
    style.remove();
  }

  // 透かし div を削除
  const watermark = document.getElementById("draft-watermark");
  if (watermark) {
    watermark.remove();
  }
}
