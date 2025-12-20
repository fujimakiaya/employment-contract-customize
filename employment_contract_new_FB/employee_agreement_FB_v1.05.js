/**
 * @fileOverview 雇用契約書のリマインダー機能
 * @author [fujimaki]
 * @version 1.0.1
 * @date 2025-02-07
 * @description このスクリプトは以下の動きをする
 * ・リマインダー機能管理アプリ(id:3773)から何日前にリマインドするのかの情報を取得し、契約終了日、試用期間終了日のx日前の日付をリマインダー管理フィールドに入れる
 * ・「契約期間の末日の翌日」に契約期間終了日の翌日を入れる
 * ・試用期間が「なし」の場合は試用期間の日付を空欄に、契約期間がなしの場合は契約期間の日付を空欄にする
 * ・試用期間が「あり」の場合に「試用期間」の文字を入れる
 * ・手当が0の場合は空欄にする
 *
 * 更新履歴:
 * - 2024-XX-XX [fujimaki] 初版作成
 * - 2025-02-07 [fujimaki] リマインダーの日付を2つから4つに増加
 */

const endpoint3 =
  "https://kintone-relay-api-light-538321378695.asia-northeast1.run.app";
let COMPANY_ID = null;
let counter = 0;
let emailToReminderDays = {};
// const endpoint = "http://localhost:3000";

async function dateNum_get() {
  /* リマインダーを何日前にするかをhttps://nkr-group.cybozu.com/k/3773/から取得。*/
  const requestParam = {
    id: 3773,
    query_params: [
      {
        key: "運用状況",
        operator: "in",
        value: "運用中",
      },
      {
        key: "会社レコード番号",
        operator: "=",
        value: COMPANY_ID,
      },
    ],
    fields: [
      "日数差",
      "フィールドコード_担当者メールアドレス_to_",
      "種類_フィールドコード",
    ],
  };
  try {
    const response = await fetch(endpoint3 + "/getRecord", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestParam),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    console.log(data);
    data.records.forEach((record) => {
      const type = record["種類_フィールドコード"].value;
      const email = record["フィールドコード_担当者メールアドレス_to_"].value;
      const daysBefore = record["日数差"].value;

      const combinedKey = `${type}-${email}`;
      emailToReminderDays[combinedKey] = daysBefore;
    });
    return emailToReminderDays; // 必要なデータを返す
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}

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

  fetch(endpoint + "/getRecord", {
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
        管理者メールアドレスレベル1_to_: {
          autocomplete: "email",
          list: "email_select",
        },
        管理者メールアドレスレベル1_cc_: {
          autocomplete: "email",
          list: "email_select",
        },
        管理者メールアドレスレベル2_to_: {
          autocomplete: "email",
          list: "email_select",
        },
        管理者メールアドレスレベル2_cc_: {
          autocomplete: "email",
          list: "email_select",
        },
        管理者メールアドレスレベル3_to_: {
          autocomplete: "email",
          list: "email_select",
        },
        管理者メールアドレスレベル3_cc_: {
          autocomplete: "email",
          list: "email_select",
        },
        管理者メールアドレスレベル4_to_: {
          autocomplete: "email",
          list: "email_select",
        },
        管理者メールアドレスレベル4_cc_: {
          autocomplete: "email",
          list: "email_select",
        },
      };
      AC.setAttribute(autocompleteList_obj);
      AC.update_checkbox(
        "管理者メールアドレスレベル1_to_",
        managerEmail_object
      );
      AC.update_checkbox(
        "管理者メールアドレスレベル1_cc_",
        managerEmail_object
      );
      AC.update_checkbox(
        "管理者メールアドレスレベル2_to_",
        managerEmail_object
      );
      AC.update_checkbox(
        "管理者メールアドレスレベル2_cc_",
        managerEmail_object
      );
      AC.update_checkbox(
        "管理者メールアドレスレベル3_to_",
        managerEmail_object
      );
      AC.update_checkbox(
        "管理者メールアドレスレベル3_cc_",
        managerEmail_object
      );
      AC.update_checkbox(
        "管理者メールアドレスレベル4_to_",
        managerEmail_object
      );
      AC.update_checkbox(
        "管理者メールアドレスレベル4_cc_",
        managerEmail_object
      );
      // 入力を制限する設定
      AC.update_readOnly("管理者メールアドレスレベル1_to_");
      AC.update_readOnly("管理者メールアドレスレベル1_cc_");
      AC.update_readOnly("管理者メールアドレスレベル2_to_");
      AC.update_readOnly("管理者メールアドレスレベル2_cc_");
      AC.update_readOnly("管理者メールアドレスレベル3_to_");
      AC.update_readOnly("管理者メールアドレスレベル3_cc_");
      AC.update_readOnly("管理者メールアドレスレベル4_to_");
      AC.update_readOnly("管理者メールアドレスレベル4_cc_");

      // const managerEmailsInitial = managerEmails.join(", ");
      // initial_input("管理者メールアドレスレベル1_to_", managerEmailsInitial);
      // initial_input("管理者メールアドレスレベル1_cc_", managerEmailsInitial);
      // initial_input("管理者メールアドレスレベル2_to_", managerEmailsInitial);
      // initial_input("管理者メールアドレスレベル2_cc_", managerEmailsInitial);
      // initial_input("管理者メールアドレスレベル3_to_", managerEmailsInitial);
      // initial_input("管理者メールアドレスレベル3_cc_", managerEmailsInitial);
      // initial_input("管理者メールアドレスレベル4_to_", managerEmailsInitial);
      // initial_input("管理者メールアドレスレベル4_cc_", managerEmailsInitial);
    })
    .catch((error) => {
      console.error("Error:", error); // エラーハンドリング
    });
}
function data_input(state) {
  auto_input_date(
    "リマインドメール受取日レベル1",
    emailToReminderDays["試用期間終了日-管理者メールアドレスレベル1_to_"],
    "試用期間終了日"
  );
  auto_input_date(
    "リマインドメール受取日レベル2",
    emailToReminderDays["試用期間終了日-管理者メールアドレスレベル2_to_"],
    "試用期間終了日"
  );
  auto_input_date(
    "リマインドメール受取日レベル3",
    emailToReminderDays["契約終了日-管理者メールアドレスレベル3_to_"],
    "契約終了日"
  );
  auto_input_date(
    "リマインドメール受取日レベル4",
    emailToReminderDays["契約終了日-管理者メールアドレスレベル4_to_"],
    "契約終了日"
  );
}
function data_input_contact_finish(state) {
  auto_input_date(
    "リマインドメール受取日レベル3",
    emailToReminderDays["契約終了日-管理者メールアドレスレベル3_to_"],
    "契約終了日"
  );
  auto_input_date(
    "リマインドメール受取日レベル4",
    emailToReminderDays["契約終了日-管理者メールアドレスレベル4_to_"],
    "契約終了日"
  );
}
function data_input_test_finish(state) {
  auto_input_date(
    "リマインドメール受取日レベル1",
    emailToReminderDays["試用期間終了日-管理者メールアドレスレベル1_to_"],
    "試用期間終了日"
  );
  auto_input_date(
    "リマインドメール受取日レベル2",
    emailToReminderDays["試用期間終了日-管理者メールアドレスレベル2_to_"],
    "試用期間終了日"
  );
}
function set_allowance_to_zero(state) {
  const field_record = state.record;
  for (let i = 1; i < 13; i++) {
    if (field_record[`手当${i}`]?.value === "") {
      field_record[`手当${i}の額`].value = "";
    }
  }
}

