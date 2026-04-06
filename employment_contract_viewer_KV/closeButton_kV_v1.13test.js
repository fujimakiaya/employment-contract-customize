const ENDPOINT =
  "https://kintone-relay-api-light-538321378695.asia-northeast1.run.app";
const uniqueKey = `${Date.now()}-${Math.random()
  .toString(36)
  .substring(2, 15)}`;
const batch_params = uniqueKey;

//リレーAPIで情報取得 replace_dataを返す
class Relay {
  constructor(companyId, records, userName) {
    this.empAppid = 3202;
    this.certiAppid = 3218;
    this.companyId = companyId;
    this.empData = records;
    this.idData = null;
    this.userName = userName;
  }

  async RelayGetValue(appId, query_params, records) {
    const requestParam = {
      id: appId,
      query_params: query_params,
      fields: records,
    };
    console.log(requestParam);

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
      // console.log(data); // レスポンスデータを処理
      return data;
    } catch (error) {
      console.error("Error:", error); // エラーハンドリング
    }
  }

  async RelayPutValue(record_list) {
    const requestParam = {
      id: this.certiAppid,
      record_list: record_list,
    };

    try {
      const response = await fetch(ENDPOINT + "/putRecord", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestParam),
      });

      const data = await response.json(); // JSON を待機して取得
      // 必要に応じてdataをreturnする
      return data;
    } catch (error) {
      console.error("Error:", error);
      return null; // エラーが発生した場合にはnullを返す
    }
  }

  changeAddress(getData) {
    const add_1 = getData.住所1.value;
    const add_2 = getData.住所2.value;
    const add_3 = getData.住所3.value;
    const add_4 = getData.住所4.value;
    const addfri_1 = kanjiToKana(add_1.trim());
    const addfri_2 = getData.住所2カナ.value;
    const addfri_3 = getData.住所3カナ.value;
    const addfri_4 = getData.住所4カナ.value;
    const fullAddress = add_1 + add_2 + add_3 + add_4;
    const fullAddressKana = addfri_1 + addfri_2 + addfri_3 + addfri_4;
    const {
      住所1,
      住所2,
      住所3,
      住所4,
      住所2カナ,
      住所3カナ,
      住所4カナ,
      ...restData
    } = getData;
    getData = {
      ...restData, // 他のデータはそのまま
      住所_労働者名簿: {
        type: "SINGLE_LINE_TEXT",
        value: fullAddress, // 結合した住所
      },
      住所フリガナ_労働者名簿: {
        type: "SINGLE_LINE_TEXT",
        value: fullAddressKana, // カナ変換した住所
      },
    };
    return getData;
  }

  changeBornDate(getData) {
    const raw = getData.生年月日.value;
    if (!raw || raw.length !== 8) {
      getData.生年月日.value = "";
      return getData;
    } // 安全チェック

    getData.生年月日.value = `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(
      6,
      8,
    )}`;
    return getData;
  }

  //値の変換
  changeValue(getData) {
    //住所変更
    getData = this.changeAddress(getData);
    //生年月日変更
    getData = this.changeBornDate(getData);
    //名称変更
    const keyMapping = [
      ["姓戸籍", "労働者氏_労働者名簿"],
      ["名戸籍", "労働者名_労働者名簿"],
      ["セイ戸籍カナ", "労働者セイ_労働者名簿"],
      ["メイ戸籍カナ", "労働者メイ_労働者名簿"],
      ["性別戸籍", "性別_労働者名簿"],
      ["生年月日", "生年月日_労働者名簿"],
      ["郵便番号", "郵便番号_労働者名簿"],
      ["入社年月日", "入社年月日_労働者名簿"],
      ["退職年月日", "退職又は死亡年月日_労働者名簿"],
      ["携帯番号", "電話番号_労働者名簿"],
      ["職種", "職種_労働者名簿"],
      ["所属事業所", "所属_労働者名簿"],
      ["離職理由", "退職または死亡事由_労働者名簿"],
      ["社員No", "社員No"],
      ["会社レコード番号", "会社レコード番号"],
      ["住所_労働者名簿", "住所_労働者名簿"],
      ["住所フリガナ_労働者名簿", "住所フリガナ_労働者名簿"],
    ];
    getData = transformObjectKeys(getData, keyMapping);
    getData["労働者名簿key"] = uniqueKey;
    const today = new Date().toISOString().split("T")[0];
    getData["労働者名簿作成日"] = {
      type: "DATE",
      value: today,
    };
    getData["労働者名簿作成者"] = this.userName.replace("+", "　");
    getData["労働者名簿公開承認日"] = {
      type: "DATE",
      value: today,
    };
    getData["労働者名簿公開承認者"] = this.userName.replace("+", "　");

    return getData;
  }

  //履歴テーブルの作成
  makeTable(getData, idData) {
    const idOnlyArray = idData.records[0]["労働者名簿テーブル"].value.map(
      (row) => ({
        id: row.id,
      }),
    );
    const keyMapping = [
      ["労働者氏_労働者名簿", "労働者氏_労働者名簿テーブル"],
      ["労働者名_労働者名簿", "労働者名_労働者名簿テーブル"],
      ["労働者セイ_労働者名簿", "労働者セイ_労働者名簿テーブル"],
      ["労働者メイ_労働者名簿", "労働者メイ_労働者名簿テーブル"],
      ["性別_労働者名簿", "性別_労働者名簿テーブル"],
      ["生年月日_労働者名簿", "生年月日_労働者名簿テーブル"],
      ["郵便番号_労働者名簿", "郵便番号_労働者名簿テーブル"],
      ["入社年月日_労働者名簿", "入社年月日_労働者名簿テーブル"],
      [
        "退職又は死亡年月日_労働者名簿",
        "退職または死亡年月日_労働者名簿テーブル",
      ],
      ["住所_労働者名簿", "住所_労働者名簿テーブル"],
      ["住所フリガナ_労働者名簿", "住所フリガナ_労働者名簿テーブル"],
      ["電話番号_労働者名簿", "電話番号_労働者名簿テーブル"],
      ["所属_労働者名簿", "所属_労働者名簿テーブル"],
      ["職種_労働者名簿", "職種_労働者名簿テーブル"],
      ["退職または死亡事由_労働者名簿", "退職又は死亡事由_労働者名簿テーブル"],
      ["労働者名簿作成日", "労働者名簿作成日_労働者名簿テーブル"],
      ["労働者名簿作成者", "労働者名簿作成者_労働者名簿テーブル"],
      ["労働者名簿公開承認日", "労働者名簿公開承認日_労働者名簿テーブル"],
      ["労働者名簿公開承認者", "労働者名簿公開承認者_労働者名簿テーブル"],
    ];
    let newRow = transformObjectKeys(getData, keyMapping);
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0"); // 月は0から始まるので+1
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    // フォーマット: YYYY-MM-DD HH:MM
    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`;
    newRow["送信日_労働者名簿テーブル"] = formattedDate;

    const Table = {
      value: [
        ...idOnlyArray,
        {
          value: newRow,
        },
      ],
    };
    getData["労働者名簿テーブル"] = Table;
    return getData;
  }

  //従業員管理アプリから会社レコード(&退職の有無)で抽出した社員No，...を全件取得
  async executeFunction(textElement) {
    let currentEmpNo = null;
    try {
      //for文で
      const empIds = this.empData.map((record) => record["社員No"]?.value);
      let relay_value;
      let operator;
      if (empIds?.length == 1) {
        operator = "=";
        relay_value = empIds[0];
      } else {
        operator = "in";
        relay_value = empIds;
      }
      const query_params = [
        {
          key: "会社レコード番号",
          operator: "=",
          value: this.companyId,
        },
        {
          key: "社員No",
          operator: operator,
          value: relay_value,
        },
      ];
      const records = ["$id", "社員No", "労働者名簿テーブル"];
      const idDatas = await this.RelayGetValue(
        this.certiAppid,
        query_params,
        records,
      );
      for (const [index, emp] of this.empData.entries()) {
        currentEmpNo = emp["社員No"]?.value;
        let getData = emp;
        let record_list = [];
        const idData = {
          records: idDatas.records.filter(
            (data) => data["社員No"]?.value === emp["社員No"].value,
          ),
        };
        //comIdとempIdが一致する人を帳票作成管理アプリから取得
        getData = this.changeValue(getData);
        getData = this.makeTable(getData, idData);
        record_list = [
          {
            id: idData.records[0]["$id"].value,
            record: {
              ...getData,
            },
          },
        ];
        textElement.textContent = `${index + 1}人目の帳票を作成しています...`;
        await this.RelayPutValue(record_list);
      }
      textElement.textContent = "帳票出力に移ります...";
      return;
    } catch (error) {
      return { error, empNo: currentEmpNo };
    }
  }
}

(function () {
  "use strict";

  const Params = new URLSearchParams(window.location.search);
  const userMailAddress = decodeURIComponent(Params.get("mailAddress")) || "";
  let companyId = sessionStorage.getItem("companyId");
  if (!companyId) {
    companyId = Params.get("companyId") || 327;
    sessionStorage.setItem("companyId", companyId);
  }
  let userName = sessionStorage.getItem("userName");
  if (!userName) {
    userName = Params.get("name") || "Administrator";
    sessionStorage.setItem("userName", userName);
  }

  kviewer.events.on("record.show", async function (state) {
    document.getElementById("__next").style.display = "none";
    showSpinner();
    let textElement = document.createElement("div");
    textElement.style.position = "absolute";
    textElement.style.top = "45%"; // ← ここを35%に！
    textElement.style.left = "50%";
    textElement.style.transform = "translate(-50%, -50%)";
    textElement.style.color = "white";
    textElement.style.fontSize = "20px";
    textElement.style.zIndex = "9999";
    textElement.textContent = "作成しています...";
    const spinBg1 = document.getElementById("kintone-spin-bg");
    if (spinBg1) {
      spinBg1.appendChild(textElement);
    }
    let apprecords = [state.record.kintoneRecord];
    await batchRelay(apprecords, companyId, userName, textElement);
    let empId = state.record.kintoneRecord.社員No.value;
    const url = `https://5ea2a167.viewer.kintoneapp.com/public/nkrfsv2-8-newkv-print-workerinfo-3218-999-test`;
    const param = `?additionalFilters=[{"field":"社員No","sign":"=","value":"${empId}","with":"and"}]&companyId=${companyId}&name=${userName}&mailAddress=${userMailAddress}`;
    window.location.href = url + param;
    /*    const modal = document.createElement("div");
    modal.innerHTML = `
            <div style="
              position:fixed;
              inset:0;
              background:rgba(0,0,0,0.45);
              backdrop-filter: blur(2px);
              display:flex;
              align-items:center;
              justify-content:center;
              z-index:99999;
            ">
              <div style="
                background:#fff;
                padding:24px 28px;
                border-radius:12px;
                min-width:320px;
                box-shadow:0 10px 30px rgba(0,0,0,.25);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              ">
                <p style="
                  margin:0 0 20px;
                  font-size:14px;
                  line-height:1.6;
                  color:#333;
                ">
                  印刷処理を行います。<br>
                  OKボタンを押してください。
                </p>

                <div style="text-align:right;">
                  <button id="ok" style="
                    background:#ff8c00;
                    color:#fff;
                    border:none;
                    padding:8px 18px;
                    border-radius:6px;
                    font-size:13px;
                    font-weight:600;
                    cursor:pointer;
                  ">
                    OK
                  </button>
                </div>
              </div>
            </div>
          `;
    document.body.appendChild(modal);

    document.getElementById("ok").onclick = () => {
      const a = document.createElement("a");
      a.href = url + param;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.click();
      modal.remove();
      hideSpinner();
      document.getElementById("__next").style.display = "block";
    };
    */
  });

  kviewer.events.on("records.show", function (state) {
    let pButton1;
    let apprecords;
    let stateData = state;
    //ボタンの複数作成を防止
    if (document.getElementsByClassName("nkrfs-button1").length !== 0) {
      Array.from(document.getElementsByClassName("nkrfs-button1")).forEach(
        function (button) {
          button.remove();
        },
      );
    }
    pButton1 = make_iconButton(
      "printer",
      "労働者名簿一括印刷",
      "nkrfs-button1",
    );
    pButton1.addEventListener("click", async function () {
      try {
        apprecords = stateData.records.map((item) => item.kintoneRecord);
        // ここで3218アプリに全員の社員Noが存在するかチェックする
        const empIds = apprecords
          .map((r) => r["社員No"]?.value)
          .filter((v) => v !== undefined && v !== null && v !== "");
        if (empIds.length === 0) {
          alert("社員Noが見つかりません。処理を中止します。");
          return;
        }

        const checkRelay = new Relay(companyId, apprecords, userName);
        const operator = empIds.length === 1 ? "=" : "in";
        const relayQuery = [
          { key: "会社レコード番号", operator: "=", value: companyId },
          {
            key: "社員No",
            operator: operator,
            value: operator === "=" ? empIds[0] : empIds,
          },
        ];
        const fields = ["社員No"];
        const existData = await checkRelay.RelayGetValue(
          checkRelay.certiAppid,
          relayQuery,
          fields,
        );

        if (!existData || !Array.isArray(existData.records)) {
          alert(
            "NKRFS帳票作成管理（AppID：3218）への確認に失敗しました。ネットワークを確認してください。",
          );
          return;
        }

        const foundIds = existData.records
          .map((r) => r["社員No"]?.value)
          .filter(Boolean);
        const missing = empIds.filter((id) => !foundIds.includes(id));

        if (missing.length > 0) {
          alert(
            "NKRFS帳票作成管理（AppID：3218）に以下の社員No.の従業員が登録されていません。\n" +
              missing.join("\n"),
          );
          return; // 存在しない社員がいるため処理中止
        }

        const recordCount = stateData.records.length;
        const timePerRecord = 400;
        const totalTimeInMilliseconds = recordCount * timePerRecord;
        const totalTimeInSeconds = totalTimeInMilliseconds / 1000;
        const isConfirmed = confirm(
          `この処理には約${
            Math.ceil(totalTimeInSeconds) + 1
          }秒かかります。レコード数: ${recordCount}件。\n処理を実行しますか？`,
        );
        showSpinner();
        const spinBg1 = document.getElementById("kintone-spin-bg");
        let textElement = document.createElement("div");
        textElement.style.position = "absolute";
        textElement.style.top = "45%"; // ← ここを35%に！
        textElement.style.left = "50%";
        textElement.style.transform = "translate(-50%, -50%)";
        textElement.style.color = "white";
        textElement.style.fontSize = "20px";
        textElement.style.zIndex = "9999";
        textElement.textContent = "作成しています...";
        if (spinBg1) {
          spinBg1.appendChild(textElement);
        }
        if (isConfirmed) {
          const result = await batchRelay(
            apprecords,
            companyId,
            userName,
            textElement,
          );
          // executeFunction が {error, empNo} を返してきた場合
          if (result?.empNo) {
            throw result; // ← catch に飛ばす
          }
          // 簡易モーダル
          hideSpinner();
          const url = `https://5ea2a167.viewer.kintoneapp.com/public/nkrfsv2-8-newkv-print-workerinfo-3218-999-test?companyId=${companyId}&batch=${batch_params}&name=${userName}&&mailAddress=${userMailAddress}`;
          window.location.href = url;
          textElement.remove();
          /*  const modal = document.createElement("div");
          modal.innerHTML = `
            <div style="
              position:fixed;
              inset:0;
              background:rgba(0,0,0,0.45);
              backdrop-filter: blur(2px);
              display:flex;
              align-items:center;
              justify-content:center;
              z-index:99999;
            ">
              <div style="
                background:#fff;
                padding:24px 28px;
                border-radius:12px;
                min-width:320px;
                box-shadow:0 10px 30px rgba(0,0,0,.25);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              ">
                <p style="
                  margin:0 0 20px;
                  font-size:14px;
                  line-height:1.6;
                  color:#333;
                ">
                  印刷処理を行います。<br>
                  OKボタンを押してください。
                </p>

                <div style="text-align:right;">
                  <button id="ok" style="
                    background:#ff8c00;
                    color:#fff;
                    border:none;
                    padding:8px 18px;
                    border-radius:6px;
                    font-size:13px;
                    font-weight:600;
                    cursor:pointer;
                  ">
                    OK
                  </button>
                </div>
              </div>
            </div>
          `;
          document.body.appendChild(modal);

          document.getElementById("ok").onclick = () => {
            const a = document.createElement("a");
            a.href = url;
            a.target = "_blank";
            a.rel = "noopener noreferrer";
            a.click();
            modal.remove();
          };
          textElement.remove();
          */
        } else {
          hideSpinner();
        }
      } catch (e) {
        console.error("Batch Relay Error:", e);
        if (e?.empNo) {
          alert(`社員No: ${e.empNo}の帳票作成に失敗しました。`);
        } else {
          alert("帳票作成に失敗しました");
        }
        hideSpinner();
        document.createElement("div").textContent = "";
      }
    });
  });

  kviewer.events.on("view.index.show", function (state) {
    const pButton = make_iconButton("close", "ウィンドウを閉じる");
    pButton.addEventListener("click", function () {
      window.close();
    });
  });
})();

