const endpoint =
  "https://kintone-relay-api-light-538321378695.asia-northeast1.run.app";
let update_flg = true;
sessionStorage.setItem("update_flg", JSON.stringify(update_flg));
let allowance_obj = {};

//(function () {
fb.events.fields.手当.fields.手当キー_雇用契約.changed.push(
  function (state, params) {
    if (allowance_obj) {
      const result = allowance_obj[params.value] || {
        手当名: "",
        手当の額: "",
        計算方法: "",
      };
      let allowance_update = state.record["手当"].value;
      allowance_update[params.index]["value"]["手当名"].value =
        result["手当名"];
      allowance_update[params.index]["value"]["手当の額"].value =
        result["手当の額"];
      allowance_update[params.index]["value"]["計算方法"].value =
        result["計算方法"];
    }
    return state;
  },
);

fb.events.confirm.back.push(function (state) {
  update_flg = false;
  sessionStorage.setItem("update_flg", JSON.stringify(update_flg));
});

fb.addValidators = function (state) {
  return {
    allowance_length_checker: {
      getMessage: function (fieldCode, params) {
        return (
          "表示できる手当数を超えています。上限は " + params[0] + " 件です。"
        );
      },
      validate: function (value, params) {
        const limit = Number(params[0]);
        if (value.length > limit) {
          return false;
        }
        return true;
      },
    },
  };
};

async function get(requestParam) {
  response = await fetch(endpoint + "/getRecord", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestParam),
  });
  data = await response.json();
  return data;
}

async function main3455(state) {
  fb.events.fields.会社レコード番号.changed.push(async (state) => {
    let flg = JSON.parse(sessionStorage.getItem("update_flg"));
    let message = "選択肢の情報を読み込みました。";
    const record = state["record"];
    const companyId = record["会社レコード番号"].value;

    const requestParam3455 = {
      id: 3455,
      query_params: [
        {
          key: "会社レコード番号",
          operator: "=",
          value: companyId,
        },
      ],
      fields: [
        "事業所情報",
        "役職情報",
        "給与形態情報",
        "雇用形態情報",
        "会社名",
        "代表者職名",
        "代表者氏名",
      ],
    };

    let company_data = await get(requestParam3455);
    company_data = company_data["records"][0];
    if (!company_data) return;

    record["会社名"].value = company_data["会社名"].value;
    record["代表者職名"].value = company_data["代表者職名"].value;
    record["代表者氏名"].value = company_data["代表者氏名"].value;

    const field_data = {
      事業所情報: {
        table_code: "事業所情報",
        flag_code: "有効フラグ事業所",
        value_code: "事業所名",
      },
      給与形態情報: {
        table_code: "給与形態情報",
        flag_code: "有効フラグ給与形態",
        value_code: "給与区分",
      },
      雇用形態情報: {
        table_code: "雇用形態情報",
        flag_code: "有効フラグ雇用形態",
        value_code: "雇用形態",
      },
      役職情報: {
        table_code: "役職情報",
        flag_code: "有効フラグ役職",
        value_code: "役職",
      },
    };

    const AC = new AttributeControl(); //attributeを設定
    const autocompleteList_obj = {
      就業の場所: { list: "office_select" },
      給与形態: { list: "salary_select" },
      雇用形態区分: { list: "status_select" },
      役職: { list: "post_select" },
    };
    AC.setAttribute(autocompleteList_obj);
    AC.update_datalist(
      "office_select",
      dropdown_table(company_data, field_data["事業所情報"]),
    );
    AC.update_datalist(
      "salary_select",
      dropdown_table(company_data, field_data["給与形態情報"]),
    );
    AC.update_datalist(
      "status_select",
      dropdown_table(company_data, field_data["雇用形態情報"]),
    );
    AC.update_datalist(
      "post_select",
      dropdown_table(company_data, field_data["役職情報"]),
    );
  });

  return new Promise(function (resolve) {
    resolve(state);
  });
}

