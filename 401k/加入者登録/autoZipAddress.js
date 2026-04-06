function autoZipAddress(fieldcode_obj) {
  if (!fieldcode_obj.hasOwnProperty("zip")) {
    console.error(
      "autoZipAddress(fieldcode_obj) argument required zip property."
    );
    return;
  }
  fb.events.fields[fieldcode_obj.zip].changed.push((state) => {
    const input_value = state.record[fieldcode_obj.zip].value.replaceAll(
      "-",
      ""
    ); //ハイフンを取り除く
    if (input_value.length == 7) {
      const KC = new KanaConverter_azp();
      const post_url = "https://zipcloud.ibsnet.co.jp/api/search?zipcode=";
      const res = fetch(post_url + input_value.toString(), {
        timeout: 10000,
      });
      res
        .then((response) => response.json())
        .then((data) => {
          switch (data.status) {
            case 400:
              console.error("入力パラメータエラー");
              break;
            case 500:
              console.error("Internal server error.");
              break;
            case 200:
              if (data.results === null)
                console.error("郵便番号から住所が見つかりませんでした。");
              else {
                const fetch_reesult = data.results[0];
                console.log("fetch result : ", fetch_reesult);
                state.record[fieldcode_obj.state].value = "";
                state.record[fieldcode_obj.city].value = "";
                state.record[fieldcode_obj.addressLine].value = "";
                state.record[fieldcode_obj.city_ruby].value = "";
                state.record[fieldcode_obj.addressLine_ruby].value = "";

                state.record[fieldcode_obj.zip].value =
                  input_value.slice(0, 3) + "-" + input_value.slice(3);
                state.record[fieldcode_obj.state].value +=
                  fetch_reesult.address1;
                state.record[fieldcode_obj.city].value +=
                  fetch_reesult.address2;
                state.record[fieldcode_obj.addressLine].value +=
                  fetch_reesult.address3;
                // state.record[fieldcode_obj.state_ruby].value = KC.halfToFull(fetch_reesult.kana1);
                state.record[fieldcode_obj.city_ruby].value += KC.halfToFull(
                  fetch_reesult.kana2
                );
                state.record[fieldcode_obj.addressLine_ruby].value +=
                  KC.halfToFull(fetch_reesult.kana3);
              }
          }
          return state;
        });
    }
  });
}

class KanaConverter_azp {
  constructor() {
    this.conversionMap = CONVERSIONMAP_azp;
  }

  halfToFull(str) {
    return this.convert(str, "half", "full");
  }

  fullToHalf(str) {
    return this.convert(str, "full", "half");
  }

  convert(str, fromType, toType) {
    const str_array = Array.from(str);
    let result_arr = [];
    str_array.forEach((elem) => {
      if (elem == "ﾞ") {
        let tmp = result_arr.pop();
        result_arr.push(tmp + elem);
      } else {
        result_arr.push(elem);
      }
    });
    const convertedString = result_arr
      .map((char) => {
        const conversion = this.conversionMap.find(
          (entry) => entry[fromType] === char
        );
        return conversion ? conversion[toType] : char;
      })
      .join("");

    return convertedString;
  }
}

