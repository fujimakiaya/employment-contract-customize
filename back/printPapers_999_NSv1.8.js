(function () {
  "use strict";

  let replace = {};
  let ledgerNames = [];

  const Params = new URLSearchParams(window.location.search);
  const companyId = Params.get("companyId");
  if (companyId === "") companyId = 327;
  const batch_params = Params.get("batch") || "";
  const userName = decodeURIComponent(Params.get("name")) || "";
  const userMailAddress =
    decodeURIComponent(Params.get("originalMailAddress")) || "";
  const appId_paper = {
    雇用契約書: 3565,
    労働条件通知書: 3565,
    辞令: null,
    在職証明書: null,
    退職証明書: null,
    解雇理由証明書: null,
  };

  let title = document.getElementsByTagName("h1")[0].textContent;
  title = title.replaceAll("・", "");
  title = title.replaceAll("閲覧", "");
  title = title.replaceAll("印刷", "");
  title = title.replaceAll("修正", "");
  if (ledgerNames.length == 0) {
    ledgerNames.push(title);
  }
  if (ledgerNames[0] == "雇用契約書") {
    ledgerNames.push("労働条件通知書");
  }
  if (ledgerNames[0] == "退職証明書") {
    ledgerNames.push("退職解雇理由");
  }
  replace = new ReplaceValue(companyId);

  kviewer.events.on("records.show", async function (state) {
    removeWatermarkInNewTab();
    if (title == "労働者名簿") {
      // 20250408 hidden kv-record-menu
      document.getElementById("__next").style.visibility = "hidden";
      // 一括印刷
      if (batch_params) {
        try {
          showSpinner();

          if (replace.replaceGetStatus() === 1) {
            await batchPrinting(companyId, replace, ledgerNames, batch_params); // awaitを追加
          } else {
            await replace.replaceInitProcess(ledgerNames);
            await batchPrinting(companyId, replace, ledgerNames, batch_params); // awaitを追加
          }

          // 非同期処理が完了した後に遷移
          window.location.href = `https://5ea2a167.viewer.kintoneapp.com/public/nkrfsv2-8-newkv-for-workerlist-3202?companyId=${companyId}`;
        } catch (error) {
          console.error("Error during batch processing:", error);
        } finally {
          hideSpinner(); // 処理が終わったらスピナーを隠す
        }

        return state;
      }
    }
    showSpinner();
    let count = 0;
    const maxTries = 50; // 最大試行回数
    const intervalId = setInterval(() => {
      const fileValues = sessionStorage.getItem("fileValues1");
      if (fileValues) {
        match_employee(state);
        clearInterval(intervalId); // 値が見つかったら監視を停止
      } else if (++count >= maxTries) {
        clearInterval(intervalId); // 50回試行後に監視を停止
        console.warn("fileValues1 が見つかりませんでした。");
      }
    }, 200);
    hideSpinner();
    return state;
  });

  function match_employee(state) {
    try {
      if (state.records.length === 0) {
        throw new Error("no employee data in kV-list");
      }

      const elem = state.getRecordElements();
      let find_flag = false;

      // 表示されるレコードが1つのみの場合、詳細ページに移動する
      if (elem.length === 1) {
        const tr_elem = elem.item(0);
        const kv_text_action = tr_elem.getElementsByTagName("button");
        kv_text_action[0].click();
        find_flag = true;
      }
      return;
    } catch (e) {
      console.log(e);
    }
  }

  //藤巻変更1218(透かし実装)
  const field_content = {
    雇用契約書: "雇用契約書公開承認日",
    労働条件通知書: "雇用契約書公開承認日",
    辞令: "辞令公開承認日",
    在職証明書: "在職証明書公開承認日",
    労働者名簿: "労働者名簿公開承認日",
    退職証明書: "退職証明書公開承認日",
    解雇理由証明書: "解雇理由証明書公開承認日",
  };

  // *** kViewer event - record.show ***
  kviewer.events.on("record.show", function (state) {
    let displayValue = state.record.kintoneRecord;
    const recordid = displayValue.$id.value;
    alertMissingTemplates();
    //    document.getElementById("__next").style.visibility = "hidden";
    // document.getElementsByClassName("flex grow")[0].style.visibility = "hidden";

    showSpinner(); // スピナー表示

    let i = 1;
    while (replace.replaceGetStatus() != 1 && i < 5) {
      setTimeout(() => {}, 200);
      i = i + 1;
    }
    if (replace.replaceGetStatus() != 1) {
      alert(
        "帳票フィールド管理データが取得できません。\n時間をおいて再試行してください"
      );
      //         window.close();
      hideSpinner(); // スピナー非表示
      return state;
    }

    console.log("next step");
    let displayHtml = new Map();
    for (let ledgerName of ledgerNames) {
      replace.replaceGetValue(ledgerName, displayValue);
      const display_html = replace.replaceValueProcess(ledgerName);
      displayHtml.set(ledgerName, display_html);
    }

    let newDiv = document.createElement("div");
    newDiv.setAttribute("class", "grow");
    document.getElementsByClassName("flex grow")[0].remove();
    document
      .getElementsByClassName(
        "flex h-screen flex-col overflow-y-auto kv-container"
      )[0]
      .append(newDiv);

    const newHTML1 = document.createElement("html");
    newHTML1.setAttribute("id", "print-area");

    //if (displayValue.文書確定 && displayValue.文書確定.value.length === 0) {
    const chkDate = new Date(displayValue[field_content[ledgerNames[0]]].value);
    if (isNaN(chkDate.getDate())) {
      addWatermarkInNewTab();
    }

    let DoubleLineflag = false;
    if (ledgerNames[0] == "退職証明書") {
      if (
        displayValue["離職理由_書面"].value !== "解雇" &&
        displayValue["労働者が解雇理由を請求するか_退職証明"].value ==
          "解雇理由を請求しない"
      ) {
        DoubleLineflag = true;
      }
    }

    for (const ledgerName of ledgerNames) {
      const inText = displayHtml.get(ledgerName);
      if (inText) {
        const newHTML = document.createElement("div");
        newHTML.innerHTML = inText;
        newDiv.append(newHTML);
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
    } else if (ledgerNames[0] == "労働者名簿") {
      const breadcrumbs = document.querySelector(".kv-record-menu").firstChild;
      const pElem = breadcrumbs.getElementsByTagName("button");
      for (let i = 0; i < pElem.length; i++) {
        pElem[i].style.display = "none";
      }
      const aTag = document.createElement("a");
      aTag.href = `https://5ea2a167.viewer.kintoneapp.com/public/nkrfsv2-8-newkv-for-workerlist-3202?companyId=${companyId}&name=${userName}`;
      aTag.textContent = "労働者名簿作成社員選択";
      aTag.setAttribute(
        "class",
        "text-role-action text-xs font-bold hover:underline"
      );
      breadcrumbs.prepend(aTag);
    }

    const aButton1 = make_iconButton(
      "printer",
      ledgerNames[0],
      "nkrfs-action1"
    );
    aButton1.addEventListener("click", function () {
      registerButtonLoggerKintone(
        appId_paper[ledgerNames[0]],
        recordid,
        userName,
        userMailAddress
      ).catch((err) => console.error(err));

      let newTab1 = window.open("", "帳票", "_blank");
      if (newTab1 === null) {
        alert("window open error");
        return;
      }

      if (ledgerNames[0] == "雇用契約書") {
        const inText = displayHtml.get(ledgerNames[0]);
        newTab1.document.getElementsByTagName("html")[0].innerHTML = inText;
      } else {
        let combinedText = ""; // すべての inText を結合するための変数
        for (const ledgerName of ledgerNames) {
          const inText = displayHtml.get(ledgerName);
          if (inText) {
            combinedText += `<div style="page-break-after: always;">${inText}</div>`;
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
        newTab1.document.getElementsByTagName("html")[0].innerHTML =
          combinedText;
      }

      if (ledgerNames[0] == "退職証明書" && DoubleLineflag == true) {
        let element = newTab1.document.getElementById("cssstyle");
        element.style.textDecoration = "line-through";
        element.style.textDecorationColor = "black";
        element.style.textDecorationStyle = "double";
      }
      //  if (!displayValue[field_content[ledgerNames[0]]].value)
      const chkDate = new Date(
        displayValue[field_content[ledgerNames[0]]].value
      );
      if (isNaN(chkDate.getDate())) {
        addWatermarkForPrintInNewTab(newTab1.document);
      }

      newTab1.print();
      newTab1.close();
    });

    if (ledgerNames[0] == "雇用契約書") {
      const bButton1 = make_iconButton(
        "printer",
        "労働条件通知書",
        "nkrfs-action1"
      );
      bButton1.addEventListener("click", function () {
        let newTab1 = window.open("", "帳票", "_blank");
        if (newTab1 === null) {
          alert("window open error");
          return;
        }
        const inText = displayHtml.get("労働条件通知書");
        newTab1.document.getElementsByTagName("html")[0].innerHTML = inText;
        //    if (!displayValue[field_content["労働条件通知書"]].value) {
        const chkDate = new Date(
          displayValue[field_content["労働条件通知書"]].value
        );
        if (isNaN(chkDate.getDate())) {
          addWatermarkForPrintInNewTab(newTab1.document);
        }
        newTab1.print();
        newTab1.close();
      });
    }

    hideSpinner(); // スピナー非表示
    document.getElementById("__next").style.visibility = "visible";
    return state;
  });

  // *** kViewer event - view.index.show ***
  kviewer.events.on("view.index.show", function (state) {
    let displayValue = state.record.kintoneRecord;
    console.log("displayValue:", displayValue);
    if (replace.replaceGetStatus() === 0) {
      replace.replaceInitProcess(ledgerNames);
    }
    if (
      ledgerNames[0] === "雇用契約書" &&
      document.getElementById("nkrfs-button1") == null
    ) {
      const pButton1 = make_iconButton(
        "printer",
        "雇用契約書一括印刷",
        "nkrfs-button1"
      );
      pButton1.addEventListener("click", function () {
        const filter = JSON.parse(sessionStorage.getItem("filters"));
        if (replace.replaceGetStatus() === 1) {
          alertMissingTemplates();
          batchPrinting(
            companyId,
            replace,
            [ledgerNames[0]],
            batch_params,
            filter
          );
        } else {
          (async () => {
            try {
              await replace.replaceInitProcess(ledgerNames);
              alertMissingTemplates();
              batchPrinting(
                companyId,
                replace,
                [ledgerNames[0]],
                batch_params,
                filter
              );
            } catch (error) {
              console.error("replaceInitProcess failed:", error);
            }
          })();
        }
      });
      const pButton2 = make_iconButton(
        "printer",
        "労働条件通知書一括印刷",
        "nkrfs-button1"
      );
      pButton2.addEventListener("click", function () {
        const filter = JSON.parse(sessionStorage.getItem("filters"));
        if (replace.replaceGetStatus() === 1) {
          alertMissingTemplates();
          batchPrinting(
            companyId,
            replace,
            [ledgerNames[1]],
            batch_params,
            filter
          );
        } else {
          (async () => {
            try {
              await replace.replaceInitProcess(ledgerNames);
              alertMissingTemplates();
              batchPrinting(
                companyId,
                replace,
                [ledgerNames[1]],
                batch_params,
                filter
              );
            } catch (error) {
              console.error("replaceInitProcess failed:", error);
            }
          })();
        }
      });
    }

    if (document.getElementById("nkrfs-button3") == null) {
      const pButton3 = make_iconButton(
        "close",
        "ウィンドウを閉じる",
        "nkrfs-button3"
      );
      pButton3.addEventListener("click", function () {
        window.close();
      });
    }
    return state;
  });
})();

//藤巻変更1218(透かし実装)
function addWatermarkForPrintInNewTab(newTab) {
  const style = newTab.createElement("style");
  style.innerHTML = `
    @media print {
      .draft-watermark {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-45deg); /* 斜めに回転させる */
        font-size: 10em; /* 透かしの大きさ */
        color: rgba(169, 169, 169, 0.2); /* 薄い灰色 */
        pointer-events: none;
        user-select: none;
        z-index: 9999;
        opacity: 1.0; /* 薄く表示 */
        white-space: nowrap;
        width: 100%;
        text-align: center;
        page-break-before: always; /* 新しいページが始まる前に透かしを挿入 */
      }
    }
  `;
  newTab.head.appendChild(style); // 新しいタブにスタイルを追加

  const watermark = newTab.createElement("div");
  watermark.classList.add("draft-watermark");
  watermark.textContent = "DRAFT"; // 透かしのテキスト

  newTab.body.appendChild(watermark); // 新しいタブに透かしを追加
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

//一括印刷
async function batchPrinting(
  companyId,
  replace,
  ledgerNames,
  batch_params,
  filter
) {
  const batchprint = new batchPrint(companyId, batch_params);
  showSpinner(); // スピナー表示
  try {
    // async関数としてラップ
    await batchprint
      .executeFunction(replace, ledgerNames, filter)
      .then((displayHtml) => {
        if (!displayHtml || !displayHtml.documentElement) {
          throw new CustomError("NoDataError", "表示するデータがありません");
        }

        const inText = displayHtml.documentElement.outerHTML;

        // 改ページ用のスタイルを定義
        const pageBreakStyle = `
        <style>
          @media print {
            body > * {
              page-break-after: always; /* 各セクションの後に改ページ */
            }
            body > *:last-child {
              page-break-after: auto; /* 最後は改ページしない */
            }
          }
        </style>
      `;
        hideSpinner();

        let newTab1 = window.open("", "帳票", "_blank");
        if (newTab1 === null) {
          alert("window open error");
          return;
        }

        // 新しいタブに HTML を書き込み
        newTab1.document.getElementsByTagName("html")[0].innerHTML =
          pageBreakStyle + inText;

        // 印刷を開始
        newTab1.print();
        newTab1.close();
      })
      .catch((error) => {
        hideSpinner();
        if (error instanceof CustomError && error.name === "NoDataError") {
          alert(error.message); // "表示するデータがありません"を表示
        } else {
          console.error("An unexpected error occurred:", error);
          alert(
            "帳票作成に失敗しました。もう一度時間をおいてからお試しください。"
          );
        }
      });

    // 処理が完了した後に return
    return;
  } catch (error) {
    hideSpinner();
    console.error("Unexpected error:", error);
    alert("予期しないエラーが発生しました。");
    return;
  }
}

//印刷ログ作成
async function registerButtonLoggerKintone(
  appId,
  recordid,
  userName,
  userMailAddress
) {
  if (appId) {
    const tableRequestParam = {
      id: appId,
      query_params: [
        {
          key: "$id",
          operator: "=",
          value: recordid,
        },
      ],
      fields: ["印刷指示テーブル"],
    };
    let tableRecord = await get(tableRequestParam);

    if (tableRecord && tableRecord["records"].length > 0) {
      const timestamp = new Date().toISOString();
      const logEntry = {
        value: {
          指示者: { value: userName },
          指示者メアド: { value: userMailAddress },
          印刷指示日時: { value: timestamp },
        },
      };
      tableRecord["records"][0]["印刷指示テーブル"].value.push(logEntry);

      console.log("Kintone送信用ログ:", tableRecord);

      try {
        const requestTableParam = {
          id: appId,
          record_list: [
            {
              id: recordid,
              record: tableRecord["records"][0],
            },
          ],
        };
        const response = await put(requestTableParam);

        // console.log("Kintoneにログを保存しました");
      } catch (err) {
        console.error("Kintone送信エラー:", err);
        // alert("ログの送信に失敗しました");
      }
    }
  }
}

// レコードのputメソッドを定義
async function put(requestParam) {
  const endpoint = "https://kintone-relay-api-eidnwbgjma-an.a.run.app";
  const response = await fetch(endpoint + "/putRecord", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestParam),
  });
  const data = await response.json();
  return data;
}

// レコードのGetメソッドを定義
async function get(requestParam) {
  const endpoint = "https://kintone-relay-api-eidnwbgjma-an.a.run.app";
  const response = await fetch(endpoint + "/getRecord", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestParam),
  });
  const data = await response.json();
  return data;
}

function alertMissingTemplates() {
  const missingNamesStr = sessionStorage.getItem("templateMissingNames");
  const missingNames = missingNamesStr ? JSON.parse(missingNamesStr) : [];

  if (missingNames.length > 0) {
    alert(
      `以下の帳票はテンプレート登録がないため、デフォルトのテンプレートを使用しています：\n\n- ${missingNames.join(
        "\n- "
      )}`
    );
  }
}