(function () {
  ("use strict");
  fb.events.form.mounted.push(function (state) {
    waitForCompanyIdChange(() => {
      add_manager_dropdown(state);
      dateNum_get();
    });
    return state;
  });
  fb.events.confirm.back.push(function (state) {
    add_manager_dropdown();
    return state;
  });
  fb.events.form.confirm.push(function (state) {
    set_allowance_to_zero(state);
    return state;
  });
  fb.events.fields.試用期間の有無.changed.push(function (state) {
    if (state.record.試用期間の有無.value[0] !== "あり") {
      state.record.試用期間開始日.value = "";
      state.record.試用期間終了日.value = "";
      state.record.試用期間.value = "";
    } else {
      state.record.試用期間.value = "試用期間";
    }
    return state;
  });
  fb.events.fields.契約期間.changed.push(function (state) {
    if (state.record.契約期間.value == "なし") {
      state.record.契約開始日.value = "";
      state.record.契約終了日.value = "";
    }
    return state;
  });
  fb.events.fields.契約終了日.changed.push(function (state) {
    data_input_contact_finish(state);
    // contract_end_date_handler(state);
    return state;
  });
  fb.events.fields.試用期間終了日.changed.push(function (state) {
    data_input_test_finish(state);
    return state;
  });
  fb.events.fields.更新の種類.changed.push(function (state) {
    if (state.record.更新の種類.value == "更新しない") {
      state.record.通算契約期間.value = "";
      state.record.更新上限回数.value = "";
    }
    return state;
  });
  fb.events.form.confirm.push(function (state) {
    if (state.record.更新上限回数.value == "0") {
      state.record.更新上限回数.value = "";
    }
    if (state.record.通算契約期間.value == "0") {
      state.record.通算契約期間.value = "";
    }
    if (state.record.定年制年齢.value == "0") {
      state.record.定年制年齢.value = "";
    }
    if (state.record.継続雇用年齢.value == "0") {
      state.record.継続雇用年齢.value = "";
    }
  });
  // fb.events.fields.通算契約期間.changed.push(function (state) {
  //   const labelsToShow = ["労働条件変更の有無", "契約期間末日の翌日"];
  //   if (
  //     state.record.通算契約期間.value ||
  //     state.record.通算契約期間.value > 5
  //   ) {
  //     document.querySelectorAll("div.el-form-item.field").forEach((el) => {
  //       const label = el.querySelector("label");
  //       if (label && labelsToShow.includes(label.textContent.trim())) {
  //         el.style.display = "";
  //       }
  //     });
  //   } else {
  //     document.querySelectorAll("div.el-form-item.field").forEach((el) => {
  //       const label = el.querySelector("label");
  //       if (label && labelsToShow.includes(label.textContent.trim())) {
  //         el.style.display = "none";
  //       }
  //     });
  //   }
  //   return state;
  // });
  fb.events.confirm.submit.push(function (state) {
    if (state.record.試用期間の有無.value[0] !== "あり") {
      state.record.リマインドメール受取日レベル1.value = "";
      state.record.管理者メールアドレスレベル1_to_.value = "";
      state.record.管理者メールアドレスレベル1_cc_.value = "";
      state.record.リマインドメール受取日レベル2.value = "";
      state.record.管理者メールアドレスレベル2_to_.value = "";
      state.record.管理者メールアドレスレベル2_cc_.value = "";
    }
    if (state.record.契約期間.value == "なし") {
      state.record.リマインドメール受取日レベル3.value = "";
      state.record.管理者メールアドレスレベル3_to_.value = "";
      state.record.管理者メールアドレスレベル3_cc_.value = "";
      state.record.リマインドメール受取日レベル4.value = "";
      state.record.管理者メールアドレスレベル4_to_.value = "";
      state.record.管理者メールアドレスレベル4_cc_.value = "";
    }
    return state;
  });
})();

