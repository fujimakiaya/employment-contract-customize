class CustomError extends Error {
  constructor(name, message) {
    super(message);
    this.name = name; // カスタムエラーの名前を設定
  }
}

//replace作業
class ReplaceValue {
  constructor(companyId, caller) {
    this.companyId = companyId;
    this.template_array = [];
    this.replace_data = {};
    this.field_name_array = [];
    this.replace_value_array = [];
    this.kind_value_array = [];
    this.customer_value = [];
    this.display_html = new Map();
    this.displayValue = {};
    this.initialized = 0;
    this.caller = caller === undefined ? "viewer" : caller;
    this.allowance_table = false;
    this.functionsObject = {
      文字消去_1文字: function remove_oneword(i, value) {
        try {
          if (value[i].length > 0) {
            value[i] = value[i].slice(0, -1);
            return value;
          } else {
            return value;
          }
        } catch (e) {
          console.error(e);
        }
      },
      日付: function date_array(i, value, replace_data, cer_name) {
        try {
          if (replace_data.get(cer_name)["day_display"] == "YYYY年MM月DD日") {
            if (Object.prototype.toString.call(value[i]).includes("Date")) {
              value[i] = value[i]
                .toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })
                .replaceAll("/", "-");
            }

            if (value[i] && value[i].trim() !== "") {
              let originalDateString = value[i];
              let originalDate = new Date(originalDateString);

              let year = originalDate.getFullYear();
              let month = originalDate.getMonth() + 1;
              let day = originalDate.getDate();
              let formattedDate = year + "年" + month + "月" + day + "日";
              value[i] = formattedDate;
              return value;
            } else {
              return value;
            }
          } else {
            return value;
          }
        } catch (e) {
          console.error(e);
        }
      },
      日付_年月のみ: function date_array(i, value, replace_data, cer_name) {
        try {
          if (replace_data.get(cer_name)["day_display"] == "YYYY年MM月DD日") {
            if (Object.prototype.toString.call(value[i]).includes("Date")) {
              value[i] = value[i]
                .toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })
                .replaceAll("/", "-");
            }

            if (value[i] && value[i].trim() !== "") {
              let originalDateString = value[i];
              let originalDate = new Date(originalDateString);

              let year = originalDate.getFullYear();
              let month = originalDate.getMonth() + 1;
              let formattedDate = year + "年" + month + "月";
              value[i] = formattedDate;

              return value;
            } else {
              return value;
            }
          } else {
            if (value[i] && value[i].trim() !== "") {
              let originalDateString = value[i];
              let originalDate = new Date(originalDateString);

              let year = originalDate.getFullYear();
              let month = originalDate.getMonth() + 1;
              let formattedDate = year + "-" + month;
              value[i] = formattedDate;
              return value;
            } else {
              return value;
            }
          }
        } catch (e) {
          console.error(e);
        }
      },
      金額: function addCommasToValue(i, value) {
        try {
          if (!isNaN(value[i]) && value[i] !== "") {
            value[i] = parseFloat(value[i]).toLocaleString("en-US");
          }
          return value;
        } catch (e) {
          console.error(e);
        }
      },
      テーブル: function table_array(
        i,
        value,
        replace_data,
        cer_name,
        displayValue,
      ) {
        let jj;
        try {
          let tablefield_name = replace_data.get(cer_name)["table_field"];
          let table = tablefield_name.map((name) =>
            name.replace(/^\{%|\%}$/g, ""),
          );
          let table_content = displayValue[table[i]].value;
          if (cer_name == "労働者名簿") {
            let flag_name = "有効無効フラグ_辞令";
            table_content = table_content.filter(
              (index) =>
                index.value &&
                index.value[flag_name] &&
                index.value[flag_name].value === "有効",
            );
          }
          if (cer_name == "雇用契約書" || cer_name == "労働条件通知書") {
            table_content = table_content.filter(
              (index) =>
                index.value &&
                index.value["手当の額"] &&
                index.value["手当の額"].value !== "0" &&
                index.value["手当の額"].value !== "",
            );
          }
          let pp = 0;
          for (jj = i + 1; jj < tablefield_name.length - 1; jj++) {
            if (table[jj] !== "") {
              if (table[jj - 1] == table[jj]) {
                pp += 1;
              } else {
                pp = 0;
              }
            }
            if (table_content[pp]) {
              let name = table[jj];
              value[jj] = table_content[pp]?.value?.[name]?.value ?? "";
            } else if (value[jj]) {
            } else {
              value[jj] = "";
            }
          }
        } catch (e) {
          console.error(e);
          value[i] = "";
        }
        return value;
      },
      個別関数1: function original_function1(
        i,
        value,
        replace_data,
        cer_name,
        displayValue,
      ) {
        try {
          let tablefield_name = replace_data.get(cer_name)["table_field"];
          let index = 0;
          const mapping = {
            ア: { index: 1, value1: "１", value2: "①", value3: "ア" },
            イ: { index: 2, value1: "２", value2: "②", value3: "イ" },
            ウ: { index: 3, value1: "３", value2: "③", value3: "ウ" },
            エ: { index: 4, value1: "４", value2: "④", value3: "エ" },
            オ: { index: 5, value1: "５", value2: "⑤", value3: "オ" },
            カ: { index: 6, value1: "６", value2: "⑥", value3: "カ" },
            キ: { index: 7, value1: "７", value2: "⑦", value3: "キ" },
          };

          const alphabet = displayValue[tablefield_name[i]].value;
          for (let key in mapping) {
            if (alphabet == key) {
              value[i + mapping[key].index] = mapping[key].value2;
              index = mapping[key].index;
            } else {
              value[i + mapping[key].index] = mapping[key].value1;
            }
          }
        } catch (e) {
          console.error(e);
        }
        return value;
      },
      個別関数2: function original_function2(
        i,
        value,
        replace_data,
        cer_name,
        displayValue,
      ) {
        try {
          let tablefield_name = replace_data.get(cer_name)["table_field"];
          let index = 0;
          const mapping = {
            ア: { index: 1, value1: "１", value2: "①", value3: "ア" },
            イ: { index: 2, value1: "２", value2: "②", value3: "イ" },
            ウ: { index: 3, value1: "３", value2: "③", value3: "ウ" },
            エ: { index: 4, value1: "４", value2: "④", value3: "エ" },
            オ: { index: 5, value1: "５", value2: "⑤", value3: "オ" },
            カ: { index: 6, value1: "６", value2: "⑥", value3: "カ" },
          };

          const alphabet = displayValue[tablefield_name[i]].value;
          for (let key in mapping) {
            if (alphabet == key) {
              value[i + mapping[key].index] = mapping[key].value2;
              index = mapping[key].index;
              value[i + 7] = mapping[key].index;
            } else {
              value[i + mapping[key].index] = mapping[key].value1;
            }
          }
        } catch (e) {
          console.error(e);
        }
        return value;
      },
      個別関数3: function original_function3(
        i,
        value,
        replace_data,
        cer_name,
        displayValue,
      ) {
        try {
          let tablefield_name = replace_data.get(cer_name)["table_field"];
          let index = value[i];
          let reasons = displayValue[tablefield_name[i]].value;
          value[i + 1 + (index - 1)] = reasons;
          value[i] = "";
        } catch (e) {
          console.error(e);
        }
        return value;
      },
    };
  }

  replaceGetValue(cer_name, displayValue) {
    try {
      this.displayValue = displayValue;
      this.field_name_array = this.replace_data.get(cer_name)["field_name"];
      this.replace_value_array =
        this.replace_data.get(cer_name)["replace_value"];
      this.kind_value_array = this.replace_data.get(cer_name)["kind_value"];
      this.customer_value = [];

      for (let [index, element] of this.field_name_array.entries()) {
        this.customer_value[index] = replaceTemplate.call(this, element);
        function replaceTemplate(templateString) {
          // プレースホルダーを正規表現でマッチさせる
          return templateString.replace(/{%([^%]+)%}/g, (match, p1) => {
            // プレースホルダーからフィールド名を取得し、値に変換する
            const key = p1.trim();
            if (
              this.displayValue[key] &&
              this.displayValue[key].value != null
            ) {
              return this.displayValue[key].value.replace(/\n/g, "<br>");
            }
            return ""; // 値が存在しない場合は空文字を返す
          });
        }
      }

      for (let i = 0; i < this.customer_value.length; i++) {
        if (this.kind_value_array[i] != null && this.customer_value != "") {
          this.customer_value = this.functionsObject[
            `${this.kind_value_array[i]}`
          ](
            i,
            this.customer_value,
            this.replace_data,
            cer_name,
            this.displayValue,
          );
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  replaceValueProcess(ledgerName) {
    let template = this.template_array.get(ledgerName);
    if (ledgerName == "退職証明書") {
      template = template.replace(
        ">%e22%",
        " id = cssstyle > （別紙の理由による）",
      );
    }
    for (let i = 0; i < this.replace_value_array.length; i++) {
      template = template.replace(
        this.replace_value_array[i],
        this.customer_value[i],
      );
    }
    return template;
  }

  replaceDateToString(data_object) {
    let retC = false;
    const entries = Object.entries(data_object);
    for (let [key, obj] of entries) {
      //        console.log(key, obj);
      if (obj.type === "DATE" && obj.value !== "") {
        obj.value = new Date(obj.value)
          .toLocaleDateString("ja-JP", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })
          .replaceAll("/", "-");

        // 数値型の処理
      } else if (obj.type === "NUMBER" && typeof obj.value === "number") {
        obj.value = obj.value.toString(); // 数値を文字列に変換
      } else if (obj.type === "SUBTABLE") {
        //        delete data_object[key];
      } else if (obj.type === "LABEL") {
        //        delete data_object[key];
      }
    }
    return retC;
  }

  replaceGetStatus() {
    return this.initialized;
  }

  async allowanceTable() {
    const relay = new Relay(
      3856,
      [
        {
          key: "会社レコード番号",
          operator: "=",
          value: this.companyId,
        },
      ],
      ["手当表示"],
    );
    return relay.RelayGetValueNormal().then((data) => {
      if (data.records.length > 0) {
        switch (data.records[0].手当表示.value) {
          case "表示する":
            this.allowance_table = true;
            break;

          case "表示しない":
            this.allowance_table = false;
            break;

          default:
            break;
        }
      }
    });
  }

  async replaceInitProcess(ledgerNames) {
    await this.allowanceTable();
    //*** Initialization of printprocess - get 帳票フィールド管理アプリ・データ ***
    const fieldTable = structuredClone(ledgerNames);
    if (fieldTable.length < 2) fieldTable.push(" "); //push dummy data
    const relay = new Relay(
      3851,
      [
        {
          key: "会社レコード番号",
          operator: "=",
          value: this.companyId,
        },
        {
          key: "帳票名",
          operator: "in",
          value: fieldTable,
        },
      ],
      ["帳票名", "フィールド管理", "日付の表示方法", "htmファイル"],
    );

    return relay
      .RelayGetValue()
      .then(async (data) => {
        // ★ 取得済み帳票名を抽出
        const existingNames = data.records.map((r) => r["帳票名"].value);

        // ★ ledgerNames のうち不足しているものを特定
        const missingNames = ledgerNames.filter(
          (name) => !existingNames.includes(name),
        );

        // ★不足が無ければ data を返す
        if (missingNames.length === 0) {
          return data;
        }
        const isSingleMissing = missingNames.length === 1;

        // ★不足が1つの場合（and 雇用契約書が含まれているパターンにも対応）
        // → 327から必要な帳票だけを取得して “data に追加” する
        const relay327 = new Relay(
          3851,
          [
            {
              key: "会社レコード番号",
              operator: "=",
              value: 327,
            },
            {
              key: "帳票名",
              operator: isSingleMissing ? "=" : "in",
              value: isSingleMissing ? missingNames[0] : missingNames,
            },
          ],
          ["帳票名", "フィールド管理", "日付の表示方法", "htmファイル"],
        );

        const data327 = await relay327.RelayGetValueNormal();

        // ★ data.records に追加
        data.records.push(...data327.records);
        sessionStorage.setItem("getValue1", JSON.stringify(data));

        // ★ 不足していた帳票名を sessionStorage に保持
        sessionStorage.setItem(
          "templateMissingNames",
          JSON.stringify(missingNames),
        );
        return data;
      })
      .then((data) => {
        const storedValues = JSON.parse(sessionStorage.getItem("fileValues1"));
        if (storedValues) {
          const restoredTemplateArray = new Map(Object.entries(storedValues));
          return restoredTemplateArray;
        } else {
          return relay.FileGetValue(ledgerNames, data);
        }
      })
      .then((fileValues) => {
        this.template_array = fileValues;
        return relay.GetRequireValue();
      })
      .then((ret_value) => {
        this.replace_data = ret_value;
        this.initialized = 1;
      })
      .catch((error) => {
        console.error(error);
      });
  }
}

//一括印刷機能
class batchPrint {
  constructor(companyId, batch_params) {
    this.companyId = companyId !== null ? companyId : 327;
    this.batch_params = batch_params;
    this.replace = new ReplaceValue(this.companyId);
  }

  async executeFunction(replace, ledgerNames, filter, latestRecords) {
    let query;
    let relay;
    let data;
    let employeeIds;
    let operator = "in";
    switch (ledgerNames[0]) {
      case "雇用契約書":
      case "労働条件通知書":
        if (Array.isArray(filter) && filter.length === 1) {
          operator = "=";
          filter = filter[0];
        }

        //従業員管理アプリから該当の社員No取得
        query = [
          {
            key: "会社レコード番号",
            operator: "=",
            value: this.companyId,
          },
          {
            key: "$id",
            operator: operator,
            value: filter,
          },
        ];
        // relay = new Relay(3202, query, ["社員No"]);
        // data = await relay.RelayGetValueReturn();
        data = {
          records: Array.from(
            new Map(
              latestRecords
                .flatMap((d) => d.kintoneRecord ?? [])
                .map((r) => [String(r["$id"]?.value), r]),
            ).values(),
          ),
        };
        employeeIds = [
          ...new Set(
            data.records.map((item) => item["$id"]?.value).filter(Boolean),
          ),
        ];
        break;
      case "労働者名簿":
        query = [
          {
            key: "会社レコード番号",
            operator: "=",
            value: this.companyId,
          },
          {
            key: "労働者名簿key",
            operator: "=",
            value: this.batch_params,
          },
        ];
        relay = new Relay(3218, query, ["社員No"]);
        // 労働者名簿から社員Noを持ってくる
        data = await relay.RelayGetValueReturn();
        employeeIds = data.records.map((item) => item["社員No"].value);
        break;
    }
    const informArray = {
      労働者名簿: {
        fieldName: [
          "社員No",
          "労働者氏_労働者名簿",
          "労働者名_労働者名簿",
          "労働者セイ_労働者名簿",
          "労働者メイ_労働者名簿",
          "性別_労働者名簿",
          "生年月日_労働者名簿",
          "入社年月日_労働者名簿",
          "退職又は死亡年月日_労働者名簿",
          "郵便番号_労働者名簿",
          "住所フリガナ_労働者名簿",
          "住所_労働者名簿",
          "電話番号_労働者名簿",
          "所属_労働者名簿",
          "職種_労働者名簿",
          "退職または死亡事由_労働者名簿",
          "備考_労働者名簿",
          "労働者名簿公開承認日",
          "辞令履歴テーブル",
        ],
        appId: 3218,
        approvalDate: "労働者名簿公開承認日",
        query: [
          {
            key: "会社レコード番号",
            operator: "=",
            value: this.companyId,
          },
          {
            key: "社員No",
            operator: "in",
            value: employeeIds,
          },
        ],
      },
      雇用契約書: {
        fieldName: [
          "$id",
          "社員No",
          "姓戸籍",
          "名戸籍",
          "入社日",
          "契約期間",
          "更新の種類",
          "契約締結日",
          "契約開始日",
          "契約終了日",
          "試用期間開始日",
          "試用期間終了日",
          "雇用形態区分",
          "就業の場所",
          "従事すべき業務の内容",
          "役職",
          "始業時刻1",
          "終業時刻1",
          "始業時刻2",
          "終業時刻2",
          "始業時刻3",
          "終業時刻3",
          "始業・終業時刻その他",
          "休憩時間1",
          "休憩時間2",
          "休憩時間3",
          "所定時間外労働の有無",
          "休日労働",
          "深夜労働",
          "休日",
          "給与形態",
          "基本賃金額",
          "手当",
          "ラベル_賃金締切日1",
          "賃金締切日当月か翌月か",
          "賃金締切日",
          "ラベル_賃金締切日2",
          "賃金締切日2当月か翌月か",
          "賃金締切日2",
          "ラベル_賃金支払日1",
          "賃金支払日当月か翌月か",
          "賃金支払日",
          "ラベル_賃金支払日2",
          "賃金支払日2当月か翌月か",
          "賃金支払日2",
          "賃金支払方法",
          "労使協定に基づく賃金支払時の控除",
          "備考1",
          "昇給の有無",
          "昇給の時期等",
          "賞与",
          "賞与時期等",
          "退職金",
          "定年制の有無",
          "定年制年齢",
          "継続雇用年齢",
          "例2か月",
          "例14",
          "労災保険の適用",
          "雇用保険の適用",
          "健康保険の適用",
          "厚生年金の適用",
          "短時間労働者について雇用管理改善等に関する相談窓口_0",
          "個別特記事項",
          "就業場所の変更範囲",
          "業務内容の変更範囲",
          "就業規則を確認できる場所",
          "就業規則の確認方法",
          "契約更新上限の有無",
          "更新上限回数",
          "通算契約期間",
          "契約期間末日の翌日",
          "労働条件変更の有無",
          "雇用契約書作成日",
          "雇用契約書公開承認日",
          "会社名",
          "代表者職名",
          "代表者氏名",
        ],
        appId: 3565,
        approvalDate: "雇用契約書公開承認日",
        query: [
          {
            key: "会社レコード番号",
            operator: "=",
            value: this.companyId,
          },
          {
            key: "$id",
            operator: "in",
            value: employeeIds,
          },
        ],
      },
      労働条件通知書: {
        fieldName: [
          "$id",
          "社員No",
          "姓戸籍",
          "名戸籍",
          "入社日",
          "契約期間",
          "更新の種類",
          "契約締結日",
          "契約開始日",
          "契約終了日",
          "試用期間開始日",
          "試用期間終了日",
          "雇用形態区分",
          "就業の場所",
          "従事すべき業務の内容",
          "役職",
          "始業時刻1",
          "終業時刻1",
          "始業時刻2",
          "終業時刻2",
          "始業時刻3",
          "終業時刻3",
          "始業・終業時刻その他",
          "休憩時間1",
          "休憩時間2",
          "休憩時間3",
          "所定時間外労働の有無",
          "休日労働",
          "深夜労働",
          "休日",
          "給与形態",
          "基本賃金額",
          "手当",
          "ラベル_賃金締切日1",
          "賃金締切日当月か翌月か",
          "賃金締切日",
          "ラベル_賃金締切日2",
          "賃金締切日2当月か翌月か",
          "賃金締切日2",
          "ラベル_賃金支払日1",
          "賃金支払日当月か翌月か",
          "賃金支払日",
          "ラベル_賃金支払日2",
          "賃金支払日2当月か翌月か",
          "賃金支払日2",
          "賃金支払方法",
          "労使協定に基づく賃金支払時の控除",
          "備考1",
          "昇給の有無",
          "昇給の時期等",
          "賞与",
          "賞与時期等",
          "退職金",
          "定年制の有無",
          "定年制年齢",
          "継続雇用年齢",
          "例2か月",
          "例14",
          "労災保険の適用",
          "雇用保険の適用",
          "健康保険の適用",
          "厚生年金の適用",
          "短時間労働者について雇用管理改善等に関する相談窓口_0",
          "個別特記事項",
          "就業場所の変更範囲",
          "業務内容の変更範囲",
          "就業規則を確認できる場所",
          "就業規則の確認方法",
          "契約更新上限の有無",
          "更新上限回数",
          "通算契約期間",
          "契約期間末日の翌日",
          "労働条件変更の有無",
          "雇用契約書作成日",
          "雇用契約書公開承認日",
          "会社名",
          "代表者職名",
          "代表者氏名",
        ],
        appId: 3565,
        approvalDate: "雇用契約書公開承認日",
        query: [
          {
            key: "会社レコード番号",
            operator: "=",
            value: this.companyId,
          },
          {
            key: "$id",
            operator: "in",
            value: employeeIds,
          },
        ],
      },
    };

    let displayHtml_join;
    const parser = new DOMParser();

    try {
      //該当社員Noの全データ取得
      const relayCertification = new Relay(
        informArray[ledgerNames[0]].appId,
        informArray[ledgerNames[0]].query,
        informArray[ledgerNames[0]].fieldName,
      );
      const batchDatas = await relayCertification.RelayGetValueBatchData();
      let batchData;
      if (
        ledgerNames[0] == "雇用契約書" ||
        ledgerNames[0] == "労働条件通知書"
      ) {
        data.records.map(async (record) => {
          const employeeId = record["$id"].value;
          batchData = batchDatas.records?.filter(
            (rec) => rec["$id"]?.value === employeeId,
          );
          makehtmlArray(batchData);
        });
      } else {
        data.records.map(async (record) => {
          const employeeId = record["社員No"].value;
          batchData = batchDatas.records?.filter(
            (rec) => rec["社員No"]?.value === employeeId,
          );
          makehtmlArray(batchData);
        });
      }
    } catch (e) {
      displayHtml_join = "";
    }
    function makehtmlArray(batchData) {
      if (
        batchData[0] &&
        (ledgerNames[0] == "雇用契約書" ||
          ledgerNames[0] == "労働条件通知書" ||
          batchData[0][informArray[ledgerNames[0]].approvalDate]?.value)
      ) {
        const displayValue = batchData[0];
        replace.replaceGetValue(ledgerNames[0], displayValue);
        const displayHtml = replace.replaceValueProcess(ledgerNames[0]);
        const doc = parser.parseFromString(displayHtml, "text/html");

        if (!displayHtml_join) {
          displayHtml_join = doc;
        } else {
          displayHtml_join.body.innerHTML += doc.body.innerHTML;
        }
      }
    }
    return displayHtml_join;
  }
}

const ENDPOINT =
  "https://kintone-relay-api-light-538321378695.asia-northeast1.run.app/";

//リレーAPIで情報取得 replace_dataを返す
class Relay {
  constructor(appid, query_params, records) {
    this.appid = appid;
    this.records = records;
    this.query_params = query_params;
    this.data = null;
  }

  async RelayGetValueNormal() {
    const requestParam = {
      id: this.appid,
      query_params: this.query_params,
      fields: this.records,
    };

    try {
      const response = await fetch(ENDPOINT + "/getRecord", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestParam),
      });

      if (!response.ok) {
        console.error("Error: ", await response.json());
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      return data;
      // console.log(this.data); // レスポンスデータを処理
    } catch (error) {
      console.error("Error:", error); // エラーハンドリング
    }
  }

  async RelayGetValueBatchData() {
    const requestParam = {
      id: this.appid,
      query_params: this.query_params,
      fields: this.records,
    };

    try {
      const response = await fetch(ENDPOINT + "/getRecord", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestParam),
      });

      if (!response.ok) {
        console.error("Error: ", await response.json());
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      this.data = data;
    } catch (error) {
      console.error("Error:", error); // エラーハンドリング
    }
    return this.data;
  }

  async RelayGetValueReturn() {
    const requestParam = {
      id: this.appid,
      query_params: this.query_params,
      fields: this.records,
    };

    try {
      const response = await fetch(ENDPOINT + "/getRecord", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestParam),
      });

      if (!response.ok) {
        console.error("Error: ", await response.json());
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      this.data = data;
    } catch (error) {
      console.error("Error:", error); // エラーハンドリング
    }
    return this.data;
  }

  async RelayGetValue() {
    //1208藤巻変更（templateない場合は327取得）
    const json_data = JSON.parse(sessionStorage.getItem("getValue1"));
    if (!json_data || !json_data.records || json_data.records.length === 0) {
      const requestParam = {
        id: this.appid,
        query_params: this.query_params,
        fields: this.records,
      };

      try {
        const response = await fetch(ENDPOINT + "/getRecord", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestParam),
        });

        if (!response.ok) {
          console.error("Error: ", await response.json());
          throw new Error("Network response was not ok");
        }

        this.data = await response.json();
        if (this.data.length !== 0) {
          sessionStorage.setItem("getValue1", JSON.stringify(this.data));
        }
        console.log(this.data); // レスポンスデータを処理
      } catch (error) {
        console.error("Error:", error); // エラーハンドリング
      }
    }
    this.data = JSON.parse(sessionStorage.getItem("getValue1"));
    return JSON.parse(sessionStorage.getItem("getValue1"));
  }

  async FileGetValue(ledgerNames, data) {
    let template_array = new Map();
    let file_records = data["records"];
    for (let e of file_records) {
      if (
        e["htmファイル"].value.length != 0 &&
        ledgerNames.includes(e["帳票名"].value)
      ) {
        const requestParam2 = {
          id: this.appid,
          file_key: e["htmファイル"].value[0].fileKey,
        };

        try {
          const response = await fetch(ENDPOINT + "/getFile", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestParam2),
          });

          if (!response.ok) {
            console.error("Error: ", await response.blob());
            throw new Error("Network response was not ok");
          }

          let blob = await response.blob();
          let arrayBuffer = await blob.arrayBuffer();
          let decoder = new TextDecoder("shift-jis");
          let template = decoder.decode(arrayBuffer);
          // console.log(template); // レスポンスデータを処理
          template_array.set(e["帳票名"].value, template);
          // console.log(template_array);
        } catch (error) {
          console.error("Error:", error); // エラーハンドリング
        }
      }
    }
    let templateObject = Object.fromEntries(template_array.entries());
    sessionStorage.setItem("fileValues1", JSON.stringify(templateObject));
    return template_array;
  }

  GetRequireValue() {
    let data_records = JSON.parse(sessionStorage.getItem("getValue1"))[
      "records"
    ];
    const replace_data = new Map();
    for (let e of data_records) {
      let cer_name = e["帳票名"].value;
      let table_value = e["フィールド管理"].value;
      let day_display = e["日付の表示方法"].value;
      let field_name = [];
      let kind_value = [];
      let table_field = [];
      let table_text_max = [];
      let replace_value = [];
      let replace_obj = {};

      for (let [index, element] of table_value.entries()) {
        let value_obj = element.value;
        field_name[index] = value_obj["フィールド名"].value;
        replace_value[index] = value_obj["置き換えるべき値"].value;
        kind_value[index] = value_obj["種類"].value;
        table_field[index] = value_obj["テーブル用フィールド"].value;
        table_text_max[index] = value_obj["文字数制限_FB"].value;
        replace_obj = {
          field_name: field_name,
          replace_value: replace_value,
          kind_value: kind_value,
          table_field: table_field,
          day_display: day_display,
          table_text_max: table_text_max,
        };
      }
      replace_data.set(cer_name, replace_obj);
    }
    return replace_data;
  }
}