async function main3856(state) {
  fb.events.fields.会社レコード番号.changed.push(async (state) => {
    let flg = JSON.parse(sessionStorage.getItem("update_flg"));
    let message = "選択肢の情報を読み込みました。";
    const record = state["record"];
    const companyId = record["会社レコード番号"].value;

    const field_data = {
      業務内容: {
        table_code: "業務内容",
        flag_code: "有効フラグ職務",
        value_code: "従事すべき業務の内容",
        first_code: "初期値として入れるか業務内容",
        fb_code: "従事すべき業務の内容",
        list: "work_select",
      },
      就業場所の変更範囲情報: {
        table_code: "就業場所の変更範囲情報",
        flag_code: "有効フラグ就業場所変更範囲",
        value_code: "就業場所の変更",
        first_code: "初期値変更範囲",
        fb_code: "就業場所の変更範囲",
        list: "place_select",
      },
      業務内容の変更範囲情報: {
        table_code: "業務内容の変更範囲情報",
        flag_code: "有効フラグ業務内容変更範囲",
        value_code: "業務内容変更範囲",
        first_code: "初期値業務内容変更範囲",
        fb_code: "業務内容の変更範囲",
        list: "content_select",
      },
      就業規則を確認できる場所情報: {
        table_code: "就業規則を確認できる場所情報",
        flag_code: "有効フラグ規則確認",
        value_code: "就業規則確認場所",
        first_code: "初期値就業規則",
        fb_code: "就業規則を確認できる場所",
        list: "rules_select",
      },
      就業規則確認方法情報: {
        table_code: "就業規則確認方法情報",
        flag_code: "有効フラグ就業規則",
        value_code: "就業規則確認方法",
        first_code: "初期値就業規則_0",
        fb_code: "就業規則の確認方法",
        list: "data_select",
      },
      短時間情報: {
        table_code: "短時間情報",
        flag_code: "有効フラグ短時間",
        value_code: "短時間労働者について雇用管理改善等に関する相談窓口",
        first_code: "初期値短時間",
        fb_code: "短時間労働者について雇用管理改善等に関する相談窓口_0",
        list: "consult_select",
      },
      始業時刻: {
        table_code: "始業時刻テーブル",
        flag_code: "有効フラグ始業時刻",
        value_code: "始業時刻",
        first_code: "初期値として入れるか始業",
        fb_code: "始業時刻1",
        list: "start_time_1",
      },
      始業時刻2: {
        table_code: "始業時刻テーブル",
        flag_code: "有効フラグ始業時刻",
        value_code: "始業時刻",
        first_code: "初期値として入れるか始業",
        fb_code: "始業時刻2",
        list: "start_time_2",
      },
      始業時刻3: {
        table_code: "始業時刻テーブル",
        flag_code: "有効フラグ始業時刻",
        value_code: "始業時刻",
        first_code: "初期値として入れるか始業",
        fb_code: "始業時刻3",
        list: "start_time_3",
      },
      終業時刻1: {
        table_code: "終業時刻テーブル",
        flag_code: "有効フラグ就業時刻",
        value_code: "終業時刻",
        first_code: "初期値として入れるか終業",
        fb_code: "終業時刻1",
        list: "finish_time_1",
      },
      終業時刻2: {
        table_code: "終業時刻テーブル",
        flag_code: "有効フラグ就業時刻",
        value_code: "終業時刻",
        first_code: "初期値として入れるか終業",
        fb_code: "終業時刻2",
        list: "finish_time_2",
      },
      終業時刻3: {
        table_code: "終業時刻テーブル",
        flag_code: "有効フラグ就業時刻",
        value_code: "終業時刻",
        first_code: "初期値として入れるか終業",
        fb_code: "終業時刻3",
        list: "finish_time_3",
      },
      始業終業時刻その他情報: {
        table_code: "始業終業時刻その他情報",
        flag_code: "有効フラグ始業終業時刻その他",
        value_code: "始業・終業時刻その他_0",
        first_code: "初期値として入れるか時刻",
        fb_code: "始業・終業時刻その他",
        list: "time_select",
      },
      休憩時間1: {
        table_code: "休憩時間テーブル",
        flag_code: "有効フラグ休憩",
        value_code: "休憩時間",
        first_code: "初期値として入れるか休憩3",
        fb_code: "休憩時間1",
        list: "break_select_1",
      },
      休憩時間2: {
        table_code: "休憩時間テーブル",
        flag_code: "有効フラグ休憩",
        value_code: "休憩時間",
        first_code: "初期値として入れるか休憩3",
        fb_code: "休憩時間2",
        list: "break_select_2",
      },
      休憩時間3: {
        table_code: "休憩時間テーブル",
        flag_code: "有効フラグ休憩",
        value_code: "休憩時間",
        first_code: "初期値として入れるか休憩3",
        fb_code: "休憩時間3",
        list: "break_select_3",
      },
      控除する場合の項目情報: {
        table_code: "控除する場合の項目情報",
        flag_code: "有効フラグ控除",
        value_code: "控除する場合の項目名",
        first_code: "初期値として入れるか控除",
        fb_code: "備考1",
        list: "deduction_select",
      },
      昇給の時期情報: {
        table_code: "昇給の時期情報",
        flag_code: "有効フラグ昇給",
        value_code: "昇給の時期等",
        first_code: "初期値として入れるか昇給",
        fb_code: "昇給の時期等",
        list: "raise_select",
      },
      賞与情報: {
        table_code: "賞与情報",
        flag_code: "有効フラグ賞与",
        value_code: "賞与",
        first_code: "初期値として入れるか賞与",
        fb_code: "賞与時期等",
        list: "bonus_select",
      },
      賞与特記情報: {
        table_code: "賞与特記情報",
        flag_code: "有効フラグ賞与特記",
        value_code: "賞与特記",
        first_code: "初期値として入れるか賞与特記",
        fb_code: "賞与の特記事項",
        list: "bonus_remarks_select",
      },
      退職金特記事項: {
        table_code: "退職金特記事項",
        flag_code: "有効フラグ退職金特記",
        value_code: "退職金特記",
        first_code: "初期値として入れるか退職金特記",
        fb_code: "退職金の特記事項",
        list: "tired_money_select",
      },
      休日情報: {
        table_code: "休日情報",
        flag_code: "有効フラグ休日",
        value_code: "休日_0",
        first_code: "初期値として入れるか休日",
        fb_code: "休日",
        list: "holiday_select",
      },
      休暇情報: {
        table_code: "休暇情報",
        flag_code: "有効フラグ休暇",
        value_code: "休暇",
        first_code: "初期値として入れるか休暇",
        fb_code: "休暇",
        list: "vacation_select",
      },
    };

    const field_str = [
      "賃金締切日当月か翌月か",
      "賃金締切日",
      "賃金支払日当月か翌月か",
      "賃金支払日",
      "賃金締切日2当月か翌月か",
      "賃金締切日2",
      "賃金支払日2当月か翌月か",
      "賃金支払日2",
      "賃金支払方法",
      "定年制の有無",
      "定年制年齢",
      "継続雇用年齢",
      "例2か月",
      "例14",
      "労災保険の適用",
      "ラベル_賃金締切日1",
      "ラベル_賃金締切日2",
      "ラベル_賃金支払日1",
      "ラベル_賃金支払日2",
    ];
    const field_table = Object.values(field_data).map(
      (item) => item.table_code,
    );
    const fields = [
      ...field_str,
      "手当情報",
      "手当設定",
      ...field_table,
      "最大有効手当数",
    ];

    const requestParam3856 = {
      id: 3856,
      query_params: [
        {
          key: "会社レコード番号",
          operator: "=",
          value: companyId,
        },
      ],
      fields: fields,
    };

    let company_data = await get(requestParam3856);
    company_data = company_data["records"][0];
    if (!company_data) return;
    field_str.forEach(function (field) {
      if (!record[field].value) {
        record[field].value = company_data[field].value;
      }
    });
    if (update_flg) {
      allowance_set(state, company_data, update_flg); //手当初期値設定
    }
    //手当数制御
    let allowance_limit = company_data["最大有効手当数"].value;
    state.fields
      .filter(function (field) {
        return field.code === "手当";
      })[0]
      .validations.push({
        params: [allowance_limit],
        rule: "allowance_length_checker",
      });

    const AC = new AttributeControl(); //attributeを設定
    const autocompleteList_obj = {};

    Object.entries(field_data).forEach(([key, { list, fb_code }]) => {
      autocompleteList_obj[fb_code] = { list };
      AC.update_datalist(
        list,
        dropdown_table(company_data, field_data[key], state),
      );
    });
    AC.setAttribute(autocompleteList_obj);

    document.querySelectorAll("input[list]").forEach((input) => {
      input.addEventListener("change", function () {
        const listId = input.getAttribute("list");
        const datalist = document.getElementById(listId);
        if (!datalist) return;

        const validValues = Array.from(datalist.options).map(
          (opt) => opt.value,
        );
        const currentValue = input.value;

        if (validValues.length > 1 && !validValues.includes(currentValue)) {
          alert("選択肢にない値です。リストから選んでください。");
          input.value = ""; // または setCustomValidity などにしてもOK
        }
      });
    });

    // AC.update_datalist("allowance_select", allowance_datalist_object);
    /*  throw {
        type: "success",
        title: "選択肢情報の読み込み完了",
        message: message,
      }; */
  });

  return new Promise(function (resolve) {
    resolve(state);
  });
}