const CONVERSIONMAP_azp = [
  { half: " ", full: "　" },
  { half: "ｶﾞ", full: "ガ" },
  { half: "ｷﾞ", full: "ギ" },
  { half: "ｸﾞ", full: "グ" },
  { half: "ｹﾞ", full: "ゲ" },
  { half: "ｺﾞ", full: "ゴ" },
  { half: "ｻﾞ", full: "ザ" },
  { half: "ｼﾞ", full: "ジ" },
  { half: "ｽﾞ", full: "ズ" },
  { half: "ｾﾞ", full: "ゼ" },
  { half: "ｿﾞ", full: "ゾ" },
  { half: "ﾀﾞ", full: "ダ" },
  { half: "ﾁﾞ", full: "ヂ" },
  { half: "ﾂﾞ", full: "ヅ" },
  { half: "ﾃﾞ", full: "デ" },
  { half: "ﾄﾞ", full: "ド" },
  { half: "ﾊﾞ", full: "バ" },
  { half: "ﾋﾞ", full: "ビ" },
  { half: "ﾌﾞ", full: "ブ" },
  { half: "ﾍﾞ", full: "ベ" },
  { half: "ﾎﾞ", full: "ボ" },
  { half: "ﾊﾟ", full: "バ" },
  { half: "ﾋﾟ", full: "ビ" },
  { half: "ﾌﾟ", full: "ブ" },
  { half: "ﾍﾟ", full: "ベ" },
  { half: "ﾎﾟ", full: "ボ" },
  { half: "ｳﾞ", full: "ヴ" },
  { half: "ﾜﾞ", full: "ワ" },
  { half: "ｦﾞ", full: "ヲ" },
  { half: "ｱ", full: "ア" },
  { half: "ｲ", full: "イ" },
  { half: "ｳ", full: "ウ" },
  { half: "ｴ", full: "エ" },
  { half: "ｵ", full: "オ" },
  { half: "ｶ", full: "カ" },
  { half: "ｷ", full: "キ" },
  { half: "ｸ", full: "ク" },
  { half: "ｹ", full: "ケ" },
  { half: "ｺ", full: "コ" },
  { half: "ｻ", full: "サ" },
  { half: "ｼ", full: "シ" },
  { half: "ｽ", full: "ス" },
  { half: "ｾ", full: "セ" },
  { half: "ｿ", full: "ソ" },
  { half: "ﾀ", full: "タ" },
  { half: "ﾁ", full: "チ" },
  { half: "ﾂ", full: "ツ" },
  { half: "ﾃ", full: "テ" },
  { half: "ﾄ", full: "ト" },
  { half: "ﾅ", full: "ナ" },
  { half: "ﾆ", full: "ニ" },
  { half: "ﾇ", full: "ヌ" },
  { half: "ﾈ", full: "ネ" },
  { half: "ﾉ", full: "ノ" },
  { half: "ﾊ", full: "ハ" },
  { half: "ﾋ", full: "ヒ" },
  { half: "ﾌ", full: "フ" },
  { half: "ﾍ", full: "ヘ" },
  { half: "ﾎ", full: "ホ" },
  { half: "ﾏ", full: "マ" },
  { half: "ﾐ", full: "ミ" },
  { half: "ﾑ", full: "ム" },
  { half: "ﾒ", full: "メ" },
  { half: "ﾓ", full: "モ" },
  { half: "ﾔ", full: "ヤ" },
  { half: "ﾕ", full: "ユ" },
  { half: "ﾖ", full: "ヨ" },
  { half: "ﾗ", full: "ラ" },
  { half: "ﾘ", full: "リ" },
  { half: "ﾙ", full: "ル" },
  { half: "ﾚ", full: "レ" },
  { half: "ﾛ", full: "ロ" },
  { half: "ﾜ", full: "ワ" },
  { half: "ｦ", full: "ヲ" },
  { half: "ﾝ", full: "ン" },
  { half: "ｧ", full: "ァ" },
  { half: "ｨ", full: "ィ" },
  { half: "ｩ", full: "ゥ" },
  { half: "ｪ", full: "ェ" },
  { half: "ｫ", full: "ォ" },
  { half: "ｯ", full: "ッ" },
  { half: "ｬ", full: "ャ" },
  { half: "ｭ", full: "ュ" },
  { half: "ｮ", full: "ョ" },
  { half: "｡", full: "。" },
  { half: "､", full: "、" },
  { half: "-", full: "ー" },
  { half: "｢", full: "「" },
  { half: "｣", full: "」" },
  { half: "･", full: "・" },
  { half: "0", full: "０" },
  { half: "1", full: "１" },
  { half: "2", full: "２" },
  { half: "3", full: "３" },
  { half: "4", full: "４" },
  { half: "5", full: "５" },
  { half: "6", full: "６" },
  { half: "7", full: "７" },
  { half: "8", full: "８" },
  { half: "9", full: "９" },
];
