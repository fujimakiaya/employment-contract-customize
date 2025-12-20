(function () {
  "use strict";

  fb.addValidators = function (state) {
    return {
      full_width_checker: {
        getMessage: function (fieldCode, params) {
          return "全角入力してください";
        },
        validate: function (value, params) {
          if (!value.match(/^[^\x01-\x7E\xA1-\xDF]+$/)) {
            return false;
          }
          return true;
        },
      },
      after_date_checker: {
        getMessage: function (fieldCode, params) {
          return "生年月日より後の日付を入力してください";
        },
        validate: function (value, params) {
          if (value < state.record.生年月日_在職.value) {
            return false;
          }
          return true;
        },
      },
      after_enter_date_checker: {
        getMessage: function (fieldCode, params) {
          return "入社年月日より後の日付を入力してください";
        },
        validate: function (value, params) {
          if (value <= state.record.入社年月日_在職.value) {
            return false;
          }
          return true;
        },
      },
      address_number_checker: {
        getMessage: function (fieldCode, params) {
          return "ハイフンありの8文字で入力してください";
        },
        validate: function (value, params) {
          if (value.length != 8 || value.indexOf("-") == -1) {
            return false;
          }
          return true;
        },
      },
      content_checker: {
        getMessage: function (fieldCode, params) {
          return "内容は全角65文字以内で記載してください";
        },
        validate: function (value, params) {
          if (value.length > 65 || !value.match(/^[^\x01-\x7E\xA1-\xDF]+$/)) {
            return false;
          }
          return true;
        },
      },
      phone_number_checker: {
        getMessage: function (fieldCode, params) {
          return "ハイフンありの12文字又は13文字で入力してください 例000-0000-0000";
        },
        validate: function (value, params) {
          if (
            (value.length != 12 && value.length != 13) ||
            value.indexOf("-") == -1
          ) {
            return false;
          }
          return true;
        },
      },
    };
  };

  fb.events.form.created = [
    function (state) {
      //在職証明書
      state.fields
        .filter(function (field) {
          return field.code === "在職証明書に記載する事項_在職";
        })[0]
        .validations.push({
          params: [],
          rule: "full_width_checker",
        });
      //辞令
      state.fields
        .filter(function (field) {
          return field.code === "辞令の内容_辞令";
        })[0]
        .validations.push({
          params: [],
          rule: "full_width_checker",
        });
      state.fields
        .filter(function (field) {
          return field.code === "代表者氏名_辞令";
        })[0]
        .validations.push({
          params: [],
          rule: "full_width_checker",
        });
      state.fields
        .filter(function (field) {
          return field.code === "辞令日付_辞令";
        })[0]
        .validations.push({
          params: [],
          rule: "after_enter_date_checker",
        });
      state.fields
        .filter(function (field) {
          return field.code === "使用者職氏名_退職証明";
        })[0]
        .validations.push({
          params: [],
          rule: "full_width_checker",
        });
      state.fields
        .filter(function (field) {
          return field.code === "具体的な理由_退職証明";
        })[0]
        .validations.push({
          params: [],
          rule: "full_width_checker",
        });
      //解雇理由証明書
      state.fields
        .filter(function (field) {
          return field.code === "使用者職氏名_解雇理由";
        })[0]
        .validations.push({
          params: [],
          rule: "full_width_checker",
        });

      return state;
    },
  ];

  // 退職証明書作成データを解雇理由証明書に自動転記
  fb.events.fields.労働者が解雇理由を請求するか_退職証明.changed.push(function (
    state
  ) {
    if (
      state.record.労働者が解雇理由を請求するか_退職証明.value !=
      "解雇理由を請求する"
    )
      return state;
    state.record.解雇日_解雇理由.value = state.record.退職日_退職証明.value;
    state.record.証明日_解雇理由.value = state.record.退職証明日_退職証明.value;
    state.record.解雇理由証明書公開承認日.value =
      state.record.退職証明書公開承認日.value;
    return state;
  });

  fb.events.fields.退職日_退職証明.changed.push(function (state) {
    state.record.解雇日_解雇理由.value = state.record.退職日_退職証明.value;
    return state;
  });

  fb.events.fields.退職証明日_退職証明.changed.push(function (state) {
    state.record.証明日_解雇理由.value = state.record.退職証明日_退職証明.value;
    return state;
  });

  fb.events.fields.退職証明書公開承認日.changed.push(function (state) {
    state.record.解雇理由証明書公開承認日.value =
      state.record.退職証明書公開承認日.value;
    return state;
  });
})();
