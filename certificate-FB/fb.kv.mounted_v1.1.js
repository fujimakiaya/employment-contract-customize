(function () {
  "use strict";
  fb.events.kviewer.records.mounted = [
    async function (state) {
      await loadKanaConverter();
      //生年月日変換
      state.record.生年月日_在職.value = ChangeBornDate(
        state.record.生年月日_全体.value
      );
      state.record.生年月日_労働者名簿.value = ChangeBornDate(
        state.record.生年月日_全体.value
      );
      //住所入力
      state.record.住所_在職.value = InputAddress(
        state.record.住所1.value,
        state.record.住所2.value,
        state.record.住所3.value,
        state.record.住所4.value
      );
      state.record.住所_労働者名簿.value = InputAddress(
        state.record.住所1.value,
        state.record.住所2.value,
        state.record.住所3.value,
        state.record.住所4.value
      );

      state.record.住所フリガナ_労働者名簿.value = InputAddress(
        kanjiToKana(state.record.住所1.value.trim()),
        state.record.住所2カナ.value,
        state.record.住所3カナ.value,
        state.record.住所4カナ.value
      );

      if (state.record.帳票種別.value == "労働者名簿") {
        let now = new Date();
        let formattedDate = now.toISOString().split("T")[0]; // YYYY-MM-DD 形式
        state.record.労働者名簿公開承認日.value = formattedDate;
        document
          .querySelectorAll(".ui.container.fb-content")
          .forEach((element) => {
            element.style.position = "absolute";
            element.style.top = "-9999px";
            element.style.left = "-9999px";
            element.style.zIndex = "-1";
            element.style.visibility = "hidden";
          });
        const intervalId = setInterval(() => {
          const fileValues = sessionStorage.getItem("fileValues1");
          if (fileValues) {
            document
              .querySelector(".ui.teal.labeled.icon.button.fb-confirm")
              ?.click();
            clearInterval(intervalId); // 値が見つかったら監視を停止
          }
        }, 200); // 0.2秒 (200ミリ秒) ごとに確認
      }
    },
  ];
  //})();

  function ChangeBornDate(originalValue) {
    if (originalValue.length === 8) {
      let formattedValue =
        originalValue.slice(0, 4) +
        "-" + // 年 (1999)
        originalValue.slice(4, 6) +
        "-" + // 月 (01)
        originalValue.slice(6, 8); // 日 (01)

      return formattedValue;
    }
  }

  function InputAddress(value1, value2, value3, value4) {
    let address =
      (value1 || "") + (value2 || "") + (value3 || "") + (value4 || "");
    if (address) {
      console.log(`Original value: ${address}`);
      // 半角 → 全角
      address = KanaConverter.halfToFull(address);
      console.log(`Converted value: ${address}`);
    }
    return address;
  }

  const kanjiToKana = (kanji) => {
    return prefectureKanaMap[kanji] || "";
  };

  function GetRequireValue_Retire(employee_app_reasons) {
    const ReasonObj = {
      自己都合による退職: "あなたの自己都合による退職",
      事業主の都合による退職: "当社の勧奨による退職",
      契約期間満了: "契約期間の満了による退職",
      退職勧奨: "当社の勧奨による退職",
      関連会社移籍: "移籍出向による退職",
      その他: "その他",
    };

    let retireReason = ReasonObj[employee_app_reasons];

    return retireReason;
  }

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
})();