function waitForCompanyIdChange(callback) {
  const interval = setInterval(() => {
    counter++;
    if (counter > 30) {
      clearInterval(interval);
      callback();
    }
    COMPANY_ID = record["会社レコード番号"].value;
    if (COMPANY_ID) {
      clearInterval(interval);
      callback();
    }
  }, 100); // 100ミリ秒ごとにチェック
}

function get_element_byfieldcode(fieldcode) {
  try {
    if (!fieldcode in fb.events.fields) return null;
    const textField = document.querySelector(
      `[data-vv-name="${fieldcode}"]`
    ).parentElement;
    if (textField == null) return null;
    const input_element = textField.getElementsByTagName("input")[0]; //htmlのinputタグを検索
    return input_element;
  } catch (e) {
    console.error(`get_element error:\n fieldcode=${fieldcode}\n detail=${e}`);
  }
}

function initial_input(fieldcode, initialStr) {
  record[fieldcode].value = initialStr;
}

function auto_input_date(fieldcode, num, fieldcode_to) {
  const initialDate = record[fieldcode_to].value;
  if (initialDate) {
    let dateObj = new Date(initialDate);
    dateObj.setDate(dateObj.getDate() - num);
    if (!isNaN(dateObj.getTime())) {
      record[fieldcode].value = dateObj;
    } else {
      record[fieldcode].value = "";
    }
  } else {
    record[fieldcode].value = "";
  }

  const inputField = get_element_byfieldcode(fieldcode_to);

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === "value") {
        const dateStr = record[fieldcode_to].value;
        let dateObj = new Date(dateStr);
        dateObj.setDate(dateObj.getDate() - num);
        if (!isNaN(dateObj.getTime())) {
          record[fieldcode].value = dateObj;
        } else {
          record[fieldcode].value = "";
        }
      }
    });
  });

  // input の属性変更を監視
  observer.observe(inputField, {
    attributes: true, // 属性の変更を監視
    attributeFilter: ["value"], // 'value' 属性のみを監視
  });
}

//契約期間末日の翌日に契約終了日の翌日を入れるfunction
function contract_end_date_handler(state) {
  const record = state.record;

  // 契約終了日の値を取得
  const contractEndDate = record["契約終了日"].value;
  if (!contractEndDate) return state;

  // 契約終了日に1日を追加
  const endDate = new Date(contractEndDate);
  endDate.setDate(endDate.getDate() + 1);

  // フォーマットをYYYY-MM-DDに変換
  const year = endDate.getFullYear();
  const month = String(endDate.getMonth() + 1).padStart(2, "0"); // 月は0始まり
  const day = String(endDate.getDate()).padStart(2, "0");
  const nextDay = `${year}-${month}-${day}`;

  // 契約期間末日の翌日に設定
  record["契約期間末日の翌日"].value = nextDay;

  console.log(`契約終了日: ${contractEndDate}, 契約期間末日の翌日: ${nextDay}`);
}