/*  try {
    main3455();
    main3856();
  } catch (e) {
    alert("エラーが発生しました");
  } */
//})();

//手当テーブル初期値入力
function allowance_set(state, company_data) {
  // const allowance_setting = company_data["手当設定"].value;
  const allowance_data = company_data["手当情報"].value;
  const allowance = state.record["手当"].value;

  allowance_data.forEach((record) => {
    if (record.value["有効フラグ手当"].value === "有効") {
      const key = record.value["手当キー_手当情報"].value;
      allowance_obj[key] = {
        手当名: record.value["手当名"].value,
        手当の額: record.value["手当の額"].value,
        計算方法: record.value["計算方法"].value,
      };
    }
  });
  if (allowance_data.length === 0) return;

  const filtered_allowance = allowance_data.filter(
    (item) => item.value["有効フラグ手当"].value === "有効",
  );

  filtered_allowance.forEach((item, index) => {
    const plus_button = document.querySelector(
      "a.ui.circular.blue.icon.button",
    );

    // 最初の1件目だけ既存レコードを上書き、それ以降は行追加
    if (
      index !== 0 ||
      allowance.length !== 1 ||
      allowance[0]["value"]["手当キー_雇用契約"].value !== 0
    ) {
      plus_button.click();
    }

    // 最新の手当行（追加済み）に値をセット
    let allowance_update = state.record["手当"].value;
    const table_index = allowance_update.length - 1;

    allowance_update[table_index]["value"]["手当キー_雇用契約"].value =
      item.value["手当キー_手当情報"]?.value || "";
    allowance_update[table_index]["value"]["手当名"].value =
      item.value["手当名"]?.value || "";
    allowance_update[table_index]["value"]["手当の額"].value =
      item.value["手当の額"]?.value || "";
    allowance_update[table_index]["value"]["計算方法"].value =
      item.value["計算方法"]?.value || "";
  });
}

//tableから動的ドロップダウン
function dropdown_table(company_data, field_data, state = null) {
  const data = company_data[field_data["table_code"]].value;
  let datalist_object = [];
  data.forEach((element) => {
    if (element.value[field_data["flag_code"]].value == "有効") {
      if (state && element.value[field_data["first_code"]].value === "入れる") {
        const fb_code = field_data["fb_code"];
        state.record[fb_code].value =
          element["value"][field_data["value_code"]].value;
      }
      value = element["value"];
      datalist_object.push({
        value: value[field_data["value_code"]].value,
        code: "",
      });
    }
  });
  return datalist_object;
}
