/**
 * @fileOverview 雇用契約書のリマインダー機能
 * @author [fujimaki]
 * @version 1.0.1
 * @date 2025-02-07
 * @description このスクリプトは以下の動きをする
 * - 管理者ユーザーのメールアドレスを取得し、担当者メールアドレス_toおよび_ccフィールドにドロップダウンリストとして設定
 *
 * 更新履歴:
 * - 2025-12-06 [fujimaki] 初版作成
 *  */

const endpoint3 =
  "https://kintone-relay-api-light-538321378695.asia-northeast1.run.app";
let COMPANY_ID = null;
let counter = 0;

async function add_manager_dropdown() {
  /* 管理ユーザー情報をhttps://nkr-group.cybozu.com/k/702/から取得。*/
  const requestParam = {
    id: 702,
    query_params: [
      {
        key: "有効無効",
        operator: "in",
        value: ["有効", "存続"],
      },
      {
        key: "ユーザー権限フラグ",
        operator: "in",
        value: ["雇用契約関連"],
      },
      {
        key: "マイページ2_5",
        operator: "in",
        value: ["ﾕｰｻﾞｰ"], // グループ親会社番号が同じ人をセレクション
      },
      {
        key: "グループ親会社番号",
        operator: "=",
        value: COMPANY_ID,
      },
    ],
    fields: ["mail", "氏名"],
  };

  fetch(endpoint3 + "/getRecord", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestParam),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      let managerEmail_object = [];
      let managerEmails = [];
      data.records.forEach((elem) => {
        const emailObj = {
          value: elem["mail"].value,
          code: elem["氏名"].value,
        };
        managerEmail_object.push(emailObj);
        managerEmails.push(elem["mail"].value);
      });
      const AC = new AttributeControl(); //attributeを設定
      const autocompleteList_obj = {
        //fieldcode : {attribute_type : attribute},
        担当者メールアドレス_to: {
          autocomplete: "email",
          list: "email_select",
        },
        担当者メールアドレス_cc: {
          autocomplete: "email",
          list: "email_select",
        },
      };
      AC.setAttribute(autocompleteList_obj);
      AC.update_checkbox("担当者メールアドレス_to", managerEmail_object);
      AC.update_checkbox("担当者メールアドレス_cc", managerEmail_object);
      // 入力を制限する設定
      AC.update_readOnly("担当者メールアドレス_to");
      AC.update_readOnly("担当者メールアドレス_cc");
    })
    .catch((error) => {
      console.error("Error:", error); // エラーハンドリング
    });
}

(function () {
  ("use strict");
  fb.events.form.mounted.push(function (state) {
    const record = state.record;
    waitForCompanyIdChange(record, async () => {
      await add_manager_dropdown();
    });
    return state;
  });
  fb.events.confirm.back.push(function (state) {
    add_manager_dropdown();
    return state;
  });
})();

function waitForCompanyIdChange(record, callback) {
  const interval = setInterval(() => {
    counter++;
    if (counter > 30) {
      clearInterval(interval);
      callback();
    }
    COMPANY_ID = record["会社レコード番号"].value;
    console.log("COMPANY_ID:", COMPANY_ID);
    if (COMPANY_ID) {
      clearInterval(interval);
      callback();
    }
  }, 100); // 100ミリ秒ごとにチェック
}

//   const observer = new MutationObserver((mutations) => {
//     mutations.forEach((mutation) => {
//       if (mutation.attributeName === "value") {
//         const dateStr = record[fieldcode_to].value;
//         let dateObj = new Date(dateStr);
//         dateObj.setDate(dateObj.getDate() - num);
//         if (!isNaN(dateObj.getTime())) {
//           record[fieldcode].value = dateObj;
//         } else {
//           record[fieldcode].value = "";
//         }
//       }
//     });
//   });

//   // input の属性変更を監視
//   observer.observe(inputField, {
//     attributes: true, // 属性の変更を監視
//     attributeFilter: ["value"], // 'value' 属性のみを監視
//   });
// }