async function batchRelay(records, companyId, userName, textElement) {
  const relay = new Relay(companyId, records, userName);
  return await relay.executeFunction(textElement);
}

const kanjiToKana = (kanji) => {
  return prefectureKanaMap[kanji] || "";
};

// 都道府県漢字からカタカナへのマップ
const prefectureKanaMap = {
  北海道: "ホッカイドウ",
  青森県: "アオモリケン",
  岩手県: "イワテケン",
  宮城県: "ミヤギケン",
  秋田県: "アキタケン",
  山形県: "ヤマガタケン",
  福島県: "フクシマケン",
  茨城県: "イバラキケン",
  栃木県: "トチギケン",
  群馬県: "グンマケン",
  埼玉県: "サイタマケン",
  千葉県: "チバケン",
  東京都: "トウキョウト",
  神奈川県: "カナガワケン",
  新潟県: "ニイガタケン",
  富山県: "トヤマケン",
  石川県: "イシカワケン",
  福井県: "フクイケン",
  山梨県: "ヤマナシケン",
  長野県: "ナガノケン",
  岐阜県: "ギフケン",
  静岡県: "シズオカケン",
  愛知県: "アイチケン",
  三重県: "ミエケン",
  滋賀県: "シガケン",
  京都府: "キョウトフ",
  大阪府: "オオサカフ",
  兵庫県: "ヒョウゴケン",
  奈良県: "ナラケン",
  和歌山県: "ワカヤマケン",
  鳥取県: "トットリケン",
  島根県: "シマネケン",
  岡山県: "オカヤマケン",
  広島県: "ヒロシマケン",
  山口県: "ヤマグチケン",
  徳島県: "トクシマケン",
  香川県: "カガワケン",
  愛媛県: "エヒメケン",
  高知県: "コウチケン",
  福岡県: "フクオカケン",
  佐賀県: "サガケン",
  長崎県: "ナガサキケン",
  熊本県: "クマモトケン",
  大分県: "オオイタケン",
  宮崎県: "ミヤザキケン",
  鹿児島県: "カゴシマケン",
  沖縄県: "オキナワケン",
};

const transformObjectKeys = (data, keyMapping) => {
  const transformedData = {};

  keyMapping.forEach(([oldKey, newKey]) => {
    if (data.hasOwnProperty(oldKey)) {
      transformedData[newKey] = data[oldKey];
    }
  });

  return transformedData;
};
